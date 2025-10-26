import { useState } from 'react';
import { motion } from 'framer-motion';
import type { DriverWithOwnership } from '@/types/marketTypes';
import { formatCurrencyPrecise, parseCurrencyInput } from '@/utils/currencyFormat';

type ModalMode = 'quickSell' | 'listForSale' | 'buyDriver';

interface DriverSaleModalProps {
  driver: DriverWithOwnership;
  userDriverCount?: number;
  userBudget?: number;
  mode: ModalMode;
  onConfirm: (price?: number) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DriverSaleModal = ({
  driver,
  userDriverCount,
  userBudget,
  mode,
  onConfirm,
  onCancel,
  loading = false,
}: DriverSaleModalProps) => {
  const acquisitionPrice = driver.ownership?.acquisition_price || driver.fantasy_stats?.price || 0;
  
  // Quick Sell calculations
  const refundAmount = Math.floor(acquisitionPrice * 0.8);
  const loss = acquisitionPrice - refundAmount;
  
  // Buy Driver calculations
  const price = driver.fantasy_stats?.price || 0;
  const budgetAfter = (userBudget || 0) - price;
  
  // List for Sale state
  const suggestedPrice = Math.round(acquisitionPrice * 1.1);
  const [inputValue, setInputValue] = useState(formatCurrencyPrecise(suggestedPrice, { prefix: false, suffix: false }));
  const [customPrice, setCustomPrice] = useState(suggestedPrice);
  const [error, setError] = useState<string | null>(null);
  
  const profit = customPrice - acquisitionPrice;
  const profitPercentage = acquisitionPrice > 0 ? ((profit / acquisitionPrice) * 100).toLocaleString(undefined, { maximumFractionDigits: 6, useGrouping: false }) : '0.0';
  
  // Validate minimum drivers (only for sell/list modes)
  const canProceed = mode === 'buyDriver' ? true : (userDriverCount || 0) > 3;
  
  const handlePriceChange = (value: string) => {
    setInputValue(value);
    const numValue = parseCurrencyInput(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid price');
      setCustomPrice(0);
      return;
    }
    setCustomPrice(numValue);
    setError(null);
  };
  
  const handlePresetClick = (multiplier: number) => {
  const newPrice = acquisitionPrice * multiplier;
  setInputValue(formatCurrencyPrecise(newPrice, { prefix: false, suffix: false }));
  setCustomPrice(Math.round(newPrice));
  setError(null);
  };
  
  const handleConfirm = () => {
    if (mode === 'listForSale') {
      if (customPrice <= 0) {
        setError('Please enter a valid price');
        return;
      }
      onConfirm(customPrice);
    } else {
      onConfirm();
    }
  };
  
  const formatCurrency = (value: number) => {
  return formatCurrencyPrecise(value);
  };
  
  // Mode-specific config
  const config = mode === 'quickSell' 
    ? {
        icon: (
          <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBgColor: 'bg-orange-600/20',
        iconBorderColor: 'border-orange-500/50',
        title: 'Quick Sell',
        subtitle: 'Sell driver to market',
        buttonText: 'Confirm Sale',
        buttonColor: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500',
        infoText: "The driver will return to the free agent pool and you'll receive 80% of the acquisition price"
      }
    : mode === 'listForSale'
    ? {
        icon: '💰',
        iconBgColor: 'bg-yellow-600/20',
        iconBorderColor: 'border-yellow-500/50',
        title: 'List for Sale',
        subtitle: `Set your asking price for ${driver.full_name}`,
        buttonText: 'List for Sale',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        infoText: 'Listed drivers appear in "For Sale" tab. You can unlist anytime.'
      }
    : {
        icon: '💵',
        iconBgColor: 'bg-green-600/20',
        iconBorderColor: 'border-green-500/50',
        title: 'Buy Driver',
        subtitle: 'Confirm purchase',
        buttonText: 'Confirm Purchase',
        buttonColor: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
        infoText: 'The driver will be added to your team roster'
      };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {mode === 'quickSell' || mode === 'buyDriver' ? (
                  <div className={`w-10 h-10 rounded-full ${config.iconBgColor} border ${config.iconBorderColor} flex items-center justify-center`}>
                    {typeof config.icon === 'string' ? (
                      <span className="text-xl">{config.icon}</span>
                    ) : (
                      config.icon
                    )}
                  </div>
                ) : (
                  <div className="text-2xl">{config.icon}</div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">{config.title}</h2>
                  <p className="text-gray-400 text-xs">{config.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-3 space-y-2.5">
            {/* Driver Info */}
            <div className="bg-black/30 rounded-xl p-3 border border-gray-700/50">
              <div className="flex items-center gap-3">
                {driver.headshot_url && (
                  <img
                    src={driver.headshot_url}
                    alt={driver.full_name}
                    className="w-14 h-14 rounded-full object-cover object-top border-2"
                    style={{ borderColor: driver.driver_color || '#888' }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{driver.full_name}</h3>
                  <p className="text-gray-400 text-xs">{driver.team_name}</p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            {mode === 'quickSell' ? (
              <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-gray-400 text-xs">Acquisition Price</span>
                  <span className="text-white font-bold text-sm">
                    {formatCurrency(acquisitionPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-gray-400 text-xs">Refund (80%)</span>
                  <span className="text-green-400 font-bold text-sm">
                    +{formatCurrency(refundAmount)}
                  </span>
                </div>
                <div className="border-t border-gray-600/50 pt-1.5 mt-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 text-xs">Loss (20%)</span>
                    <span className="text-red-400 font-semibold text-sm">
                      -{formatCurrency(loss)}
                    </span>
                  </div>
                </div>
              </div>
            ) : mode === 'buyDriver' ? (
              <>
                {/* Driver Stats */}
                {(driver.season_results || driver.fantasy_stats) && (
                  <div className="grid grid-cols-3 gap-2">
                    {driver.season_results && (
                      <div className="bg-gray-700/30 rounded-lg p-2 border border-gray-600/50">
                        <p className="text-[10px] text-gray-400">Points</p>
                        <p className="text-sm font-bold text-white">
                          {driver.season_results.points}
                        </p>
                      </div>
                    )}
                    {driver.fantasy_stats && (
                      <>
                        <div className="bg-gray-700/30 rounded-lg p-2 border border-gray-600/50">
                          <p className="text-[10px] text-gray-400">Avg Finish</p>
                          <p className="text-sm font-bold text-white">
                            P{driver.fantasy_stats.avg_finish?.toLocaleString(undefined, { maximumFractionDigits: 1, useGrouping: false }) || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-700/30 rounded-lg p-2 border border-gray-600/50">
                          <p className="text-[10px] text-gray-400">Value</p>
                          <p className="text-sm font-bold text-green-400">
                            {formatCurrency(price)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Budget Impact */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2.5">
                  <h4 className="text-[11px] font-medium text-blue-300 mb-2">Budget Impact</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Current Budget:</span>
                      <span className="text-white font-bold text-sm">
                        {formatCurrency(userBudget || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Driver Cost:</span>
                      <span className="text-red-400 font-bold text-sm">
                        -{formatCurrency(price)}
                      </span>
                    </div>
                    <div className="h-px bg-gray-700 my-1"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium text-xs">After Purchase:</span>
                      <span className={`text-base font-bold ${
                        budgetAfter >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(budgetAfter)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Low budget warning */}
                {budgetAfter < 10_000_000 && budgetAfter >= 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-2">
                    <div className="flex items-start gap-1.5">
                      <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-yellow-300 text-[11px]">
                        Warning: Your remaining budget will be low. Make sure you have enough for future transactions.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Acquisition Price */}
                <div className="bg-gray-700/30 rounded-lg p-2 border border-gray-600/50">
                  <div className="text-[10px] text-gray-400">Your acquisition price</div>
                  <div className="text-base font-bold text-white">
                    {formatCurrency(acquisitionPrice)}
                  </div>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-300 mb-1">
                    Set asking price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-full pl-7 pr-10 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm font-medium focus:outline-none focus:border-yellow-500 transition-colors"
                      placeholder="0.0"
                      disabled={loading}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                      M
                    </span>
                  </div>
                  {error && (
                    <div className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                      ⚠️ {error}
                    </div>
                  )}
                </div>

                {/* Price Presets */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handlePresetClick(0.9)}
                    disabled={loading}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-white transition-colors"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => handlePresetClick(1.05)}
                    disabled={loading}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-white transition-colors"
                  >
                    +5%
                  </button>
                  <button
                    onClick={() => handlePresetClick(1.1)}
                    disabled={loading}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-white transition-colors"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() => handlePresetClick(1.2)}
                    disabled={loading}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-white transition-colors"
                  >
                    +20%
                  </button>
                </div>

                {/* Profit/Loss Indicator */}
                <div className={`rounded-lg p-2 border ${
                  profit >= 0
                    ? 'bg-green-900/20 border-green-700/50'
                    : 'bg-red-900/20 border-red-700/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-300">Expected profit/loss</span>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                      </div>
                      <div className={`text-[9px] ${
                        profit >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        ({profit >= 0 ? '+' : ''}{profitPercentage}%)
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Validation Warning - only for sell/list modes */}
            {!canProceed && mode !== 'buyDriver' && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-2">
                <div className="flex items-start gap-1.5">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-red-400 font-medium text-[11px]">
                      Cannot {mode === 'quickSell' ? 'sell' : 'list'} this driver
                    </p>
                    <p className="text-red-300/80 text-[10px] mt-0.5">
                      You must maintain at least 3 drivers in your team
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2">
              <div className="flex items-start gap-1.5">
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-300 text-[11px]">
                  {config.infoText}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-3 flex gap-2.5">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !canProceed || (mode === 'listForSale' && (!!error || customPrice <= 0))}
              className={`flex-1 px-4 py-2.5 ${config.buttonColor} text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'quickSell' ? 'Selling...' : mode === 'buyDriver' ? 'Processing...' : 'Listing...'}
                </>
              ) : (
                <>
                  {mode === 'quickSell' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : mode === 'buyDriver' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
