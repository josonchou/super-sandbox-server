/*
 * @description: 结果拦截器
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // throw new Error('Method not implemented.');
    const req = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      map((value) => {
        let data = value;
        if (value === null || value === undefined) {
          data = '';
        }
        return {
          errorCode: 0,
          timestamp: new Date().toISOString(),
          message: 'OK',
          path: req.url,
          data,
        };
      }),
    );
  }
}
