import { apiConfig } from './config';
import { tokenStorage } from './tokenStorage';

export async function shouldUseApi(): Promise<boolean> {
  return !apiConfig.useMocks || Boolean(await tokenStorage.read());
}
