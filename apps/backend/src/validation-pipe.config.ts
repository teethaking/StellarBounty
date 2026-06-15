import { ValidationPipeOptions } from '@nestjs/common';

export function createValidationPipeOptions(): ValidationPipeOptions {
  return {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  };
}
