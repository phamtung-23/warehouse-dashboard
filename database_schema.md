# Dashboard Schema Design

## Overview
This document outlines the database schema design for a warehouse management dashboard using Next.js, focusing on user management, role-based permissions, and store assignments, with audit fields `created_at`, `updated_at`, and `deleted_at` added to all tables.

## Tables

### `stores`
- `id` (SERIAL PRIMARY KEY): Unique identifier for each store.
- `name` (VARCHAR(255) NOT NULL UNIQUE): Store name, e.g., 'Canon'.
- `address` (TEXT): Store address (optional).
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Creation timestamp.
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Last update timestamp.
- `deleted_at` (TIMESTAMP): Soft delete timestamp (NULL if not deleted).

### `permissions`
- `id` (SERIAL PRIMARY KEY): Unique identifier for each permission.
- `name` (VARCHAR(255) NOT NULL UNIQUE): Permission name, e.g., 'ban_hang_pos', 'hang_hoa'.
- `description` (TEXT): Description of the permission.
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Creation timestamp.
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Last update timestamp.
- `deleted_at` (TIMESTAMP): Soft delete timestamp (NULL if not deleted).

**Sample Permissions:**
- `tong_quan`: Truy cập tổng quan dashboard
- `don_hang`: Quản lý đơn hàng
- `hang_hoa`: Quản lý hàng hóa
- ... (others as per sidebar and functionality table)

### `roles`
- `id` (SERIAL PRIMARY KEY): Unique identifier for each role.
- `name` (VARCHAR(255) NOT NULL UNIQUE): Role name, e.g., 'chu_cua_hang', 'quan_ly'.
- `description` (TEXT): Role description.
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Creation timestamp.
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Last update timestamp.
- `deleted_at` (TIMESTAMP): Soft delete timestamp (NULL if not deleted).

**Sample Roles:**
- `chu_cua_hang`: Chủ cửa hàng - Quyền cao nhất
- `quan_ly`: Quản lý - Quyền quản trị chính
- `nhan_vien_ban_hang`: Nhân viên bán hàng
- `quan_ly_kho`: Quản lý kho
- `nhan_vien_thu_ngan`: Nhân viên thu ngân

### `role_permissions`
- `role_id` (INTEGER REFERENCES roles(id) ON DELETE CASCADE): Foreign key to roles.
- `permission_id` (INTEGER REFERENCES permissions(id) ON DELETE CASCADE): Foreign key to permissions.
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Creation timestamp.
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Last update timestamp.
- `deleted_at` (TIMESTAMP): Soft delete timestamp (NULL if not deleted).
- PRIMARY KEY (role_id, permission_id): Composite key.

### `users`
- `id` (SERIAL PRIMARY KEY): Unique identifier for each user.
- `name` (VARCHAR(255) NOT NULL): Full name of the employee.
- `code` (VARCHAR(50) NOT NULL UNIQUE): Employee code, e.g., '.canon135369'.
- `password_hash` (VARCHAR(255) NOT NULL): Hashed password.
- `store_id` (INTEGER REFERENCES stores(id) ON DELETE SET NULL): Store assignment.
- `language` (language_enum DEFAULT 'tieng_viet'): Language preference.
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Creation timestamp.
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Last update timestamp.
- `deleted_at` (TIMESTAMP): Soft delete timestamp (NULL if not deleted).

### `user_roles`
- `user_id` (INTEGER REFERENCES users(id) ON DELETE CASCADE): Foreign key to users.
- `role_id` (INTEGER REFERENCES roles(id) ON DELETE CASCADE): Foreign key to roles.
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Creation timestamp.
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Last update timestamp.
- `deleted_at` (TIMESTAMP): Soft delete timestamp (NULL if not deleted).
- PRIMARY KEY (user_id, role_id): Composite key.

## Indexes
- `idx_users_code` ON `users(code)`: For fast lookup by employee code.
- `idx_user_roles_user_id` ON `user_roles(user_id)`: For efficient role assignment queries.

## Notes
- Use Prisma or raw SQL in Next.js for querying.
- Permissions are assigned to roles based on the "Chức năng cho nhóm người dùng" table.
- Users can have multiple roles via the `user_roles` junction table.
- Schema supports role-based access control (RBAC) for the dashboard.
- `deleted_at` enables soft deletion; query active records with `WHERE deleted_at IS NULL`.