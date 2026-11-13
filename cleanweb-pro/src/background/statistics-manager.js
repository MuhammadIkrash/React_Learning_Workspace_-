/**
 * @file statistics-manager.js
 * Local-only counters. Nothing here ever leaves the device — see the Privacy
 * page (src/dashboard) for the plain-language explanation of this data.
 */

import { getStatistics, setStatistics } from './storage-manager.js';
import { todayKey } from '../shared/utils.js';
import { logger } from '../shared/logger.js';

/**
 * @param {string} statKey one of STAT_KEYS values
 * @param {number} amount
 */
export async function incrementStat(statKey, amount = 1) {
  const stats = await getStatistics();
  const day = todayKey();

  const next = { ...stats };
  next[statKey] = (next[statKey] || 0) + amount;

  next.dailyLog = { ...next.dailyLog };
  const dayLog = { ...(next.dailyLog[day] || {}) };
  dayLog[statKey] = (dayLog[statKey] || 0) + amount;
  next.dailyLog[day] = dayLog;

  // Keep only the last 30 days of daily logs to bound storage growth.
  const days = Object.keys(next.dailyLog).sort();
  if (days.length > 30) {
    for (const staleDay of days.slice(0, days.length - 30)) {
      delete next.dailyLog[staleDay];
    }
  }

  await setStatistics(next);
  logger.debug('Stat incremented', statKey, amount);
  return next;
}

function sumRange(dailyLog, numDays) {
  const now = new Date();
  const totals = {};
  for (let i = 0; i < numDays; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = dailyLog[key];
    if (!entry) continue;
    for (const [k, v] of Object.entries(entry)) {
      totals[k] = (totals[k] || 0) + v;
    }
  }
  return totals;
}

/** Returns { today, last7, last30, allTime } summaries used by popup + dashboard. */
export async function getStatisticsSummary() {
  const stats = await getStatistics();
  const dailyLog = stats.dailyLog || {};
  const today = dailyLog[todayKey()] || {};
  const last7 = sumRange(dailyLog, 7);
  const last30 = sumRange(dailyLog, 30);
  const allTime = { ...stats };
  delete allTime.dailyLog;
  return { today, last7, last30, allTime };
}

export async function resetStatistics() {
  const { DEFAULT_STATISTICS } = await import('../shared/defaults.js');
  await setStatistics(DEFAULT_STATISTICS);
}
