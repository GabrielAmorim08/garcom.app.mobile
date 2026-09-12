import { create } from 'zustand';

import type { Address, GeoPoint } from '../../shared/types/common';
import { combineDateAndTime } from '../../shared/utils/date';
import type { CreateJobPostRequest, ServiceKind } from './types';

/**
 * Draft behind the three-step request flow. It lives in a store rather than in
 * navigation params so going back never loses what was already filled in.
 */
interface NewRequestState {
  serviceKind: ServiceKind | null;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  address: Address;
  location: GeoPoint | null;
  slots: number;
  notes: string;

  setServiceKind: (kind: ServiceKind) => void;
  setDate: (date: Date) => void;
  setTimeRange: (start: Date, end: Date) => void;
  setAddress: (address: Address, location: GeoPoint | null) => void;
  setSlots: (slots: number) => void;
  setNotes: (notes: string) => void;
  reset: () => void;

  /** Null until date and both times are set. */
  getShiftRange: () => { shiftStart: string; shiftEnd: string } | null;
  isStepOneValid: () => boolean;
  isStepTwoValid: () => boolean;
  toRequest: (title: string) => CreateJobPostRequest | null;
}

const emptyDraft = {
  serviceKind: null,
  date: null,
  startTime: null,
  endTime: null,
  address: {} as Address,
  location: null,
  slots: 1,
  notes: '',
};

export const useNewRequestStore = create<NewRequestState>((set, get) => ({
  ...emptyDraft,

  setServiceKind: serviceKind => set({ serviceKind }),
  setDate: date => set({ date }),
  setTimeRange: (startTime, endTime) => set({ startTime, endTime }),
  setAddress: (address, location) => set({ address, location }),
  setSlots: slots => set({ slots }),
  setNotes: notes => set({ notes }),
  reset: () => set({ ...emptyDraft }),

  getShiftRange() {
    const { date, startTime, endTime } = get();
    if (!date || !startTime || !endTime) {
      return null;
    }

    const shiftStart = combineDateAndTime(date, startTime);
    const shiftEnd = combineDateAndTime(date, endTime);

    // A shift that ends earlier than it starts crosses midnight: it lands the next day.
    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    return { shiftStart: shiftStart.toISOString(), shiftEnd: shiftEnd.toISOString() };
  },

  isStepOneValid() {
    return get().serviceKind !== null;
  },

  isStepTwoValid() {
    const { location, address } = get();
    return get().getShiftRange() !== null && (location !== null || Boolean(address.street));
  },

  toRequest(title) {
    const state = get();
    const range = state.getShiftRange();

    if (!state.serviceKind || !range || !state.location) {
      return null;
    }

    return {
      serviceKind: state.serviceKind,
      title,
      description: state.notes.trim() || null,
      shiftStart: range.shiftStart,
      shiftEnd: range.shiftEnd,
      slots: state.slots,
      // Set by the server from the estimate; the company does not type a price.
      payAmount: 0,
      payType: 'PerShift',
      address: state.address,
      location: state.location,
    };
  },
}));
