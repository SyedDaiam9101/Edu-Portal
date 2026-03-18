import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../prisma/client';
import { academicService } from '../services/academic.service';
import { examService } from '../services/exam.service';
import { teacherService } from '../services/teacher.service';
import type { BulkAttendanceInput } from '../validators/teacher';

export const teacherController = {
  async listMyStudents(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing teacher identity' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, gradeLevel: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return reply.status(403).send({ error: 'forbidden', message: 'Teacher access required' });
    }

    if (!teacher.gradeLevel) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Teacher has no assigned grade.',
      });
    }

    const students = await teacherService.listStudentsByGrade(teacher.gradeLevel);
    return reply.send({ data: students });
  },

  async markBulkAttendance(
    request: FastifyRequest,
    reply: FastifyReply,
    input: BulkAttendanceInput,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing teacher identity' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, gradeLevel: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return reply.status(403).send({ error: 'forbidden', message: 'Teacher access required' });
    }

    if (!teacher.gradeLevel) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Teacher has no assigned grade.',
      });
    }

    const studentIds = Array.from(new Set(input.records.map((record) => record.studentId)));
    if (studentIds.length === 0) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Attendance records are required.',
      });
    }

    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        gradeLevel: teacher.gradeLevel,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    });

    if (students.length !== studentIds.length) {
      return reply.status(403).send({
        error: 'forbidden',
        message: 'One or more students are outside your assigned grade.',
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const data = input.records.map((record) => ({
      studentId: record.studentId,
      status: record.status,
      date: todayStart,
    }));

    await prisma.$transaction([
      prisma.attendance.deleteMany({
        where: {
          studentId: { in: studentIds },
          date: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.attendance.createMany({ data }),
    ]);

    return reply.status(201).send({ ok: true, count: data.length });
  },

  async getClassAttendanceToday(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing teacher identity' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, gradeLevel: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return reply.status(403).send({ error: 'forbidden', message: 'Teacher access required' });
    }

    if (!teacher.gradeLevel) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Teacher has no assigned grade.',
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const records = await prisma.attendance.findMany({
      where: {
        date: { gte: todayStart, lt: tomorrowStart },
        student: {
          gradeLevel: teacher.gradeLevel,
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      select: { studentId: true, status: true },
    });

    const statuses = records.reduce<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>((acc, record) => {
      acc[record.studentId] = record.status;
      return acc;
    }, {});

    return reply.send({ data: { statuses, count: records.length } });
  },

  async getStudentResults(request: FastifyRequest, reply: FastifyReply, studentId: string) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing teacher identity' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, gradeLevel: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return reply.status(403).send({ error: 'forbidden', message: 'Teacher access required' });
    }

    if (!teacher.gradeLevel) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Teacher has no assigned grade.',
      });
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        gradeLevel: true,
      },
    });

    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    if (student.gradeLevel !== teacher.gradeLevel) {
      return reply.status(403).send({
        error: 'forbidden',
        message: 'This student is not in your assigned class.',
      });
    }

    const [results, gpa] = await Promise.all([
      academicService.listResultsByStudent(studentId),
      examService.calculateStudentGPA(studentId),
    ]);

    return reply.send({ data: { student, gpa, results } });
  },
};
