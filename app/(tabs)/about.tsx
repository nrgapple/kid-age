import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Text, View, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getSettings } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/types';

export default function AboutScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [adultAge, setAdultAge] = useState(DEFAULT_SETTINGS.adultAge);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const settings = await getSettings();
        setAdultAge(settings.adultAge);
      })();
    }, [])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Image
        source={require('@/assets/images/icon.png')}
        style={styles.logo}
      />
      <Text style={[styles.title, { color: colors.text }]}>
        Time Through Their Eyes
      </Text>

      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.text }]}>The Concept</Text>
        <Text style={[styles.body, { color: colors.secondaryText }]}>
          Time feels different depending on how long you've been alive. A 2-hour plane ride
          is a tiny fraction of an adult's life, but for a 1-year-old, it's a much bigger deal.
        </Text>
        <Text style={[styles.body, { color: colors.secondaryText, marginTop: 12 }]}>
          Think about it: when you were 5, a single summer felt like an eternity. That's because
          3 months was about 5% of your entire life. For a {adultAge}-year-old, that same summer is only
          about {Math.round((3 / (adultAge * 12)) * 1000) / 10}%.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.text }]}>How It Works</Text>
        <Text style={[styles.body, { color: colors.secondaryText }]}>
          1. Add your child with their birth date{'\n\n'}
          2. See preset events (plane rides, school days, vacations) and what percentage of your
          child's life each one represents{'\n\n'}
          3. Compare: see how long that event would "feel" to a {adultAge}-year-old adult{'\n\n'}
          4. Enter custom durations to explore on your own
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.text }]}>Privacy</Text>
        <Text style={[styles.body, { color: colors.secondaryText }]}>
          All data is stored locally on your device. Nothing is sent to any server. Your
          children's information never leaves your phone.
        </Text>
      </View>

      <Text style={[styles.footer, { color: colors.secondaryText }]}>
        Made with ❤️ for parents who want to see{'\n'}the world through their child's eyes.
      </Text>
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
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: '100%',
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
});
