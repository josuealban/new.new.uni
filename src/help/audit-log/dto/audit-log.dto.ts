import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateAuditLogDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    action: string;

    @IsString()
    @IsNotEmpty()
    resource: string;

    @IsString()
    @IsOptional()
    details?: string;
}
