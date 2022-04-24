/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import axios from 'axios';
import * as moment from 'moment';

interface Store {
  accessToken: string;
  expireAt: number;
}

class WechatAuth {
  static store: Store = {
    accessToken:
      '43_F97uZFKtBt8lfUVSkr2OU9gw028dSVmE3j-lBiO1SS-F1XqF7PeB7weqWiE_nTrjmyv76GCfsJhGd4EVkoT9m04dvwkCrKJbCM7KP3-nnue2pyAoxQReuq4KcqsODs89WiXZpIvjZVttodSPHCEiAJAUPR',
    expireAt: 0,
  };
  static ins: WechatAuth;
  appId: string;
  secret: string;
  constructor(appId: string, secret: string) {
    this.appId = appId;
    this.secret = secret;
  }

  static of(appId: string, secret: string) {
    if (!this.ins) {
      this.ins = new WechatAuth(appId, secret);
    }

    return this.ins;
  }

  getAccessToken = async () => {
    const { store } = WechatAuth;
    const now = moment().unix();

    if (store.accessToken && store.expireAt > now) {
      return store.accessToken;
    }
    const resp = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: this.appId,
        secret: this.secret,
      },
    });

    const {
      access_token,
      expires_in, // 秒
    } = resp.data;

    WechatAuth.store.accessToken = access_token;
    WechatAuth.store.expireAt = moment().add(expires_in, 'seconds').unix();

    return WechatAuth.store.accessToken;
  };
}

export default WechatAuth;
