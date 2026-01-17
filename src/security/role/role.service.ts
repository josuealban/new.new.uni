import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { SecurityDataService } from '../security-data.service';
import { CreateRoleDto, GrantPermissionDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
    constructor(private readonly securityDb: SecurityDataService) { }

    async createRole(dto: CreateRoleDto) {
        const exists = await this.securityDb.role.findUnique({ where: { name: dto.name } });
        if (exists) throw new ConflictException('El nombre del rol ya existe.');

        return this.securityDb.role.create({ data: dto });
    }

    async getAllRoles() {
        return this.securityDb.role.findMany({
            include: { permissions: { include: { permission: true } } },
        });
    }

    async linkPermission(dto: GrantPermissionDto) {
        return this.securityDb.rolePermission.create({
            data: dto,
        });
    }

    async updateRole(id: number, dto: UpdateRoleDto) {
        return this.securityDb.role.update({
            where: { id },
            data: dto,
        });
    }
}
