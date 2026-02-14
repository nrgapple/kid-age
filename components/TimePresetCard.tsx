import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import PercentBar from './PercentBar';
import AdultComparison from './AdultComparison';
import { getPercentOfLife, getAdultEquivalent, formatPercent } from '@/lib/calculations';
import { lightHaptic } from '@/lib/haptics';

type TimePresetCardProps = {
  label: string;
  icon: string;
  durationMinutes: number;
  kidAgeMinutes: number;
  kidColor: string;
  adultAge?: number;
  onShare?: (label: string, percent: string, adultEquiv: string) => void;
  defaultExpanded?: boolean;
};

export default function TimePresetCard({
  label,
  icon,
  durationMinutes,
  kidAgeMinutes,
  kidColor,
  adultAge,
  onShare,
  defaultExpanded = false,
}: TimePresetCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [detailHeight, setDetailHeight] = useState(0);
  const [measured, setMeasured] = useState(false);

  const animHeight = useSharedValue(defaultExpanded ? 1 : 0);

  const percent = getPercentOfLife(durationMinutes, kidAgeMinutes);
  const adultEquiv = getAdultEquivalent(durationMinutes, kidAgeMinutes, adultAge);
  const percentDisplay = formatPercent(percent);

  const toggleExpanded = () => {
    lightHaptic();
    const next = !expanded;
    setExpanded(next);
    animHeight.value = withTiming(next ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const detailAnimStyle = useAnimatedStyle(() => ({
    height: measured ? animHeight.value * detailHeight : undefined,
    opacity: animHeight.value,
    overflow: 'hidden' as const,
  }));

  return (
    <Pressable
      onPress={toggleExpanded}
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      {/* Compact header — always visible */}
      <View style={styles.compactRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.percentCompact, { color: kidColor }]}>{percentDisplay}</Text>
        {onShare && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onShare(label, percentDisplay, adultEquiv.raw);
            }}
            hitSlop={8}
            style={styles.shareButton}
          >
            <Text style={[styles.shareIcon, { color: colors.secondaryText }]}>↗</Text>
          </Pressable>
        )}
        <Text style={[styles.chevron, { color: colors.secondaryText }]}>
          {expanded ? '▾' : '›'}
        </Text>
      </View>

      {/* Expandable detail section */}
      <Animated.View style={detailAnimStyle}>
        <View
          onLayout={(e) => {
            if (!measured) {
              setDetailHeight(e.nativeEvent.layout.height);
              setMeasured(true);
              if (defaultExpanded) {
                animHeight.value = 1;
              }
            }
          }}
          style={measured ? undefined : styles.offscreen}
        >
          <View style={styles.detailContent}>
            <View style={styles.percentRow}>
              <Text style={[styles.percentText, { color: kidColor }]}>{percentDisplay}</Text>
              <Text style={[styles.ofLife, { color: colors.secondaryText }]}> of their life</Text>
            </View>
            <PercentBar percent={percent} color={kidColor} />
            <AdultComparison equivalentRaw={adultEquiv.raw} adultAge={adultAge} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  percentCompact: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  shareButton: {
    marginLeft: 8,
    padding: 4,
  },
  shareIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
    width: 16,
    textAlign: 'center',
  },
  offscreen: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    right: 0,
  },
  detailContent: {
    paddingTop: 12,
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
