import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DeviceInfoRequest } from './types';

const DEVICE_ID_KEY = '@serveup/device-id';

async function getDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) {
    return stored;
  }

  const generated = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

export async function getDeviceInfo(): Promise<DeviceInfoRequest> {
  return {
    deviceId: await getDeviceId(),
    platform: Platform.OS === 'ios' ? 'Ios' : 'Android',
    deviceModel: Platform.OS,
    appVersion: '0.0.1',
  };
}
