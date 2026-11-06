import type { ProviderKind } from './types';

export const PROVIDER_KINDS: ProviderKind[] = [
  'Waiter',
  'KitchenAssistant',
  'PantryAttendant',
  'Bartender',
  'Receptionist',
  'Cleaner',
  'Cook',
  'GrillCook',
  'BarbecueCook',
  'Other',
];

const PROVIDER_KIND_KEYS: Record<ProviderKind, string> = {
  Waiter: 'waiter',
  KitchenAssistant: 'kitchenAssistant',
  PantryAttendant: 'pantryAttendant',
  Bartender: 'bartender',
  Receptionist: 'receptionist',
  Cleaner: 'cleaner',
  Cook: 'cook',
  GrillCook: 'grillCook',
  BarbecueCook: 'barbecueCook',
  Other: 'other',
};

/** Suffix of the `serviceRequest.step1.providers.<key>` translations. */
export function providerKindKey(kind: string): string {
  return PROVIDER_KIND_KEYS[kind as ProviderKind] ?? 'other';
}
