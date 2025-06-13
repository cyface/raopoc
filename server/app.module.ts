import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { ConfigController } from './controllers/config.controller'
import { ApplicationController } from './controllers/application.controller'
import { TranslationController } from './controllers/translation.controller'
import { DocumentController } from './controllers/document.controller'
import { ConfigService } from './services/config.service'
import { EncryptionService } from './services/encryption.service'
import { ApplicationService } from './services/application.service'
import { TranslationService } from './services/translation.service'
import { DocumentService } from './services/document.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/public',
    }),
  ],
  controllers: [
    ConfigController,
    ApplicationController,
    TranslationController,
    DocumentController,
  ],
  providers: [
    ConfigService,
    EncryptionService,
    ApplicationService,
    TranslationService,
    DocumentService,
  ],
})
export class AppModule {}