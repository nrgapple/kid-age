import { differenceInMinutes, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const MINUTES_PER_WEEK = 10080;
const MINUTES_PER_MONTH = 43200; // ~30 days
const MINUTES_PER_YEAR = 525600;

/**
 * Get a kid's exact age in minutes from birth to now.
 */
export function getAgeInMinutes(birthDate: Date): number {
  return differenceInMinutes(new Date(), birthDate);
}

/**
 * What percentage of the kid's life this duration represents.
 */
export function getPercentOfLife(durationMinutes: number, ageMinutes: number): number {
  if (ageMinutes <= 0) return 0;
  return (durationMinutes / ageMinutes) * 100;
}

/**
 * Given a duration and a kid's age, compute the equivalent duration
 * a reference adult (default 30 years old) would need to experience
 * for it to feel the same relative proportion of their life.
 *
 * Formula: adultEquivalent = (duration / kidAge) * adultAge
 */
export function getAdultEquivalent(
  durationMinutes: number,
  kidAgeMinutes: number,
  adultAgeYears: number = 30
): { value: number; unit: string; raw: string } {
  if (kidAgeMinutes <= 0) return { value: 0, unit: 'minutes', raw: '0 minutes' };

  const adultAgeMinutes = adultAgeYears * MINUTES_PER_YEAR;
  const equivalentMinutes = (durationMinutes / kidAgeMinutes) * adultAgeMinutes;

  return formatDuration(equivalentMinutes);
}

/**
 * Format a duration in minutes into the most readable unit.
 */
export function formatDuration(totalMinutes: number): { value: number; unit: string; raw: string } {
  if (totalMinutes < 1) {
    const seconds = Math.round(totalMinutes * 60);
    return { value: seconds, unit: seconds === 1 ? 'second' : 'seconds', raw: `${seconds} ${seconds === 1 ? 'second' : 'seconds'}` };
  }
  if (totalMinutes < MINUTES_PER_HOUR) {
    const val = Math.round(totalMinutes * 10) / 10;
    return { value: val, unit: val === 1 ? 'minute' : 'minutes', raw: `${val} ${val === 1 ? 'minute' : 'minutes'}` };
  }
  if (totalMinutes < MINUTES_PER_DAY) {
    const val = Math.round((totalMinutes / MINUTES_PER_HOUR) * 10) / 10;
    return { value: val, unit: val === 1 ? 'hour' : 'hours', raw: `${val} ${val === 1 ? 'hour' : 'hours'}` };
  }
  if (totalMinutes < MINUTES_PER_WEEK) {
    const val = Math.round((totalMinutes / MINUTES_PER_DAY) * 10) / 10;
    return { value: val, unit: val === 1 ? 'day' : 'days', raw: `${val} ${val === 1 ? 'day' : 'days'}` };
  }
  if (totalMinutes < MINUTES_PER_MONTH) {
    const val = Math.round((totalMinutes / MINUTES_PER_WEEK) * 10) / 10;
    return { value: val, unit: val === 1 ? 'week' : 'weeks', raw: `${val} ${val === 1 ? 'week' : 'weeks'}` };
  }
  if (totalMinutes < MINUTES_PER_YEAR) {
    const val = Math.round((totalMinutes / MINUTES_PER_MONTH) * 10) / 10;
    return { value: val, unit: val === 1 ? 'month' : 'months', raw: `${val} ${val === 1 ? 'month' : 'months'}` };
  }
  const val = Math.round((totalMinutes / MINUTES_PER_YEAR) * 10) / 10;
  return { value: val, unit: val === 1 ? 'year' : 'years', raw: `${val} ${val === 1 ? 'year' : 'years'}` };
}

/**
 * Format a kid's age as a human-readable string.
 */
export function formatAge(birthDate: Date): string {
  const now = new Date();
  const years = differenceInYears(now, birthDate);
  const monthsTotal = differenceInMonths(now, birthDate);
  const months = monthsTotal - years * 12;
  const daysTotal = differenceInDays(now, birthDate);

  // For very young babies (< 1 month)
  if (monthsTotal === 0) {
    return `${daysTotal} ${daysTotal === 1 ? 'day' : 'days'} old`;
  }

  // Under 1 year
  if (years === 0) {
    const remainingDays = daysTotal - months * 30; // approximate
    if (remainingDays > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}, ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} old`;
    }
    return `${months} ${months === 1 ? 'month' : 'months'} old`;
  }

  // 1+ years
  const parts: string[] = [];
  parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  }
  return parts.join(', ') + ' old';
}

/**
 * Format a percentage for display.
 * Uses scientific notation for very small values.
 */
export function formatPercent(percent: number): string {
  if (percent >= 1) {
    return `${Math.round(percent * 10) / 10}%`;
  }
  if (percent >= 0.01) {
    return `${Math.round(percent * 1000) / 1000}%`;
  }
  if (percent >= 0.0001) {
    return `${percent.toFixed(4)}%`;
  }
  return `${percent.toExponential(2)}%`;
}
