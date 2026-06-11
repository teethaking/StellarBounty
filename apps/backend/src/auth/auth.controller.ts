import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChallengeQueryDto } from './dto/challenge-query.dto';
import { VerifyDto } from './dto/verify.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Get authentication challenge nonce' })
  @Get('challenge')
  getChallenge(@Query() query: ChallengeQueryDto) {
    return this.authService.getChallenge(query.address);
  }

  @ApiOperation({ summary: 'Verify signed challenge and get JWT' })
  @Post('verify')
  verify(@Body() body: VerifyDto) {
    return this.authService.verify(body.address, body.signature, body.nonce);
  }
}
