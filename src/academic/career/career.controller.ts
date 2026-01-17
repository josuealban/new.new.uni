import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CareerService } from './career.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Careers')
@Controller('academic/careers')
export class CareerController {
    constructor(private readonly careerService: CareerService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new career' })
    create(@Body() createCareerDto: CreateCareerDto) {
        return this.careerService.create(createCareerDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all careers' })
    findAll() {
        return this.careerService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a career by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.careerService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a career' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCareerDto: UpdateCareerDto) {
        return this.careerService.update(id, updateCareerDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a career' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.careerService.remove(id);
    }
}
