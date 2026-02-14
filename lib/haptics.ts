import { Platform } from 'react-native';

/**
 * Cross-platform haptic feedback utilities.
 * On native, uses expo-haptics. On web, silently no-ops.
 */

let Haptics: typeof import('expo-haptics') | null = null;

if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {
    // expo-haptics not available
  }
}

export function lightHaptic() {
  if (Haptics) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function mediumHaptic() {
  if (Haptics) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

export function selectionHaptic() {
  if (Haptics) {
    Haptics.selectionAsync();
  }
}
