import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Bounty, BountyStatus } from '../entities/bounty.entity';
import { Submission, SubmissionStatus } from '../entities/submission.entity';
import { CreateSubmissionDto } from './submissions.dto';
import { StellarRpcClient } from '../common/stellar-rpc-client';

@Injectable()
export class SubmissionsService {
  private lastWarnMessage: { bountyId: string; contractId: string; rpcUrl: string; message: string } | null = null;
  private lastWarnTime = 0;

  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Bounty)
    private readonly bountyRepo: Repository<Bounty>,
    private readonly config: ConfigService,
    private readonly stellarRpcClient: StellarRpcClient,
  ) {}

  async create(bountyId: string, dto: CreateSubmissionDto, contributorAddress: string) {
    const bounty = await this.bountyRepo.findOneBy({ id: bountyId });
    if (!bounty) throw new NotFoundException('Bounty not found');

    const submission = this.submissionRepo.create({
      bountyId,
      link: dto.link,
      notes: dto.notes ?? null,
      contributorAddress,
    });
    return this.submissionRepo.save(submission);
  }

  async findAll(bountyId: string, ownerAddress: string) {
    const bounty = await this.bountyRepo.findOneBy({ id: bountyId });
    if (!bounty) throw new NotFoundException('Bounty not found');
    if (bounty.ownerAddress !== ownerAddress) throw new ForbiddenException();
    return this.submissionRepo.findBy({ bountyId });
  }

  async approve(bountyId: string, subId: string, ownerAddress: string) {
    const bounty = await this.bountyRepo.findOneBy({ id: bountyId });
    if (!bounty) throw new NotFoundException('Bounty not found');
    if (bounty.ownerAddress !== ownerAddress) throw new ForbiddenException();

    const alreadyApproved = await this.submissionRepo.findOneBy({
      bountyId,
      status: SubmissionStatus.APPROVED,
    });
    if (alreadyApproved) throw new BadRequestException('A submission is already approved for this bounty');

    const submission = await this.submissionRepo.findOneBy({ id: subId, bountyId });
    if (!submission) throw new NotFoundException('Submission not found');

    await this.callContractApprove(bountyId, ownerAddress);

    submission.status = SubmissionStatus.APPROVED;
    bounty.status = BountyStatus.COMPLETED;
    await this.bountyRepo.save(bounty);
    return this.submissionRepo.save(submission);
  }

  async reject(bountyId: string, subId: string, ownerAddress: string) {
    const bounty = await this.bountyRepo.findOneBy({ id: bountyId });
    if (!bounty) throw new NotFoundException('Bounty not found');
    if (bounty.ownerAddress !== ownerAddress) throw new ForbiddenException();

    const submission = await this.submissionRepo.findOneBy({ id: subId, bountyId });
    if (!submission) throw new NotFoundException('Submission not found');

    submission.status = SubmissionStatus.REJECTED;
    return this.submissionRepo.save(submission);
  }

  private async callContractApprove(bountyId: string, ownerAddress: string): Promise<void> {
    const contractId =
      this.config.get<string>(`SOROBAN_CONTRACT_${bountyId.toUpperCase()}`) ??
      this.config.get<string>('SOROBAN_CONTRACT_ID');
    if (!contractId) return;

    const network = this.config.get<string>('STELLAR_NETWORK', 'testnet');
    const rpcUrl =
      this.config.get<string>('STELLAR_RPC_URL') ??
      (network === 'mainnet'
        ? 'https://mainnet.stellar.validationcloud.io/v1/rpc'
        : 'https://soroban-testnet.stellar.org');
    const networkPassphrase =
      network === 'mainnet' ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET;

    this.stellarRpcClient.initialize(rpcUrl, networkPassphrase);

    try {
      const account = await this.stellarRpcClient.getAccount(ownerAddress);

      const contract = new StellarSdk.Contract(contractId);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase,
      })
        .addOperation(
          contract.call('approve', StellarSdk.nativeToScVal(ownerAddress, { type: 'address' })),
        )
        .setTimeout(30)
        .build();

      const prepared = await this.stellarRpcClient.prepareTransaction(tx);
      const signingSecret = this.config.get<string>('STELLAR_SIGNING_SECRET');
      if (signingSecret) {
        const signingKeypair = StellarSdk.Keypair.fromSecret(signingSecret);
        prepared.sign(signingKeypair);
        await this.stellarRpcClient.sendTransaction(prepared);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.stellarRpcClientThrottledWarn(bountyId, contractId, rpcUrl, message);
    }
  }

  private stellarRpcClientThrottledWarn(
    bountyId: string,
    contractId: string,
    rpcUrl: string,
    message: string,
  ): void {
    const now = Date.now();
    const key = `${bountyId}:${contractId}:${rpcUrl}:${message}`;
    if (this.lastWarnMessage === key && now - this.lastWarnTime < 5_000) {
      return;
    }
    this.lastWarnMessage = key;
    this.lastWarnTime = now;
    console.warn(
      `Stellar contract approval skipped after RPC failure: bountyId=${bountyId}, contractId=${contractId}, rpcUrl=${rpcUrl}, error=${message}`,
    );
  }
}
