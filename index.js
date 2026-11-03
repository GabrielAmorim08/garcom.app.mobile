/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// The Firebase plist is injected only in distribution environments. Never let a
// missing optional push configuration prevent React Native from registering the
// application and replacing the native splash screen.
try {
  setBackgroundMessageHandler(getMessaging(), async () => undefined);
} catch {
  // Push remains unavailable until Firebase is configured, while the app works.
}

AppRegistry.registerComponent(appName, () => App);
