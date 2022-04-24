/*
 * @description: 加载 Yaml 配置
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */
import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export default function loadYamlConfig(nodeName: string) {
  const srvEnv = process.env.SRV_ENV;
  let envPrefix = '';
  if (srvEnv === 'local') {
    envPrefix = '.local';
  }

  const prodPath = path.join(__dirname, `../../config/${nodeName}.yaml`);
  const configPath = path.join(
    __dirname,
    `../../config/${nodeName}${envPrefix}.yaml`,
  );
  return registerAs(nodeName, () => {
    const prod = yaml.load(fs.readFileSync(prodPath, 'utf-8'), {
      json: false,
    });
    const res = yaml.load(fs.readFileSync(configPath, 'utf-8'), {
      json: false,
    });

    let config = {};

    if (typeof prod === 'object') {
      config = { ...prod };
    }

    if (typeof res === 'object') {
      config = {
        ...config,
        ...res,
      };
    }

    return config;
  });
}
