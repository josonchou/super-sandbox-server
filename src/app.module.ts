import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionFilter } from './common/AllExceptionFilter';
import { TimeoutInterceptor } from './interceptors/TimeoutInterceptor';
import { ResponseInterceptor } from './interceptors/ResponseInterceptor';
import { FileModule } from './file/file.module';
import { GuardModule } from './auth/guard.module';
import { AdminModule } from './admin/admin.module';
import { AuthGuard } from './auth/guard';
import loadYamlConfig from './common/loadYamlConfig';
import { AppService } from './app.service';
import { CourseModule } from './course/course.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CategoryModule } from './category/category.module';
import { CategoryService } from './category/category.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [loadYamlConfig('app'), loadYamlConfig('database')],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('database.address'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    FileModule,
    GuardModule,
    AdminModule,
    CourseModule,
    CategoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule {}
