import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { saveKid } from '@/lib/storage';

// Only import DateTimePicker on native platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

// Simple ID generator that works everywhere (no crypto dependency)
function generateId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

// Cross-platform alert
function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function AddKidScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasName = name.trim().length > 0;
  const hasDate = birthDate !== null;
  const canSave = hasName && hasDate && !saving;

  const onNativeDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (_event.type === 'dismissed') {
      return;
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const onWebDateChange = (e: any) => {
    const dateString = e.target.value;
    if (dateString) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        setBirthDate(date);
      }
    } else {
      setBirthDate(null);
    }
  };

  const handleSave = async () => {
    if (!canSave || !birthDate) return;

    const trimmedName = name.trim();

    if (birthDate > new Date()) {
      showAlert('Invalid Date', 'Birth date cannot be in the future.');
      return;
    }

    setSaving(true);
    try {
      const kidColor =
        Colors.kidColors[Math.floor(Math.random() * Colors.kidColors.length)];

      await saveKid({
        id: generateId(),
        name: trimmedName,
        birthDate: birthDate.toISOString(),
        color: kidColor,
        createdAt: new Date().toISOString(),
      });

      router.back();
    } catch (error) {
      console.error('Save failed:', error);
      showAlert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date as YYYY-MM-DD for the HTML input value
  const getWebDateValue = () => {
    if (!birthDate) return '';
    const y = birthDate.getFullYear();
    const m = String(birthDate.getMonth() + 1).padStart(2, '0');
    const d = String(birthDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getTodayString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const renderWebDatePicker = () => (
    <View>
      {React.createElement('input', {
        type: 'date',
        value: getWebDateValue(),
        onChange: onWebDateChange,
        max: getTodayString(),
        min: '2000-01-01',
        style: {
          width: '100%',
          padding: '16px 18px',
          fontSize: '18px',
          fontWeight: '500',
          fontFamily: 'System, -apple-system, BlinkMacSystemFont, sans-serif',
          borderRadius: '14px',
          border: `1px solid ${hasDate ? colors.accent : colors.border}`,
          backgroundColor: colors.cardBackground,
          color: hasDate ? colors.text : colors.secondaryText,
          boxSizing: 'border-box',
          outline: 'none',
          WebkitAppearance: 'none',
          cursor: 'pointer',
        },
      })}
    </View>
  );

  const renderNativeDatePicker = () => (
    <View>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[
          styles.dateButton,
          {
            backgroundColor: colors.cardBackground,
            borderColor: hasDate ? colors.accent : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.dateButtonText,
            { color: hasDate ? colors.text : colors.secondaryText },
          ]}
        >
          {hasDate ? formatDateDisplay(birthDate) : 'Tap to select date'}
        </Text>
      </Pressable>

      {showDatePicker && DateTimePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={birthDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onNativeDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(2000, 0, 1)}
            themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
          />
          {Platform.OS === 'ios' && (
            <Pressable
              onPress={() => {
                if (!birthDate) {
                  setBirthDate(new Date());
                }
                setShowDatePicker(false);
              }}
              style={[styles.doneButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

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
        <Text style={styles.emoji}>👶</Text>
        <Text style={[styles.title, { color: colors.text }]}>Add a Child</Text>

        {/* Name field */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.cardBackground,
                borderColor: hasName ? colors.accent : colors.border,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={colors.secondaryText}
            autoFocus
            returnKeyType="done"
          />
        </View>

        {/* Date of birth field */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Date of Birth</Text>
          {Platform.OS === 'web' ? renderWebDatePicker() : renderNativeDatePicker()}
        </View>

        {/* Validation hints */}
        {(!hasName || !hasDate) && (
          <Text style={[styles.hint, { color: colors.secondaryText }]}>
            {!hasName && !hasDate
              ? 'Enter a name and select a date of birth to continue'
              : !hasName
              ? 'Enter a name to continue'
              : 'Select a date of birth to continue'}
          </Text>
        )}

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: canSave ? colors.accent : colors.border,
              opacity: pressed && canSave ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: canSave ? '#fff' : colors.secondaryText },
            ]}
          >
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 32,
  },
  field: {
    width: '100%',
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: '500',
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  datePickerContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  doneButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
