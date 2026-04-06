import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import PageHeader from "@/components/PageHeader";
import SurfaceCard from "@/components/SurfaceCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { getSettings } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/types";

export default function AboutScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [adultAge, setAdultAge] = useState(DEFAULT_SETTINGS.adultAge);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const settings = await getSettings();
        setAdultAge(settings.adultAge);
      })();
    }, []),
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
        <PageHeader
          eyebrow="About the model"
          title="Why this app works"
          subtitle="Time feels elastic because people judge events against how much life they have already lived."
          centered
        />
      </View>

      <SurfaceCard style={styles.card}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Relative time, not literal time
        </Text>
        <Text style={[styles.body, { color: colors.secondaryText }]}>
          A two-hour delay is still two hours on the clock. What changes is the share of lived
          experience it occupies. That is why the same event can feel minor to an adult and enormous
          to a toddler.
        </Text>
      </SurfaceCard>

      <SurfaceCard accent style={styles.card}>
        <Text style={[styles.heading, { color: colors.text }]}>Current baseline</Text>
        <Text style={[styles.body, { color: colors.secondaryText }]}>
          Right now the app compares each child against a {adultAge}-year-old adult. Change that in
          settings if you want the numbers to map more closely to your own lived perspective.
        </Text>
      </SurfaceCard>

      <SurfaceCard style={styles.card}>
        <Text style={[styles.heading, { color: colors.text }]}>Privacy</Text>
        <Text style={[styles.body, { color: colors.secondaryText }]}>
          Profiles stay in local device storage. The app does not upload your children’s information
          to a remote service.
        </Text>
      </SurfaceCard>
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
  hero: {
    alignItems: "center",
    marginBottom: 4,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
  },
});
