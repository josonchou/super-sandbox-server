import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CommonException } from './CommonException';

/*
 * @description: Http异常处理
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown = {}, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let errorCode = 1;
    let errorList = [];
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = (exception as any).message || '服务器异常';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      // exception
      message = exception.message;
    }

    if (exception instanceof CommonException) {
      status = exception.getStatus();
      const resp = exception.getResponse() as {
        message: string;
        errorCode: number;
      };
      message = resp.message || exception.message;
      errorCode = resp.errorCode;
    }

    if (exception instanceof BadRequestException) {
      console.log(exception, 'exception');
      status = exception.getStatus();
      const resp = exception.getResponse() as {
        statusCode: number;
        message: any;
      };
      if (resp.message && resp.message.length) {
        message = resp.message[0];
        errorList = resp.message;
      } else {
        message = String(resp.message);
      }
    }
    Logger.error(`${request.method} ${request.url} error: ${message}`);
    // const status = exception.getStatus();
    // @todo 记录日志
    // console.log('%s %s error: %s', request.method, request.url, message);
    // 发送响应
    response.status(status).json({
      statusCode: status,
      errorCode,
      timestamp: new Date().toISOString(),
      message: message,
      path: request.url,
      errorList,
    });
  }
}
