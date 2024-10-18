import { useAAVEDataProvider } from '@/context'
import styles from './Dashboard.module.scss'
import LiquidationChart from './Chart/Chart'
import { Page } from '@/components'
import { useAccount } from 'wagmi'
import { NETWORKS } from '@/common/networks'
import EmailAndExtension from './EmailAndExtension'

const Dashboard = () => {
    const { chainId } = useAccount()
    const { address, isConnecting, isReconnecting, isLoading, aaveData, error } =
        useAAVEDataProvider()

    // if (!(chainId in NETWORKS)) {
    //     return (
    //         <Page>
    //             <h2>Unsupported network</h2>
    //         </Page>
    //     )
    // }

    return (
        <Page className={styles.dashboard}>
            <div className={styles.aaveData}>
                {isConnecting || isReconnecting ? (
                    <p>Connecting...</p>
                ) : !address ? (
                    <p>
                        Please connect your wallet or input an address to view your AAVE account
                        data.
                    </p>
                ) : error ? (
                    <p>Error: {error.message}</p>
                ) : isLoading ? (
                    <p>Loading AAVE data...</p>
                ) : aaveData ? (
                    <>
                        <h4>{`Address: ${address}`}</h4>
                        <p>{`totalCollateralETH: ${aaveData.totalCollateralETH}`}</p>
                        <p>{`totalDebtETH: ${aaveData.totalDebtETH}`}</p>
                        <p>{`availableBorrowsETH: ${aaveData.availableBorrowsETH}`}</p>
                        <p>{`currentLiquidationThreshold: ${aaveData.currentLiquidationThreshold}`}</p>
                        <p>{`ltv: ${aaveData.ltv}`}</p>
                        <p>{`healthFactor: ${aaveData.healthFactor}`}</p>
                    </>
                ) : null}
                <LiquidationChart liquidationValue={0.81} value={1.5} />
            </div>
            <EmailAndExtension />
        </Page>
    )
}

export default Dashboard
