import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, IsEnum, IsBoolean } from 'class-validator';

export enum EmploymentType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    HOURLY = 'HOURLY',
}

export class CreateTeacherDto {
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

    @IsEnum(EmploymentType)
    @IsOptional()
    employmentType?: EmploymentType;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
