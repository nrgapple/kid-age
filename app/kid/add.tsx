import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { generateId, showMessage } from "@/lib/platform";
import { saveKid } from "@/lib/storage";

type NativeDatePicker = typeof import("@react-native-community/datetimepicker").default;
type WebDateChangeEvent = {
  target: {
    value: string;
  };
};

let DateTimePicker: NativeDatePicker | null = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function AddKidScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasName = name.trim().length > 0;
  const hasDate = birthDate !== null;
  const canSave = hasName && hasDate && !saving;

  const onNativeDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") return;
    if (selectedDate) setBirthDate(selectedDate);
  };

  const onWebDateChange = (event: WebDateChangeEvent) => {
    const value = event.target.value;
    if (!value) {
      setBirthDate(null);
      return;
    }

    const [year, month, day] = value.split("-").map(Number);
    const nextDate = new Date(year, month - 1, day);
    if (!Number.isNaN(nextDate.getTime())) {
      setBirthDate(nextDate);
    }
  };

  const handleSave = async () => {
    if (!canSave || !birthDate) return;

    if (birthDate > new Date()) {
      showMessage("Invalid date", "Birth date cannot be in the future.");
      return;
    }

    setSaving(true);
    try {
      const kidColor = Colors.kidColors[Math.floor(Math.random() * Colors.kidColors.length)];

      await saveKid({
        id: generateId(),
        name: name.trim(),
        birthDate: birthDate.toISOString(),
        color: kidColor,
        createdAt: new Date().toISOString(),
      });

      router.back();
    } catch (error) {
      console.error("Save failed:", error);
      showMessage("Save failed", "The profile could not be stored. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (date: Date) =>
    date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getWebDateValue = () => {
    if (!birthDate) return "";
    const y = birthDate.getFullYear();
    const m = String(birthDate.getMonth() + 1).padStart(2, "0");
    const d = String(birthDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getTodayString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const renderWebDatePicker = () => (
    <View>
      {React.createElement("input", {
        type: "date",
        value: getWebDateValue(),
        onChange: onWebDateChange,
        max: getTodayString(),
        min: "2000-01-01",
        style: {
          width: "100%",
          padding: "16px 18px",
          fontSize: "18px",
          fontWeight: "600",
          fontFamily: "System, -apple-system, BlinkMacSystemFont, sans-serif",
          borderRadius: "16px",
          border: `1px solid ${hasDate ? colors.accent : colors.border}`,
          backgroundColor: colors.background,
          color: hasDate ? colors.text : colors.secondaryText,
          boxSizing: "border-box",
          outline: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
        },
      })}
    </View>
  );

  const renderNativeDatePicker = () => (
    <View>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[
          styles.inputShell,
          {
            backgroundColor: colors.background,
            borderColor: hasDate ? colors.accent : colors.border,
          },
        ]}
      >
        <Text style={[styles.inputText, { color: hasDate ? colors.text : colors.secondaryText }]}>
          {hasDate ? formatDateDisplay(birthDate) : "Select a birth date"}
        </Text>
      </Pressable>

      {showDatePicker && DateTimePicker ? (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={birthDate ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onNativeDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(2000, 0, 1)}
            themeVariant={colorScheme === "dark" ? "dark" : "light"}
          />
          {Platform.OS === "ios" ? (
            <Pressable
              onPress={() => {
                if (!birthDate) setBirthDate(new Date());
                setShowDatePicker(false);
              }}
              style={[styles.inlineButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.inlineButtonText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );

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
          eyebrow="New profile"
          title="Add a child"
          subtitle="Store a name and birth date locally so the app can translate everyday durations into a share of their life."
        />

        <SurfaceCard style={styles.card}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Name</Text>
            <TextInput
              style={[
                styles.inputShell,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: hasName ? colors.accent : colors.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Avery"
              placeholderTextColor={colors.secondaryText}
              autoFocus
              returnKeyType="done"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Birth date</Text>
            {Platform.OS === "web" ? renderWebDatePicker() : renderNativeDatePicker()}
          </View>

          {!hasName || !hasDate ? (
            <Text style={[styles.hint, { color: colors.secondaryText }]}>
              Enter both fields to save the profile.
            </Text>
          ) : null}

          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: canSave ? colors.accent : colors.border,
                opacity: pressed && canSave ? 0.88 : 1,
              },
            ]}
          >
            <Text
              style={[styles.primaryButtonText, { color: canSave ? "#fff" : colors.secondaryText }]}
            >
              {saving ? "Saving profile..." : "Save profile"}
            </Text>
          </Pressable>
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
    marginBottom: 20,
  },
  label: {
    fontFamily: "SpaceMono",
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputShell: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  inputText: {
    fontSize: 18,
    fontWeight: "600",
  },
  datePickerContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  inlineButton: {
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 8,
  },
  inlineButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  hint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
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
});
