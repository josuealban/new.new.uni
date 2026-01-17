import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

@Injectable()
export class CycleService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createCycleDto: CreateCycleDto) {
        const existingName = await this.dataService.cycle.findUnique({
            where: { name: createCycleDto.name },
        });

        if (existingName) {
            throw new ConflictException(`Cycle with name ${createCycleDto.name} already exists`);
        }

        const existingNumber = await this.dataService.cycle.findUnique({
            where: { number: createCycleDto.number },
        });

        if (existingNumber) {
            throw new ConflictException(`Cycle with number ${createCycleDto.number} already exists`);
        }

        return this.dataService.cycle.create({
            data: createCycleDto,
        });
    }

    async findAll() {
        return this.dataService.cycle.findMany({
            include: { subjects: true },
        });
    }

    async findOne(id: number) {
        const cycle = await this.dataService.cycle.findUnique({
            where: { id },
            include: { subjects: true },
        });

        if (!cycle) {
            throw new NotFoundException(`Cycle with ID ${id} not found`);
        }

        return cycle;
    }

    async update(id: number, updateCycleDto: UpdateCycleDto) {
        await this.findOne(id);

        if (updateCycleDto.name) {
            const existing = await this.dataService.cycle.findFirst({
                where: {
                    name: updateCycleDto.name,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Cycle with name ${updateCycleDto.name} already exists`);
            }
        }

        if (updateCycleDto.number) {
            const existing = await this.dataService.cycle.findFirst({
                where: {
                    number: updateCycleDto.number,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Cycle with number ${updateCycleDto.number} already exists`);
            }
        }

        return this.dataService.cycle.update({
            where: { id },
            data: updateCycleDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.cycle.delete({
            where: { id },
        });
    }
}
