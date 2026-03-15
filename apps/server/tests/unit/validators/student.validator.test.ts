import { describe, expect, it } from 'vitest';

import {
  studentCreateInputSchema,
  studentListQuerySchema,
  studentUpdateInputSchema,
} from '../../../src/validators/student';

describe('student validators', () => {
  it('allows nulls for optional fields on create', () => {
    const parsed = studentCreateInputSchema.parse({
      rollNumber: 'A-0002',
      firstName: 'Test',
      lastName: 'Student',
      email: null,
      gradeLevel: null,
      section: null,
      guardianName: null,
      guardianPhone: null,
    });

    expect(parsed.email).toBeNull();
    expect(parsed.gradeLevel).toBeNull();
  });

  it('allows nulls for optional fields on update', () => {
    const parsed = studentUpdateInputSchema.parse({
      email: null,
      gradeLevel: null,
    });

    expect(parsed).toEqual({ email: null, gradeLevel: null });
  });

  it('coerces list query params', () => {
    const parsed = studentListQuerySchema.parse({ take: '10', includeArchived: 'true' });
    expect(parsed.take).toBe(10);
    expect(parsed.includeArchived).toBe(true);
  });
});

