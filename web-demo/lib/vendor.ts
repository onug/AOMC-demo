/**
 * Vendor helper utilities for components.
 *
 * All functions are safe to call when vendorConfig is null — they return
 * sensible defaults so components don't need null-checking everywhere.
 */

import { ControlKey } from './types';
import vendorConfig from './vendor-config';

export const isVendorMode: boolean = vendorConfig !== null;

export function getVendorName(): string {
  return vendorConfig?.name ?? 'AOMC';
}

export function getVendorLogoUrl(): string | undefined {
  return vendorConfig?.logoUrl ?? undefined;
}

export function getVendorAccentColor(): string {
  return vendorConfig?.accentColor ?? '#f97316'; // default orange
}

export function getVendorTagline(): string | undefined {
  return vendorConfig?.tagline ?? undefined;
}

export function getVendorWebsite(): string | undefined {
  return vendorConfig?.website ?? undefined;
}

export function vendorCoversControl(key: ControlKey): boolean {
  return vendorConfig?.controls[key] !== undefined;
}

export function getVendorProductForControl(key: ControlKey): string | undefined {
  return vendorConfig?.controls[key]?.productName;
}

export function getVendorCoveredCount(): number {
  if (!vendorConfig) return 0;
  return Object.keys(vendorConfig.controls).length;
}
