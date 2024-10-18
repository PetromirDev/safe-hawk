import { Input } from '@/components'
import { IExecDataProtectorCore } from '@iexec/dataprotector'
import { useEffect, useState } from 'react'
import { useAccount, useConnectorClient, useSwitchChain } from 'wagmi'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useMemo } from 'react'
import { type Config } from '@wagmi/core'
import type { Client, Chain, Transport, Account } from 'viem'
import toast from 'react-hot-toast'
import { config } from '@/wagmiConfig'

export function clientToSigner(client: Client<Transport, Chain, Account>) {
    const { account, chain, transport } = client

    if (!chain) return

    const network = {
        // @ts-ignore
        chainId: chain.id,
        // @ts-ignore
        name: chain.name,
        // @ts-ignore
        ensAddress: chain.contracts?.ensRegistry?.address
    }
    const provider = new BrowserProvider(transport, network)
    // @ts-ignore
    const signer = new JsonRpcSigner(provider, account.address)
    return signer
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
    const { data: client } = useConnectorClient<Config>({ chainId })
    return useMemo(() => (client ? clientToSigner(client) : undefined), [client])
}

const Email = () => {
    const { address, chainId } = useAccount()
    const { switchChain } = useSwitchChain({ config })
    const signer = useEthersSigner({ chainId })
    const dataProtectorCore = new IExecDataProtectorCore(signer)
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isAccessGivenToEmail, setIsAccessGivenToEmail] = useState(false)
    const [hasProtectedEmail, setHasProtectedEmail] = useState(false)

    const switchToIExecChain = () => {
        try {
            return switchChain({ chainId: 134 })
        } catch (e) {
            console.error(e)
            toast.error('Failed to switch chain')
        }
    }

    const saveEmailAsProtected = async () => {
        switchToIExecChain()

        if (chainId !== 134) return

        try {
            await dataProtectorCore.protectData({
                name: 'email',
                data: {
                    email
                }
            })
            setHasProtectedEmail(true)
        } catch (e) {
            console.error(e)
            toast.error('Failed to save email address')
        }
    }

    const getProtectedData = async () => {
        switchToIExecChain()
        if (chainId !== 134) return
        try {
            const result = await dataProtectorCore.getProtectedData({
                owner: address,
                requiredSchema: {
                    email: 'string'
                }
            })

            return result
        } catch (e) {
            console.error(e)
            toast.error('Failed to get email address')
        }
    }

    const grantAccess = async () => {
        const protectedData = await getProtectedData()
        if (chainId !== 134) {
            toast.error('Please switch to iExec chain')
            return
        }
        if (!protectedData?.length) {
            toast.error('Internal error. Please contact support')
            return
        }
        try {
            const access = await dataProtectorCore.grantAccess({
                protectedData: protectedData[0].address,
                authorizedApp: '0x781482C39CcE25546583EaC4957Fb7Bf04C277D2',
                authorizedUser: process.env.REACT_APP_EMAIL_ACCOUNT_ADDRESS,
                numberOfAccess: 100000
            })

            setIsAccessGivenToEmail(!!access)

            return access
        } catch (e) {
            console.error(e)
            toast.error('Failed to grant email address access')
        }
    }

    useEffect(() => {
        getProtectedData().then((data) => {
            setHasProtectedEmail(data?.length > 0)

            if (!data?.length) {
                setIsAccessGivenToEmail(false)
                setIsLoading(false)
                return
            }

            dataProtectorCore
                .getGrantedAccess({
                    protectedData: data[0].address,
                    authorizedApp: '0x781482C39CcE25546583EaC4957Fb7Bf04C277D2',
                    authorizedUser: process.env.REACT_APP_EMAIL_ACCOUNT_ADDRESS,
                    isUserStrict: true
                })
                .then((access) => {
                    setIsAccessGivenToEmail(access.count > 0)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        })
    }, [])

    if (isLoading) return <div>Loading...</div>

    if (!signer) return <div>Please connect a signer</div>

    if (isAccessGivenToEmail) return <div>Notifications enabled</div>

    return (
        <div>
            <Input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={hasProtectedEmail}
            />
            <button
                onClick={() => {
                    if (hasProtectedEmail) {
                        grantAccess()
                    } else {
                        saveEmailAsProtected()
                    }
                }}
                disabled={!hasProtectedEmail && !email}
            >
                {hasProtectedEmail ? 'Grant access' : 'Save email'}
            </button>
        </div>
    )
}

export default Email
