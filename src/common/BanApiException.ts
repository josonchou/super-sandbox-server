import { CommonException } from './CommonException';

/*
 * @description: 接口已被禁用的异常
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */
export class BanApiException extends CommonException {
  constructor() {
    super('该接口已被禁用，如需使用，请联系系统管理员', 40010);
  }
}
