import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import PercentBar from "@/components/PercentBar";
import SurfaceCard from "@/components/SurfaceCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  formatPercent,
  getAdultEquivalent,
  getAgeInMinutes,
  getPercentOfLife,
} from "@/lib/calculations";
import { PRESETS } from "@/lib/presets";
import { getKids, getSettings } from "@/lib/storage";
import { DEFAULT_SETTINGS, type Kid } from "@/lib/types";

export default function CompareScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKids, setSelectedKids] = useState<Set<string>>(new Set());
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [adultAge, setAdultAge] = useState(DEFAULT_SETTINGS.adultAge);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [loadedKids, settings] = await Promise.all([getKids(), getSettings()]);
        setKids(loadedKids);
        setAdultAge(settings.adultAge);
        setSelectedKids(new Set(loadedKids.map((kid) => kid.id)));
      })();
    }, []),
  );

  const toggleKid = (kidId: string) => {
    setSelectedKids((current) => {
      const next = new Set(current);
      if (next.has(kidId)) {
        next.delete(kidId);
      } else {
        next.add(kidId);
      }
      return next;
    });
  };

  if (kids.length < 2) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <EmptyState
          eyebrow="Need more profiles"
          title="Compare needs at least two children"
          body="Add one more profile and this view will line up the same event across each child so you can see who experiences it more intensely."
        />
      </View>
    );
  }

  const preset = PRESETS[selectedPresetIndex];
  const comparedKids = kids.filter((kid) => selectedKids.has(kid.id));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        eyebrow="Cross-profile view"
        title="Compare one event across your kids"
        subtitle={`Using ${adultAge} years old as the adult reference point.`}
      />

      <SurfaceCard accent style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>How to read this</Text>
        <Text style={[styles.cardBody, { color: colors.secondaryText }]}>
          Larger percentages mean the event takes up more of that child&apos;s lifetime, so it will
          usually feel longer and heavier.
        </Text>
      </SurfaceCard>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Who is included</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.selector}
      >
        {kids.map((kid) => {
          const selected = selectedKids.has(kid.id);
          return (
            <Pressable
              key={kid.id}
              onPress={() => toggleKid(kid.id)}
              style={[
                styles.kidChip,
                {
                  backgroundColor: selected ? `${kid.color}22` : colors.cardBackground,
                  borderColor: selected ? kid.color : colors.border,
                },
              ]}
            >
              <View style={[styles.kidChipAvatar, { backgroundColor: kid.color }]}>
                <Text style={styles.kidChipAvatarText}>{kid.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text
                style={[
                  styles.kidChipName,
                  { color: selected ? colors.text : colors.secondaryText },
                ]}
              >
                {kid.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Which event</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.selector}
      >
        {PRESETS.map((item, index) => {
          const active = index === selectedPresetIndex;
          return (
            <Pressable
              key={item.label}
              onPress={() => setSelectedPresetIndex(index)}
              style={[
                styles.eventChip,
                {
                  backgroundColor: active ? colors.accent : colors.cardBackground,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.eventIcon}>{item.icon}</Text>
              <Text
                style={[styles.eventLabel, { color: active ? "#fff" : colors.secondaryText }]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Comparison</Text>
      {comparedKids.length === 0 ? (
        <SurfaceCard>
          <Text style={[styles.noSelectionText, { color: colors.secondaryText }]}>
            Select at least one child above.
          </Text>
        </SurfaceCard>
      ) : (
        comparedKids.map((kid) => {
          const ageMinutes = getAgeInMinutes(new Date(kid.birthDate));
          const percent = getPercentOfLife(preset.minutes, ageMinutes);
          const adultEquivalent = getAdultEquivalent(preset.minutes, ageMinutes, adultAge);

          return (
            <SurfaceCard key={kid.id} style={styles.resultCard}>
              <View style={styles.compareHeader}>
                <View style={[styles.compareAvatar, { backgroundColor: kid.color }]}>
                  <Text style={styles.compareAvatarText}>{kid.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.compareInfo}>
                  <Text style={[styles.compareName, { color: colors.text }]}>{kid.name}</Text>
                  <Text style={[styles.compareMeta, { color: kid.color }]}>
                    {formatPercent(percent)} of their life
                  </Text>
                </View>
              </View>

              <PercentBar percent={percent} color={kid.color} height={10} />

              <Text style={[styles.compareDescription, { color: colors.secondaryText }]}>
                For a {adultAge}-year-old, that lands closer to{" "}
                <Text style={[styles.highlight, { color: colors.accent }]}>
                  {adultEquivalent.raw}
                </Text>
                .
              </Text>
            </SurfaceCard>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  selector: {
    marginBottom: 18,
  },
  chipRow: {
    gap: 10,
  },
  kidChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  kidChipAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  kidChipAvatarText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  kidChipName: {
    fontSize: 14,
    fontWeight: "700",
  },
  eventChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 180,
  },
  eventIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  eventLabel: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  resultCard: {
    marginBottom: 12,
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  compareAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  compareAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  compareInfo: {
    flex: 1,
  },
  compareName: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  compareMeta: {
    fontSize: 15,
    fontWeight: "700",
  },
  compareDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
  highlight: {
    fontWeight: "800",
  },
  noSelectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
