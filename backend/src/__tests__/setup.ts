/// <reference types="vitest" />
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  if (process.env.NODE_ENV !== "test") {
    console.warn("Tests should run with NODE_ENV=test");
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
