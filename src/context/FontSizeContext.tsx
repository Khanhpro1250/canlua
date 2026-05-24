import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontSizeLabel = 'small' | 'default' | 'large' | 'extraLarge';
type FontColorLabel = 'black' | 'blue' | 'red';

interface FontSizeConfig {
  base: number;
  title: number;
  subtitle: number;
  label: number;
  value: number;
}

const FONT_SIZE_CONFIGS: Record<FontSizeLabel, FontSizeConfig> = {
  small: { base: 14, title: 16, subtitle: 12, label: 12, value: 16 },
  default: { base: 16, title: 18, subtitle: 14, label: 14, value: 18 },
  large: { base: 18, title: 20, subtitle: 16, label: 16, value: 22 },
  extraLarge: { base: 20, title: 24, subtitle: 18, label: 18, value: 28 },
};

const COLOR_CONFIGS: Record<FontColorLabel, string> = {
  black: '#000000',
  blue: '#0056b3',
  red: '#c62828',
};

interface FontSizeContextType {
  fontSizeLabel: FontSizeLabel;
  fontColorLabel: FontColorLabel;
  setFontSizeLabel: (label: FontSizeLabel) => void;
  setFontColorLabel: (label: FontColorLabel) => void;
  sizes: FontSizeConfig;
  colors: {
    primaryText: string;
  };
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSizeLabel, setFontSizeLabelState] = useState<FontSizeLabel>('default');
  const [fontColorLabel, setFontColorLabelState] = useState<FontColorLabel>('black');

  useEffect(() => {
    // Load settings from storage on startup
    const loadSettings = async () => {
      try {
        const savedSize = await AsyncStorage.getItem('font_size_label');
        const savedColor = await AsyncStorage.getItem('font_color_label');
        if (savedSize) setFontSizeLabelState(savedSize as FontSizeLabel);
        if (savedColor) setFontColorLabelState(savedColor as FontColorLabel);
      } catch (e) {
        console.error('Failed to load font settings', e);
      }
    };
    loadSettings();
  }, []);

  const setFontSizeLabel = async (label: FontSizeLabel) => {
    setFontSizeLabelState(label);
    await AsyncStorage.setItem('font_size_label', label);
  };

  const setFontColorLabel = async (label: FontColorLabel) => {
    setFontColorLabelState(label);
    await AsyncStorage.setItem('font_color_label', label);
  };

  const value = {
    fontSizeLabel,
    fontColorLabel,
    setFontSizeLabel,
    setFontColorLabel,
    sizes: FONT_SIZE_CONFIGS[fontSizeLabel],
    colors: {
      primaryText: COLOR_CONFIGS[fontColorLabel],
    },
  };

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>;
};

export const useFontSettings = () => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSettings must be used within a FontSizeProvider');
  }
  return context;
};
