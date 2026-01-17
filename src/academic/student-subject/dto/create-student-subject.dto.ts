import { IsNotEmpty, IsInt, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateStudentSubjectDto {
    @IsInt()
    @IsNotEmpty()
    studentId: number;

    @IsInt()
    @IsNotEmpty()
    subjectId: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    grade?: number;

    @IsBoolean()
    @IsOptional()
    passed?: boolean;
}
