import { distanceInMeters } from '../src/shared/utils/geo';
import { durationInHours, firstName, initials } from '../src/shared/utils/format';

/**
 * Pure helpers only: anything that formats through Intl depends on the device
 * locale, which is not worth pinning in a unit test.
 */
describe('format helpers', () => {
  it('takes the first name for greetings', () => {
    expect(firstName('Lucas Andrade')).toBe('Lucas');
    expect(firstName('  Ana  Paula  Souza ')).toBe('Ana');
    expect(firstName('Madonna')).toBe('Madonna');
  });

  it('builds initials from the first and last name', () => {
    expect(initials('Lucas Andrade')).toBe('LA');
    expect(initials('Ana Paula Souza')).toBe('AS');
    expect(initials('Madonna')).toBe('M');
  });

  it('measures a shift in hours, including one that crosses midnight', () => {
    const start = new Date(2026, 3, 12, 19, 0).toISOString();
    const end = new Date(2026, 3, 12, 23, 0).toISOString();
    expect(durationInHours(start, end)).toBe(4);

    const overnightEnd = new Date(2026, 3, 13, 1, 30).toISOString();
    expect(durationInHours(start, overnightEnd)).toBe(6.5);
  });
});

describe('geo', () => {
  it('returns zero for the same point', () => {
    const point = { latitude: -23.5505, longitude: -46.6333 };
    expect(distanceInMeters(point, point)).toBe(0);
  });

  it('measures the distance between two points in São Paulo', () => {
    // Av. Paulista to Rua Faria Lima: roughly 3.5 km in a straight line.
    const paulista = { latitude: -23.5652, longitude: -46.6521 };
    const fariaLima = { latitude: -23.5747, longitude: -46.6889 };

    const meters = distanceInMeters(paulista, fariaLima);

    expect(meters).toBeGreaterThan(3_000);
    expect(meters).toBeLessThan(4_500);
  });

  it('is symmetric', () => {
    const a = { latitude: -23.5505, longitude: -46.6333 };
    const b = { latitude: -23.5614, longitude: -46.6559 };

    expect(distanceInMeters(a, b)).toBe(distanceInMeters(b, a));
  });
});
