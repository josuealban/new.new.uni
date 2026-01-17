import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TeacherSubjectService } from './teacher-subject.service';
import { CreateTeacherSubjectDto } from './dto/create-teacher-subject.dto';
import { UpdateTeacherSubjectDto } from './dto/update-teacher-subject.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Teacher Subjects')
@Controller('academic/teacher-subjects')
export class TeacherSubjectController {
    constructor(private readonly teacherSubjectService: TeacherSubjectService) { }

    @Post()
    @ApiOperation({ summary: 'Assign a subject to a teacher' })
    create(@Body() createTeacherSubjectDto: CreateTeacherSubjectDto) {
        return this.teacherSubjectService.create(createTeacherSubjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all teacher-subject assignments' })
    findAll() {
        return this.teacherSubjectService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an assignment by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.teacherSubjectService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an assignment' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateTeacherSubjectDto: UpdateTeacherSubjectDto) {
        return this.teacherSubjectService.update(id, updateTeacherSubjectDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an assignment' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.teacherSubjectService.remove(id);
    }
}
