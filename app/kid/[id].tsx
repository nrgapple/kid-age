import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter, useFocusEffect } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Kid, DEFAULT_SETTINGS } from '@/lib/types';
import { getKids, deleteKid, getSettings } from '@/lib/storage';
import { confirmAction } from '@/lib/confirm';
import { formatAge, getAgeInMinutes } from '@/lib/calculations';
import { PRESETS } from '@/lib/presets';
import TimePresetCard from '@/components/TimePresetCard';
import CustomDurationInput from '@/components/CustomDurationInput';

export default function KidDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [kid, setKid] = useState<Kid | null>(null);
  const [loading, setLoading] = useState(true);
  const [adultAge, setAdultAge] = useState(DEFAULT_SETTINGS.adultAge);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [kids, settings] = await Promise.all([getKids(), getSettings()]);
        const found = kids.find((k) => k.id === id);
        setKid(found ?? null);
        setAdultAge(settings.adultAge);
        if (found) {
          navigation.setOptions({ title: found.name });
        }
        setLoading(false);
      })();
    }, [id, navigation])
  );

  const handleDelete = useCallback(() => {
    if (!kid) return;
    confirmAction(
      'Remove Child',
      `Are you sure you want to remove ${kid.name}? This cannot be undone.`,
      async () => {
        await deleteKid(kid.id);
        router.back();
      }
    );
  }, [kid, router]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!kid) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Child not found</Text>
      </View>
    );
  }

  const birthDate = new Date(kid.birthDate);
  const ageMinutes = getAgeInMinutes(birthDate);
  const ageDisplay = formatAge(birthDate);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: kid.color }]}>
          <Text style={styles.avatarText}>{kid.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{kid.name}</Text>
        <Text style={[styles.age, { color: colors.secondaryText }]}>{ageDisplay}</Text>
      </View>

      {/* Section: Presets */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        How Time Feels
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
        Each event as a percentage of {kid.name}'s life, compared to a {adultAge}-year-old
      </Text>

      {PRESETS.map((preset) => (
        <TimePresetCard
          key={preset.label}
          label={preset.label}
          icon={preset.icon}
          durationMinutes={preset.minutes}
          kidAgeMinutes={ageMinutes}
          kidColor={kid.color}
          adultAge={adultAge}
        />
      ))}

      {/* Section: Custom */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>
        Try Your Own
      </Text>
      <CustomDurationInput
        kidAgeMinutes={ageMinutes}
        kidColor={kid.color}
        adultAge={adultAge}
      />

      {/* Delete button */}
      <View style={styles.deleteSection}>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            {
              backgroundColor: colors.dangerLight,
              borderColor: colors.danger,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
            Remove {kid.name}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteSection: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 20,
  },
  deleteButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
