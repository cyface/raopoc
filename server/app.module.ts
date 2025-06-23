import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { ConfigController } from './controllers/config.controller'
import { ApplicationController } from './controllers/application.controller'
import { TranslationController } from './controllers/translation.controller'
import { DocumentController } from './controllers/document.controller'
import { SessionController } from './controllers/session.controller'
import { LeadController } from './controllers/lead.controller'
import { SpaController } from './controllers/spa.controller'
import { ConfigService } from './services/config.service'
import { EncryptionService } from './services/encryption.service'
import { ApplicationService } from './services/application.service'
import { TranslationService } from './services/translation.service'
import { DocumentService } from './services/document.service'
import { SessionService } from './services/session.service'
import { PrismaService } from './services/prisma.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/public',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'dist'),
      exclude: ['/api/{*path}'],
      serveStaticOptions: {
        fallthrough: true,
        index: false,
      },
    }),
  ],
  controllers: [
    ConfigController,
    ApplicationController,
    TranslationController,
    DocumentController,
    SessionController,
    LeadController,
    SpaController, // Must be last to catch SPA routes
  ],
  providers: [
    ConfigService,
    EncryptionService,
    ApplicationService,
    TranslationService,
    DocumentService,
    SessionService,
    PrismaService,
  ],
})
export class AppModule {}