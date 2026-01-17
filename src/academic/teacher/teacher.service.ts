import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createTeacherDto: CreateTeacherDto) {
        const existingEmail = await this.dataService.teacher.findUnique({
            where: { email: createTeacherDto.email },
        });

        if (existingEmail) {
            throw new ConflictException(`Teacher with email ${createTeacherDto.email} already exists`);
        }

        const existingUser = await this.dataService.teacher.findUnique({
            where: { userId: createTeacherDto.userId },
        });

        if (existingUser) {
            throw new ConflictException(`Teacher with userId ${createTeacherDto.userId} already exists`);
        }

        return this.dataService.teacher.create({
            data: createTeacherDto,
        });
    }

    async findAll() {
        return this.dataService.teacher.findMany({
            include: { subjects: { include: { subject: true } } },
        });
    }

    async findOne(id: number) {
        const teacher = await this.dataService.teacher.findUnique({
            where: { id },
            include: { subjects: { include: { subject: true } } },
        });

        if (!teacher) {
            throw new NotFoundException(`Teacher with ID ${id} not found`);
        }

        return teacher;
    }

    async update(id: number, updateTeacherDto: UpdateTeacherDto) {
        await this.findOne(id);

        if (updateTeacherDto.email) {
            const existing = await this.dataService.teacher.findFirst({
                where: {
                    email: updateTeacherDto.email,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Teacher with email ${updateTeacherDto.email} already exists`);
            }
        }

        if (updateTeacherDto.userId) {
            const existing = await this.dataService.teacher.findFirst({
                where: {
                    userId: updateTeacherDto.userId,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Teacher with userId ${updateTeacherDto.userId} already exists`);
            }
        }

        return this.dataService.teacher.update({
            where: { id },
            data: updateTeacherDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.teacher.delete({
            where: { id },
        });
    }
}
