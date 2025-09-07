import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userPermissions = this.extractPermissionsFromUser(user);

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private extractPermissionsFromUser(user: any): string[] {
    const permissions: string[] = [];

    if (user.userRoles && Array.isArray(user.userRoles)) {
      for (const userRole of user.userRoles) {
        if (userRole.role && userRole.role.rolePermissions) {
          for (const rolePermission of userRole.role.rolePermissions) {
            if (rolePermission.permission) {
              permissions.push(rolePermission.permission.name);
            }
          }
        }
      }
    }

    return [...new Set(permissions)]; // Remove duplicates
  }
}
