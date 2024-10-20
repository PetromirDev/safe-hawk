import formatDecimals from '@/helpers/formatDecimals'
import { formatUnits, Contract } from 'ethers'

/// This function is not used anymore since wagmi integration
const getAAVEUserContractDataFormatted = async (
    address: string,
    provider: any,
    aaveLendingPoolAddress: string
) => {
    const aaveLendingPoolABI = [
        'function getUserAccountData(address) view returns (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
    ]

    const lendingPoolContract = new Contract(aaveLendingPoolAddress, aaveLendingPoolABI, provider)

    const accountData = await lendingPoolContract.getUserAccountData(address)

    if (accountData.totalCollateralETH === 0n) return null

    return {
        totalCollateralETH: formatDecimals(
            parseFloat(formatUnits(accountData.totalCollateralETH, 8)),
            'price'
        ),
        totalDebtETH: formatDecimals(parseFloat(formatUnits(accountData.totalDebtETH, 8)), 'price'),
        availableBorrowsETH: formatDecimals(
            parseFloat(formatUnits(accountData.availableBorrowsETH, 8)),
            'price'
        ),
        currentLiquidationThreshold: `${Number(accountData.currentLiquidationThreshold) / 100}%`,
        ltv: `${Number(accountData.ltv) / 100}%`,
        healthFactor: formatDecimals(parseFloat(formatUnits(accountData.healthFactor, 18)))
    }
}

export { getAAVEUserContractDataFormatted }
