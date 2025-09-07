import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Nguyễn Văn A',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique employee code',
    example: 'nva001',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'Store ID where user is assigned',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  storeId?: number;

  @ApiPropertyOptional({
    description: 'User language preference',
    enum: Language,
    example: 'tieng_viet',
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({
    description: 'Array of role IDs to assign to user',
    type: [Number],
    example: [1, 2],
  })
  @IsOptional()
  @IsInt({ each: true })
  roleIds?: number[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'Nguyễn Văn A Updated',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Unique employee code',
    example: 'nva001_updated',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsInt()
  storeId?: number;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsInt({ each: true })
  roleIds?: number[];
}

export class UserResponseDto {
  id: number;
  name: string;
  code: string;
  storeId: number | null;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
  store?: {
    id: number;
    name: string;
    address: string | null;
  };
  userRoles?: {
    role: {
      id: number;
      name: string;
      description: string | null;
    };
  }[];
}
