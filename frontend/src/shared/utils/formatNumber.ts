/**
 * Format a number to a human-readable string with K, M, B suffixes
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.2K", "3.5M")
 */
export const formatNumber = (num: number, decimals: number = 1): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return "0";
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1_000_000_000) {
    const value = absNum / 1_000_000_000;
    return sign + (value % 1 === 0 ? value.toFixed(0) : value.toFixed(decimals)) + "B";
  }

  if (absNum >= 1_000_000) {
    const value = absNum / 1_000_000;
    return sign + (value % 1 === 0 ? value.toFixed(0) : value.toFixed(decimals)) + "M";
  }

  if (absNum >= 1_000) {
    const value = absNum / 1_000;
    return sign + (value % 1 === 0 ? value.toFixed(0) : value.toFixed(decimals)) + "K";
  }

  return sign + absNum.toString();
};

/**
 * Format a number with locale-specific separators
 * @param num - The number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted string with separators (e.g., "1,234,567")
 */
export const formatNumberWithSeparators = (
  num: number,
  locale: string = "en-US"
): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return "0";
  }
  return num.toLocaleString(locale);
};

/**
 * Format a number as a compact string with + suffix
 * @param num - The number to format
 * @returns Formatted string (e.g., "10K+", "5M+")
 */
export const formatNumberCompact = (num: number): string => {
  if (num === 0) return "0";
  return formatNumber(num) + "+";
};






