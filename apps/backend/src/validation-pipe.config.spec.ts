import { createValidationPipeOptions } from './validation-pipe.config';

describe('createValidationPipeOptions', () => {
  it('rejects unknown properties while transforming and whitelisting DTO input', () => {
    expect(createValidationPipeOptions()).toEqual({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  });
});
