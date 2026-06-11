import { validate } from 'class-validator';
import { CreateBountyDto, MAX_REWARD_AMOUNT, UpdateBountyDto } from './bounty.dto';

describe('Bounty DTO rewardAmount validation', () => {
  function createValidDto(rewardAmount: string): CreateBountyDto {
    const dto = new CreateBountyDto();
    dto.title = 'Build the bounty page';
    dto.description = 'Create a working bounty page with wallet-gated submission.';
    dto.ownerAddress = 'GDXP4W5M2K2N7KDXP4W5M2K2N7KDXP4W5M2K2N7KDXP4W5M2K2N7KDX';
    dto.deadline = '2026-12-31T00:00:00.000Z';
    dto.rewardAmount = rewardAmount;
    return dto;
  }

  it('accepts a positive whole-number rewardAmount within the max', async () => {
    await expect(validate(createValidDto(MAX_REWARD_AMOUNT.toString()))).resolves.toHaveLength(0);
  });

  it.each(['0', '-1', '10.5', 'not-a-number', (MAX_REWARD_AMOUNT + 1n).toString()])(
    'rejects invalid rewardAmount %s',
    async (rewardAmount) => {
      const errors = await validate(createValidDto(rewardAmount));

      expect(errors.some((error) => error.property === 'rewardAmount')).toBe(true);
    },
  );

  it('validates optional update rewardAmount when present', async () => {
    const dto = new UpdateBountyDto();
    dto.rewardAmount = '-1';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'rewardAmount')).toBe(true);
  });
});
