import { z } from 'zod';

export const createCaseSchema = z.object({
  title: z
    .string({ required_error: 'Case title is required.' })
    .trim()
    .min(2, 'Case title must be at least 2 characters.')
    .max(160, 'Case title cannot exceed 160 characters.'),
  description: z.string().trim().max(4000).optional().nullable(),
  status: z.enum(['draft', 'open']).default('open'),
});

export const caseIdParamSchema = z.object({
  caseId: z.string().uuid('Invalid Case ID format.'),
});

export const createEvidenceSchema = z.object({
  kind: z.enum(['note', 'url'], {
    required_error: 'Evidence kind must be note or url.',
  }),
  content: z
    .string({ required_error: 'Evidence content is required.' })
    .trim()
    .min(2, 'Content must be at least 2 characters.')
    .max(4000, 'Content cannot exceed 4000 characters.'),
  visibility: z.enum(['team', 'private_to_submitter']).default('team'),
});

export const updateEvidenceSchema = z
  .object({
    content: z.string().trim().min(2).max(4000).optional(),
    visibility: z.enum(['team', 'private_to_submitter']).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required to update evidence.' }
  );

export const evidenceIdParamSchema = z.object({
  evidenceId: z.string().uuid('Invalid Evidence ID format.'),
});

export const submitVoteSchema = z.object({
  choice: z.enum(['fair', 'needs_review', 'unfair'], {
    required_error: 'Vote choice must be fair, needs_review, or unfair.',
  }),
});

export const shareTokenParamSchema = z.object({
  token: z.string().trim().min(10, 'Invalid share token format.'),
});
