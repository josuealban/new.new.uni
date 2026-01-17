import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Valida las credenciales del usuario y genera un token JWT.
     */
    async authenticate(dto: LoginDto) {
        const user = await this.userService.findByUsername(dto.username);
        if (!user) throw new UnauthorizedException('Credenciales inválidas.');

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Credenciales inválidas.');

        const payload = {
            sub: user.id,
            username: user.username,
            roles: user.roles.map(r => r.role.name)
        };

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                username: user.username,
                name: user.name
            }
        };
    }
}
