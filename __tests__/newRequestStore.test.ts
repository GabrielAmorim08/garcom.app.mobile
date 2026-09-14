import { useNewRequestStore } from '../src/entities/jobPost/newRequestStore';

/**
 * The request draft carries the only non-trivial client-side rule in the flow:
 * turning a date plus two times into a shift range, including the overnight case.
 */
describe('newRequestStore', () => {
  beforeEach(() => {
    useNewRequestStore.getState().reset();
  });

  function at(hour: number, minute = 0): Date {
    const date = new Date(2026, 3, 12, hour, minute, 0, 0);
    return date;
  }

  it('has no shift range until date and both times are set', () => {
    const store = useNewRequestStore.getState();

    expect(store.getShiftRange()).toBeNull();

    store.setDate(at(0));
    expect(useNewRequestStore.getState().getShiftRange()).toBeNull();

    store.setTimeRange(at(19), at(23));
    expect(useNewRequestStore.getState().getShiftRange()).not.toBeNull();
  });

  it('builds a shift range on the chosen date', () => {
    const store = useNewRequestStore.getState();
    store.setDate(at(0));
    store.setTimeRange(at(19), at(23));

    const range = useNewRequestStore.getState().getShiftRange()!;

    expect(new Date(range.shiftStart).getHours()).toBe(19);
    expect(new Date(range.shiftEnd).getHours()).toBe(23);
    expect(new Date(range.shiftEnd).getDate()).toBe(12);
  });

  it('rolls the end into the next day when the shift crosses midnight', () => {
    const store = useNewRequestStore.getState();
    store.setDate(at(0));
    // 18:00 to 00:00 — the bar shift in the fixtures.
    store.setTimeRange(at(18), at(0));

    const range = useNewRequestStore.getState().getShiftRange()!;

    expect(new Date(range.shiftEnd).getDate()).toBe(13);
    expect(new Date(range.shiftEnd).getTime()).toBeGreaterThan(
      new Date(range.shiftStart).getTime(),
    );
  });

  it('refuses to build a request without a location', () => {
    const store = useNewRequestStore.getState();
    store.setServiceKind('PrivateEvent');
    store.setDate(at(0));
    store.setTimeRange(at(19), at(23));

    expect(useNewRequestStore.getState().toRequest('Evento Particular')).toBeNull();
  });

  it('builds a request once kind, range and location are present', () => {
    const store = useNewRequestStore.getState();
    store.setServiceKind('Corporate');
    store.setDate(at(0));
    store.setTimeRange(at(12), at(18));
    store.setAddress({ street: 'Rua Faria Lima', number: '350' }, {
      latitude: -23.5747,
      longitude: -46.6889,
    });
    store.setSlots(3);
    store.setNotes('  Coffee break  ');

    const request = useNewRequestStore.getState().toRequest('Evento Corporativo')!;

    expect(request.serviceKind).toBe('Corporate');
    expect(request.slots).toBe(3);
    expect(request.description).toBe('Coffee break');
    expect(request.location.latitude).toBeCloseTo(-23.5747);
  });

  it('treats whitespace-only notes as no description', () => {
    const store = useNewRequestStore.getState();
    store.setServiceKind('Other');
    store.setDate(at(0));
    store.setTimeRange(at(10), at(14));
    store.setAddress({}, { latitude: 0, longitude: 0 });
    store.setNotes('   ');

    expect(useNewRequestStore.getState().toRequest('Outro')!.description).toBeNull();
  });
});
