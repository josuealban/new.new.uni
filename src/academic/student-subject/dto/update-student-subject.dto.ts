import { PartialType } from '@nestjs/swagger';
import { CreateStudentSubjectDto } from './create-student-subject.dto';

export class UpdateStudentSubjectDto extends PartialType(CreateStudentSubjectDto) { }
