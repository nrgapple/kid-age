import AsyncStorage from '@react-native-async-storage/async-storage';
import { Kid, Settings, DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = '@kid_age_kids';
const SETTINGS_KEY = '@kid_age_settings';

export async function getKids(): Promise<Kid[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json) as Kid[];
    }
    return [];
  } catch (error) {
    console.error('Failed to load kids:', error);
    return [];
  }
}

export async function saveKid(kid: Kid): Promise<void> {
  try {
    const kids = await getKids();
    const existingIndex = kids.findIndex((k) => k.id === kid.id);
    if (existingIndex >= 0) {
      kids[existingIndex] = kid;
    } else {
      kids.push(kid);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(kids));
  } catch (error) {
    console.error('Failed to save kid:', error);
    throw error;
  }
}

export async function deleteKid(id: string): Promise<void> {
  try {
    const kids = await getKids();
    const filtered = kids.filter((k) => k.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete kid:', error);
    throw error;
  }
}

export async function getSettings(): Promise<Settings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return { ...DEFAULT_SETTINGS };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}
