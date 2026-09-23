import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';
import { User, UserResponse, UpdateUserDTO, AdvisorOption, UserType } from '../types/user.types';

function isRecordNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

/** Prisma's generated user_type_enum has the same string values as UserType, but is a distinct nominal type. */
function asUser<T>(row: T): T & { user_type: UserType } {
  return row as T & { user_type: UserType };
}

const userResponseSelect = {
  id: true,
  name: true,
  email: true,
  user_type: true,
  is_active: true,
  created_at: true,
  updated_at: true
} as const;

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.users.findUnique({ where: { email } });
    return user && asUser(user);
  },

  async findById(id: number): Promise<User | null> {
    const user = await prisma.users.findUnique({ where: { id } });
    return user && asUser(user);
  },

  async create(name: string, email: string, passwordHash: string, userType: string): Promise<UserResponse> {
    const user = await prisma.users.create({
      data: { name, email, password_hash: passwordHash, user_type: userType as UserType },
      select: userResponseSelect
    });
    return asUser(user);
  },

  async findAll(): Promise<UserResponse[]> {
    const users = await prisma.users.findMany({
      select: userResponseSelect,
      orderBy: { created_at: 'desc' }
    });
    return users.map(asUser);
  },

  async findAdvisors(): Promise<AdvisorOption[]> {
    return prisma.users.findMany({
      where: { user_type: UserType.ADVISOR, is_active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
  },

  async findAdmins(): Promise<UserResponse[]> {
    const admins = await prisma.users.findMany({
      where: { user_type: UserType.ADMIN, is_active: true },
      select: userResponseSelect,
      orderBy: { name: 'asc' }
    });
    return admins.map(asUser);
  },

  async update(id: number, data: UpdateUserDTO): Promise<UserResponse | null> {
    const updateData: {
      name?: string;
      email?: string;
      password_hash?: string;
      user_type?: UserType;
      is_active?: boolean;
    } = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password_hash = data.password;
    if (data.user_type) updateData.user_type = data.user_type;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    if (Object.keys(updateData).length === 0) return null;

    const updated = await prisma.users.update({
      where: { id },
      data: updateData,
      select: userResponseSelect
    });
    return asUser(updated);
  },

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await prisma.users.update({
      where: { id },
      data: { password_hash: passwordHash }
    });
  },

  async deactivate(id: number): Promise<boolean> {
    try {
      await prisma.users.update({
        where: { id },
        data: { is_active: false }
      });
      return true;
    } catch (error) {
      if (isRecordNotFound(error)) return false;
      throw error;
    }
  }
};
