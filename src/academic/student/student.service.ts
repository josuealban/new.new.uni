import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createStudentDto: CreateStudentDto) {
        const existingEmail = await this.dataService.student.findUnique({
            where: { email: createStudentDto.email },
        });

        if (existingEmail) {
            throw new ConflictException(`Student with email ${createStudentDto.email} already exists`);
        }

        const existingUser = await this.dataService.student.findUnique({
            where: { userId: createStudentDto.userId },
        });

        if (existingUser) {
            throw new ConflictException(`Student with userId ${createStudentDto.userId} already exists`);
        }

        // Verify career exists
        await this.dataService.career.findUniqueOrThrow({
            where: { id: createStudentDto.careerId },
        }).catch(() => {
            throw new NotFoundException(`Career with ID ${createStudentDto.careerId} not found`);
        });

        return this.dataService.student.create({
            data: createStudentDto,
        });
    }

    async findAll() {
        return this.dataService.student.findMany({
            include: { career: true, enrollments: true },
        });
    }

    async findOne(id: number) {
        const student = await this.dataService.student.findUnique({
            where: { id },
            include: { career: true, enrollments: true, subjects: { include: { subject: true } } },
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }

        return student;
    }

    async update(id: number, updateStudentDto: UpdateStudentDto) {
        await this.findOne(id);

        if (updateStudentDto.email) {
            const existing = await this.dataService.student.findFirst({
                where: {
                    email: updateStudentDto.email,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Student with email ${updateStudentDto.email} already exists`);
            }
        }

        if (updateStudentDto.userId) {
            const existing = await this.dataService.student.findFirst({
                where: {
                    userId: updateStudentDto.userId,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Student with userId ${updateStudentDto.userId} already exists`);
            }
        }

        if (updateStudentDto.careerId) {
            await this.dataService.career.findUniqueOrThrow({
                where: { id: updateStudentDto.careerId },
            }).catch(() => {
                throw new NotFoundException(`Career with ID ${updateStudentDto.careerId} not found`);
            });
        }

        return this.dataService.student.update({
            where: { id },
            data: updateStudentDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.student.delete({
            where: { id },
        });
    }
}
