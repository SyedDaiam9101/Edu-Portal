-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'USER');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "gradeLevel" TEXT,
    "section" TEXT,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_key" ON "Student"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_createdAt_idx" ON "Student"("createdAt");

-- CreateIndex
CREATE INDEX "Student_rollNumber_idx" ON "Student"("rollNumber");
