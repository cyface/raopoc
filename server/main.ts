import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe, Logger } from '@nestjs/common'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }))
  
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://app.localhost',
      'http://localhost:3000',
      'https://api.localhost'
    ],
    credentials: true
  })
  
  const port = Number(process.env.PORT) || 3000
  await app.listen(port, '127.0.0.1')
  
  logger.log(`Server running on http://127.0.0.1:${port}`)
  logger.log('Config endpoints available at:')
  logger.log(`  - http://127.0.0.1:${port}/api/config/states`)
  logger.log(`  - http://127.0.0.1:${port}/api/config/countries`)
  logger.log(`  - http://127.0.0.1:${port}/api/config/identification-types`)
  logger.log(`  - http://127.0.0.1:${port}/api/config/products`)
  logger.log(`  - http://127.0.0.1:${port}/api/config/documents`)
  logger.log(`  - http://127.0.0.1:${port}/api/config/bank-info`)
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap')
  logger.error('Failed to start server', error)
  process.exit(1)
})