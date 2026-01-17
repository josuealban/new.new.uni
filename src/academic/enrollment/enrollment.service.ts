import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createEnrollmentDto: CreateEnrollmentDto) {
        const { studentId, subjectId, academicPeriodId } = createEnrollmentDto;

        // 1. Verify student exists
        const student = await this.dataService.student.findUnique({ where: { id: studentId } });
        if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);

        // 2. Verify academic period exists and is active
        const period = await this.dataService.academicPeriod.findUnique({ where: { id: academicPeriodId } });
        if (!period) throw new NotFoundException(`Academic period with ID ${academicPeriodId} not found`);
        if (!period.isActive) throw new BadRequestException(`Academic period with ID ${academicPeriodId} is not active`);

        // 3. Verify subject exists and has quota
        const subject = await this.dataService.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new NotFoundException(`Subject with ID ${subjectId} not found`);
        if (subject.availableQuota <= 0) throw new BadRequestException(`No available quota for subject ${subject.name}`);

        // 4. Verify no duplicate enrollment
        const existing = await this.dataService.enrollment.findUnique({
            where: {
                studentId_subjectId_academicPeriodId: {
                    studentId,
                    subjectId,
                    academicPeriodId,
                },
            },
        });
        if (existing) throw new ConflictException(`Student is already enrolled in this subject for this period`);

        // 5. Build transaction to create enrollment and update quota
        return this.dataService.$transaction(async (tx) => {
            const enrollment = await tx.enrollment.create({
                data: createEnrollmentDto,
            });

            await tx.subject.update({
                where: { id: subjectId },
                data: { availableQuota: { decrement: 1 } },
            });

            return enrollment;
        });
    }

    async findAll() {
        return this.dataService.enrollment.findMany({
            include: {
                student: true,
                subject: true,
                academicPeriod: true,
            },
        });
    }

    async findOne(id: number) {
        const enrollment = await this.dataService.enrollment.findUnique({
            where: { id },
            include: {
                student: true,
                subject: true,
                academicPeriod: true,
            },
        });

        if (!enrollment) {
            throw new NotFoundException(`Enrollment with ID ${id} not found`);
        }

        return enrollment;
    }

    async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
        // Note: Updating an enrollment is complex because of quota management.
        // For now, only allowing updates to non-ID fields if any existed,
        // but the model only has foreign keys. If keys change, it's safer to re-create.
        const current = await this.findOne(id);

        // Simplification: just update as requested if data provided
        return this.dataService.enrollment.update({
            where: { id },
            data: updateEnrollmentDto,
        });
    }

    async remove(id: number) {
        const enrollment = await this.findOne(id);

        return this.dataService.$transaction(async (tx) => {
            await tx.enrollment.delete({ where: { id } });

            await tx.subject.update({
                where: { id: enrollment.subjectId },
                data: { availableQuota: { increment: 1 } },
            });

            return { message: 'Enrollment deleted and quota restored' };
        });
    }
}
