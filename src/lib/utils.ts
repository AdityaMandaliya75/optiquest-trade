
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to INR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format large numbers with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

// Format percentage with + or - sign
export function formatPercent(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

// Determine CSS class based on change in value
export function getPriceChangeClass(change: number): string {
  return change > 0 ? 'price-up' : change < 0 ? 'price-down' : 'text-neutral';
}

// Format date for display
export function formatDate(date: Date | number): string {
  return format(date, 'dd MMM yyyy');
}

// Format timestamp for charts
export function formatChartTime(timestamp: number): string {
  return format(new Date(timestamp), 'HH:mm');
}

// Format timestamp for date display
export function formatTimestamp(timestamp: number): string {
  return format(new Date(timestamp), 'dd MMM yyyy HH:mm:ss');
}

// Abbreviate large numbers (e.g., 1.5M, 2.3B)
export function abbreviateNumber(num: number): string {
  if (num >= 1.0e+9) {
    return (num / 1.0e+9).toFixed(1) + 'B';
  }
  if (num >= 1.0e+7) {
    return (num / 1.0e+7).toFixed(1) + 'Cr';
  }
  if (num >= 1.0e+5) {
    return (num / 1.0e+5).toFixed(1) + 'L';
  }
  if (num >= 1.0e+3) {
    return (num / 1.0e+3).toFixed(1) + 'K';
  }
  return num.toString();
}

// Convert date string to format required for option chains
export function formatOptionExpiryDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'dd MMM yyyy');
}

// Generate random fluctuation for demo data
export function generateRandomFluctuation(baseValue: number, maxPercentChange = 0.5): number {
  const percentChange = (Math.random() * maxPercentChange * 2) - maxPercentChange;
  return baseValue * (1 + percentChange / 100);
}
