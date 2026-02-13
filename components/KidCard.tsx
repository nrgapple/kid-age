import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Kid } from '@/lib/types';
import { formatAge } from '@/lib/calculations';

// Only import Swipeable on native (it has spotty web support)
let Swipeable: any = null;
if (Platform.OS !== 'web') {
  Swipeable = require('react-native-gesture-handler').Swipeable;
}

type KidCardProps = {
  kid: Kid;
  onPress: () => void;
  onDelete: () => void;
};

export default function KidCard({ kid, onPress, onDelete }: KidCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const initial = kid.name.charAt(0).toUpperCase();
  const age = formatAge(new Date(kid.birthDate));
  const swipeableRef = useRef<any>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX }] }]}>
        <Pressable
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          style={styles.swipeDeleteButton}
        >
          <Text style={styles.swipeDeleteText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const cardContent = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: kid.color }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{kid.name}</Text>
        <Text style={[styles.age, { color: colors.secondaryText }]}>{age}</Text>
      </View>

      {/* On web, show a visible delete button since swipe doesn't work */}
      {Platform.OS === 'web' ? (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={({ pressed }) => [
            styles.webDeleteButton,
            {
              backgroundColor: pressed ? colors.danger : colors.dangerLight,
            },
          ]}
        >
          <Text style={[styles.webDeleteText, { color: colors.danger }]}>✕</Text>
        </Pressable>
      ) : (
        <Text style={[styles.chevron, { color: colors.secondaryText }]}>›</Text>
      )}
    </Pressable>
  );

  // On native, wrap in Swipeable for swipe-to-delete
  if (Platform.OS !== 'web' && Swipeable) {
    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        overshootRight={false}
        friction={2}
      >
        {cardContent}
      </Swipeable>
    );
  }

  // On web, just render the card (with inline delete button)
  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 3,
  },
  age: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 8,
  },
  webDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  webDeleteText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  swipeDeleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '100%',
    borderRadius: 16,
  },
  swipeDeleteText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
