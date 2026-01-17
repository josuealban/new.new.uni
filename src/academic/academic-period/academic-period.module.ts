import { Module } from '@nestjs/common';
import { AcademicPeriodService } from './academic-period.service';
import { AcademicPeriodController } from './academic-period.controller';

@Module({
    controllers: [AcademicPeriodController],
    providers: [AcademicPeriodService],
    exports: [AcademicPeriodService],
})
export class AcademicPeriodModule { }
