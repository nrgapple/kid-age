import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  Share,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter, useFocusEffect } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Kid, DEFAULT_SETTINGS } from '@/lib/types';
import { getKids, deleteKid, getSettings } from '@/lib/storage';
import { confirmAction } from '@/lib/confirm';
import { formatAge, getAgeInMinutes } from '@/lib/calculations';
import { PRESETS, PRESET_CATEGORIES, CATEGORY_LABELS, PresetCategory } from '@/lib/presets';
import TimePresetCard from '@/components/TimePresetCard';
import CustomDurationInput from '@/components/CustomDurationInput';
import { selectionHaptic, mediumHaptic } from '@/lib/haptics';

export default function KidDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [kid, setKid] = useState<Kid | null>(null);
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [adultAge, setAdultAge] = useState(DEFAULT_SETTINGS.adultAge);
  const [activeCategory, setActiveCategory] = useState<'all' | PresetCategory>('all');
  const [showCustomModal, setShowCustomModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [kids, settings] = await Promise.all([getKids(), getSettings()]);
        const found = kids.find((k) => k.id === id);
        setKid(found ?? null);
        setAllKids(kids);
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

  const handleSwitchKid = useCallback(
    (kidId: string) => {
      selectionHaptic();
      router.replace(`/kid/${kidId}`);
    },
    [router]
  );

  const handleShare = useCallback(
    (label: string, percent: string, adultEquiv: string) => {
      if (!kid) return;
      const message = `Did you know? A ${label.toLowerCase()} is ${percent} of ${kid.name}'s life! To a ${adultAge}-year-old, that feels like ${adultEquiv}.\n\n— Time Through Their Eyes`;
      if (Platform.OS === 'web') {
        if (navigator.share) {
          navigator.share({ text: message }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(message);
        }
      } else {
        Share.share({ message });
      }
    },
    [kid, adultAge]
  );

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

  const filteredPresets =
    activeCategory === 'all'
      ? PRESETS
      : PRESETS.filter((p) => p.category === activeCategory);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky header */}
      <View style={[styles.stickyHeader, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        {/* Kid switcher row */}
        {allKids.length > 1 && (
          <FlatList
            data={allKids}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kidSwitcherList}
            renderItem={({ item }) => {
              const isActive = item.id === kid.id;
              return (
                <Pressable
                  onPress={() => handleSwitchKid(item.id)}
                  style={[
                    styles.kidSwitcherItem,
                    isActive && styles.kidSwitcherItemActive,
                  ]}
                >
                  <View
                    style={[
                      styles.switcherAvatar,
                      {
                        backgroundColor: item.color,
                        opacity: isActive ? 1 : 0.4,
                      },
                    ]}
                  >
                    <Text style={styles.switcherAvatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  {isActive && (
                    <Text
                      style={[styles.switcherName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  )}
                </Pressable>
              );
            }}
          />
        )}

        {/* Kid info */}
        <View style={styles.kidInfo}>
          <View style={[styles.avatar, { backgroundColor: kid.color }]}>
            <Text style={styles.avatarText}>{kid.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.kidInfoText}>
            <Text style={[styles.name, { color: colors.text }]}>{kid.name}</Text>
            <Text style={[styles.age, { color: colors.secondaryText }]}>{ageDisplay}</Text>
          </View>
        </View>
      </View>

      {/* Main content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section: Presets */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>How Time Feels</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
          Each event as a share of {kid.name}'s life
        </Text>

        {/* Category filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipRowContent}
        >
          <Pressable
            onPress={() => { selectionHaptic(); setActiveCategory('all'); }}
            style={[
              styles.chip,
              {
                backgroundColor: activeCategory === 'all' ? kid.color : colors.cardBackground,
                borderColor: activeCategory === 'all' ? kid.color : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: activeCategory === 'all' ? '#fff' : colors.secondaryText },
              ]}
            >
              All
            </Text>
          </Pressable>
          {PRESET_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => { selectionHaptic(); setActiveCategory(cat); }}
              style={[
                styles.chip,
                {
                  backgroundColor: activeCategory === cat ? kid.color : colors.cardBackground,
                  borderColor: activeCategory === cat ? kid.color : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: activeCategory === cat ? '#fff' : colors.secondaryText },
                ]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredPresets.map((preset) => (
          <TimePresetCard
            key={preset.label}
            label={preset.label}
            icon={preset.icon}
            durationMinutes={preset.minutes}
            kidAgeMinutes={ageMinutes}
            kidColor={kid.color}
            adultAge={adultAge}
            onShare={handleShare}
          />
        ))}

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

      {/* FAB for custom duration */}
      <Pressable
        onPress={() => { mediumHaptic(); setShowCustomModal(true); }}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: kid.color,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <Text style={styles.fabText}>⏱</Text>
      </Pressable>

      {/* Custom duration bottom sheet / modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCustomModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCustomModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <Pressable
              style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}
              onPress={(e) => e.stopPropagation?.()}
            >
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Try Your Own</Text>
              <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
                Enter any duration to see how it feels to {kid.name}
              </Text>
              <CustomDurationInput
                kidAgeMinutes={ageMinutes}
                kidColor={kid.color}
                adultAge={adultAge}
                kidName={kid.name}
              />
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // Sticky header
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  kidSwitcherList: {
    paddingVertical: 6,
    gap: 8,
  },
  kidSwitcherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  kidSwitcherItemActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  switcherAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switcherAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  switcherName: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Kid info
  kidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  kidInfoText: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  age: {
    fontSize: 14,
  },

  // Content
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },

  // Category chips
  chipRow: {
    marginBottom: 14,
  },
  chipRowContent: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Delete
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

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
});
