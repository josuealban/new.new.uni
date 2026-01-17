import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateEnrollmentDto {
    @IsInt()
    @IsNotEmpty()
    studentId: number;

    @IsInt()
    @IsNotEmpty()
    subjectId: number;

    @IsInt()
    @IsNotEmpty()
    academicPeriodId: number;
}
