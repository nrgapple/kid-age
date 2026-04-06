import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
};

export default function EmptyState({
  eyebrow,
  title,
  body,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text> : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.secondaryText }]}>{body}</Text>
      {children}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.accent, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  eyebrow: {
    fontFamily: "SpaceMono",
    fontSize: 12,
    letterSpacing: 1.1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
    maxWidth: 520,
    marginBottom: 18,
  },
  button: {
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
