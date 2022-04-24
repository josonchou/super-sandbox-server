import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import * as bodyParser from 'body-parser';
// import * as bodyParserXML from 'body-parser-xml';

// eslint-disable-next-line
const bodyParserXML = require('body-parser-xml');

bodyParserXML(bodyParser);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Shared Api')
    .setDescription('Shared Api Document')
    .setVersion('1.0')
    .build();
  app.useGlobalPipes(new ValidationPipe());
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);
  app.use(
    bodyParser['xml']({
      xmlParseOptions: {
        explicitArray: false, // 始终返回数组。默认情况下只有数组元素数量大于 1 是才返回数组。
      },
    }),
  );
  await app.listen(3000, () => {
    Logger.log('服务已经启动，请访问 http://localhost:3000');
  });
}
bootstrap();
