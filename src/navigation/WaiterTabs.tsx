import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { MessagesScreen } from '../screens/shared/MessagesScreen';
import { NearbyServicesScreen } from '../screens/waiter/NearbyServicesScreen';
import { WaiterHomeScreen } from '../screens/waiter/WaiterHomeScreen';
import { tabBarStyle, tabScreenOptions } from './TabBar';
import type { WaiterTabParamList } from './types';

const Tab = createBottomTabNavigator<WaiterTabParamList>();

export function WaiterTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator screenOptions={tabBarStyle}>
      <Tab.Screen
        name="WaiterHome"
        component={WaiterHomeScreen}
        options={tabScreenOptions('home', t('tabs.home'))}
      />
      <Tab.Screen
        name="NearbyServices"
        component={NearbyServicesScreen}
        options={tabScreenOptions('search', t('tabs.services'))}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={tabScreenOptions('message', t('tabs.messages'))}
      />
      <Tab.Screen
        name="WaiterProfile"
        component={ProfileScreen}
        options={tabScreenOptions('user', t('tabs.profile'))}
      />
    </Tab.Navigator>
  );
}
