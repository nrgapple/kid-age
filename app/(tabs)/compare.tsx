import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Kid, DEFAULT_SETTINGS } from '@/lib/types';
import { getKids, getSettings } from '@/lib/storage';
import { getAgeInMinutes, getPercentOfLife, getAdultEquivalent, formatPercent } from '@/lib/calculations';
import { PRESETS } from '@/lib/presets';
import PercentBar from '@/components/PercentBar';

export default function CompareScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKids, setSelectedKids] = useState<Set<string>>(new Set());
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [adultAge, setAdultAge] = useState(DEFAULT_SETTINGS.adultAge);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [loaded, settings] = await Promise.all([getKids(), getSettings()]);
        setKids(loaded);
        setAdultAge(settings.adultAge);
        // Auto-select all kids on load
        setSelectedKids(new Set(loaded.map((k) => k.id)));
      })();
    }, [])
  );

  const toggleKid = (kidId: string) => {
    setSelectedKids((prev) => {
      const next = new Set(prev);
      if (next.has(kidId)) {
        next.delete(kidId);
      } else {
        next.add(kidId);
      }
      return next;
    });
  };

  const preset = PRESETS[selectedPresetIndex];
  const comparedKids = kids.filter((k) => selectedKids.has(k.id));

  if (kids.length < 2) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Add More Kids</Text>
        <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
          Add at least two children to compare{'\n'}how time feels to each of them
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Kid selector */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Kids</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.kidSelector}
        contentContainerStyle={styles.kidSelectorContent}
      >
        {kids.map((kid) => {
          const isSelected = selectedKids.has(kid.id);
          return (
            <Pressable
              key={kid.id}
              onPress={() => toggleKid(kid.id)}
              style={[
                styles.kidChip,
                {
                  backgroundColor: isSelected ? kid.color + '20' : colors.cardBackground,
                  borderColor: isSelected ? kid.color : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.kidChipAvatar,
                  {
                    backgroundColor: kid.color,
                    opacity: isSelected ? 1 : 0.4,
                  },
                ]}
              >
                <Text style={styles.kidChipAvatarText}>
                  {kid.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text
                style={[
                  styles.kidChipName,
                  { color: isSelected ? colors.text : colors.secondaryText },
                ]}
              >
                {kid.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Event selector */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose an Event</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetSelector}
        contentContainerStyle={styles.presetSelectorContent}
      >
        {PRESETS.map((p, index) => {
          const isActive = index === selectedPresetIndex;
          return (
            <Pressable
              key={p.label}
              onPress={() => setSelectedPresetIndex(index)}
              style={[
                styles.presetChip,
                {
                  backgroundColor: isActive ? colors.accent : colors.cardBackground,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.presetChipIcon}>{p.icon}</Text>
              <Text
                style={[
                  styles.presetChipLabel,
                  { color: isActive ? '#fff' : colors.secondaryText },
                ]}
                numberOfLines={1}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Comparison results */}
      {comparedKids.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {preset.icon} {preset.label}
          </Text>

          {comparedKids.map((kid) => {
            const birthDate = new Date(kid.birthDate);
            const ageMinutes = getAgeInMinutes(birthDate);
            const percent = getPercentOfLife(preset.minutes, ageMinutes);
            const adultEquiv = getAdultEquivalent(preset.minutes, ageMinutes, adultAge);

            return (
              <View
                key={kid.id}
                style={[
                  styles.compareCard,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                ]}
              >
                <View style={styles.compareHeader}>
                  <View style={[styles.compareAvatar, { backgroundColor: kid.color }]}>
                    <Text style={styles.compareAvatarText}>
                      {kid.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.compareInfo}>
                    <Text style={[styles.compareName, { color: colors.text }]}>{kid.name}</Text>
                    <Text style={[styles.comparePercent, { color: kid.color }]}>
                      {formatPercent(percent)} of their life
                    </Text>
                  </View>
                </View>
                <PercentBar percent={percent} color={kid.color} height={10} />
                <Text style={[styles.compareEquiv, { color: colors.secondaryText }]}>
                  Feels like <Text style={{ fontWeight: '700', color: colors.accent }}>{adultEquiv.raw}</Text> to a {adultAge}-year-old
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {comparedKids.length === 0 && (
        <View style={styles.noSelection}>
          <Text style={[styles.noSelectionText, { color: colors.secondaryText }]}>
            Select at least one child above to compare
          </Text>
        </View>
      )}
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
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  kidSelector: {
    marginBottom: 16,
  },
  kidSelectorContent: {
    gap: 8,
  },
  kidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  kidChipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  kidChipAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  kidChipName: {
    fontSize: 14,
    fontWeight: '600',
  },
  presetSelector: {
    marginBottom: 20,
  },
  presetSelectorContent: {
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  presetChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 120,
  },
  resultsSection: {
    marginTop: 4,
  },
  compareCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  compareAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  compareAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  compareInfo: {
    flex: 1,
  },
  compareName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  comparePercent: {
    fontSize: 15,
    fontWeight: '600',
  },
  compareEquiv: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  noSelection: {
    padding: 40,
    alignItems: 'center',
  },
  noSelectionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
