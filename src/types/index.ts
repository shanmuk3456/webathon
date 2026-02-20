export type Role = 'USER' | 'ADMIN';

export const IssueStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  VERIFIED_BY_NEIGHBOR: 'VERIFIED_BY_NEIGHBOR',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type IssueStatus = (typeof IssueStatus)[keyof typeof IssueStatus];

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  communityName: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  communityName: string;
  civicPoints: number;
  weeklyPoints: number;
}

export type IssueUrgency = 'NORMAL' | 'URGENT';

export interface Issue {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  latitude: number;
  longitude: number;
  urgency?: IssueUrgency;
  status: IssueStatus;
  communityName: string;
  reporterId: string;
  verifierId?: string | null;
  adminId?: string | null;
  pointsAwarded: boolean;
  supportCount?: number;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date | null;
  verifiedAt?: Date | null;
  inProgressAt?: Date | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  weeklyPoints: number;
  rank: number;
}
