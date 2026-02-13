import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getSettings, saveSettings } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/types';

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [adultAgeText, setAdultAgeText] = useState('');
  const [savedAge, setSavedAge] = useState(DEFAULT_SETTINGS.adultAge);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const settings = await getSettings();
        setAdultAgeText(String(settings.adultAge));
        setSavedAge(settings.adultAge);
      })();
    }, [])
  );

  const parsedAge = parseFloat(adultAgeText);
  const isValidAge = !isNaN(parsedAge) && parsedAge >= 1 && parsedAge <= 120;
  const hasChanges = isValidAge && parsedAge !== savedAge;

  const handleSave = async () => {
    if (!isValidAge) {
      showAlert('Invalid Age', 'Please enter an age between 1 and 120.');
      return;
    }

    setSaving(true);
    try {
      const age = Math.round(parsedAge);
      await saveSettings({ adultAge: age });
      setSavedAge(age);
      setAdultAgeText(String(age));
      showAlert('Saved', 'Your adult age has been updated.');
    } catch (error) {
      console.error('Save failed:', error);
      showAlert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.emoji}>⚙️</Text>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.text }]}>Your Age</Text>
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            This is the reference adult age used for comparisons. Events are scaled to show how they
            would feel to someone this age.
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Age (years)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: isValidAge || adultAgeText === '' ? colors.border : colors.danger,
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
            {adultAgeText !== '' && !isValidAge && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                Please enter a valid age between 1 and 120
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleSave}
            disabled={!hasChanges || saving}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: hasChanges ? colors.accent : colors.border,
                opacity: pressed && hasChanges ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                { color: hasChanges ? '#fff' : colors.secondaryText },
              ]}
            >
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.text }]}>About This Setting</Text>
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            The default is 30 years old. Changing this to your actual age makes the comparisons
            more personal — you'll see how events in your child's life would feel relative to your
            own lived experience.
          </Text>
        </View>
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
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
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
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
