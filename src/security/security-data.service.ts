import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client-security';

/**
 * Servicio encargado de gestionar la conexión con la base de datos de Seguridad.
 * Maneja el ciclo de vida de la conexión mediante los hooks de NestJS.
 */
@Injectable()
export class SecurityDataService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
