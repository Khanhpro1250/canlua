import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TareConfigContextType {
  isTareByTime: boolean;
  bagsPerKg: number;
  kgPerBag: number;
  setIsTareByTime: (value: boolean) => void;
  setBagsPerKg: (value: number) => void;
  setKgPerBag: (value: number) => void;
}

const TareConfigContext = createContext<TareConfigContextType | undefined>(undefined);

export const TareConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTareByTime, setIsTareByTimeState] = useState<boolean>(false);
  const [bagsPerKg, setBagsPerKgState] = useState<number>(8);
  const [kgPerBag, setKgPerBagState] = useState<number>(0.5);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTareMode = await AsyncStorage.getItem('tare_by_time');
        const savedBags = await AsyncStorage.getItem('bags_per_kg');
        const savedKgPerBag = await AsyncStorage.getItem('kg_per_bag');
        if (savedTareMode !== null) setIsTareByTimeState(savedTareMode === 'true');
        if (savedBags !== null) setBagsPerKgState(parseInt(savedBags));
        if (savedKgPerBag !== null) setKgPerBagState(parseFloat(savedKgPerBag));
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

  const setKgPerBag = async (value: number) => {
    setKgPerBagState(value);
    await AsyncStorage.setItem('kg_per_bag', value.toString());
  };

  return (
    <TareConfigContext.Provider value={{ isTareByTime, bagsPerKg, kgPerBag, setIsTareByTime, setBagsPerKg, setKgPerBag }}>
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
