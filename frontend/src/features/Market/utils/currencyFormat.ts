/**
 * Currency formatting utilities
 * 
 * Backend stores all monetary values as INTEGER in base units (dollars).
 * Frontend converts to millions for display without losing precision.
 */

/**
 * Format a value (in base units) to millions with maximum precision
 * @param value - Value in base units (e.g., 87654321)
 * @param options - Formatting options
 * @returns Formatted string (e.g., "87.654321M" or "87.7M")
 */
export function formatCurrency(
  value: number,
  options: {
    /** Number of decimal places (default: no limit - shows all precision) */
    decimals?: number;
    /** Whether to add $ prefix (default: true) */
    prefix?: boolean;
    /** Whether to add M suffix (default: true) */
    suffix?: boolean;
    /** Whether to remove trailing zeros (default: false for max precision) */
    removeTrailingZeros?: boolean;
  } = {}
): string {
  const {
    decimals,
    prefix = true,
    suffix = true,
    removeTrailingZeros = false,
  } = options;

  // Convert to millions
  const millions = value / 1_000_000;

  // Format with specified decimals or full precision
  let formatted: string;
  if (decimals !== undefined) {
    formatted = millions.toFixed(decimals);
  } else {
    // Show full precision (up to 6 decimals for cents)
    formatted = millions.toString();
  }

  // Remove trailing zeros if requested
  if (removeTrailingZeros && formatted.includes('.')) {
    formatted = formatted.replace(/\.?0+$/, '');
  }

  // Add prefix and suffix
  const prefixStr = prefix ? '$' : '';
  const suffixStr = suffix ? 'M' : '';

  return `${prefixStr}${formatted}${suffixStr}`;
}

/**
 * Format for compact display (1 decimal place)
 * @param value - Value in base units
 * @returns Formatted string (e.g., "$87.7M")
 */
export function formatCurrencyCompact(value: number): string {
  return formatCurrency(value, { decimals: 1 });
}

/**
 * Format with full precision (all decimals)
 * @param value - Value in base units
 * @returns Formatted string with full precision (e.g., "$87.654321M")
 */
export function formatCurrencyPrecise(value: number): string {
  return formatCurrency(value, { removeTrailingZeros: true });
}

/**
 * Format without prefix/suffix (just the number)
 * @param value - Value in base units
 * @param decimals - Number of decimal places
 * @returns Formatted number string (e.g., "87.7")
 */
export function formatCurrencyNumber(value: number, decimals?: number): string {
  return formatCurrency(value, { decimals, prefix: false, suffix: false });
}

/**
 * Parse a currency input string to base units
 * Accepts formats: "87.7", "87.7M", "$87.7M", etc.
 * @param input - Currency string
 * @returns Value in base units (INTEGER)
 */
export function parseCurrencyInput(input: string): number {
  // Remove non-numeric characters except . and -
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const value = parseFloat(cleaned);
  
  if (isNaN(value)) {
    return 0;
  }

  // If input contains 'M', treat as millions, otherwise as base units
  if (input.toUpperCase().includes('M')) {
    return Math.floor(value * 1_000_000);
  }
  
  return Math.floor(value);
}
