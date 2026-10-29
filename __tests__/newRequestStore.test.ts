import { useNewRequestStore } from '../src/entities/jobPost/newRequestStore';

/**
 * The request draft carries the only non-trivial client-side rule in the flow:
 * turning start/end dates plus times into a shift range.
 */
describe('newRequestStore', () => {
  beforeEach(() => {
    useNewRequestStore.getState().reset();
  });

  function at(hour: number, minute = 0): Date {
    const date = new Date(2099, 3, 12, hour, minute, 0, 0);
    return date;
  }

  it('has no shift range until date and both times are set', () => {
    const store = useNewRequestStore.getState();

    expect(store.getShiftRange()).toBeNull();

    store.setStartDate(at(0));
    expect(useNewRequestStore.getState().getShiftRange()).toBeNull();

    store.setEndDate(at(0));
    store.setStartTime(at(19));
    store.setEndTime(at(23));
    expect(useNewRequestStore.getState().getShiftRange()).not.toBeNull();
  });

  it('builds a shift range on the chosen date', () => {
    const store = useNewRequestStore.getState();
    store.setStartDate(at(0));
    store.setEndDate(at(0));
    store.setStartTime(at(19));
    store.setEndTime(at(23));

    const range = useNewRequestStore.getState().getShiftRange()!;

    expect(new Date(range.shiftStart).getHours()).toBe(19);
    expect(new Date(range.shiftEnd).getHours()).toBe(23);
    expect(new Date(range.shiftEnd).getDate()).toBe(12);
  });

  it('uses the explicit end date when the shift crosses midnight', () => {
    const store = useNewRequestStore.getState();
    store.setStartDate(at(0));
    store.setEndDate(new Date(2099, 3, 13, 0, 0, 0, 0));
    store.setStartTime(at(18));
    store.setEndTime(at(0));

    const range = useNewRequestStore.getState().getShiftRange()!;

    expect(new Date(range.shiftEnd).getDate()).toBe(13);
    expect(new Date(range.shiftEnd).getTime()).toBeGreaterThan(
      new Date(range.shiftStart).getTime(),
    );
  });

  it('refuses to build a request without a location', () => {
    const store = useNewRequestStore.getState();
    store.setProviderKind('Waiter');
    store.setStartDate(at(0));
    store.setEndDate(at(0));
    store.setStartTime(at(19));
    store.setEndTime(at(23));
    store.setPayAmount(180);

    expect(useNewRequestStore.getState().toRequest('Evento Particular')).toBeNull();
  });

  it('builds a request once provider, range and location are present', () => {
    const store = useNewRequestStore.getState();
    store.setProviderKind('PantryAttendant');
    store.setStartDate(at(0));
    store.setEndDate(at(0));
    store.setStartTime(at(12));
    store.setEndTime(at(18));
    store.setAddress({ street: 'Rua Faria Lima', number: '350' }, {
      latitude: -23.5747,
      longitude: -46.6889,
    });
    store.setSlots(3);
    store.setPayAmount(220);
    store.setNotes('  Coffee break  ');

    const request = useNewRequestStore.getState().toRequest('Evento Corporativo')!;

    expect(request.serviceKind).toBe('Other');
    expect(request.providerKind).toBe('PantryAttendant');
    expect(request.slots).toBe(3);
    expect(request.payAmount).toBe(220);
    expect(request.description).toBe('Coffee break');
    expect(request.location?.latitude).toBeCloseTo(-23.5747);
  });

  it('treats whitespace-only notes as no description', () => {
    const store = useNewRequestStore.getState();
    store.setProviderKind('Other');
    store.setStartDate(at(0));
    store.setEndDate(at(0));
    store.setStartTime(at(10));
    store.setEndTime(at(14));
    store.setAddress({}, { latitude: 0, longitude: 0 });
    store.setPayAmount(120);
    store.setNotes('   ');

    expect(useNewRequestStore.getState().toRequest('Outro')!.description).toBeNull();
  });

  it('rejects a manual address without a complete CEP', () => {
    const store = useNewRequestStore.getState();
    store.setProviderKind('Waiter');
    store.setStartDate(at(0));
    store.setStartTime(at(12));
    store.setEndTime(at(18));
    store.setAddress({ street: 'Rua Exemplo', postalCode: '12345' }, null);
    store.setPayAmount(150);

    expect(store.isStepTwoValid()).toBe(false);
    expect(store.toRequest('Evento')).toBeNull();

    store.setAddress({ street: 'Rua Exemplo', postalCode: '83823-152' }, null);
    expect(store.isStepTwoValid()).toBe(true);
  });

  it('moves the end date forward when the start date changes', () => {
    const store = useNewRequestStore.getState();
    store.setStartDate(at(0));
    store.setEndDate(new Date(2099, 3, 13));
    store.setStartDate(new Date(2099, 3, 14));

    expect(useNewRequestStore.getState().endDate?.getDate()).toBe(14);
  });
});
