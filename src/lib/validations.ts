import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    houseAddress: z.string().min(1, 'House address is required for community members').optional(),
    communityName: z.string().min(1, 'Community name is required'),
    role: z.enum(['USER', 'ADMIN']),
  })
  .refine((data) => data.role !== 'USER' || (data.houseAddress && data.houseAddress.trim().length > 0), {
    message: 'House address is required for community members',
    path: ['houseAddress'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  communityName: z.string().min(1, 'Community name is required'),
});

export const createIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  image_url: z.string().url('Photo is required and must be a valid URL'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  urgency: z.enum(['NORMAL', 'URGENT']),
});

export const updateIssueSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const verifyIssueExistenceSchema = locationSchema;
export const verifyIssueResolutionSchema = locationSchema;
