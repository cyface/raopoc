import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
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
  
  console.log(`Server running on http://127.0.0.1:${port}`)
  console.log('Config endpoints available at:')
  console.log(`  - http://127.0.0.1:${port}/api/config/states`)
  console.log(`  - http://127.0.0.1:${port}/api/config/countries`)
  console.log(`  - http://127.0.0.1:${port}/api/config/identification-types`)
  console.log(`  - http://127.0.0.1:${port}/api/config/products`)
  console.log(`  - http://127.0.0.1:${port}/api/config/documents`)
  console.log(`  - http://127.0.0.1:${port}/api/config/bank-info`)
}

bootstrap().catch(console.error)