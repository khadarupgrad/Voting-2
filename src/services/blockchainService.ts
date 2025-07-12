import { User, Candidate, Election } from '@/types/blockchain';
import { contractService } from './contractService';
import { ethers } from 'ethers';

class BlockchainService {
  private isContractMode = false;
  
  async initializeContract(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner): Promise<boolean> {
    try {
      await contractService.initialize(provider, signer);
      this.isContractMode = true;
      console.log('✅ Smart contract initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Smart contract initialization failed:', error);
      this.isContractMode = false;
      throw error;
    }
  }

  async isAdmin(address: string): Promise<boolean> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    try {
      return await contractService.isOwner(address);
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // User Management
  async requestUserRegistration(address: string, name: string): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.requestUserRegistration(name);
  }

  async requestCandidateRegistration(address: string, partyName: string, symbol: string): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.requestCandidateRegistration(partyName, symbol);
  }

  async approveUser(userAddress: string): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.approveUser(userAddress);
  }

  async approveCandidate(candidateId: number): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.approveCandidate(candidateId);
  }

  // Election Management
  async createElection(title: string, description: string, votingStartDate: number, votingEndDate: number, resultAnnounceDate: number): Promise<number> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.createElection(title, description, votingStartDate, votingEndDate, resultAnnounceDate);
    return 0; // Contract will assign ID
  }

  async addCandidateToElection(electionId: number, candidateId: number): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.addCandidateToElection(electionId, candidateId);
  }

  async startElection(electionId: number): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.startElection(electionId);
  }

  async endElection(electionId: number): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.endElection(electionId);
  }

  async pauseElection(electionId: number): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.pauseElection(electionId);
  }

  async updateElectionDates(electionId: number, votingStartDate: number, votingEndDate: number, resultAnnounceDate: number): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.updateElectionDates(electionId, votingStartDate, votingEndDate, resultAnnounceDate);
  }

  // Voting
  async enrollToVote(electionId: number, voterAddress: string): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.enrollToVote(electionId);
  }

  async vote(electionId: number, candidateId: number, voterAddress: string): Promise<void> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    await contractService.vote(electionId, candidateId);
  }

  // Data Retrieval
  async getUser(address: string): Promise<User | null> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    return await contractService.getUser(address);
  }

  async getAllElections(): Promise<Election[]> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    return await contractService.getAllElections();
  }

  async getAllCandidates(): Promise<Candidate[]> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    return await contractService.getAllCandidates();
  }

  async getPendingUsers(): Promise<User[]> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    return await contractService.getPendingUsers();
  }

  async getPendingCandidates(): Promise<Candidate[]> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    return await contractService.getPendingCandidates();
  }

  async getElectionResults(electionId: number): Promise<Candidate[]> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    return await contractService.getElectionResults(electionId);
  }

  async hasUserVoted(electionId: number, voterAddress: string): Promise<boolean> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    return await contractService.hasUserVoted(electionId, voterAddress);
  }

  async isUserEnrolled(electionId: number, voterAddress: string): Promise<boolean> {
    if (!this.isContractMode) {
      throw new Error('Contract not initialized');
    }
    
    return await contractService.isUserEnrolled(electionId, voterAddress);
  }

  getContractMode(): boolean {
    return this.isContractMode;
  }
}

export const blockchainService = new BlockchainService();