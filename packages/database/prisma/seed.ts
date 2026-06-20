import {
  PrismaClient,
  Role,
  EmployeeStatus,
  LeaveStatus,
  GoalStatus,
  JobStatus,
  CandidateStatus
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.review.deleteMany();
  await prisma.salaryRecord.deleteMany();
  await prisma.document.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.jobOpening.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.companyMembership.deleteMany();
  await prisma.roleProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.department.deleteMany();
  await prisma.jobTitle.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.company.deleteMany();

  const company = await prisma.company.create({
    data: {
      name: "Nutrivae Labs",
      legalName: "Nutrivae Labs Inc.",
      slug: "nutrivae-labs",
      theme: "emerald",
      currency: "USD",
      country: "United States",
      timezone: "America/New_York",
      email: "people@nutrivae.com",
      phone: "+1 415 555 0134",
      address: "548 Market Street, San Francisco, CA"
    }
  });
  const [adminRole, managerRole, employeeRole] = await Promise.all([
    prisma.roleProfile.create({
      data: {
        companyId: company.id,
        name: "Company admin",
        description: "Full company access",
        permissions: ["*"],
        isSystem: true
      }
    }),
    prisma.roleProfile.create({
      data: {
        companyId: company.id,
        name: "People manager",
        description: "Manage people and approvals",
        permissions: [
          "employees.manage",
          "leave.approve",
          "organization.manage",
          "goals.manage",
          "payouts.manage",
          "projects.manage"
        ],
        isSystem: true
      }
    }),
    prisma.roleProfile.create({
      data: {
        companyId: company.id,
        name: "Employee",
        description: "Employee self-service",
        permissions: ["profile.self", "leave.self", "goals.self", "payouts.self"],
        isSystem: true
      }
    })
  ]);

  const [people, product, growth] = await Promise.all([
    prisma.department.create({ data: { companyId: company.id, name: "People & Culture", code: "PPL" } }),
    prisma.department.create({ data: { companyId: company.id, name: "Product & Engineering", code: "PRD" } }),
    prisma.department.create({ data: { companyId: company.id, name: "Growth", code: "GRO" } })
  ]);
  const [director, engineer, designer, recruiter] = await Promise.all([
    prisma.jobTitle.create({ data: { companyId: company.id, name: "People Director", level: "L6" } }),
    prisma.jobTitle.create({ data: { companyId: company.id, name: "Senior Engineer", level: "L4" } }),
    prisma.jobTitle.create({ data: { companyId: company.id, name: "Product Designer", level: "L4" } }),
    prisma.jobTitle.create({ data: { companyId: company.id, name: "Talent Partner", level: "L3" } })
  ]);
  const passwordHash = await bcrypt.hash("Welcome123!", 12);
  const adminUser = await prisma.user.create({
    data: { email: "admin@nutrivae.com", passwordHash, role: Role.ADMIN }
  });
  await prisma.companyMembership.create({
    data: { userId: adminUser.id, companyId: company.id, systemRole: Role.ADMIN, roleId: adminRole.id }
  });
  const admin = await prisma.employee.create({
    data: {
      companyId: company.id,
      employeeNumber: "NV-1001",
      firstName: "Amara",
      lastName: "Okafor",
      workEmail: adminUser.email,
      startDate: new Date("2021-03-15"),
      status: EmployeeStatus.ACTIVE,
      userId: adminUser.id,
      departmentId: people.id,
      jobTitleId: director.id
    }
  });
  const names = [
    ["Maya", "Chen", "maya@nutrivae.com", product.id, designer.id],
    ["Leo", "Martins", "leo@nutrivae.com", product.id, engineer.id],
    ["Sofia", "Rivera", "sofia@nutrivae.com", growth.id, recruiter.id],
    ["Noah", "Williams", "noah@nutrivae.com", product.id, engineer.id],
    ["Ava", "Patel", "ava@nutrivae.com", people.id, recruiter.id]
  ] as const;
  const employees = [];
  for (let i = 0; i < names.length; i++) {
    const [firstName, lastName, workEmail, departmentId, jobTitleId] = names[i]!;
    const user = await prisma.user.create({
      data: { email: workEmail, passwordHash, role: i === 0 ? Role.MANAGER : Role.EMPLOYEE }
    });
    await prisma.companyMembership.create({
      data: {
        userId: user.id,
        companyId: company.id,
        systemRole: i === 0 ? Role.MANAGER : Role.EMPLOYEE,
        roleId: i === 0 ? managerRole.id : employeeRole.id
      }
    });
    employees.push(
      await prisma.employee.create({
        data: {
          companyId: company.id,
          employeeNumber: `NV-${1002 + i}`,
          firstName,
          lastName,
          workEmail,
          startDate: new Date(2022 + (i % 3), i, 10),
          status: i === 4 ? EmployeeStatus.PROBATION : EmployeeStatus.ACTIVE,
          userId: user.id,
          departmentId,
          jobTitleId,
          managerId: admin.id
        }
      })
    );
  }
  const [annual, sick, wellness] = await Promise.all([
    prisma.leaveType.create({
      data: { companyId: company.id, name: "Annual leave", color: "#30776b", defaultAllowance: 20 }
    }),
    prisma.leaveType.create({
      data: { companyId: company.id, name: "Sick leave", color: "#e26d5a", defaultAllowance: 10 }
    }),
    prisma.leaveType.create({
      data: { companyId: company.id, name: "Wellness day", color: "#8b72be", defaultAllowance: 4 }
    })
  ]);
  for (const employee of [admin, ...employees]) {
    for (const type of [annual, sick, wellness]) {
      await prisma.leaveBalance.create({
        data: { employeeId: employee.id, leaveTypeId: type.id, year: 2026, allowance: type.defaultAllowance }
      });
    }
  }
  await prisma.leaveRequest.createMany({
    data: [
      {
        employeeId: employees[0]!.id,
        leaveTypeId: annual.id,
        startDate: new Date("2026-06-24"),
        endDate: new Date("2026-06-26"),
        days: 3,
        reason: "Family trip",
        status: LeaveStatus.PENDING,
        approverId: admin.id
      },
      {
        employeeId: employees[2]!.id,
        leaveTypeId: sick.id,
        startDate: new Date("2026-06-16"),
        endDate: new Date("2026-06-16"),
        days: 1,
        reason: "Medical appointment",
        status: LeaveStatus.APPROVED,
        approverId: admin.id,
        decidedAt: new Date()
      }
    ]
  });
  await prisma.goal.createMany({
    data: [
      {
        title: "Launch onboarding 2.0",
        employeeId: admin.id,
        progress: 72,
        status: GoalStatus.ACTIVE,
        dueDate: new Date("2026-07-31")
      },
      {
        title: "Improve activation rate",
        employeeId: employees[0]!.id,
        progress: 48,
        status: GoalStatus.AT_RISK,
        dueDate: new Date("2026-07-15")
      },
      {
        title: "Reduce time-to-hire",
        employeeId: employees[2]!.id,
        progress: 84,
        status: GoalStatus.ACTIVE,
        dueDate: new Date("2026-06-30")
      }
    ]
  });
  const job = await prisma.jobOpening.create({
    data: {
      companyId: company.id,
      title: "Staff Product Engineer",
      location: "Remote · US",
      employmentType: "Full-time",
      status: JobStatus.OPEN,
      departmentId: product.id
    }
  });
  await prisma.candidate.createMany({
    data: [
      {
        firstName: "Jamie",
        lastName: "Brooks",
        email: "jamie@example.com",
        status: CandidateStatus.INTERVIEW,
        currentStage: "Technical interview",
        source: "Referral",
        jobOpeningId: job.id
      },
      {
        firstName: "Rina",
        lastName: "Kapoor",
        email: "rina@example.com",
        status: CandidateStatus.SCREENING,
        currentStage: "Hiring manager screen",
        source: "LinkedIn",
        jobOpeningId: job.id
      },
      {
        firstName: "Eli",
        lastName: "Stone",
        email: "eli@example.com",
        status: CandidateStatus.OFFER,
        currentStage: "Offer",
        source: "Careers page",
        jobOpeningId: job.id
      }
    ]
  });
  await prisma.holiday.createMany({
    data: [
      {
        companyId: company.id,
        name: "Independence Day",
        date: new Date("2026-07-04"),
        location: "United States"
      },
      { companyId: company.id, name: "Labor Day", date: new Date("2026-09-07"), location: "United States" }
    ]
  });
  await prisma.payout.createMany({
    data: [
      {
        companyId: company.id,
        employeeId: employees[0]!.id,
        amount: 7800,
        currency: "USD",
        type: "SALARY",
        status: "PAID",
        scheduledFor: new Date("2026-06-30"),
        paidAt: new Date("2026-06-30"),
        reference: "PAY-2026-061"
      },
      {
        companyId: company.id,
        employeeId: employees[2]!.id,
        amount: 1200,
        currency: "USD",
        type: "BONUS",
        status: "PROCESSING",
        scheduledFor: new Date("2026-07-05"),
        reference: "BONUS-Q2"
      }
    ]
  });
  const project = await prisma.project.create({
    data: {
      companyId: company.id,
      name: "Employee Experience 2.0",
      code: "EX-20",
      clientName: "Internal",
      description: "Modernize onboarding, self-service, and people operations.",
      status: "ACTIVE"
    }
  });
  await prisma.projectAssignment.createMany({
    data: [
      { projectId: project.id, employeeId: admin.id, role: "Sponsor", allocation: 20 },
      { projectId: project.id, employeeId: employees[0]!.id, role: "Product lead", allocation: 60 },
      { projectId: project.id, employeeId: employees[1]!.id, role: "Engineer", allocation: 80 }
    ]
  });
  console.log("Seeded Nutrivae HRMS. Login: admin@nutrivae.com / Welcome123!");
}

main().finally(() => prisma.$disconnect());
