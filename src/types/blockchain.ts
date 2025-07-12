export interface User {
  address: string;
  name: string;
  isRegistered: boolean;
  isCandidate: boolean;
  approved: boolean;
  registeredElectionIds: number[];
}

export interface Candidate {
  candidateId: number;
  userAddress: string;
  partyName: string;
  symbol: string;
  voteCount: number;
  electionId: number;
  approved: boolean;
}

export interface Election {
  electionId: number;
  title: string;
  description: string;
  isActive: boolean;
  isEnded: boolean;
  candidateIds: number[];
  voterAddresses: string[];
  startTime?: number;
  endTime?: number;
  votingStartDate: number;
  votingEndDate: number;
  resultAnnounceDate: number;
  resultAnnounced: boolean;
  paused: boolean;
}

export interface VotingContract {
  requestUserRegistration: (name: string) => Promise<void>;
  requestCandidateRegistration: (partyName: string, symbol: string) => Promise<void>;
  approveUser: (userAddress: string) => Promise<void>;
  approveCandidate: (candidateId: number) => Promise<void>;
  createElection: (title: string, description: string, votingStartDate: number, votingEndDate: number, resultAnnounceDate: number) => Promise<void>;
  addCandidateToElection: (electionId: number, candidateId: number) => Promise<void>;
  enrollToVote: (electionId: number) => Promise<void>;
  vote: (electionId: number, candidateId: number) => Promise<void>;
  endElection: (electionId: number) => Promise<void>;
  pauseElection: (electionId: number) => Promise<void>;
  updateElectionDates: (electionId: number, votingStartDate: number, votingEndDate: number, resultAnnounceDate: number) => Promise<void>;
  getElectionResults: (electionId: number) => Promise<Candidate[]>;
}

export type UserRole = 'visitor' | 'user' | 'candidate' | 'admin';

export interface AppState {
  isConnected: boolean;
  userAddress: string | null;
  userRole: UserRole;
  currentUser: User | null;
  elections: Election[];
  pendingUsers: User[];
  pendingCandidates: Candidate[];
}