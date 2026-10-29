import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { biometricLogin, BiometryKind } from './biometricLogin';

/** What the device can do and whether the user turned it on, with its display name. */
export function useBiometricLogin() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<BiometryKind | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [supported, isEnabled] = await Promise.all([
      biometricLogin.getKind(),
      biometricLogin.isEnabled(),
    ]);

    setKind(supported);
    setEnabled(supported !== null && isEnabled);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const methodName = t(`biometric.methods.${kind ?? 'generic'}`);

  return { kind, enabled, loaded, methodName, refresh };
}
