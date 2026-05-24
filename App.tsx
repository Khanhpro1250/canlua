import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { FontSizeProvider } from './src/context/FontSizeContext';
import { InputFormatProvider } from './src/context/InputFormatContext';
import { TareConfigProvider } from './src/context/TareConfigContext';

export default function App() {
  return (
    <TareConfigProvider>
      <InputFormatProvider>
        <FontSizeProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </FontSizeProvider>
      </InputFormatProvider>
    </TareConfigProvider>
  );
}
