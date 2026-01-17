import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

export class CreateSystemLogDto {
    @IsEnum(LogLevel)
    @IsNotEmpty()
    level: LogLevel;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsOptional()
    context?: string;

    @IsString()
    @IsOptional()
    stack?: string;
}
