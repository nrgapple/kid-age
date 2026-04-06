import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DailyInsightCard from "@/components/DailyInsightCard";
import EmptyState from "@/components/EmptyState";
import KidCard from "@/components/KidCard";
import PageHeader from "@/components/PageHeader";
import SurfaceCard from "@/components/SurfaceCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { lightHaptic } from "@/lib/haptics";
import { confirmAction } from "@/lib/platform";
import { deleteKid, getKids } from "@/lib/storage";
import type { Kid } from "@/lib/types";

const PERSPECTIVE_NOTES = [
  {
    title: "Small waits hit hard",
    body: "A short delay can still land like a major interruption when you have only been alive for a few years.",
  },
  {
    title: "Routine scales differently",
    body: "Daily transitions feel larger because they occupy a bigger share of a child’s lived experience.",
  },
  {
    title: "Trips and breaks expand",
    body: "Travel days, weekends, and school breaks feel stretched because they take up a larger fraction of life.",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [kids, setKids] = useState<Kid[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadKids = useCallback(async () => {
    const loadedKids = await getKids();
    setKids(loadedKids);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadKids();
    }, [loadKids]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadKids();
    setRefreshing(false);
  }, [loadKids]);

  const handleDelete = useCallback(
    (kid: Kid) => {
      confirmAction({
        title: "Remove child",
        message: `Remove ${kid.name} from this device? This does not sync anywhere else.`,
        confirmText: "Remove",
        destructive: true,
        onConfirm: async () => {
          await deleteKid(kid.id);
          await loadKids();
        },
      });
    },
    [loadKids],
  );

  const renderEmpty = () => (
    <EmptyState
      eyebrow="First setup"
      title="Build a time map for your family"
      body="Add one child profile to start translating everyday moments into proportions they can actually feel."
      actionLabel="Add a child"
      onAction={() => router.push("/kid/add")}
    >
      <View style={styles.noteStack}>
        {PERSPECTIVE_NOTES.map((note, index) => (
          <SurfaceCard key={note.title} accent={index === 0} style={styles.noteCard}>
            <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
            <Text style={[styles.noteBody, { color: colors.secondaryText }]}>{note.body}</Text>
          </SurfaceCard>
        ))}
      </View>
    </EmptyState>
  );

  const renderListHeader = () => {
    if (kids.length === 0) return null;

    return (
      <View style={styles.headerBlock}>
        <PageHeader
          eyebrow="Daily view"
          title="Time through their eyes"
          subtitle="A quick read on how ordinary moments scale for the children you track here."
        />

        <SurfaceCard accent style={styles.editorialCard}>
          <Text style={[styles.editorialEyebrow, { color: colors.accent }]}>
            Perspective journal
          </Text>
          <Text style={[styles.editorialBody, { color: colors.text }]}>
            These cards are strongest when you treat them as conversation starters, not exact
            science. They help you recalibrate patience around waiting, travel, routines, and
            change.
          </Text>
        </SurfaceCard>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>Today&apos;s perspective</Text>
        {kids.map((kid) => (
          <DailyInsightCard key={kid.id} kid={kid} onPress={() => router.push(`/kid/${kid.id}`)} />
        ))}

        <View style={styles.rowHeader}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Profiles</Text>
          <Text style={[styles.sectionHint, { color: colors.secondaryText }]}>
            Swipe on mobile or use the inline remove button on web
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={kids}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <KidCard
            kid={item}
            onPress={() => router.push(`/kid/${item.id}`)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={[styles.list, kids.length === 0 && styles.listEmpty]}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.cardBackground}
            title="Refreshing"
            titleColor={colors.secondaryText}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {kids.length > 0 ? (
        <Pressable
          onPress={() => {
            lightHaptic();
            router.push("/kid/add");
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: colors.accent,
              bottom: insets.bottom + 18,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Text style={styles.fabText}>New</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 20,
    paddingBottom: 104,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  headerBlock: {
    marginBottom: 12,
  },
  editorialCard: {
    marginBottom: 22,
  },
  editorialEyebrow: {
    fontFamily: "SpaceMono",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  editorialBody: {
    fontSize: 15,
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  sectionHint: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right",
    marginLeft: 12,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
  },
  noteStack: {
    width: "100%",
    marginBottom: 18,
    gap: 12,
  },
  noteCard: {
    width: "100%",
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  noteBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  fab: {
    position: "absolute",
    right: 20,
    borderRadius: 999,
    paddingHorizontal: 18,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 14,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
});
