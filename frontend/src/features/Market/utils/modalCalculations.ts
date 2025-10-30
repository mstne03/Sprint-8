import type { DriverWithOwnership } from '@/features/Market/types/marketTypes';

interface ModalCalculations {
  acquisitionPrice: number;
  refundAmount: number;
  loss: number;
  price: number;
  budgetAfter: number;
  suggestedPrice: number;
}

interface CalculateModalValuesParams {
  driver: DriverWithOwnership;
  userBudget?: number;
}

/**
 * Calculate all financial values for the driver sale modal
 */
export const calculateModalValues = ({
  driver,
  userBudget = 0
}: CalculateModalValuesParams): ModalCalculations => {
  const acquisitionPrice = driver.ownership?.acquisition_price || driver.fantasy_stats?.price || 0;
  
  // Quick Sell calculations (80% refund)
  const refundAmount = Math.floor(acquisitionPrice * 0.8);
  const loss = acquisitionPrice - refundAmount;
  
  // Buy Driver calculations
  const price = driver.fantasy_stats?.price || 0;
  const budgetAfter = userBudget - price;
  
  // List for Sale suggested price (10% markup)
  const suggestedPrice = Math.round(acquisitionPrice * 1.1);

  return {
    acquisitionPrice,
    refundAmount,
    loss,
    price,
    budgetAfter,
    suggestedPrice
  };
};

interface ProfitCalculation {
  profit: number;
  profitPercentage: string;
}

/**
 * Calculate profit/loss and percentage for listing a driver
 */
export const calculateProfit = (
  customPrice: number,
  acquisitionPrice: number
): ProfitCalculation => {
  const profit = customPrice - acquisitionPrice;
  const profitPercentage = acquisitionPrice > 0 
    ? ((profit / acquisitionPrice) * 100).toLocaleString(undefined, { 
        maximumFractionDigits: 6, 
        useGrouping: false 
      }) 
    : '0.0';

  return {
    profit,
    profitPercentage
  };
};
