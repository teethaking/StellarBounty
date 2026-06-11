import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^G[A-Z2-7]{55}$/, {
    message: 'address must be a valid Stellar public key (starts with G, 56 characters)',
  })
  address!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;

  @IsString()
  @IsNotEmpty()
  nonce!: string;
}
