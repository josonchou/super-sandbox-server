/*
 * @description: 通用错误
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { HttpException } from '@nestjs/common';

export class CommonException extends HttpException {
  constructor(message: string, errorCode: number) {
    super({ message, errorCode }, 400);
  }
}
