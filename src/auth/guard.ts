/*
 * @description: 认证守护者
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import {
  CanActivate,
  ExecutionContext,
  Inject,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { BanApiException } from 'src/common/BanApiException';
import { GuardService } from './guard.service';

const IS_PUBLIC_KEY = 'isPublic';
const IS_API_BAN = 'isApiBan';
const BACKEND_API = 'BACKEND_API';

export const AuthPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
export const ApiBan = () => SetMetadata(IS_API_BAN, true);
export const BackendApi = () => SetMetadata(BACKEND_API, true);

export class AuthGuard implements CanActivate {
  constructor(
    @Inject('GuardService')
    private readonly guardService: GuardService,
    private readonly reflector: Reflector,
  ) {}

  canActivateAdmin(
    context: ExecutionContext,
  ): Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isBan = this.reflector.getAllAndOverride<boolean>(IS_API_BAN, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isBan) {
      throw new BanApiException();
    }

    // 认证白名单
    if (isPublic) {
      return Promise.resolve(true);
    }

    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers['authorization'] || '';

    const token = auth.replace('Bearer', '');
    return this.guardService.verifyAdmin(token).then((foundAdmin) => {
      req.app.set('loginAdmin', foundAdmin);
      return !!foundAdmin;
    });
  }

  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | Observable<boolean> {
    const isBackend = this.reflector.get(BACKEND_API, context.getHandler());

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isBan = this.reflector.getAllAndOverride<boolean>(IS_API_BAN, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isBan) {
      throw new BanApiException();
    }

    // 认证白名单
    if (isPublic) {
      return Promise.resolve(true);
    }
    return this.canActivateAdmin(context);
  }
}
