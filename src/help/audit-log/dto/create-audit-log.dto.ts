import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateAuditLogDto {
    @IsInt()
    @IsOptional()
    userId?: number;

    @IsString()
    @IsNotEmpty()
    action: string;

    @IsString()
    @IsNotEmpty()
    resource: string;

    @IsOptional()
    details?: any;

    @IsString()
    @IsOptional()
    ipAddress?: string;
}
