/**
 * Centralized issue state machine.
 * Every state-changing route MUST validate transitions against this.
 * No route should directly mutate status without validation.
 */
import { IssueStatus } from '@/types';

export const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_APPROVAL: ['APPROVED', 'CLOSED'], // CLOSED = rejected
  APPROVED: ['VERIFIED_BY_NEIGHBOR', 'CLOSED'], // CLOSED = false alarm
  VERIFIED_BY_NEIGHBOR: ['IN_PROGRESS', 'CLOSED'], // CLOSED = false alarm
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [], // Terminal
};

export const TERMINAL_STATUSES = ['CLOSED'];

export function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function getTransitionError(from: string, to: string): string {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || allowed.length === 0) {
    return `Invalid transition: status "${from}" is terminal or unknown.`;
  }
  return `Invalid transition: ${from} -> ${to}. Allowed: ${allowed.join(', ')}`;
}
