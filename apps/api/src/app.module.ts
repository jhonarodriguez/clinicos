import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { IdentityModule } from './identity/identity.module'
import { PatientsModule } from './patients/patients.module'
import { ResourcesModule } from './resources/resources.module'
import { ServiceTypesModule } from './service-types/service-types.module'
import { ProfessionalsModule } from './professionals/professionals.module'
import { SchedulesModule } from './schedules/schedules.module'
import { ScheduleBlocksModule } from './schedule-blocks/schedule-blocks.module'
import { AvailabilityModule } from './availability/availability.module'
import { AppointmentsModule } from './appointments/appointments.module'
import { WaitlistModule } from './waitlist/waitlist.module'
import { HealthController } from './health/health.controller'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { RlsInterceptor } from './common/interceptors/rls.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    PrismaModule,
    AuthModule,
    IdentityModule,
    PatientsModule,
    ResourcesModule,
    ServiceTypesModule,
    ProfessionalsModule,
    SchedulesModule,
    ScheduleBlocksModule,
    AvailabilityModule,
    AppointmentsModule,
    WaitlistModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: RlsInterceptor },
  ],
})
export class AppModule {}
