/**
 * Native modules have no implementation under Jest, and importing one throws
 * before a test body ever runs. These stubs keep the modules loadable so pure
 * logic can be tested without a device.
 */

jest.mock('react-native-localize', () => ({
  findBestLanguageTag: () => ({ languageTag: 'pt-BR', isRTL: false }),
  getLocales: () => [
    { countryCode: 'BR', languageTag: 'pt-BR', languageCode: 'pt', isRTL: false },
  ],
  getTimeZone: () => 'America/Sao_Paulo',
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();

  return {
    __esModule: true,
    default: {
      getItem: async key => store.get(key) ?? null,
      setItem: async (key, value) => {
        store.set(key, value);
      },
      removeItem: async key => {
        store.delete(key);
      },
      getMany: async keys =>
        Object.fromEntries(keys.map(key => [key, store.get(key) ?? null])),
      setMany: async entries => {
        Object.entries(entries).forEach(([key, value]) => store.set(key, value));
      },
      removeMany: async keys => {
        keys.forEach(key => store.delete(key));
      },
      getAllKeys: async () => [...store.keys()],
      clear: async () => {
        store.clear();
      },
    },
  };
});

jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
}));
