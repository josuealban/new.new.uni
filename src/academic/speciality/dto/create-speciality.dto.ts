import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSpecialityDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
