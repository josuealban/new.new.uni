import { Global, Module } from '@nestjs/common';
import { SecurityDataService } from '../security/security-data.service';
import { AcademicDataService } from '../academic/academic-data.service';
import { HelpDataService } from '../help/help-data.service';

/**
 * Módulo global que centraliza los servicios de persistencia de todos los dominios.
 * Esto facilita la inyección de dependencias en cualquier parte del sistema.
 */
@Global()
@Module({
    providers: [SecurityDataService, AcademicDataService, HelpDataService],
    exports: [SecurityDataService, AcademicDataService, HelpDataService],
})
export class PersistenceModule { }
