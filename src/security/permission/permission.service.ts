import { Injectable, ConflictException } from '@nestjs/common';
import { SecurityDataService } from '../security-data.service';
import { CreatePermissionDto } from './dto/permission.dto';

@Injectable()
export class PermissionService {
    constructor(private readonly securityDb: SecurityDataService) { }

    async add(dto: CreatePermissionDto) {
        const exists = await this.securityDb.permission.findUnique({ where: { name: dto.name } });
        if (exists) throw new ConflictException('El permiso ya existe.');

        return this.securityDb.permission.create({ data: dto });
    }

    async listAll() {
        return this.securityDb.permission.findMany();
    }
}
