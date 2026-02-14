import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Share, Platform } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import PercentBar from './PercentBar';
import AdultComparison from './AdultComparison';
import { getPercentOfLife, getAdultEquivalent, formatPercent } from '@/lib/calculations';

type Unit = 'minutes' | 'hours' | 'days' | 'weeks';

const UNIT_TO_MINUTES: Record<Unit, number> = {
  minutes: 1,
  hours: 60,
  days: 1440,
  weeks: 10080,
};

type CustomDurationInputProps = {
  kidAgeMinutes: number;
  kidColor: string;
  adultAge?: number;
  kidName?: string;
};

export default function CustomDurationInput({
  kidAgeMinutes,
  kidColor,
  adultAge,
  kidName,
}: CustomDurationInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<Unit>('hours');

  const numericValue = parseFloat(value) || 0;
  const totalMinutes = numericValue * UNIT_TO_MINUTES[unit];
  const hasInput = numericValue > 0;

  const percent = hasInput ? getPercentOfLife(totalMinutes, kidAgeMinutes) : 0;
  const adultEquiv = hasInput ? getAdultEquivalent(totalMinutes, kidAgeMinutes, adultAge) : null;

  const units: Unit[] = ['minutes', 'hours', 'days', 'weeks'];

  const handleShare = () => {
    if (!hasInput || !adultEquiv) return;
    const durationLabel = `${numericValue} ${unit}`;
    const name = kidName || 'your child';
    const message = `Did you know? ${durationLabel} is ${formatPercent(percent)} of ${name}'s life! To a ${adultAge || 30}-year-old, that feels like ${adultEquiv.raw}.\n\n— Time Through Their Eyes`;
    if (Platform.OS === 'web') {
      if (navigator.share) {
        navigator.share({ text: message }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(message);
      }
    } else {
      Share.share({ message });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          value={value}
          onChangeText={setValue}
          placeholder="Enter amount"
          placeholderTextColor={colors.secondaryText}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitRow}>
        {units.map((u) => (
          <Pressable
            key={u}
            onPress={() => setUnit(u)}
            style={[
              styles.unitButton,
              {
                backgroundColor: unit === u ? kidColor : colors.background,
                borderColor: unit === u ? kidColor : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.unitText,
                { color: unit === u ? '#fff' : colors.secondaryText },
              ]}
            >
              {u}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {hasInput && (
        <View style={styles.result}>
          <View style={styles.percentRow}>
            <Text style={[styles.percentText, { color: kidColor }]}>
              {formatPercent(percent)}
            </Text>
            <Text style={[styles.ofLife, { color: colors.secondaryText }]}> of their life</Text>
            <Pressable onPress={handleShare} hitSlop={8} style={styles.shareButton}>
              <Text style={[styles.shareIcon, { color: colors.secondaryText }]}>↗</Text>
            </Pressable>
          </View>
          <PercentBar percent={percent} color={kidColor} />
          {adultEquiv && <AdultComparison equivalentRaw={adultEquiv.raw} adultAge={adultAge} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  inputRow: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '500',
  },
  unitRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  unitButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  result: {
    marginTop: 16,
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
    flex: 1,
  },
  shareButton: {
    padding: 4,
  },
  shareIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
});
