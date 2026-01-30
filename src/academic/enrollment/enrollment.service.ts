import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createEnrollmentDto: CreateEnrollmentDto) {
        const { studentId, subjectId, academicPeriodId } = createEnrollmentDto;

        return this.dataService.$transaction(async (tx) => {
            // 1. Verify student exists AND is active
            const student = await tx.student.findUnique({ where: { id: studentId } });
            if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);
            if (!student.isActive) throw new BadRequestException(`Student with ID ${studentId} is NOT active`);

            // 2. Verify academic period exists and is active
            const period = await tx.academicPeriod.findUnique({ where: { id: academicPeriodId } });
            if (!period) throw new NotFoundException(`Academic period with ID ${academicPeriodId} not found`);
            if (!period.isActive) throw new BadRequestException(`Academic period with ID ${academicPeriodId} is not active`);

            // 3. Verify subject exists and has quota
            const subject = await tx.subject.findUnique({ where: { id: subjectId } });
            if (!subject) throw new NotFoundException(`Subject with ID ${subjectId} not found`);
            if (subject.availableQuota <= 0) throw new BadRequestException(`No available quota for subject ${subject.name}`);

            // 4. Verify no duplicate enrollment
            const existing = await tx.enrollment.findUnique({
                where: {
                    studentId_subjectId_academicPeriodId: {
                        studentId,
                        subjectId,
                        academicPeriodId,
                    },
                },
            });
            if (existing) throw new ConflictException(`Student is already enrolled in this subject for this period`);

            // 5. Create enrollment and update quota
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
        return this.dataService.$transaction(async (tx) => {
            const current = await tx.enrollment.findUnique({
                where: { id },
                include: { subject: true }
            });

            if (!current) throw new NotFoundException(`Enrollment with ID ${id} not found`);

            // Verify no duplicate enrollment if subject changes
            if (updateEnrollmentDto.subjectId && updateEnrollmentDto.subjectId !== current.subjectId) {
                const duplicate = await tx.enrollment.findUnique({
                    where: {
                        studentId_subjectId_academicPeriodId: {
                            studentId: current.studentId,
                            subjectId: updateEnrollmentDto.subjectId,
                            academicPeriodId: current.academicPeriodId,
                        },
                    },
                });
                if (duplicate) {
                    throw new ConflictException(`Student is already enrolled in the new subject for this period`);
                }

                // Verify new subject has quota
                const newSubject = await tx.subject.findUnique({
                    where: { id: updateEnrollmentDto.subjectId }
                });
                if (!newSubject) throw new NotFoundException(`New subject with ID ${updateEnrollmentDto.subjectId} not found`);
                if (newSubject.availableQuota <= 0) throw new BadRequestException(`No available quota for new subject ${newSubject.name}`);

                // 1. Restore quota to old subject
                await tx.subject.update({
                    where: { id: current.subjectId },
                    data: { availableQuota: { increment: 1 } }
                });

                // 2. Deduct quota from new subject
                await tx.subject.update({
                    where: { id: updateEnrollmentDto.subjectId },
                    data: { availableQuota: { decrement: 1 } }
                });
            }

            try {
                return await tx.enrollment.update({
                    where: { id },
                    data: updateEnrollmentDto,
                });
            } catch (error) {
                if (error.code === 'P2002') {
                    throw new ConflictException(`Final update failed: Student already enrolled in this combination`);
                }
                throw error;
            }
        });
    }

    async remove(id: number) {
        return this.dataService.$transaction(async (tx) => {
            const enrollment = await tx.enrollment.findUnique({ where: { id } });
            if (!enrollment) throw new NotFoundException(`Enrollment with ID ${id} not found`);

            await tx.enrollment.delete({ where: { id } });

            await tx.subject.update({
                where: { id: enrollment.subjectId },
                data: { availableQuota: { increment: 1 } },
            });

            return { message: 'Enrollment deleted and quota restored' };
        });
    }

    async updateFull(id: number, createEnrollmentDto: CreateEnrollmentDto) {
        return this.update(id, createEnrollmentDto);
    }

    // --- ACTIVIDAD PRÁCTICA ---

    // Parte 1: Mostrar las matrículas de un estudiante en un período académico determinado
    async findByStudentAndPeriod(studentId: number, periodId: number) {
        return this.dataService.enrollment.findMany({
            where: {
                studentId,
                academicPeriodId: periodId
            },
            include: {
                student: true,
                subject: true,
                academicPeriod: true
            }
        });
    }

    // Parte 3: Consulta SQL Nativa (Reporte de materias por estudiante)
    async getNativeStudentReport() {
        try {
            return await this.dataService.$queryRaw`
                SELECT 
                    s.first_name || ' ' || s.last_name as "studentName",
                    c.name as "careerName",
                    COUNT(e.id)::int as "totalSubjects"
                FROM students s
                JOIN careers c ON s.career_id = c.id
                LEFT JOIN enrollments e ON s.id = e.student_id
                GROUP BY s.id, s.first_name, s.last_name, c.name
                ORDER BY "totalSubjects" DESC
            `;
        } catch (error) {
            console.error('Error in native report:', error);
            throw error;
        }
    }
}
