import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from '@config';
import { INestApplication } from '@nestjs/common';

export function initSwagger(app: INestApplication) {
  if (config.NODE_ENV === config.PROD) return;

  const SR = config.SR;
  const configSwagger = new DocumentBuilder()
    .setTitle(SR.PRODUCT_NAME)
    .setDescription('Description document for Rest API')
    .setVersion(SR.VERSION)
    .setContact(SR.SIGNATURE, SR.SUPPORT.URL, SR.SUPPORT.EMAIL)
    .setExternalDoc('Backend overview', config.HOST + '/overview')
    .setLicense('Postman API Docs', config.API_DOC_URL)
    .addServer(config.DOMAIN, 'Current server')
    .addServer('http://localhost:' + String(config.PORT), 'Localhost')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup(config.SWAGGER_NAMESPACE, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
