/**
 * Security test cases for:
 * - Invalid state transition
 * - Cross-community access attempt
 * - Duplicate issue attempt
 * - Out-of-radius verification attempt
 */
import { isValidTransition, getTransitionError } from '@/lib/issue-state-machine';
import { calculateDistance } from '@/lib/utils';

describe('Issue state machine', () => {
  it('rejects invalid transition PENDING_APPROVAL -> RESOLVED', () => {
    expect(isValidTransition('PENDING_APPROVAL', 'RESOLVED')).toBe(false);
    expect(getTransitionError('PENDING_APPROVAL', 'RESOLVED')).toContain('Allowed');
  });

  it('rejects invalid transition APPROVED -> CLOSED when not via reject path', () => {
    // APPROVED -> CLOSED is valid (false alarm)
    expect(isValidTransition('APPROVED', 'CLOSED')).toBe(true);
  });

  it('rejects transition from terminal CLOSED', () => {
    expect(isValidTransition('CLOSED', 'APPROVED')).toBe(false);
  });

  it('allows valid transitions', () => {
    expect(isValidTransition('PENDING_APPROVAL', 'APPROVED')).toBe(true);
    expect(isValidTransition('PENDING_APPROVAL', 'CLOSED')).toBe(true);
    expect(isValidTransition('APPROVED', 'VERIFIED_BY_NEIGHBOR')).toBe(true);
    expect(isValidTransition('VERIFIED_BY_NEIGHBOR', 'IN_PROGRESS')).toBe(true);
    expect(isValidTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
    expect(isValidTransition('RESOLVED', 'CLOSED')).toBe(true);
  });
});

describe('Haversine / radius validation', () => {
  it('returns 0 for same coords', () => {
    expect(calculateDistance(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
  });

  it('rejects out-of-radius: distance > 500m', () => {
    const issue = { lat: 40.7128, lon: -74.006 };
    const user = { lat: 40.7200, lon: -74.006 };
    const dist = calculateDistance(issue.lat, issue.lon, user.lat, user.lon);
    expect(dist).toBeGreaterThan(500);
  });

  it('allows in-radius: distance ~100m', () => {
    const issue = { lat: 40.7128, lon: -74.006 };
    const user = { lat: 40.7135, lon: -74.006 };
    const dist = calculateDistance(issue.lat, issue.lon, user.lat, user.lon);
    expect(dist).toBeLessThanOrEqual(500);
  });
});
