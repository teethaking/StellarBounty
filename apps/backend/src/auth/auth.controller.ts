import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

class VerifyDto {
  address!: string;
  signature!: string;
  nonce!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('challenge')
  getChallenge(@Query('address') address: string) {
    return this.authService.getChallenge(address);
  }

  @Post('verify')
  verify(@Body() body: VerifyDto) {
    return this.authService.verify(body.address, body.signature, body.nonce);
  }
}
