import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AcademicDataService } from '../academic-data.service';

import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';

@Injectable()
export class SpecialityService {
    constructor(private readonly dataService: AcademicDataService) { }

    async create(createSpecialityDto: CreateSpecialityDto) {
        const existing = await this.dataService.specialty.findUnique({
            where: { name: createSpecialityDto.name },
        });

        if (existing) {
            throw new ConflictException(`Speciality with name ${createSpecialityDto.name} already exists`);
        }

        return this.dataService.specialty.create({
            data: createSpecialityDto,
        });
    }

    async findAll() {
        return this.dataService.specialty.findMany({
            include: { careers: true },
        });
    }

    async findOne(id: number) {
        const speciality = await this.dataService.specialty.findUnique({
            where: { id },
            include: { careers: true },
        });

        if (!speciality) {
            throw new NotFoundException(`Speciality with ID ${id} not found`);
        }

        return speciality;
    }

    async update(id: number, updateSpecialityDto: UpdateSpecialityDto) {
        await this.findOne(id);

        if (updateSpecialityDto.name) {
            const existing = await this.dataService.specialty.findFirst({
                where: {
                    name: updateSpecialityDto.name,
                    id: { not: id }
                },
            });

            if (existing) {
                throw new ConflictException(`Speciality with name ${updateSpecialityDto.name} already exists`);
            }
        }

        return this.dataService.specialty.update({
            where: { id },
            data: updateSpecialityDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.dataService.specialty.delete({
            where: { id },
        });
    }
}
