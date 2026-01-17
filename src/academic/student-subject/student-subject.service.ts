import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateStudentSubjectDto } from './dto/create-student-subject.dto';
import { UpdateStudentSubjectDto } from './dto/update-student-subject.dto';

@Injectable()
export class StudentSubjectService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createStudentSubjectDto: CreateStudentSubjectDto) {
        const { studentId, subjectId } = createStudentSubjectDto;

        // 1. Verify student exists
        await this.dataService.student.findUniqueOrThrow({ where: { id: studentId } }).catch(() => {
            throw new NotFoundException(`Student with ID ${studentId} not found`);
        });

        // 2. Verify subject exists
        await this.dataService.subject.findUniqueOrThrow({ where: { id: subjectId } }).catch(() => {
            throw new NotFoundException(`Subject with ID ${subjectId} not found`);
        });

        // 3. Verify no duplicate linkage
        const existing = await this.dataService.studentSubject.findUnique({
            where: {
                studentId_subjectId: {
                    studentId,
                    subjectId,
                },
            },
        });
        if (existing) throw new ConflictException(`Student is already linked to this subject`);

        return this.dataService.studentSubject.create({
            data: createStudentSubjectDto,
        });
    }

    async findAll() {
        return this.dataService.studentSubject.findMany({
            include: {
                student: true,
                subject: true,
            },
        });
    }

    async findOne(id: number) {
        const linkage = await this.dataService.studentSubject.findUnique({
            where: { id },
            include: {
                student: true,
                subject: true,
            },
        });

        if (!linkage) {
            throw new NotFoundException(`Linkage with ID ${id} not found`);
        }

        return linkage;
    }

    async update(id: number, updateStudentSubjectDto: UpdateStudentSubjectDto) {
        await this.findOne(id);
        return this.dataService.studentSubject.update({
            where: { id },
            data: updateStudentSubjectDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.studentSubject.delete({
            where: { id },
        });
    }
}
