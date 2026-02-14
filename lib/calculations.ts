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
 * Get a relatable real-world analogy for a duration in minutes.
 * Maps durations to common adult experiences to make them tangible.
 */
export function getAnalogy(totalMinutes: number): string | null {
  if (totalMinutes < 5) return null;
  if (totalMinutes < 30) return "Like waiting for your coffee order";
  if (totalMinutes < 60) return "Like being stuck in a long meeting";
  if (totalMinutes < MINUTES_PER_HOUR * 3) return "Like sitting through a movie marathon";
  if (totalMinutes < MINUTES_PER_DAY) return "Like pulling an all-nighter at work";
  if (totalMinutes < MINUTES_PER_DAY * 2) return "Like a full work day that never ends";
  if (totalMinutes < MINUTES_PER_WEEK) return "Like a long weekend road trip";
  if (totalMinutes < MINUTES_PER_WEEK * 2) return "Like a full work week with overtime";
  if (totalMinutes < MINUTES_PER_MONTH) return "Like waiting for next month's paycheck";
  if (totalMinutes < MINUTES_PER_MONTH * 3) return "Like training for a marathon";
  if (totalMinutes < MINUTES_PER_MONTH * 6) return "Like a semester of college classes";
  if (totalMinutes < MINUTES_PER_YEAR) return "Like waiting for the holidays all year";
  if (totalMinutes < MINUTES_PER_YEAR * 2) return "Like the gap between Olympic Games";
  if (totalMinutes < MINUTES_PER_YEAR * 5) return "Like getting a college degree";
  return "Like waiting to pay off a mortgage";
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
