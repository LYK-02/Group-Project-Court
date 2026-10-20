import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string({ required_error: 'Team name is required.' })
    .trim()
    .min(2, 'Team name must be at least 2 characters long.')
    .max(100, 'Team name cannot exceed 100 characters.'),
});

export const createInviteSchema = z.object({
  expiresInHours: z
    .coerce
    .number()
    .int('Expiration must be an integer number of hours.')
    .min(1, 'Invite must be valid for at least 1 hour.')
    .max(720, 'Invite validity cannot exceed 30 days.')
    .default(72),
});

export const teamIdParamSchema = z.object({
  teamId: z.string().uuid('Invalid Team ID format.'),
});

export const teamMemberParamSchema = z.object({
  teamId: z.string().uuid('Invalid Team ID format.'),
  userId: z.string().uuid('Invalid User ID format.'),
});
