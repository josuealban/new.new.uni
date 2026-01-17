import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateSubjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(1)
    credits: number;

    @IsInt()
    @Min(1)
    @Max(100)
    maxQuota: number;

    @IsInt()
    @IsNotEmpty()
    careerId: number;

    @IsInt()
    @IsNotEmpty()
    cycleId: number;
}
