import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersistenceModule } from './prisma/persistence.module';

// Academic Domain
import { CycleModule } from './academic/cycle/cycle.module';
import { SpecialtyModule } from './academic/specialty/specialty.module';
import { CareerModule } from './academic/career/career.module';
import { SubjectModule } from './academic/subject/subject.module';
import { TeacherModule } from './academic/teacher/teacher.module';
import { StudentModule } from './academic/student/student.module';
import { AcademicPeriodModule } from './academic/academic-period/academic-period.module';
import { TeacherSubjectModule } from './academic/teacher-subject/teacher-subject.module';
import { StudentSubjectModule } from './academic/student-subject/student-subject.module';
import { EnrollmentModule } from './academic/enrollment/enrollment.module';

// Security Domain
import { UserModule } from './security/user/user.module';
import { RoleModule } from './security/role/role.module';
import { PermissionModule } from './security/permission/permission.module';
import { AuthModule } from './security/auth/auth.module';

// Help Domain
import { AuditLogModule } from './help/audit-log/audit-log.module';
import { SystemLogModule } from './help/system-log/system-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersistenceModule,

    // Academic
    CycleModule,
    SpecialtyModule,
    CareerModule,
    SubjectModule,
    TeacherModule,
    StudentModule,
    AcademicPeriodModule,
    TeacherSubjectModule,
    StudentSubjectModule,
    EnrollmentModule,

    // Security
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,

    // Help
    AuditLogModule,
    SystemLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
