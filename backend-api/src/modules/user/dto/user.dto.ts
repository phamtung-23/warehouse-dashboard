import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Language } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  password: string;

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

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

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
