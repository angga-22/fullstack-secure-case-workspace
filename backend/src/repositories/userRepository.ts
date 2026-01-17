// src/repositories/userRepository.ts
import { Prisma, User } from "@/generated/client/client";
import { prisma } from "@/config/db";

export const USER_FIELDS_SAFE = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: USER_FIELDS_SAFE,
  });
};

export const createUser = async (data: Prisma.UserCreateInput) => {
  return prisma.user.create({
    data,
    select: USER_FIELDS_SAFE,
  });
};
