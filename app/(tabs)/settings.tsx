import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import PageHeader from "@/components/PageHeader";
import SurfaceCard from "@/components/SurfaceCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { showMessage } from "@/lib/platform";
import { getSettings, saveSettings } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/types";

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [adultAgeText, setAdultAgeText] = useState("");
  const [savedAge, setSavedAge] = useState(DEFAULT_SETTINGS.adultAge);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const settings = await getSettings();
        setAdultAgeText(String(settings.adultAge));
        setSavedAge(settings.adultAge);
      })();
    }, []),
  );

  const parsedAge = parseFloat(adultAgeText);
  const isValidAge = !Number.isNaN(parsedAge) && parsedAge >= 1 && parsedAge <= 120;
  const hasChanges = isValidAge && parsedAge !== savedAge;

  const handleSave = async () => {
    if (!isValidAge) {
      showMessage("Invalid age", "Enter a reference age between 1 and 120.");
      return;
    }

    setSaving(true);
    try {
      const age = Math.round(parsedAge);
      await saveSettings({ adultAge: age });
      setSavedAge(age);
      setAdultAgeText(String(age));
      showMessage("Saved", "Reference age updated.");
    } catch (error) {
      console.error("Save failed:", error);
      showMessage("Save failed", "The setting could not be stored. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Calibration"
          title="Reference age"
          subtitle="Choose the adult age the app should use when it translates a child’s experience into an adult equivalent."
        />

        <SurfaceCard style={styles.card}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Age in years</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: adultAgeText === "" || isValidAge ? colors.border : colors.danger,
                },
              ]}
              value={adultAgeText}
              onChangeText={setAdultAgeText}
              placeholder={String(DEFAULT_SETTINGS.adultAge)}
              placeholderTextColor={colors.secondaryText}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={3}
            />
            {adultAgeText !== "" && !isValidAge ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                Enter a whole-person age between 1 and 120.
              </Text>
            ) : null}
          </View>

          <Pressable
            onPress={handleSave}
            disabled={!hasChanges || saving}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: hasChanges ? colors.accent : colors.border,
                opacity: pressed && hasChanges ? 0.88 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: hasChanges ? "#fff" : colors.secondaryText },
              ]}
            >
              {saving ? "Saving..." : "Save setting"}
            </Text>
          </Pressable>
        </SurfaceCard>

        <SurfaceCard accent>
          <Text style={[styles.tipTitle, { color: colors.text }]}>How to choose it</Text>
          <Text style={[styles.tipBody, { color: colors.secondaryText }]}>
            Use your actual age if you want the comparisons to feel personal. Leave it near the
            default if you want a generic adult baseline for quick perspective checks.
          </Text>
        </SurfaceCard>
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontFamily: "SpaceMono",
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  tipBody: {
    fontSize: 15,
    lineHeight: 24,
  },
});
