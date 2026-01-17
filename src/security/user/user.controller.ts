import { Controller, Post, Get, Param, ParseIntPipe, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Security - Users')
@Controller('security/users')
export class UserController {
    constructor(private readonly users: UserService) { }

    @Post('register')
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    signUp(@Body() dto: CreateUserDto) {
        return this.users.register(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de usuario' })
    findUser(@Param('id', ParseIntPipe) id: number) {
        return this.users.findById(id);
    }
}
