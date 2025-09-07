import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create stores
  const store = await prisma.store.upsert({
    where: { name: 'Canon Store' },
    update: {},
    create: {
      name: 'Canon Store',
      address: '123 Main Street, City',
    },
  });

  console.log('Created store:', store);

  // Create permissions
  const permissions = [
    { name: 'tong_quan', description: 'Truy cập tổng quan dashboard' },
    { name: 'don_hang', description: 'Quản lý đơn hàng' },
    { name: 'hang_hoa', description: 'Quản lý hàng hóa' },
    { name: 'ban_hang_pos', description: 'Bán hàng POS' },
    { name: 'kho_hang', description: 'Quản lý kho' },
    { name: 'khach_hang', description: 'Quản lý khách hàng' },
    { name: 'nha_cung_cap', description: 'Quản lý nhà cung cấp' },
    { name: 'thu_chi', description: 'Quản lý thu chi' },
    { name: 'bao_cao', description: 'Xem báo cáo' },
    { name: 'cai_dat', description: 'Cài đặt hệ thống' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log('Created permissions');

  // Create roles
  const roles = [
    { name: 'chu_cua_hang', description: 'Chủ cửa hàng - Quyền cao nhất' },
    { name: 'quan_ly', description: 'Quản lý - Quyền quản trị chính' },
    { name: 'nhan_vien_ban_hang', description: 'Nhân viên bán hàng' },
    { name: 'quan_ly_kho', description: 'Quản lý kho' },
    { name: 'nhan_vien_thu_ngan', description: 'Nhân viên thu ngân' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('Created roles');

  // Assign permissions to roles
  const rolePermissions = [
    // Chủ cửa hàng - All permissions
    { roleName: 'chu_cua_hang', permissions: permissions.map(p => p.name) },
    // Quản lý - Most permissions except some admin settings
    { 
      roleName: 'quan_ly', 
      permissions: ['tong_quan', 'don_hang', 'hang_hoa', 'ban_hang_pos', 'kho_hang', 'khach_hang', 'nha_cung_cap', 'thu_chi', 'bao_cao'] 
    },
    // Nhân viên bán hàng
    { 
      roleName: 'nhan_vien_ban_hang', 
      permissions: ['tong_quan', 'don_hang', 'ban_hang_pos', 'khach_hang'] 
    },
    // Quản lý kho
    { 
      roleName: 'quan_ly_kho', 
      permissions: ['tong_quan', 'hang_hoa', 'kho_hang', 'nha_cung_cap', 'bao_cao'] 
    },
    // Nhân viên thu ngân
    { 
      roleName: 'nhan_vien_thu_ngan', 
      permissions: ['tong_quan', 'ban_hang_pos', 'thu_chi'] 
    },
  ];

  for (const rp of rolePermissions) {
    const role = await prisma.role.findUnique({ where: { name: rp.roleName } });
    if (role) {
      for (const permissionName of rp.permissions) {
        const permission = await prisma.permission.findUnique({ where: { name: permissionName } });
        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
  }

  console.log('Assigned permissions to roles');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      name: 'Administrator',
      code: 'admin',
      passwordHash: adminPassword,
      storeId: store.id,
      language: 'tieng_viet',
    },
  });

  // Assign admin role to admin user
  const adminRole = await prisma.role.findUnique({ where: { name: 'chu_cua_hang' } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }

  console.log('Created admin user:', adminUser);
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
