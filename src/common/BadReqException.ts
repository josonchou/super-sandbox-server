import { CommonException } from './CommonException';

/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */
export class BadReqException extends CommonException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class LoginErrorException extends CommonException {
  constructor() {
    super('用户名或密码错误', 10003);
  }
}
