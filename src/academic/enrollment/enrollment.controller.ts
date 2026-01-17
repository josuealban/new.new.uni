import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Enrollments')
@Controller('academic/enrollments')
export class EnrollmentController {
    constructor(private readonly enrollmentService: EnrollmentService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new enrollment' })
    create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
        return this.enrollmentService.create(createEnrollmentDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all enrollments' })
    findAll() {
        return this.enrollmentService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an enrollment by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.enrollmentService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an enrollment' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
        return this.enrollmentService.update(id, updateEnrollmentDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an enrollment' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.enrollmentService.remove(id);
    }
}
