export type PresetCategory = 'daily' | 'travel' | 'school' | 'extended';

export type Preset = {
  label: string;
  minutes: number;
  icon: string; // emoji
  category: PresetCategory;
};

export const CATEGORY_LABELS: Record<PresetCategory, string> = {
  daily: 'Daily',
  travel: 'Travel',
  school: 'School',
  extended: 'Extended',
};

export const PRESET_CATEGORIES: PresetCategory[] = ['daily', 'travel', 'school', 'extended'];

export const PRESETS: Preset[] = [
  { label: '30-Min Timeout', minutes: 30, icon: '⏰', category: 'daily' },
  { label: '1-Hour Doctor Visit', minutes: 60, icon: '🏥', category: 'daily' },
  { label: '8-Hour Sleep', minutes: 480, icon: '😴', category: 'daily' },
  { label: '15-Min Car Ride to School', minutes: 15, icon: '🚗', category: 'travel' },
  { label: '2-Hour Plane Ride', minutes: 120, icon: '✈️', category: 'travel' },
  { label: '5-Hour Car Ride', minutes: 300, icon: '🚙', category: 'travel' },
  { label: 'Day of School', minutes: 420, icon: '🏫', category: 'school' },
  { label: 'Summer Break', minutes: 129600, icon: '☀️', category: 'school' },
  { label: 'Weekend', minutes: 2880, icon: '🎉', category: 'extended' },
  { label: 'Week-Long Vacation', minutes: 10080, icon: '🏖️', category: 'extended' },
];
