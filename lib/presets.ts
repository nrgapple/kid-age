export type Preset = {
  label: string;
  minutes: number;
  icon: string; // emoji
};

export const PRESETS: Preset[] = [
  { label: '30-Min Timeout', minutes: 30, icon: '⏰' },
  { label: '1-Hour Doctor Visit', minutes: 60, icon: '🏥' },
  { label: '15-Min Car Ride to School', minutes: 15, icon: '🚗' },
  { label: '2-Hour Plane Ride', minutes: 120, icon: '✈️' },
  { label: '5-Hour Car Ride', minutes: 300, icon: '🚙' },
  { label: 'Day of School', minutes: 420, icon: '🏫' },
  { label: '8-Hour Sleep', minutes: 480, icon: '😴' },
  { label: 'Weekend', minutes: 2880, icon: '🎉' },
  { label: 'Week-Long Vacation', minutes: 10080, icon: '🏖️' },
  { label: 'Summer Break', minutes: 129600, icon: '☀️' },
];
