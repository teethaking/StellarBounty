export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  reputation: number;
  walletAddress: string;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  rewardAmount: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  ownerId: string;
}

export interface Submission {
  id: string;
  bountyId: string;
  contributorId: string;
  link: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}
