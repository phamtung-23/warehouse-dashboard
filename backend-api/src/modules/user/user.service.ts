import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user with same code already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        code: createUserDto.code,
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this code already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        code: createUserDto.code,
        passwordHash: hashedPassword,
        storeId: createUserDto.storeId,
        language: createUserDto.language || 'tieng_viet',
      },
      include: {
        store: true,
        userRoles: {
          where: { deletedAt: null },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Assign roles if provided
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      await this.assignRoles(user.id, createUserDto.roleIds);
    }

    return this.formatUserResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        store: true,
        userRoles: {
          where: { deletedAt: null },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.formatUserResponse(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        store: true,
        userRoles: {
          where: { deletedAt: null },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUserResponse(user);
  }

  async findByCode(code: string): Promise<any> {
    return this.prisma.user.findFirst({
      where: {
        code,
        deletedAt: null,
      },
      include: {
        store: true,
        userRoles: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                rolePermissions: {
                  where: { deletedAt: null },
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if code is being changed and if it conflicts with existing user
    if (updateUserDto.code && updateUserDto.code !== existingUser.code) {
      const codeExists = await this.prisma.user.findFirst({
        where: {
          code: updateUserDto.code,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (codeExists) {
        throw new ConflictException('User with this code already exists');
      }
    }

    // Prepare update data
    const updateData: any = {
      name: updateUserDto.name,
      code: updateUserDto.code,
      storeId: updateUserDto.storeId,
      language: updateUserDto.language,
    };

    // Hash password if provided
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        store: true,
        userRoles: {
          where: { deletedAt: null },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Update roles if provided
    if (updateUserDto.roleIds !== undefined) {
      await this.updateUserRoles(id, updateUserDto.roleIds);
    }

    return this.formatUserResponse(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete user
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Soft delete user roles
    await this.prisma.userRole.updateMany({
      where: {
        userId: id,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  }

  private async assignRoles(userId: number, roleIds: number[]): Promise<void> {
    const roleAssignments = roleIds.map((roleId) => ({
      userId,
      roleId,
    }));

    await this.prisma.userRole.createMany({
      data: roleAssignments,
    });
  }

  private async updateUserRoles(
    userId: number,
    roleIds: number[],
  ): Promise<void> {
    // Soft delete existing roles
    await this.prisma.userRole.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    // Assign new roles
    if (roleIds.length > 0) {
      await this.assignRoles(userId, roleIds);
    }
  }

  private formatUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      code: user.code,
      storeId: user.storeId,
      language: user.language,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      store: user.store
        ? {
            id: user.store.id,
            name: user.store.name,
            address: user.store.address,
          }
        : undefined,
      userRoles: user.userRoles?.map((userRole: any) => ({
        role: {
          id: userRole.role.id,
          name: userRole.role.name,
          description: userRole.role.description,
        },
      })),
    };
  }

  async validateUser(code: string, password: string): Promise<any> {
    const user = await this.findByCode(code);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }
}
