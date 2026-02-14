import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getAnalogy, formatDuration } from '@/lib/calculations';

type AdultComparisonProps = {
  equivalentRaw: string;
  adultAge?: number;
};

export default function AdultComparison({ equivalentRaw, adultAge = 30 }: AdultComparisonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Parse the raw string to get the duration for analogy lookup
  // The equivalentRaw is already formatted, we need to reverse-engineer minutes for the analogy
  // Instead, we accept an optional equivalentMinutes prop or just use a rough estimate
  const analogy = getAnalogyFromRaw(equivalentRaw);

  return (
    <View style={[styles.container, { backgroundColor: colors.accentLight }]}>
      <Text style={[styles.label, { color: colors.secondaryText }]}>
        To a {adultAge}-year-old, this feels like
      </Text>
      <Text style={[styles.value, { color: colors.accent }]}>
        {equivalentRaw}
      </Text>
      {analogy && (
        <Text style={[styles.analogy, { color: colors.secondaryText }]}>
          {analogy}
        </Text>
      )}
    </View>
  );
}

/**
 * Rough reverse-parse of the formatted duration string to get approximate minutes
 * for analogy lookup, then return the analogy.
 */
function getAnalogyFromRaw(raw: string): string | null {
  const parts = raw.split(' ');
  if (parts.length < 2) return null;
  const num = parseFloat(parts[0]);
  if (isNaN(num)) return null;
  const unit = parts[1].toLowerCase();

  let minutes = 0;
  if (unit.startsWith('second')) minutes = num / 60;
  else if (unit.startsWith('minute')) minutes = num;
  else if (unit.startsWith('hour')) minutes = num * 60;
  else if (unit.startsWith('day')) minutes = num * 1440;
  else if (unit.startsWith('week')) minutes = num * 10080;
  else if (unit.startsWith('month')) minutes = num * 43200;
  else if (unit.startsWith('year')) minutes = num * 525600;

  return getAnalogy(minutes);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  analogy: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
});
