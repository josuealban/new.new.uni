import { PartialType } from '@nestjs/swagger';
import { CreateTeacherSubjectDto } from './create-teacher-subject.dto';

export class UpdateTeacherSubjectDto extends PartialType(CreateTeacherSubjectDto) { }
