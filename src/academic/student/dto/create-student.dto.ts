import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateStudentDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsInt()
    @IsNotEmpty()
    careerId: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
