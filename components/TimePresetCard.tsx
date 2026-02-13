import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import PercentBar from './PercentBar';
import AdultComparison from './AdultComparison';
import { getPercentOfLife, getAdultEquivalent, formatPercent } from '@/lib/calculations';

type TimePresetCardProps = {
  label: string;
  icon: string;
  durationMinutes: number;
  kidAgeMinutes: number;
  kidColor: string;
};

export default function TimePresetCard({
  label,
  icon,
  durationMinutes,
  kidAgeMinutes,
  kidColor,
}: TimePresetCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const percent = getPercentOfLife(durationMinutes, kidAgeMinutes);
  const adultEquiv = getAdultEquivalent(durationMinutes, kidAgeMinutes);
  const percentDisplay = formatPercent(percent);

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.percentRow}>
        <Text style={[styles.percentText, { color: kidColor }]}>{percentDisplay}</Text>
        <Text style={[styles.ofLife, { color: colors.secondaryText }]}> of their life</Text>
      </View>
      <PercentBar percent={percent} color={kidColor} />
      <AdultComparison equivalentRaw={adultEquiv.raw} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 22,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  percentText: {
    fontSize: 24,
    fontWeight: '700',
  },
  ofLife: {
    fontSize: 14,
  },
});
