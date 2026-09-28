import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_COMPLETED_FIRST_LOGIN_KEY = '@serveup/has-completed-first-login';

export const authPreferences = {
  async hasCompletedFirstLogin(): Promise<boolean> {
    return AsyncStorage.getItem(HAS_COMPLETED_FIRST_LOGIN_KEY).then(value => value === 'true');
  },

  async markFirstLoginCompleted(): Promise<void> {
    await AsyncStorage.setItem(HAS_COMPLETED_FIRST_LOGIN_KEY, 'true');
  },
};
