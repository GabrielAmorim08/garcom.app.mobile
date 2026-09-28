import { create } from 'zustand';

import type { Address, GeoPoint } from '../../shared/types/common';
import { combineDateAndTime } from '../../shared/utils/date';
import type { CreateJobPostRequest, ProviderKind } from './types';

/**
 * Draft behind the three-step request flow. It lives in a store rather than in
 * navigation params so going back never loses what was already filled in.
 */
interface NewRequestState {
  providerKind: ProviderKind | null;
  startDate: Date | null;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  address: Address;
  location: GeoPoint | null;
  slots: number;
  payAmount: number | null;
  notes: string;

  setProviderKind: (kind: ProviderKind) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setStartTime: (time: Date) => void;
  setEndTime: (time: Date) => void;
  setAddress: (address: Address, location: GeoPoint | null) => void;
  setSlots: (slots: number) => void;
  setPayAmount: (amount: number | null) => void;
  setNotes: (notes: string) => void;
  reset: () => void;

  /** Null until date and both times are set. */
  getShiftRange: () => { shiftStart: string; shiftEnd: string } | null;
  isStepOneValid: () => boolean;
  isStepTwoValid: () => boolean;
  toRequest: (title: string) => CreateJobPostRequest | null;
}

const emptyDraft = {
  providerKind: null,
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  address: {} as Address,
  location: null,
  slots: 1,
  payAmount: null,
  notes: '',
};

export const useNewRequestStore = create<NewRequestState>((set, get) => ({
  ...emptyDraft,

  setProviderKind: providerKind => set({ providerKind }),
  setStartDate: startDate => set(state => ({ startDate, endDate: state.endDate ?? startDate })),
  setEndDate: endDate => set({ endDate }),
  setStartTime: startTime => set({ startTime }),
  setEndTime: endTime => set({ endTime }),
  setAddress: (address, location) => set({ address, location }),
  setSlots: slots => set({ slots }),
  setPayAmount: payAmount => set({ payAmount }),
  setNotes: notes => set({ notes }),
  reset: () => set({ ...emptyDraft }),

  getShiftRange() {
    const { startDate, endDate, startTime, endTime } = get();
    if (!startDate || !endDate || !startTime || !endTime) {
      return null;
    }

    const shiftStart = combineDateAndTime(startDate, startTime);
    const shiftEnd = combineDateAndTime(endDate, endTime);

    return { shiftStart: shiftStart.toISOString(), shiftEnd: shiftEnd.toISOString() };
  },

  isStepOneValid() {
    return get().providerKind !== null;
  },

  isStepTwoValid() {
    const { location, address } = get();
    const range = get().getShiftRange();
    return (
      range !== null &&
      new Date(range.shiftEnd).getTime() > new Date(range.shiftStart).getTime() &&
      (location !== null || Boolean(address.postalCode || address.street))
    );
  },

  toRequest(title) {
    const state = get();
    const range = state.getShiftRange();

    if (
      !state.providerKind ||
      !range ||
      new Date(range.shiftEnd).getTime() <= new Date(range.shiftStart).getTime() ||
      !state.payAmount ||
      state.payAmount <= 0 ||
      (state.location === null && !state.address.postalCode && !state.address.street)
    ) {
      return null;
    }

    return {
      serviceKind: 'Other',
      providerKind: state.providerKind,
      title,
      description: state.notes.trim() || null,
      shiftStart: range.shiftStart,
      shiftEnd: range.shiftEnd,
      slots: state.slots,
      payAmount: state.payAmount,
      payType: 'PerShift',
      address: state.address,
      location: state.location,
    };
  },
}));
