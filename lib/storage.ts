import AsyncStorage from '@react-native-async-storage/async-storage';
import { Kid } from './types';

const STORAGE_KEY = '@kid_age_kids';

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
