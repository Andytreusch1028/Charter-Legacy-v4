// Simple feature flag registry with environment and localStorage overrides
// Usage: if (isEnabled('newWizard')) { ... }

type FlagName =
  | 'newDashboard'
  | 'newStaffNode'
  | 'newWizards'
  | 'v2DataClients'
  | 'strictServicesLayer';

const defaultFlags: Record<FlagName, boolean> = {
  newDashboard: false,
  newStaffNode: false,
  newWizards: false,
  v2DataClients: false,
  strictServicesLayer: false,
};

function readEnv(name: string): boolean | undefined {
  // Vite exposes import.meta.env; Node exposes process.env in tests/build
  const v = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name])
    || (typeof process !== 'undefined' && process.env && process.env[name]);
  if (typeof v === 'string') {
    if (v.toLowerCase() === 'true') return true;
    if (v.toLowerCase() === 'false') return false;
  }
  return undefined;
}

export function isEnabled(flag: FlagName): boolean {
  try {
    const ls = typeof localStorage !== 'undefined' ? localStorage.getItem(`flag:${flag}`) : null;
    if (ls === 'true') return true;
    if (ls === 'false') return false;
  } catch (_) {}

  const env = readEnv(`VITE_FLAG_${flag.toUpperCase()}`.replace(/-/g, '_'));
  if (typeof env === 'boolean') return env;

  return defaultFlags[flag];
}

export function setLocalOverride(flag: FlagName, value: boolean) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(`flag:${flag}`, value ? 'true' : 'false');
}

export function clearLocalOverride(flag: FlagName) {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(`flag:${flag}`);
}

export type { FlagName };
