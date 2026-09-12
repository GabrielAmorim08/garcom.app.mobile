import React from 'react';
import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../entities/auth/authStore';
import { NewRequestStepOneScreen } from '../screens/company/NewRequestStepOneScreen';
import { NewRequestStepThreeScreen } from '../screens/company/NewRequestStepThreeScreen';
import { NewRequestStepTwoScreen } from '../screens/company/NewRequestStepTwoScreen';
import { RequestSentScreen } from '../screens/company/RequestSentScreen';
import { WelcomeScreen } from '../screens/shared/WelcomeScreen';
import { MyServicesScreen } from '../screens/waiter/MyServicesScreen';
import { ServiceConfirmedScreen } from '../screens/waiter/ServiceConfirmedScreen';
import { ServiceDetailScreen } from '../screens/waiter/ServiceDetailScreen';
import { colors } from '../theme';
import { CompanyTabs } from './CompanyTabs';
import type { RootStackParamList } from './types';
import { WaiterTabs } from './WaiterTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};

export function RootNavigator() {
  const mode = useAuthStore(state => state.mode);

  return (
    <NavigationContainer theme={navigationTheme}>
      {/*
        Headers are off across the stack: every screen draws its own, because the
        design puts the title, the back arrow and the step bar in one block.
      */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />

        {mode === 'company' ? (
          <Stack.Group>
            <Stack.Screen name="CompanyTabs" component={CompanyTabs} />
            <Stack.Screen name="NewRequestStepOne" component={NewRequestStepOneScreen} />
            <Stack.Screen name="NewRequestStepTwo" component={NewRequestStepTwoScreen} />
            <Stack.Screen name="NewRequestStepThree" component={NewRequestStepThreeScreen} />
            <Stack.Screen
              name="RequestSent"
              component={RequestSentScreen}
              options={{ gestureEnabled: false }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="WaiterTabs" component={WaiterTabs} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
            <Stack.Screen
              name="ServiceConfirmed"
              component={ServiceConfirmedScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="MyServices" component={MyServicesScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
