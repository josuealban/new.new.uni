import { IsNotEmpty, IsString, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class CreateAcademicPeriodDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
