import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { formatAge, getAdultEquivalent, getAgeInMinutes } from "@/lib/calculations";
import { PRESETS } from "@/lib/presets";
import type { Kid } from "@/lib/types";

type DailyInsightCardProps = {
  kid: Kid;
  onPress: () => void;
};

/**
 * Pick a deterministic "daily" preset index based on kid id + today's date.
 */
function getDailyPresetIndex(kidId: string, presetCount: number): number {
  const today = new Date();
  const seed = `${kidId}-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % presetCount;
}

export default function DailyInsightCard({ kid, onPress }: DailyInsightCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const presetIndex = getDailyPresetIndex(kid.id, PRESETS.length);
  const preset = PRESETS[presetIndex];
  const birthDate = new Date(kid.birthDate);
  const ageMinutes = getAgeInMinutes(birthDate);
  const adultEquiv = getAdultEquivalent(preset.minutes, ageMinutes);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: `${kid.color}18`,
          borderColor: `${kid.color}40`,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: kid.color }]}>
          <Text style={styles.avatarText}>{kid.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]}>{kid.name}</Text>
          <Text style={[styles.age, { color: colors.secondaryText }]}>{formatAge(birthDate)}</Text>
        </View>
        <Text style={[styles.presetLabel, { color: colors.secondaryText }]}>{preset.label}</Text>
      </View>
      <Text style={[styles.insight, { color: colors.text }]}>
        Today&apos;s anchor: <Text style={{ fontWeight: "800" }}>{preset.label.toLowerCase()}</Text>{" "}
        feels like <Text style={[styles.highlight, { color: kid.color }]}>{adultEquiv.raw}</Text> to
        you
      </Text>
      <Text style={[styles.tapHint, { color: colors.secondaryText }]}>
        Open the profile for more comparisons
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  age: {
    fontSize: 13,
  },
  presetLabel: {
    fontFamily: "SpaceMono",
    fontSize: 11,
    textAlign: "right",
    maxWidth: 92,
  },
  insight: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 6,
  },
  highlight: {
    fontWeight: "800",
    fontSize: 18,
  },
  tapHint: {
    fontSize: 13,
    fontStyle: "italic",
  },
});
