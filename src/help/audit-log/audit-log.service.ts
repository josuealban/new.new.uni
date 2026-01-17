import { Injectable } from '@nestjs/common';
import { HelpDataService } from '../help-data.service';
import { CreateAuditLogDto } from './dto/audit-log.dto';

@Injectable()
export class AuditLogService {
    constructor(private readonly helpDb: HelpDataService) { }

    /**
     * Registra un evento de auditoría en el sistema.
     */
    async record(dto: CreateAuditLogDto) {
        return this.helpDb.auditLog.create({
            data: dto,
        });
    }

    /**
     * Recupera el historial de auditoría.
     */
    async fetchHistory() {
        return this.helpDb.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100, // Limitar a los últimos 100 para eficiencia
        });
    }
}
