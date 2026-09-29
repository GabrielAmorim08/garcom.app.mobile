import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../entities/auth/authStore';
import { NewRequestStepOneScreen } from '../screens/company/NewRequestStepOneScreen';
import { NewRequestStepThreeScreen } from '../screens/company/NewRequestStepThreeScreen';
import { NewRequestStepTwoScreen } from '../screens/company/NewRequestStepTwoScreen';
import { RequestSentScreen } from '../screens/company/RequestSentScreen';
import { CompanyServiceDetailScreen } from '../screens/company/CompanyServiceDetailScreen';
import { EmailVerificationScreen } from '../screens/shared/EmailVerificationScreen';
import { ProfileDetailsScreen } from '../screens/shared/ProfileDetailsScreen';
import { SignInScreen } from '../screens/shared/SignInScreen';
import { SignUpScreen } from '../screens/shared/SignUpScreen';
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
  const user = useAuthStore(state => state.user);
  const isHydrating = useAuthStore(state => state.isHydrating);
  const pendingVerificationEmail = useAuthStore(state => state.pendingVerificationEmail);
  const hasCompletedFirstLogin = useAuthStore(state => state.hasCompletedFirstLogin);

  if (isHydrating) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {/*
        Headers are off across the stack: every screen draws its own, because the
        design puts the title, the back arrow and the step bar in one block.
      */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            {!hasCompletedFirstLogin ? (
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
            ) : null}
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : pendingVerificationEmail ? (
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        ) : mode === 'company' ? (
          <>
            <Stack.Screen name="CompanyTabs" component={CompanyTabs} />
            <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
            <Stack.Screen name="NewRequestStepOne" component={NewRequestStepOneScreen} />
            <Stack.Screen name="NewRequestStepTwo" component={NewRequestStepTwoScreen} />
            <Stack.Screen name="NewRequestStepThree" component={NewRequestStepThreeScreen} />
            <Stack.Screen name="CompanyServiceDetail" component={CompanyServiceDetailScreen} />
            <Stack.Screen
              name="RequestSent"
              component={RequestSentScreen}
              options={{ gestureEnabled: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="WaiterTabs" component={WaiterTabs} />
            <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
            <Stack.Screen
              name="ServiceConfirmed"
              component={ServiceConfirmedScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="MyServices" component={MyServicesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
