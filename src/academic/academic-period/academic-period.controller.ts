import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AcademicPeriodService } from './academic-period.service';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Periods')
@Controller('academic/periods')
export class AcademicPeriodController {
    constructor(private readonly academicPeriodService: AcademicPeriodService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new academic period' })
    create(@Body() createAcademicPeriodDto: CreateAcademicPeriodDto) {
        return this.academicPeriodService.create(createAcademicPeriodDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all academic periods' })
    findAll() {
        return this.academicPeriodService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an academic period by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.academicPeriodService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an academic period' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateAcademicPeriodDto: UpdateAcademicPeriodDto) {
        return this.academicPeriodService.update(id, updateAcademicPeriodDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an academic period' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.academicPeriodService.remove(id);
    }
}
