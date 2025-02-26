export type CourseType = 'intel' | 'cyber' | 'info' | 'people' | 'media' | 'theory' | 'mod-sim' | 'sys-arch' | 'devices' | 'required';

export interface Theme {
  bg: string;
  text: string;
  textSecondary: string;
}

export interface ThemeModes {
  light: Theme;
  dark: Theme;
}

export interface Thread {
  name: CourseType;
  formalName: string;
  theme: ThemeModes;
  show: boolean;
} 