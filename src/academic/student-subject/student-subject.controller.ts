import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { StudentSubjectService } from './student-subject.service';
import { CreateStudentSubjectDto } from './dto/create-student-subject.dto';
import { UpdateStudentSubjectDto } from './dto/update-student-subject.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Student Subjects')
@Controller('academic/student-subjects')
export class StudentSubjectController {
    constructor(private readonly studentSubjectService: StudentSubjectService) { }

    @Post()
    @ApiOperation({ summary: 'Link a student to a subject' })
    create(@Body() createStudentSubjectDto: CreateStudentSubjectDto) {
        return this.studentSubjectService.create(createStudentSubjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all student-subject linkages' })
    findAll() {
        return this.studentSubjectService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a linkage by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.studentSubjectService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a linkage (grade/passed)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateStudentSubjectDto: UpdateStudentSubjectDto) {
        return this.studentSubjectService.update(id, updateStudentSubjectDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a linkage' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.studentSubjectService.remove(id);
    }
}
