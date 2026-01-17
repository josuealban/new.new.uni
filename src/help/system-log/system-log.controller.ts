import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SystemLogService } from './system-log.service';
import { CreateSystemLogDto } from './dto/system-log.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Help - System Logs')
@Controller('help/system-logs')
export class SystemLogController {
    constructor(private readonly systemLogService: SystemLogService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar un evento del sistema' })
    create(@Body() dto: CreateSystemLogDto) {
        return this.systemLogService.logEvent(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Consultar eventos recientes' })
    findAll(@Query('level') level?: string) {
        return this.systemLogService.getRecentLogs(level);
    }
}
