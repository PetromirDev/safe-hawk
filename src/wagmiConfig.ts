import { createConfig, http } from 'wagmi'
import { mainnet, avalanche, polygon, optimism, arbitrum } from 'wagmi/chains' // Add the chains you want to support
import { getDefaultConfig } from 'connectkit'

export const config = createConfig(
    getDefaultConfig({
        // Your dApp's supported chains
        chains: [mainnet, avalanche, polygon, optimism, arbitrum], // Add more chains as needed
        transports: {
            // RPC URL for each chain
            [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_NEXT_PUBLIC_ALCHEMY_ID}`),
            [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
            [polygon.id]: http('https://polygon-rpc.com'),
            [optimism.id]: http('https://mainnet.optimism.io'),
            [arbitrum.id]: http('https://arb1.arbitrum.io/rpc')
        },

        // Required API Keys
        walletConnectProjectId: process.env.REACT_APP_NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

        // Required App Info
        appName: 'SafeHawk',

        // Optional App Info
        appDescription: 'In the dynamic world of decentralized finance, keeping track of your investments is crucial. SafeHawk provides the tools you need to monitor your positions effortlessly.',
        appUrl: 'https://safe-hawk.com', // your app's URL
        appIcon: 'https://safe-hawk.com/logo512.png' // your app's icon, no bigger than 1024x1024px (max. 1MB)
    })
)
