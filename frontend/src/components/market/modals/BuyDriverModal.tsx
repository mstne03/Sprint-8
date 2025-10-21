import { motion } from 'framer-motion';
import type { DriverWithOwnership } from '@/types/marketTypes';

interface BuyDriverModalProps {
  driver: DriverWithOwnership;
  userBudget: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const BuyDriverModal = ({
  driver,
  userBudget,
  onConfirm,
  onCancel,
  loading = false,
}: BuyDriverModalProps) => {
  const price = driver.base_price || driver.fantasy_stats?.price || 0;
  const budgetAfter = userBudget - price;

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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-500/50 rounded-2xl shadow-2xl p-6 m-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                <span className="text-2xl">🏎️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Buy Driver</h2>
                <p className="text-sm text-gray-400">Confirm purchase</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Driver Info */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-700/50">
            <div className="flex items-center gap-4 mb-4">
              {driver.headshot_url && (
                <img
                  src={driver.headshot_url}
                  alt={driver.full_name}
                  className="w-16 h-16 rounded-full object-cover object-top border-2"
                  style={{ borderColor: driver.driver_color || '#888' }}
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{driver.full_name}</h3>
                <p className="text-sm text-gray-400">
                  #{driver.driver_number} • {driver.team_name || 'No Team'}
                </p>
              </div>
            </div>

            {/* Stats */}
            {(driver.season_results || driver.fantasy_stats) && (
              <div className="grid grid-cols-3 gap-3">
                {driver.season_results && (
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Points</p>
                    <p className="text-lg font-bold text-white">
                      {driver.season_results.points}
                    </p>
                  </div>
                )}
                {driver.fantasy_stats && (
                  <>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Avg Finish</p>
                      <p className="text-lg font-bold text-white">
                        P{driver.fantasy_stats.avg_finish?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Value</p>
                      <p className="text-lg font-bold text-green-400">
                        ${(driver.fantasy_stats.price / 1_000_000).toFixed(1)}M
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Budget Impact */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-300 mb-3">Budget Impact</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Budget:</span>
                <span className="text-white font-bold">
                  ${(userBudget / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Driver Cost:</span>
                <span className="text-red-400 font-bold">
                  -${(price / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="h-px bg-gray-700 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">After Purchase:</span>
                <span className={`text-xl font-bold ${
                  budgetAfter >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${(budgetAfter / 1_000_000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>

          {/* Warning if low budget */}
          {budgetAfter < 10_000_000 && budgetAfter >= 0 && (
            <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-300">
                  Warning: Your remaining budget will be low. Make sure you have enough for future transactions.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirm Purchase</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
