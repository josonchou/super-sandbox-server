import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admin/admin.entity';
import { AdminPassword } from 'src/admin/adminPassword.entity';
import { GuardController } from './guard.controller';
import { GuardService } from './guard.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Admin, AdminPassword])],
  controllers: [GuardController],
  providers: [GuardService],
  exports: [GuardService],
})
export class GuardModule {}
