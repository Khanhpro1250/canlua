import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddItemScreen from '../screens/AddItemScreen';
import AddFarmerScreen from '../screens/AddFarmerScreen';
import FarmerDetailScreen from '../screens/FarmerDetailScreen';
import SettingsFontSizeScreen from '../screens/SettingsFontSizeScreen';
import SettingsInputFormatScreen from '../screens/SettingsInputFormatScreen';
import SettingsTareScreen from '../screens/SettingsTareScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddItem" component={AddItemScreen} />
      <Stack.Screen name="AddFarmer" component={AddFarmerScreen} />
      <Stack.Screen name="FarmerDetail" component={FarmerDetailScreen} />
      <Stack.Screen name="SettingsFontSize" component={SettingsFontSizeScreen} />
      <Stack.Screen name="SettingsInputFormat" component={SettingsInputFormatScreen} />
      <Stack.Screen name="SettingsTare" component={SettingsTareScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
