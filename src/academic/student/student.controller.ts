import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Students')
@Controller('academic/students')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new student' })
    create(@Body() createStudentDto: CreateStudentDto) {
        return this.studentService.create(createStudentDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all students' })
    findAll() {
        return this.studentService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a student by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.studentService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a student' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateStudentDto: UpdateStudentDto) {
        return this.studentService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a student' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.studentService.remove(id);
    }
}
