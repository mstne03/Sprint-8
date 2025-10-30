import type { ReactNode } from 'react';

interface DriverSaleModalHeaderProps {
  mode: 'quickSell' | 'listForSale' | 'buyDriver';
  icon: ReactNode | string;
  iconBgColor: string;
  iconBorderColor: string;
  title: string;
  subtitle: string;
  onCancel: () => void;
}

export const DriverSaleModalHeader = ({
  mode,
  icon,
  iconBgColor,
  iconBorderColor,
  title,
  subtitle,
  onCancel,
}: DriverSaleModalHeaderProps) => {
  return (
    <div className="px-5 py-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {mode === 'quickSell' || mode === 'buyDriver' ? (
            <div className={`w-10 h-10 rounded-full ${iconBgColor} border ${iconBorderColor} flex items-center justify-center`}>
              {typeof icon === 'string' ? (
                <span className="text-xl">{icon}</span>
              ) : (
                icon
              )}
            </div>
          ) : (
            <div className="text-2xl">{icon}</div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-gray-400 text-xs">{subtitle}</p>
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
  );
};
