import {
  getAgeInMinutes,
  getPercentOfLife,
  getAdultEquivalent,
  formatDuration,
  formatAge,
  formatPercent,
} from '../calculations';

describe('calculations', () => {
  describe('getAgeInMinutes', () => {
    it('returns a positive number for a past date', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const minutes = getAgeInMinutes(oneHourAgo);
      // Should be approximately 60 (allow some tolerance for test runtime)
      expect(minutes).toBeGreaterThanOrEqual(59);
      expect(minutes).toBeLessThanOrEqual(61);
    });

    it('returns 0 for right now', () => {
      const now = new Date();
      const minutes = getAgeInMinutes(now);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThanOrEqual(1);
    });
  });

  describe('getPercentOfLife', () => {
    it('returns 0 if age is 0', () => {
      expect(getPercentOfLife(60, 0)).toBe(0);
    });

    it('returns 0 if age is negative', () => {
      expect(getPercentOfLife(60, -100)).toBe(0);
    });

    it('calculates correct percentage', () => {
      // 60 minutes out of 600 minutes = 10%
      expect(getPercentOfLife(60, 600)).toBe(10);
    });

    it('can return values over 100%', () => {
      // Duration longer than age (theoretically possible input)
      expect(getPercentOfLife(200, 100)).toBe(200);
    });

    it('handles very small percentages', () => {
      // 1 minute out of 525600 minutes (1 year)
      const pct = getPercentOfLife(1, 525600);
      expect(pct).toBeCloseTo(0.00019, 4);
    });
  });

  describe('getAdultEquivalent', () => {
    it('returns 0 for zero kid age', () => {
      const result = getAdultEquivalent(120, 0);
      expect(result.value).toBe(0);
    });

    it('returns a larger equivalent for a young kid', () => {
      // For a 1-year-old, a 2-hour plane ride (120 min)
      // kidAge = 525600 min (1 year)
      // adult equivalent = (120 / 525600) * (30 * 525600) = 120 * 30 = 3600 min = 60 hours = 2.5 days
      const result = getAdultEquivalent(120, 525600, 30);
      expect(result.value).toBe(2.5);
      expect(result.unit).toBe('days');
    });

    it('returns same duration when kid is 30 years old', () => {
      // If kid is 30 and adult reference is 30, equivalent = same duration
      const thirtyYearsInMinutes = 30 * 525600;
      const result = getAdultEquivalent(120, thirtyYearsInMinutes, 30);
      expect(result.value).toBe(2);
      expect(result.unit).toBe('hours');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds for < 1 minute', () => {
      const result = formatDuration(0.5);
      expect(result.value).toBe(30);
      expect(result.unit).toBe('seconds');
    });

    it('formats minutes', () => {
      const result = formatDuration(45);
      expect(result.value).toBe(45);
      expect(result.unit).toBe('minutes');
    });

    it('formats hours', () => {
      const result = formatDuration(150);
      expect(result.value).toBe(2.5);
      expect(result.unit).toBe('hours');
    });

    it('formats days', () => {
      const result = formatDuration(4320); // 3 days
      expect(result.value).toBe(3);
      expect(result.unit).toBe('days');
    });

    it('formats weeks', () => {
      const result = formatDuration(20160); // 2 weeks
      expect(result.value).toBe(2);
      expect(result.unit).toBe('weeks');
    });

    it('formats months', () => {
      const result = formatDuration(86400); // ~2 months
      expect(result.value).toBe(2);
      expect(result.unit).toBe('months');
    });

    it('formats years', () => {
      const result = formatDuration(1051200); // 2 years
      expect(result.value).toBe(2);
      expect(result.unit).toBe('years');
    });

    it('uses singular form for value of 1', () => {
      expect(formatDuration(60).unit).toBe('hour');
      expect(formatDuration(1440).unit).toBe('day');
      expect(formatDuration(10080).unit).toBe('week');
    });
  });

  describe('formatAge', () => {
    it('formats a newborn (days old)', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const result = formatAge(fiveDaysAgo);
      expect(result).toBe('5 days old');
    });

    it('formats 1 day old singular', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = formatAge(yesterday);
      expect(result).toBe('1 day old');
    });

    it('formats months for babies under 1 year', () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const result = formatAge(sixMonthsAgo);
      expect(result).toContain('month');
      expect(result).toContain('old');
    });

    it('formats years for older kids', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const result = formatAge(twoYearsAgo);
      expect(result).toContain('2 years');
      expect(result).toContain('old');
    });

    it('formats 1 year with singular', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const result = formatAge(oneYearAgo);
      expect(result).toContain('1 year');
    });
  });

  describe('formatPercent', () => {
    it('formats large percentages with 1 decimal', () => {
      expect(formatPercent(15.67)).toBe('15.7%');
    });

    it('formats small percentages with more precision', () => {
      expect(formatPercent(0.05)).toBe('0.05%');
    });

    it('formats very small percentages with 4 decimals', () => {
      expect(formatPercent(0.0012)).toBe('0.0012%');
    });

    it('formats tiny percentages with scientific notation', () => {
      const result = formatPercent(0.00001);
      expect(result).toContain('e');
      expect(result).toContain('%');
    });
  });
});
