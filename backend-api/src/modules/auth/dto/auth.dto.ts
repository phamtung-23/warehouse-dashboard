import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Employee code for login',
    example: 'admin',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Employee password',
    example: 'admin123',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  access_token: string;
  user: {
    id: number;
    name: string;
    code: string;
    store?: any;
    language: string;
    roles?: any[];
  };
}
