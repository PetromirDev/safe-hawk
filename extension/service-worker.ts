import { JsonRpcProvider } from 'ethers'
import { getAAVEUserContractDataFormatted } from '../src/libs/getAAVEContractDataFormatted'
import { NETWORKS } from '../src/common/networks'
import formatDecimals from '@/helpers/formatDecimals'

async function runHeartbeat() {
    await chrome.storage.local.set({ 'last-heartbeat': new Date().getTime() })
}

async function keepSwAlive() {
    // Run the heartbeat once at service worker startup.
    runHeartbeat().then(() => {
        // Then again every 20 seconds.
        setInterval(runHeartbeat, 20 * 1000)
    })
}

keepSwAlive()

const pricesByNetwork = {}
Object.values(NETWORKS).forEach((n) => {
    pricesByNetwork[n.chainId.toString()] = []
})
const runDataUpdate = async () => {
    const network = NETWORKS.find((n) => n.chainId === 1)!
    const provider = new JsonRpcProvider(network.url)

    function percentageDifference(newValue, oldValue) {
        const difference = newValue - oldValue
        const percentageDiff = (difference / oldValue) * 100
        return percentageDiff
    }

    function getBookmarkTitle(healthFactor) {
        healthFactor = Number(healthFactor)
        let statusDot = '🟢'
        if (healthFactor < 1.3) {
            statusDot = '🔴'
        } else if (healthFactor >= 1.3 && healthFactor <= 1.8) {
            statusDot = '🟡'
        }

        return `${statusDot} Health ${formatDecimals(healthFactor)}`
    }

    function updateHealthFactorBookmark(healthFactor) {
        const bookmarkTitle = getBookmarkTitle(healthFactor)

        chrome.bookmarks.getTree(function (tree) {
            const folders = tree[0].children
            let bookmarksBar = folders.filter((f) => f.title === 'Bookmarks Bar')[0]

            if (!bookmarksBar) bookmarksBar = folders[0]

            chrome.bookmarks.search({ url: 'https://safe-hawk.com/' }, function (bookmarks) {
                if (bookmarks.length > 0) {
                    chrome.bookmarks.update(bookmarks[0].id, {
                        title: bookmarkTitle,
                        url: 'https://safe-hawk.com/'
                    })
                } else {
                    chrome.bookmarks.create({
                        parentId: bookmarksBar.id,
                        title: bookmarkTitle,
                        url: 'https://safe-hawk.com/',
                        index: 0
                    })
                }
            })
        })
    }

    async function checkForImmediateDrop(healthFactors) {
        if (healthFactors.length < 2) return // Need at least two data points to compare
        for (let i = 0; i < healthFactors.length - 1; i++) {
            const previousHealthFactor = healthFactors[i]
            const currentHealthFactor = healthFactors[healthFactors.length - 1]
            const percentageChange = percentageDifference(previousHealthFactor, currentHealthFactor)

            // Check if the current price is 5% or more lower than any previous price
            if (percentageChange >= 5 && currentHealthFactor >= 1) {
                await chrome.notifications.create(Math.random().toString(), {
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('assets/icon@96.png'),
                    title: 'Health Factor Alert',
                    message: `Your credit health factor just dropped by ${formatDecimals(Math.abs(percentageChange))}% to ${formatDecimals(currentHealthFactor)} on ${network.name}.`
                })
                break
            }
        }
    }

    const update = async () => {
        const data = await getAAVEUserContractDataFormatted(
            '0x4F3c11ac6f552E36211661d161360e4A7677C683',
            provider
        )

        pricesByNetwork[network.chainId.toString()].push(data.healthFactor)

        // Keep only the last 6 prices (one hour worth of data)
        if (pricesByNetwork[network.chainId.toString()].length > 6) {
            pricesByNetwork[network.chainId.toString()].shift()
        }

        await checkForImmediateDrop(pricesByNetwork[network.chainId.toString()])
        updateHealthFactorBookmark(data.healthFactor)

        setTimeout(
            () => {
                update()
            },
            10 * 60 * 1000
        ) // run every 10 mins
    }
    update()
}

runDataUpdate()
