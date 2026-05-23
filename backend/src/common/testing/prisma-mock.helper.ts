/**
 * Factory function tạo mock PrismaService hoàn chỉnh cho unit tests.
 * Sử dụng: `const prismaMock = createPrismaMock();`
 */
export function createPrismaMock() {
  const modelMethods = () => ({
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  });

  const mock = {
    admin: modelMethods(),
    teacher: modelMethods(),
    parent: modelMethods(),
    student: modelMethods(),
    studentParent: modelMethods(),
    otp: modelMethods(),
    subject: modelMethods(),
    academicYear: modelMethods(),
    academicTerm: modelMethods(),
    score: modelMethods(),
    scoreLog: modelMethods(),
    attendance: modelMethods(),
    notification: modelMethods(),
    feedback: modelMethods(),
    feedbackMessage: modelMethods(),
    major: modelMethods(),
    classSection: modelMethods(),
    classEnrollment: modelMethods(),
    attendanceSession: modelMethods(),
    attendanceRecord: modelMethods(),
    $transaction: jest.fn((args) => {
      if (Array.isArray(args)) {
        return Promise.all(args);
      }
      return Promise.resolve(args(mock));
    }),
  };

  return mock;
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;
