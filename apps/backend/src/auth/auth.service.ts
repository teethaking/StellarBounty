import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as StellarSdk from '@stellar/stellar-sdk';
import * as crypto from 'crypto';

interface NonceEntry {
  nonce: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly nonces = new Map<string, NonceEntry>();
  private readonly NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly jwtService: JwtService) {}

  getChallenge(address: string): { nonce: string } {
    this.pruneExpired();
    const nonce = crypto.randomBytes(32).toString('hex');
    this.nonces.set(address, { nonce, expiresAt: Date.now() + this.NONCE_TTL_MS });
    return { nonce };
  }

  verify(address: string, signature: string, nonce: string): { accessToken: string } {
    this.pruneExpired();
    const entry = this.nonces.get(address);

    if (!entry || entry.nonce !== nonce || Date.now() > entry.expiresAt) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }

    try {
      const keypair = StellarSdk.Keypair.fromPublicKey(address);
      const messageBytes = Buffer.from(nonce);
      const signatureBytes = Buffer.from(signature, 'base64');
      const valid = keypair.verify(messageBytes, signatureBytes);
      if (!valid) throw new Error('Bad signature');
    } catch {
      throw new UnauthorizedException('Signature verification failed');
    }

    this.nonces.delete(address);
    const accessToken = this.jwtService.sign({ sub: address });
    return { accessToken };
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [addr, entry] of this.nonces) {
      if (now > entry.expiresAt) this.nonces.delete(addr);
    }
  }
}
