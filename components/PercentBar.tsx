import { StyleSheet, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type PercentBarProps = {
  percent: number;
  color: string;
  height?: number;
};

export default function PercentBar({ percent, color, height = 8 }: PercentBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const displayPercent = Math.min(Math.max(percent, 0), 100);
  const barWidth = displayPercent > 0 ? Math.max(displayPercent, 0.5) : 0;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: colors.accentLight,
          borderColor: colors.border,
        },
      ]}
    >
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
    width: "100%",
    borderWidth: 1,
    overflow: "hidden",
  },
  fill: {
    minWidth: 4,
  },
});
