import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { ConfigController } from './controllers/config.controller'
import { ApplicationController } from './controllers/application.controller'
import { TranslationController } from './controllers/translation.controller'
import { DocumentController } from './controllers/document.controller'
import { SessionController } from './controllers/session.controller'
import { LeadController } from './controllers/lead.controller'
import { AdminController } from './controllers/admin.controller'
import { SpaController } from './controllers/spa.controller'
import { ConfigService } from './services/config.service'
import { ApplicationService } from './services/application.service'
import { TranslationService } from './services/translation.service'
import { DocumentService } from './services/document.service'
import { SessionService } from './services/session.service'
import { PrismaService } from './services/prisma.service'
import { LeadResolver } from './graphql/lead.resolver'
import { ConfigResolver } from './graphql/config.resolver'
import { ApplicationResolver } from './graphql/application.resolver'
import { TranslationResolver } from './graphql/translation.resolver'
import { SessionResolver } from './graphql/session.resolver'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'server/schema.gql'),
      playground: true,
      introspection: true,
      path: '/graphql',
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
    AdminController,
    SpaController, // Must be last to catch SPA routes
  ],
  providers: [
    ConfigService,
    ApplicationService,
    TranslationService,
    DocumentService,
    SessionService,
    PrismaService,
    LeadResolver,
    ConfigResolver,
    ApplicationResolver,
    TranslationResolver,
    SessionResolver,
  ],
})
export class AppModule {}