# 🎓 Edu Portal
A high-performance, modern School Management System (ERP) built with a **Monorepo** architecture for maximum scalability and developer experience.

## 🚀 Core Features (v1.0)
- **👤 Student Management**: Full CRUD operations, roll number generation, and profile tracking.
- **📅 Attendance & Tracking**: Real-time attendance logging with a 14-day historical visual grid.
- **💰 Fee Management**: Automated ledger system with payment tracking and outstanding balance calculation.
- **🧠 Academic Engine**: 
  - Relational Subject & Exam management.
  - Automatic GPA calculation (4.0 Scale).
  - Subject-grouped result cards for students.
- **📊 Admin Analytics**: Global dashboard with real-time stats (Active students, revenue, today's attendance rate).
- **🛡️ Secure Foundation**: Role-Based Access Control (Admin, Teacher, Student) with HttpOnly secure session cookies.

## 🛠️ Tech Stack
- **Frontend**: [Next.js](https://nextjs.org/) (App Router), React, TailwindCSS.
- **Backend**: [Fastify](https://www.fastify.io/) (Node.js), TypeScript.
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/).
- **Orchestration**: [pnpm Workspaces](https://pnpm.io/workspaces) & [Turborepo](https://turbo.build/).
- **Containerization**: [Docker](https://www.docker.com/) (Postgres & Migration handling).

## 📥 Getting Started

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```
2. **Setup Environment**:
   Copy `.env.example` to `.env` and update your database credentials.
3. **Launch Infrastructure**:
   ```bash
   docker-compose up -d
   ```
4. **Sync Database**:
   ```bash
   pnpm --filter @edu/server run prisma:migrate
   ```
5. **Run Development Mode**:
   ```bash
   pnpm dev
   ```

## 📂 Project Structure
- `apps/web`: Next.js portal with optimistic UI updates.
- `apps/server`: High-speed API with Zod validation.
- `packages/`: Shared types, utilities, and UI components.

---
Built with ⚡ by [Syed Daiam](https://github.com/SyedDaiam9101)
