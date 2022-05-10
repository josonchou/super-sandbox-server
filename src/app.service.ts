import { Injectable, OnModuleInit } from '@nestjs/common';
import { AdminService } from './admin/admin.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private adminServer: AdminService) {}

  async onModuleInit() {
    await this.adminServer.initAdmin();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
