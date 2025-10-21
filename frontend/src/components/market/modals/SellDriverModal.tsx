import { motion } from 'framer-motion';
import type { DriverWithOwnership } from '@/types/marketTypes';

interface SellDriverModalProps {
  driver: DriverWithOwnership;
  userDriverCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const SellDriverModal = ({
  driver,
  userDriverCount,
  onConfirm,
  onCancel,
  loading = false,
}: SellDriverModalProps) => {
  // Calculate 80% refund
  const acquisitionPrice = driver.ownership?.acquisition_price || driver.base_price;
  const refundAmount = Math.floor(acquisitionPrice * 0.8);
  const loss = acquisitionPrice - refundAmount;

  // Validate minimum 3 drivers after sell
  const canSell = userDriverCount > 3;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-md w-full p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-600/20 border border-orange-500/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Quick Sell</h2>
                <p className="text-gray-400 text-sm">Sell driver to market</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Driver Info */}
          <div className="bg-black/30 rounded-xl p-4 mb-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              {driver.headshot_url && (
                <img
                  src={driver.headshot_url}
                  alt={driver.full_name}
                  className="w-16 h-16 rounded-full object-cover border-2"
                  style={{ borderColor: `#${driver.driver_color}` }}
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{driver.full_name}</h3>
                <p className="text-gray-400 text-sm">{driver.team_name}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 mb-6">
            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Acquisition Price</span>
                <span className="text-white font-bold">
                  ${(acquisitionPrice / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Refund (80%)</span>
                <span className="text-green-400 font-bold">
                  +${(refundAmount / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="border-t border-gray-600/50 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-red-400 text-sm">Loss (20%)</span>
                  <span className="text-red-400 font-semibold">
                    -${(loss / 1_000_000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Warning */}
            {!canSell && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-red-400 font-medium text-sm">Cannot sell this driver</p>
                    <p className="text-red-300/80 text-xs mt-1">
                      You must maintain at least 3 drivers in your team
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-300 text-sm">
                  The driver will return to the free agent pool and you'll receive 80% of the acquisition price
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !canSell}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Selling...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Sale
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
