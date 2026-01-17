import { Injectable } from '@nestjs/common';
import { HelpDataService } from '../help-data.service';
import { CreateSystemLogDto } from './dto/system-log.dto';

@Injectable()
export class SystemLogService {
    constructor(private readonly helpDb: HelpDataService) { }

    /**
     * Registra un log del sistema (errores o advertencias).
     */
    async logEvent(dto: CreateSystemLogDto) {
        return this.helpDb.systemLog.create({
            data: dto,
        });
    }

    /**
     * Obtiene logs recientes filtrados por nivel.
     */
    async getRecentLogs(level?: string) {
        return this.helpDb.systemLog.findMany({
            where: level ? { level } : {},
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
}
