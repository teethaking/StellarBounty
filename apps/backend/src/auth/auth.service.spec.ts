import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as StellarSdk from '@stellar/stellar-sdk';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = { sign: jest.fn().mockReturnValue('mock.jwt.token') } as any;
    service = new AuthService(jwtService);
  });

  describe('getChallenge', () => {
    it('returns a hex nonce for the given address', () => {
      const result = service.getChallenge('GABC');
      expect(result.nonce).toMatch(/^[0-9a-f]{64}$/);
    });

    it('overwrites previous nonce for the same address', () => {
      const first = service.getChallenge('GABC');
      const second = service.getChallenge('GABC');
      expect(first.nonce).not.toBe(second.nonce);
    });
  });

  describe('verify', () => {
    it('returns an accessToken on valid signature', () => {
      const keypair = StellarSdk.Keypair.random();
      const address = keypair.publicKey();

      const { nonce } = service.getChallenge(address);
      const signatureBytes = keypair.sign(Buffer.from(nonce));
      const signature = Buffer.from(signatureBytes).toString('base64');

      const result = service.verify(address, signature, nonce);
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: address });
    });

    it('throws UnauthorizedException for wrong nonce', () => {
      const keypair = StellarSdk.Keypair.random();
      const address = keypair.publicKey();
      service.getChallenge(address);

      const wrongNonce = 'deadbeef';
      const sig = Buffer.from(keypair.sign(Buffer.from(wrongNonce))).toString('base64');

      expect(() => service.verify(address, sig, wrongNonce)).toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for invalid signature', () => {
      const keypair = StellarSdk.Keypair.random();
      const address = keypair.publicKey();
      const { nonce } = service.getChallenge(address);

      const badSig = Buffer.alloc(64).toString('base64');
      expect(() => service.verify(address, badSig, nonce)).toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when nonce is not found', () => {
      const keypair = StellarSdk.Keypair.random();
      const address = keypair.publicKey();
      const nonce = 'nonexistent';
      const sig = Buffer.from(keypair.sign(Buffer.from(nonce))).toString('base64');

      expect(() => service.verify(address, sig, nonce)).toThrow(UnauthorizedException);
    });

    it('invalidates nonce after successful verification (replay protection)', () => {
      const keypair = StellarSdk.Keypair.random();
      const address = keypair.publicKey();
      const { nonce } = service.getChallenge(address);
      const sig = Buffer.from(keypair.sign(Buffer.from(nonce))).toString('base64');

      service.verify(address, sig, nonce);
      // Second call with same nonce should fail
      expect(() => service.verify(address, sig, nonce)).toThrow(UnauthorizedException);
    });
  });
});
