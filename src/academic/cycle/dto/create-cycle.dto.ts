import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateCycleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(1)
    number: number;
}
