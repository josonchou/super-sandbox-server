/*
 * @description:
 * @author: 周金顺（云天河） <yuntianhe@douyu.tv>
 * @copyright:  © 2020 DouYu.tv
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  doTest(): string {
    return 'doTest';
  }
}
