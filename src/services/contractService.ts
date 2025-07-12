import { ethers } from 'ethers';
import { User, Candidate, Election } from '@/types/blockchain';
import contractInfo from "../contracts/VotingContract.json"

// Contract ABI - will be populated from deployed contract
let CONTRACT_ABI: any[] = [];
let CONTRACT_ADDRESS = '';

function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Load contract info from deployment
const loadContractInfo = async () => {
  try {
    CONTRACT_ABI = contractInfo.abi;
    CONTRACT_ADDRESS = contractInfo.address;
    if (!CONTRACT_ABI || !Array.isArray(CONTRACT_ABI) || CONTRACT_ABI.length === 0) {
      throw new Error('Contract ABI is missing or invalid');
    }
    if (!CONTRACT_ADDRESS || !isValidAddress(CONTRACT_ADDRESS)) {
      throw new Error('Contract address is missing or invalid');
    }
    console.log("CONTRACT_ADDRESS", CONTRACT_ADDRESS)
  } catch (error) {
    console.error('Failed to load contract info:', error);
    throw new Error('Contract not deployed or ABI/address not found or invalid');
  }
};

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;

    if (!CONTRACT_ADDRESS || !CONTRACT_ABI.length) {
      await loadContractInfo();
    }
    if (!CONTRACT_ADDRESS || !isValidAddress(CONTRACT_ADDRESS)) {
      throw new Error('Contract address is missing or invalid after loading');
    }
    if (!CONTRACT_ABI || !Array.isArray(CONTRACT_ABI) || CONTRACT_ABI.length === 0) {
      throw new Error('Contract ABI is missing or invalid after loading');
    }
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  private ensureContract() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return this.contract;
  }

  // User Management
  async requestUserRegistration(name: string): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.requestUserRegistration(name);
    await tx.wait();
  }

  async requestCandidateRegistration(partyName: string, symbol: string): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.requestCandidateRegistration(partyName, symbol);
    await tx.wait();
  }

  async approveUser(userAddress: string): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.approveUser(userAddress);
    await tx.wait();
  }

  async approveCandidate(candidateId: number): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.approveCandidate(candidateId);
    await tx.wait();
  }

  // Election Management
  async createElection(
    title: string,
    description: string,
    votingStartDate: number,
    votingEndDate: number,
    resultAnnounceDate: number
  ): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.createElection(
      title,
      description,
      Math.floor(votingStartDate / 1000), // Convert to seconds
      Math.floor(votingEndDate / 1000),
      Math.floor(resultAnnounceDate / 1000)
    );
    await tx.wait();
  }

  async addCandidateToElection(electionId: number, candidateId: number): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.addCandidateToElection(electionId, candidateId);
    await tx.wait();
  }

  async startElection(electionId: number): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.startElection(electionId);
    await tx.wait();
  }

  async endElection(electionId: number): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.endElection(electionId);
    await tx.wait();
  }

  async pauseElection(electionId: number): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.pauseElection(electionId);
    await tx.wait();
  }

  async updateElectionDates(
    electionId: number,
    votingStartDate: number,
    votingEndDate: number,
    resultAnnounceDate: number
  ): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.updateElectionDates(
      electionId,
      Math.floor(votingStartDate / 1000),
      Math.floor(votingEndDate / 1000),
      Math.floor(resultAnnounceDate / 1000)
    );
    await tx.wait();
  }

  // Voting
  async enrollToVote(electionId: number): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.enrollToVote(electionId);
    await tx.wait();
  }

  async vote(electionId: number, candidateId: number): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.vote(electionId, candidateId);
    await tx.wait();
  }

  // Data Retrieval
  async getUser(address: string): Promise<User | null> {
    console.log("ADDRESS", address)
    const contract = this.ensureContract();
    try {
      const userData = await contract.getUser(address);
      if (!userData[0]) return null; // Name is empty if user doesn't exist

      return {
        address,
        name: userData[0],
        isRegistered: userData[1],
        isCandidate: userData[2],
        approved: userData[3],
        registeredElectionIds: userData[4].map((id: any) => Number(id)),
      };
    } catch (error) {
      return null;
    }
  }

  async getCandidate(candidateId: number): Promise<Candidate | null> {
    const contract = this.ensureContract();
    try {
      const candidateData = await contract.getCandidate(candidateId);
      return {
        candidateId: Number(candidateData[0]),
        userAddress: candidateData[1],
        partyName: candidateData[2],
        symbol: candidateData[3],
        voteCount: Number(candidateData[4]),
        electionId: Number(candidateData[5]),
        approved: candidateData[6],
      };
    } catch (error) {
      return null;
    }
  }

  async getElection(electionId: number): Promise<Election | null> {
    const contract = this.ensureContract();
    try {
      const electionData = await contract.getElection(electionId);
      return {
        electionId: Number(electionData[0]),
        title: electionData[1],
        description: electionData[2],
        isActive: electionData[3],
        isEnded: electionData[4],
        candidateIds: electionData[5].map((id: any) => Number(id)),
        voterAddresses: [], // Will be populated separately if needed
        startTime: electionData[6] ? Number(electionData[6]) * 1000 : undefined,
        endTime: electionData[7] ? Number(electionData[7]) * 1000 : undefined,
        votingStartDate: Number(electionData[8]) * 1000,
        votingEndDate: Number(electionData[9]) * 1000,
        resultAnnounceDate: Number(electionData[10]) * 1000,
        resultAnnounced: electionData[11],
        paused: electionData[12],
      };
    } catch (error) {
      return null;
    }
  }

  async getAllElections(): Promise<Election[]> {
    const contract = this.ensureContract();
    const electionIds = await contract.getAllElections();
    const elections: Election[] = [];

    for (const id of electionIds) {
      const election = await this.getElection(Number(id));
      if (election) elections.push(election);
    }

    return elections;
  }

  async getAllCandidates(): Promise<Candidate[]> {
    const contract = this.ensureContract();
    const candidateIds = await contract.getAllCandidates();
    const candidates: Candidate[] = [];

    for (const id of candidateIds) {
      const candidate = await this.getCandidate(Number(id));
      if (candidate) candidates.push(candidate);
    }

    return candidates;
  }

  async getPendingUsers(): Promise<User[]> {
    const contract = this.ensureContract();
    const pendingAddresses = await contract.getPendingUsers();
    const users: User[] = [];

    for (const address of pendingAddresses) {
      const user = await this.getUser(address);
      if (user) users.push(user);
    }

    return users;
  }

  async getPendingCandidates(): Promise<Candidate[]> {
    const contract = this.ensureContract();
    const pendingIds = await contract.getPendingCandidates();
    const candidates: Candidate[] = [];

    for (const id of pendingIds) {
      const candidate = await this.getCandidate(Number(id));
      if (candidate) candidates.push(candidate);
    }

    return candidates;
  }

  async getElectionResults(electionId: number): Promise<Candidate[]> {
    const contract = this.ensureContract();
    const [candidateIds, voteCounts] = await contract.getElectionResults(electionId);
    const results: Candidate[] = [];

    for (let i = 0; i < candidateIds.length; i++) {
      const candidate = await this.getCandidate(Number(candidateIds[i]));
      if (candidate) {
        candidate.voteCount = Number(voteCounts[i]);
        results.push(candidate);
      }
    }

    return results.sort((a, b) => b.voteCount - a.voteCount);
  }

  async hasUserVoted(electionId: number, voterAddress: string): Promise<boolean> {
    const contract = this.ensureContract();
    return await contract.hasUserVoted(electionId, voterAddress);
  }

  async isUserEnrolled(electionId: number, voterAddress: string): Promise<boolean> {
    const contract = this.ensureContract();
    return await contract.isUserEnrolled(electionId, voterAddress);
  }

  async isOwner(address: string): Promise<boolean> {
    const contract = this.ensureContract();
    const owner = await contract.owner();
    return owner.toLowerCase() === address.toLowerCase();
  }

  // Auto-update election states
  async updateElectionState(electionId: number): Promise<void> {
    const contract = this.ensureContract();
    const tx = await contract.updateElectionState(electionId);
    await tx.wait();
  }
}

export const contractService = new ContractService();