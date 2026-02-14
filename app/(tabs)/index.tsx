import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  View,
  Platform,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Kid } from '@/lib/types';
import { getKids, deleteKid } from '@/lib/storage';
import { confirmAction } from '@/lib/confirm';
import KidCard from '@/components/KidCard';
import DailyInsightCard from '@/components/DailyInsightCard';
import { lightHaptic } from '@/lib/haptics';

const ONBOARDING_CARDS = [
  {
    icon: '⏰',
    title: 'Did you know?',
    body: 'A 30-minute timeout feels like 3 full days to a 1-year-old.',
    color: '#6C63FF',
  },
  {
    icon: '✈️',
    title: 'Think about it...',
    body: 'A 2-hour flight is just a blink for you, but for your toddler it feels like an entire work week.',
    color: '#FF6B6B',
  },
  {
    icon: '☀️',
    title: 'Remember summers?',
    body: 'When you were 5, summer break was 5% of your entire life. No wonder it felt endless!',
    color: '#4ECDC4',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Only import GestureHandlerRootView on native
let GestureHandlerRootView: any = null;
if (Platform.OS !== 'web') {
  GestureHandlerRootView = require('react-native-gesture-handler').GestureHandlerRootView;
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [kids, setKids] = useState<Kid[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadKids = useCallback(async () => {
    const loaded = await getKids();
    setKids(loaded);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadKids();
    }, [loadKids])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadKids();
    setRefreshing(false);
  }, [loadKids]);

  const handleDelete = useCallback(
    (kid: Kid) => {
      confirmAction(
        'Remove Child',
        `Are you sure you want to remove ${kid.name}?`,
        async () => {
          await deleteKid(kid.id);
          await loadKids();
        }
      );
    },
    [loadKids]
  );

  const [onboardingIndex, setOnboardingIndex] = useState(0);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.onboardingHeading, { color: colors.text }]}>
        Time Through Their Eyes
      </Text>

      {/* Carousel */}
      <FlatList
        data={ONBOARDING_CARDS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 64));
          setOnboardingIndex(idx);
        }}
        contentContainerStyle={styles.carouselContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.onboardingCard,
              {
                backgroundColor: item.color + '15',
                borderColor: item.color + '40',
                width: SCREEN_WIDTH - 96,
              },
            ]}
          >
            <Text style={styles.onboardingCardIcon}>{item.icon}</Text>
            <Text style={[styles.onboardingCardTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.onboardingCardBody, { color: colors.secondaryText }]}>
              {item.body}
            </Text>
          </View>
        )}
      />

      {/* Page dots */}
      <View style={styles.dots}>
        {ONBOARDING_CARDS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === onboardingIndex ? colors.accent : colors.border,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
        Add your child to see how time{'\n'}feels from their perspective
      </Text>
      <Pressable
        onPress={() => router.push('/kid/add')}
        style={[styles.emptyButton, { backgroundColor: colors.accent }]}
      >
        <Text style={styles.emptyButtonText}>+ Add Your Child</Text>
      </Pressable>
    </View>
  );

  // Refresh animation
  const spinValue = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      spinValue.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(spinValue);
      spinValue.value = 0;
    }
  }, [refreshing, spinValue]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));

  const renderInsightHeader = () => {
    if (kids.length === 0) return null;
    return (
      <View style={styles.insightSection}>
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <Animated.Text style={[styles.refreshIcon, spinStyle]}>⏳</Animated.Text>
            <Text style={[styles.refreshText, { color: colors.secondaryText }]}>
              Updating perspectives...
            </Text>
          </View>
        )}
        <Text style={[styles.insightTitle, { color: colors.text }]}>Today's Perspective</Text>
        {kids.map((kid) => (
          <DailyInsightCard
            key={kid.id}
            kid={kid}
            onPress={() => router.push(`/kid/${kid.id}`)}
          />
        ))}
        <Text style={[styles.kidListTitle, { color: colors.text }]}>My Kids</Text>
      </View>
    );
  };

  const listContent = (
    <>
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
        contentContainerStyle={[
          styles.list,
          kids.length === 0 && styles.listEmpty,
        ]}
        ListHeaderComponent={renderInsightHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.cardBackground}
            title="Updating perspectives..."
            titleColor={colors.secondaryText}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {kids.length > 0 && (
        <Pressable
          onPress={() => { lightHaptic(); router.push('/kid/add'); }}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: colors.accent,
              bottom: 20 + insets.bottom,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </>
  );

  // On native, wrap in GestureHandlerRootView for swipe gestures
  if (Platform.OS !== 'web' && GestureHandlerRootView) {
    return (
      <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
        {listContent}
      </GestureHandlerRootView>
    );
  }

  // On web, no gesture handler needed
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {listContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  onboardingHeading: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  carouselContent: {
    gap: 12,
  },
  onboardingCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  onboardingCardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  onboardingCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  onboardingCardBody: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  refreshIcon: {
    fontSize: 20,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightSection: {
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  kidListTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 32,
  },
});
