import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Subjects')
@Controller('academic/subjects')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new subject' })
    create(@Body() createSubjectDto: CreateSubjectDto) {
        return this.subjectService.create(createSubjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all subjects' })
    findAll() {
        return this.subjectService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a subject by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.subjectService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a subject' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSubjectDto: UpdateSubjectDto) {
        return this.subjectService.update(id, updateSubjectDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a subject' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.subjectService.remove(id);
    }
}
