import { Controller, Get, Post, Body, ApiTags, ApiOperation } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, GrantPermissionDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Security - Roles')
@Controller('security/roles')
export class RoleController {
    constructor(private readonly roles: RoleService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo rol' })
    addRole(@Body() dto: CreateRoleDto) {
        return this.roles.createRole(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos los roles y permisos' })
    list() {
        return this.roles.getAllRoles();
    }

    @Post('permissions')
    @ApiOperation({ summary: 'Otorgar permiso a un rol' })
    authorize(@Body() dto: GrantPermissionDto) {
        return this.roles.linkPermission(dto);
    }
}
