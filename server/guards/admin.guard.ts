import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as any;
    
    if (!session?.adminAuthenticated) {
      throw new UnauthorizedException('Admin authentication required');
    }
    
    return true;
  }
}