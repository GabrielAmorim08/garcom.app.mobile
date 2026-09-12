import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '../entities/auth/authStore';
import '../i18n';
import { RootNavigator } from '../navigation/RootNavigator';
import { setSessionExpiredHandler } from '../shared/api/httpClient';
import { queryClient } from '../shared/api/queryClient';


export function App() {
  const hydrate = useAuthStore(state => state.hydrate);
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    void hydrate();

    // A refresh that cannot be recovered drops the session and the cached data with it.
    setSessionExpiredHandler(() => {
      setUser(null);
      queryClient.clear();
    });
  }, [hydrate, setUser]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
