import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';

@Injectable()
export class AcademicPeriodService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createAcademicPeriodDto: CreateAcademicPeriodDto) {
        const existing = await this.dataService.academicPeriod.findUnique({
            where: { name: createAcademicPeriodDto.name },
        });

        if (existing) {
            throw new ConflictException(`Academic period with name ${createAcademicPeriodDto.name} already exists`);
        }

        // If making this one active, deactivate others (optional business logic)
        if (createAcademicPeriodDto.isActive) {
            await this.dataService.academicPeriod.updateMany({
                where: { isActive: true },
                data: { isActive: false },
            });
        }

        return this.dataService.academicPeriod.create({
            data: {
                ...createAcademicPeriodDto,
                startDate: new Date(createAcademicPeriodDto.startDate),
                endDate: new Date(createAcademicPeriodDto.endDate),
            },
        });
    }

    async findAll() {
        return this.dataService.academicPeriod.findMany({
            include: { enrollments: true },
        });
    }

    async findOne(id: number) {
        const period = await this.dataService.academicPeriod.findUnique({
            where: { id },
            include: { enrollments: true },
        });

        if (!period) {
            throw new NotFoundException(`Academic period with ID ${id} not found`);
        }

        return period;
    }

    async update(id: number, updateAcademicPeriodDto: UpdateAcademicPeriodDto) {
        await this.findOne(id);

        if (updateAcademicPeriodDto.name) {
            const existing = await this.dataService.academicPeriod.findFirst({
                where: {
                    name: updateAcademicPeriodDto.name,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Academic period with name ${updateAcademicPeriodDto.name} already exists`);
            }
        }

        if (updateAcademicPeriodDto.isActive) {
            await this.dataService.academicPeriod.updateMany({
                where: { isActive: true, id: { not: id } },
                data: { isActive: false },
            });
        }

        return this.dataService.academicPeriod.update({
            where: { id },
            data: {
                ...updateAcademicPeriodDto,
                ...(updateAcademicPeriodDto.startDate ? { startDate: new Date(updateAcademicPeriodDto.startDate) } : {}),
                ...(updateAcademicPeriodDto.endDate ? { endDate: new Date(updateAcademicPeriodDto.endDate) } : {}),
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.academicPeriod.delete({
            where: { id },
        });
    }
}
