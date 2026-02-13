import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

type AdultComparisonProps = {
  equivalentRaw: string;
  adultAge?: number;
};

export default function AdultComparison({ equivalentRaw, adultAge = 30 }: AdultComparisonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.accentLight }]}>
      <Text style={[styles.label, { color: colors.secondaryText }]}>
        To a {adultAge}-year-old, this feels like
      </Text>
      <Text style={[styles.value, { color: colors.accent }]}>
        {equivalentRaw}
      </Text>
    </View>
  );
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
});
