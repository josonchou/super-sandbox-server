import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { AuthPublic } from './auth';

/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AuthPublic()
  appInfo() {
    return 'Super Sandbox Serivce V1.0';
  }
}
