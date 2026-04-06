import { StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
};

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
}: PageHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, centered && styles.centered]}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { color: colors.accent }, centered && styles.centeredText]}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={[styles.title, { color: colors.text }, centered && styles.centeredText]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            { color: colors.secondaryText },
            centered && styles.centeredText,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  centered: {
    alignItems: "center",
  },
  eyebrow: {
    fontFamily: "SpaceMono",
    fontSize: 12,
    letterSpacing: 1.1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 640,
  },
  centeredText: {
    textAlign: "center",
  },
});
