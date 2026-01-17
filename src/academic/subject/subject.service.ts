import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createSubjectDto: CreateSubjectDto) {
        const existing = await this.dataService.subject.findUnique({
            where: {
                careerId_cycleId_name: {
                    careerId: createSubjectDto.careerId,
                    cycleId: createSubjectDto.cycleId,
                    name: createSubjectDto.name,
                },
            },
        });

        if (existing) {
            throw new ConflictException(`Subject ${createSubjectDto.name} already exists for this career and cycle`);
        }

        // Verify career and cycle exist
        await this.dataService.career.findUniqueOrThrow({ where: { id: createSubjectDto.careerId } }).catch(() => {
            throw new NotFoundException(`Career with ID ${createSubjectDto.careerId} not found`);
        });

        await this.dataService.cycle.findUniqueOrThrow({ where: { id: createSubjectDto.cycleId } }).catch(() => {
            throw new NotFoundException(`Cycle with ID ${createSubjectDto.cycleId} not found`);
        });

        return this.dataService.subject.create({
            data: {
                ...createSubjectDto,
                availableQuota: createSubjectDto.maxQuota,
            },
        });
    }

    async findAll() {
        return this.dataService.subject.findMany({
            include: { career: true, cycle: true },
        });
    }

    async findOne(id: number) {
        const subject = await this.dataService.subject.findUnique({
            where: { id },
            include: { career: true, cycle: true, teachers: { include: { teacher: true } } },
        });

        if (!subject) {
            throw new NotFoundException(`Subject with ID ${id} not found`);
        }

        return subject;
    }

    async update(id: number, updateSubjectDto: UpdateSubjectDto) {
        const current = await this.findOne(id);

        if (updateSubjectDto.name || updateSubjectDto.careerId || updateSubjectDto.cycleId) {
            const name = updateSubjectDto.name ?? current.name;
            const careerId = updateSubjectDto.careerId ?? current.careerId;
            const cycleId = updateSubjectDto.cycleId ?? current.cycleId;

            const existing = await this.dataService.subject.findFirst({
                where: {
                    name,
                    careerId,
                    cycleId,
                    id: { not: id },
                },
            });

            if (existing) {
                throw new ConflictException(`Subject ${name} already exists for this career and cycle`);
            }
        }

        // Handle availableQuota update if maxQuota changes
        let availableQuota = undefined;
        if (updateSubjectDto.maxQuota !== undefined) {
            const quotaDifference = updateSubjectDto.maxQuota - current.maxQuota;
            availableQuota = current.availableQuota + quotaDifference;
            if (availableQuota < 0) availableQuota = 0;
        }

        return this.dataService.subject.update({
            where: { id },
            data: {
                ...updateSubjectDto,
                ...(availableQuota !== undefined ? { availableQuota } : {}),
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.subject.delete({
            where: { id },
        });
    }
}
