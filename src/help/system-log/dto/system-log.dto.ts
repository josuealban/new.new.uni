import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

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
    @IsNotEmpty()
    source: string;
}
