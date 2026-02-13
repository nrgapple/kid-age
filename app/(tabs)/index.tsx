import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  View,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Kid } from '@/lib/types';
import { getKids, deleteKid } from '@/lib/storage';
import { confirmAction } from '@/lib/confirm';
import KidCard from '@/components/KidCard';

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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👶</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No kids yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
        Add your first child to see how time{'\n'}feels through their eyes
      </Text>
      <Pressable
        onPress={() => router.push('/kid/add')}
        style={[styles.emptyButton, { backgroundColor: colors.accent }]}
      >
        <Text style={styles.emptyButtonText}>+ Add Child</Text>
      </Pressable>
    </View>
  );

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
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
      />

      {kids.length > 0 && (
        <Pressable
          onPress={() => router.push('/kid/add')}
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
    marginBottom: 24,
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
