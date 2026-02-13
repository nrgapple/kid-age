import React from 'react';
import { View, StyleSheet } from 'react-native';

type PercentBarProps = {
  percent: number;
  color: string;
  height?: number;
};

export default function PercentBar({ percent, color, height = 8 }: PercentBarProps) {
  // Clamp between 0 and 100 for display, but use a minimum width so tiny values are visible
  const displayPercent = Math.min(Math.max(percent, 0), 100);
  const barWidth = displayPercent > 0 ? Math.max(displayPercent, 0.5) : 0;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${barWidth}%`,
            backgroundColor: color,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
    overflow: 'hidden',
  },
  fill: {
    minWidth: 4,
  },
});
