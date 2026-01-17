import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateTeacherSubjectDto {
    @IsInt()
    @IsNotEmpty()
    teacherId: number;

    @IsInt()
    @IsNotEmpty()
    subjectId: number;
}
