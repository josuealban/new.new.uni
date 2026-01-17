import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';


import { CreateTeacherSubjectDto } from './dto/create-teacher-subject.dto';
import { UpdateTeacherSubjectDto } from './dto/update-teacher-subject.dto';

@Injectable()
export class TeacherSubjectService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createTeacherSubjectDto: CreateTeacherSubjectDto) {
        const { teacherId, subjectId } = createTeacherSubjectDto;

        // 1. Verify teacher exists
        await this.dataService.teacher.findUniqueOrThrow({ where: { id: teacherId } }).catch(() => {
            throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
        });

        // 2. Verify subject exists
        await this.dataService.subject.findUniqueOrThrow({ where: { id: subjectId } }).catch(() => {
            throw new NotFoundException(`Subject with ID ${subjectId} not found`);
        });

        // 3. Verify no duplicate assignment
        const existing = await this.dataService.teacherSubject.findUnique({
            where: {
                teacherId_subjectId: {
                    teacherId,
                    subjectId,
                },
            },
        });
        if (existing) throw new ConflictException(`Teacher is already assigned to this subject`);

        return this.dataService.teacherSubject.create({
            data: createTeacherSubjectDto,
        });
    }

    async findAll() {
        return this.dataService.teacherSubject.findMany({
            include: {
                teacher: true,
                subject: true,
            },
        });
    }

    async findOne(id: number) {
        const assignment = await this.dataService.teacherSubject.findUnique({
            where: { id },
            include: {
                teacher: true,
                subject: true,
            },
        });

        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${id} not found`);
        }

        return assignment;
    }

    async update(id: number, updateTeacherSubjectDto: UpdateTeacherSubjectDto) {
        await this.findOne(id);
        return this.dataService.teacherSubject.update({
            where: { id },
            data: updateTeacherSubjectDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.teacherSubject.delete({
            where: { id },
        });
    }
}
