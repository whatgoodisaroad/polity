import type { State } from "./game";

export interface Stat {
  value: number;
  lifecycle: 'game' | 'turn';
  displayName?: string;
  display?: boolean;
  max?: number;
}

export type StatKey =
  | 'money'
  | 'ap'
  | 'residentialTaxRate'
  | 'residentialApplications'
  | 'commercialApplications'
  | 'industrialApplications';

export function modifyStat(
  state: State,
  key: StatKey,
  fn: (value: number) => number
): State {
  const stats = new Map(state.stats);
  let stat = stats.get(key);
  if (!stat) {
    stat = initStat(key);
  } 
  if (!stat) {
    throw `Failed to get stat ${key}`;
  }
  stat = { ...stat };

  stat.value = fn(stat.value);
  if (stat.max && stat.value > stat.max) {
    stat.value = stat.max;
  }
  stats.set(key, stat);
  
  return {
    ...state,
    stats,
  }
}

export function getStatValue(state: State, key: StatKey): number {
  let stat = state.stats.get(key);
  if (!stat) {
    stat = initStat(key);
  }
  if (!stat) {
    throw 'Failed to initialize stat';
  }
  return stat.value;
}

export function initStat(key: StatKey): Stat {
  if (key === 'money') {
    return { value: 10_000, lifecycle: 'game', display: true };
  } else if (key === 'ap') {
    return { value: 4, max: 20, lifecycle: 'game', display: true };
  } else if (key === 'residentialTaxRate') {
    return { value: 0.05, max: 0.5, lifecycle: 'game' };
  } else if (key === 'residentialApplications') {
    return { value: 2, max: 20, display: true, lifecycle: 'game' };
  } else if (key === 'commercialApplications') {
    return { value: 0, max: 20, display: true, lifecycle: 'game' };
  } else if (key === 'industrialApplications') {
    return { value: 0, max: 20, display: true, lifecycle: 'game' };
  }
  throw `Unrecognized stat ${key}`;
}