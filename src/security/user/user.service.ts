import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SecurityDataService } from '../security-data.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly securityDb: SecurityDataService) { }

    /**
     * Crea un usuario aplicando hashing a la contraseña.
     */
    async register(dto: CreateUserDto) {
        const existing = await this.securityDb.user.findFirst({
            where: { OR: [{ email: dto.email }, { username: dto.username }] },
        });

        if (existing) {
            throw new ConflictException('El correo o nombre de usuario ya están en uso.');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        return this.securityDb.user.create({
            data: {
                ...dto,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    /**
     * Busca un usuario por ID e incluye sus roles.
     */
    async findById(id: number) {
        const user = await this.securityDb.user.findUnique({
            where: { id },
            include: {
                roles: { include: { role: true } },
            },
        });

        if (!user) throw new NotFoundException('Usuario no encontrado.');

        const { password, ...result } = user;
        return result;
    }

    /**
     * Busca un usuario por username (usado en Auth).
     */
    async findByUsername(username: string) {
        return this.securityDb.user.findUnique({
            where: { username },
            include: {
                roles: { include: { role: true } },
            },
        });
    }
}
