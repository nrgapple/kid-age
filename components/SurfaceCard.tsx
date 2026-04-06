import type { PropsWithChildren } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type SurfaceCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
}>;

export default function SurfaceCard({ children, style, accent = false }: SurfaceCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: accent ? colors.accentLight : colors.cardBackground,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
});
