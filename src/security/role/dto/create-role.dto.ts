import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class GrantPermissionDto {
    @IsNotEmpty()
    roleId: number;

    @IsNotEmpty()
    permissionId: number;
}
