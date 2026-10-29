import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { CompanyHomeScreen } from '../screens/company/CompanyHomeScreen';
import { CompanyServicesScreen } from '../screens/company/CompanyServicesScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { tabScreenOptions, useTabBarOptions } from './TabBar';
import type { CompanyTabParamList } from './types';

const Tab = createBottomTabNavigator<CompanyTabParamList>();

export function CompanyTabs() {
  const { t } = useTranslation();
  const tabBarOptions = useTabBarOptions();

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="CompanyHome"
        component={CompanyHomeScreen}
        options={tabScreenOptions('home', t('tabs.home'))}
      />
      <Tab.Screen
        name="CompanyServices"
        component={CompanyServicesScreen}
        options={tabScreenOptions('note', t('tabs.services'))}
      />
      <Tab.Screen
        name="CompanyProfile"
        component={ProfileScreen}
        options={tabScreenOptions('user', t('tabs.profile'))}
      />
    </Tab.Navigator>
  );
}
