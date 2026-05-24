import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Single type for all 4 options
export type InputFormatMode = 'under-2-digits' | 'under-3-digits' | 'above-3-digits' | 'above-4-digits';

interface InputFormatContextType {
  mode: InputFormatMode;
  setMode: (mode: InputFormatMode) => void;
}

const InputFormatContext = createContext<InputFormatContextType | undefined>(undefined);

export const InputFormatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<InputFormatMode>('under-2-digits');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('input_format_mode');
        if (savedMode) setModeState(savedMode as InputFormatMode);
      } catch (e) {
        console.error('Failed to load input format settings', e);
      }
    };
    loadSettings();
  }, []);

  const setMode = async (newMode: InputFormatMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem('input_format_mode', newMode);
  };

  return (
    <InputFormatContext.Provider value={{ mode, setMode }}>
      {children}
    </InputFormatContext.Provider>
  );
};

export const useInputFormat = () => {
  const context = useContext(InputFormatContext);
  if (context === undefined) {
    throw new Error('useInputFormat must be used within an InputFormatProvider');
  }
  return context;
};
