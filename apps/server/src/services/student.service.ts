import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';
import type { StudentCreateInput, StudentListQuery, StudentUpdateInput } from '../validators/student';

const baseSelect = {
  id: true,
  rollNumber: true,
  firstName: true,
  lastName: true,
  email: true,
  gradeLevel: true,
  section: true,
  guardianName: true,
  guardianPhone: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.StudentSelect;

export const studentService = {
  async list(query: StudentListQuery) {
    const where = buildWhere(query);

    const students = await prisma.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.take + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      select: baseSelect,
    });

    const hasMore = students.length > query.take;
    const data = hasMore ? students.slice(0, query.take) : students;
    const nextCursor = hasMore ? data.at(-1)?.id ?? null : null;

    return { data, nextCursor };
  },

  async create(input: StudentCreateInput) {
    return prisma.student.create({
      data: {
        rollNumber: input.rollNumber,
        firstName: input.firstName,
        lastName: input.lastName,
        email: toNullable(input.email),
        gradeLevel: toNullable(input.gradeLevel),
        section: toNullable(input.section),
        guardianName: toNullable(input.guardianName),
        guardianPhone: toNullable(input.guardianPhone),
        status: input.status ?? 'ACTIVE',
      },
      select: baseSelect,
    });
  },

  async getById(id: string) {
    return prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: baseSelect,
    });
  },

  async getByEmail(email: string) {
    return prisma.student.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        deletedAt: null,
      },
      select: baseSelect,
    });
  },

  async update(id: string, input: StudentUpdateInput) {
    const existing = await prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return null;

    const data: Prisma.StudentUpdateInput = {};
    if (input.firstName !== undefined) data.firstName = input.firstName;
    if (input.lastName !== undefined) data.lastName = input.lastName;
    if (input.email !== undefined) data.email = toNullable(input.email);
    if (input.gradeLevel !== undefined) data.gradeLevel = toNullable(input.gradeLevel);
    if (input.section !== undefined) data.section = toNullable(input.section);
    if (input.guardianName !== undefined) data.guardianName = toNullable(input.guardianName);
    if (input.guardianPhone !== undefined) data.guardianPhone = toNullable(input.guardianPhone);
    if (input.status !== undefined) data.status = input.status;

    return prisma.student.update({
      where: { id },
      data,
      select: baseSelect,
    });
  },

  async remove(id: string) {
    const existing = await prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return null;

    await prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  },
};

function buildWhere(query: StudentListQuery): Prisma.StudentWhereInput {
  const where: Prisma.StudentWhereInput = query.includeArchived ? {} : { deletedAt: null };

  if (query.q) {
    where.OR = [
      { rollNumber: { contains: query.q, mode: 'insensitive' } },
      { firstName: { contains: query.q, mode: 'insensitive' } },
      { lastName: { contains: query.q, mode: 'insensitive' } },
      { email: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

function toNullable(value: string | null | undefined) {
  return value ?? null;
}
