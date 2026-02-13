export type Kid = {
  id: string;
  name: string;
  birthDate: string; // ISO date string
  color: string; // accent color hex
  createdAt: string;
};

export type Settings = {
  adultAge: number; // reference adult age in years (default 30)
};

export const DEFAULT_SETTINGS: Settings = {
  adultAge: 30,
};
