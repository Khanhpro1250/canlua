import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TareConfigContextType {
  isTareByTime: boolean;
  bagsPerKg: number;
  setIsTareByTime: (value: boolean) => void;
  setBagsPerKg: (value: number) => void;
}

const TareConfigContext = createContext<TareConfigContextType | undefined>(undefined);

export const TareConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTareByTime, setIsTareByTimeState] = useState<boolean>(false);
  const [bagsPerKg, setBagsPerKgState] = useState<number>(8);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTareMode = await AsyncStorage.getItem('tare_by_time');
        const savedBags = await AsyncStorage.getItem('bags_per_kg');
        if (savedTareMode !== null) setIsTareByTimeState(savedTareMode === 'true');
        if (savedBags !== null) setBagsPerKgState(parseInt(savedBags));
      } catch (e) {
        console.error('Failed to load tare config settings', e);
      }
    };
    loadSettings();
  }, []);

  const setIsTareByTime = async (value: boolean) => {
    setIsTareByTimeState(value);
    await AsyncStorage.setItem('tare_by_time', value.toString());
  };

  const setBagsPerKg = async (value: number) => {
    setBagsPerKgState(value);
    await AsyncStorage.setItem('bags_per_kg', value.toString());
  };

  return (
    <TareConfigContext.Provider value={{ isTareByTime, bagsPerKg, setIsTareByTime, setBagsPerKg }}>
      {children}
    </TareConfigContext.Provider>
  );
};

export const useTareConfig = () => {
  const context = useContext(TareConfigContext);
  if (context === undefined) {
    throw new Error('useTareConfig must be used within a TareConfigProvider');
  }
  return context;
};
