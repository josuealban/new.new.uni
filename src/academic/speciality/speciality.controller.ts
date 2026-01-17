import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Specialities')
@Controller('academic/specialities')
export class SpecialityController {
    constructor(private readonly specialityService: SpecialityService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new speciality' })
    create(@Body() createSpecialityDto: CreateSpecialityDto) {
        return this.specialityService.create(createSpecialityDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all specialities' })
    findAll() {
        return this.specialityService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a speciality by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.specialityService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a speciality' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSpecialityDto: UpdateSpecialityDto) {
        return this.specialityService.update(id, updateSpecialityDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a speciality' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.specialityService.remove(id);
    }
}
