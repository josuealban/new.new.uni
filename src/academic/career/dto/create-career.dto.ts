import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateCareerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(1)
    totalCycles: number;

    @IsInt()
    @Min(1)
    durationYears: number;

    @IsInt()
    @IsNotEmpty()
    specialtyId: number;
}
