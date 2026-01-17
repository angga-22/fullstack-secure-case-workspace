import * as userRepo from "@/repositories/userRepository";
import { hashPassword, comparePassword } from "@/utils/password";
import { createSessionToken } from "@/utils/auth";

export const register = async (data: any) => {
  const existingUser = await userRepo.findUserByEmail(data.email);
  if (existingUser) throw new Error("Email already in use");

  const hashedPassword = await hashPassword(data.password);

  return userRepo.createUser({
    email: data.email,
    passwordHash: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role, // 'CLIENT' | 'LAWYER'
  });
};

export const login = async (email: string, password: string) => {
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  const token = await createSessionToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};
