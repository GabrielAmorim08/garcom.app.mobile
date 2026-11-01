import React, { useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../entities/auth/authStore';
import { NewRequestStepOneScreen } from '../screens/company/NewRequestStepOneScreen';
import { NewRequestStepThreeScreen } from '../screens/company/NewRequestStepThreeScreen';
import { NewRequestStepTwoScreen } from '../screens/company/NewRequestStepTwoScreen';
import { RequestSentScreen } from '../screens/company/RequestSentScreen';
import { CompanyServiceDetailScreen } from '../screens/company/CompanyServiceDetailScreen';
import { CandidateProfileScreen } from '../screens/company/CandidateProfileScreen';
import { ChatConversationScreen } from '../screens/shared/ChatConversationScreen';
import { EmailVerificationScreen } from '../screens/shared/EmailVerificationScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { ProfileDetailsScreen } from '../screens/shared/ProfileDetailsScreen';
import { SignInScreen } from '../screens/shared/SignInScreen';
import { SignUpScreen } from '../screens/shared/SignUpScreen';
import { SplashScreen } from '../screens/shared/SplashScreen';
import { WelcomeScreen } from '../screens/shared/WelcomeScreen';
import { AssignmentDetailScreen } from '../screens/waiter/AssignmentDetailScreen';
import { EarningsDashboardScreen } from '../screens/waiter/EarningsDashboardScreen';
import { MyServicesScreen } from '../screens/waiter/MyServicesScreen';
import { ServiceConfirmedScreen } from '../screens/waiter/ServiceConfirmedScreen';
import { ServiceDetailScreen } from '../screens/waiter/ServiceDetailScreen';
import { WaiterProfileEditScreen } from '../screens/waiter/WaiterProfileEditScreen';
import { splashAnimationEnabled } from '../shared/appInfo';
import { LocationRequiredDialog } from '../shared/components';
import { useLocationAccess } from '../shared/hooks/useLocationAccess';
import { colors } from '../theme';
import { CompanyTabs } from './CompanyTabs';
import type { RootStackParamList } from './types';
import { WaiterTabs } from './WaiterTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** The opening screen leaves when its animation ends; this only guards against it never reporting. */
const SPLASH_MAX_DURATION_MS = 6000;

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

function LocationGate() {
  const { block, openSettings } = useLocationAccess();
  return <LocationRequiredDialog block={block} onOpenSettings={() => void openSettings()} />;
}

export function RootNavigator() {
  const mode = useAuthStore(state => state.mode);
  const user = useAuthStore(state => state.user);
  const isHydrating = useAuthStore(state => state.isHydrating);
  const pendingVerificationEmail = useAuthStore(state => state.pendingVerificationEmail);
  const hasCompletedFirstLogin = useAuthStore(state => state.hasCompletedFirstLogin);

  const [splashTimeElapsed, setSplashTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashTimeElapsed(true), SPLASH_MAX_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (isHydrating || (splashAnimationEnabled && !splashTimeElapsed)) {
    return <SplashScreen onFinished={() => setSplashTimeElapsed(true)} />;
  }

  const needsLocation = user !== null && !pendingVerificationEmail;

  return (
    <NavigationContainer theme={navigationTheme}>
      {needsLocation ? <LocationGate /> : null}
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
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NewRequestStepOne" component={NewRequestStepOneScreen} />
            <Stack.Screen name="NewRequestStepTwo" component={NewRequestStepTwoScreen} />
            <Stack.Screen name="NewRequestStepThree" component={NewRequestStepThreeScreen} />
            <Stack.Screen name="CompanyServiceDetail" component={CompanyServiceDetailScreen} />
            <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
            <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
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
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
            <Stack.Screen
              name="ServiceConfirmed"
              component={ServiceConfirmedScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="MyServices" component={MyServicesScreen} />
            <Stack.Screen name="EarningsDashboard" component={EarningsDashboardScreen} />
            <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
            <Stack.Screen name="WaiterProfileEdit" component={WaiterProfileEditScreen} />
            <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
