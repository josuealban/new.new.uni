import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@Injectable()
export class CareerService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createCareerDto: CreateCareerDto) {
        const existing = await this.dataService.career.findUnique({
            where: { name: createCareerDto.name },
        });

        if (existing) {
            throw new ConflictException(`Career with name ${createCareerDto.name} already exists`);
        }

        // Verify speciality exists
        await this.dataService.specialty.findUniqueOrThrow({
            where: { id: createCareerDto.specialtyId },
        }).catch(() => {
            throw new NotFoundException(`Speciality with ID ${createCareerDto.specialtyId} not found`);
        });

        return this.dataService.career.create({
            data: createCareerDto,
        });
    }

    async findAll() {
        return this.dataService.career.findMany({
            include: { specialty: true, subjects: true },
        });
    }

    async findOne(id: number) {
        const career = await this.dataService.career.findUnique({
            where: { id },
            include: { specialty: true, subjects: true },
        });

        if (!career) {
            throw new NotFoundException(`Career with ID ${id} not found`);
        }

        return career;
    }

    async update(id: number, updateCareerDto: UpdateCareerDto) {
        await this.findOne(id);

        if (updateCareerDto.name) {
            const existing = await this.dataService.career.findFirst({
                where: {
                    name: updateCareerDto.name,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Career with name ${updateCareerDto.name} already exists`);
            }
        }

        if (updateCareerDto.specialtyId) {
            await this.dataService.specialty.findUniqueOrThrow({
                where: { id: updateCareerDto.specialtyId },
            }).catch(() => {
                throw new NotFoundException(`Speciality with ID ${updateCareerDto.specialtyId} not found`);
            });
        }

        return this.dataService.career.update({
            where: { id },
            data: updateCareerDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.career.delete({
            where: { id },
        });
    }
}
