import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Candidate, Election, UserRole } from '@/types/blockchain';
import { blockchainService } from '@/services/blockchainService';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

interface BlockchainContextType {
  currentUser: User | null;
  userRole: UserRole;
  elections: Election[];
  pendingUsers: User[];
  pendingCandidates: Candidate[];
  allCandidates: Candidate[];
  isContractMode: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // User actions
  requestRegistration: (name: string) => Promise<void>;
  requestCandidateRegistration: (partyName: string, symbol: string) => Promise<void>;
  enrollToVote: (electionId: number) => Promise<void>;
  vote: (electionId: number, candidateId: number) => Promise<void>;

  // Admin actions
  approveUser: (userAddress: string) => Promise<void>;
  approveCandidate: (candidateId: number) => Promise<void>;
  createElection: (title: string, description: string, votingStartDate: number, votingEndDate: number, resultAnnounceDate: number) => Promise<void>;
  addCandidateToElection: (electionId: number, candidateId: number) => Promise<void>;
  startElection: (electionId: number) => Promise<void>;
  endElection: (electionId: number) => Promise<void>;
  pauseElection: (electionId: number) => Promise<void>;
  updateElectionDates: (electionId: number, votingStartDate: number, votingEndDate: number, resultAnnounceDate: number) => Promise<void>;

  // Getters
  getElectionResults: (electionId: number) => Promise<Candidate[]>;
  hasUserVoted: (electionId: number) => Promise<boolean>;
  isUserEnrolled: (electionId: number) => Promise<boolean>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userAddress, isConnected, isCorrectNetwork, provider, signer } = useWallet();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('visitor');
  const [elections, setElections] = useState<Election[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingCandidates, setPendingCandidates] = useState<Candidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isContractMode, setIsContractMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("userAddress", userAddress)

  useEffect(() => {
    const setup = async () => {
      if (userAddress && isConnected && isCorrectNetwork && provider && signer) {
        console.log("🔗 Wallet ready. Initializing contract...");
        setError(null);
        setIsLoading(true);
        try {
          await initializeBlockchain(); // only sets contract, refreshData is called inside
        } catch (e) {
          // error already handled in initializeBlockchain
        }
      } else {
        // Reset to visitor state if wallet/network is not ready
        setCurrentUser(null);
        setUserRole('visitor');
        setIsContractMode(false);
        setIsLoading(false);
        setError(null);
      }
    };

    setup();
  }, [userAddress, isConnected, isCorrectNetwork, provider, signer]);

  const initializeBlockchain = async () => {
    if (!userAddress || !provider || !signer) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log('Initializing contract with address:', userAddress);
      await blockchainService.initializeContract(provider, signer);
      setIsContractMode(true);
      toast({
        title: "Smart Contract Connected",
        description: "Successfully connected to the blockchain voting contract on opBNB Testnet.",
      });
      console.log('Contract initialized, refreshing data...');
      await refreshData();
      console.log('Data refreshed.');
    } catch (error: any) {
      console.error('Failed to initialize blockchain:', error);
      setIsContractMode(false);
      setError(error?.message || 'Failed to initialize blockchain');
      if (error.message && error.message.includes('Contract not deployed')) {
        toast({
          title: "Contract Not Deployed",
          description: "The voting contract is not deployed on opBNB Testnet. Please deploy the contract first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to the smart contract. Please check your connection.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (!userAddress) return;
    try {
      setIsLoading(true);
      console.log('Refreshing user and election data...');
      // Get current user
      const user = await blockchainService.getUser(userAddress);
      console.log("USER", user)
      setCurrentUser(user);
      // Determine user role
      const isAdmin = await blockchainService.isAdmin(userAddress);
      if (isAdmin) {
        setUserRole('admin');
      } else if (user?.approved) {
        setUserRole(user.isCandidate ? 'candidate' : 'user');
      } else {
        setUserRole('visitor');
      }
      // Load all data
      const [electionsData, candidatesData, pendingUsersData, pendingCandidatesData] = await Promise.all([
        blockchainService.getAllElections(),
        blockchainService.getAllCandidates(),
        blockchainService.getPendingUsers(),
        blockchainService.getPendingCandidates(),
      ]);
      setElections(electionsData);
      setAllCandidates(candidatesData);
      setPendingUsers(pendingUsersData);
      setPendingCandidates(pendingCandidatesData);
      console.log('Election and candidate data loaded.');
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      setError(error.message || 'Failed to load latest data from blockchain.');
      toast({
        title: "Data Refresh Failed",
        description: error.message || "Failed to load latest data from blockchain.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // User actions
  const requestRegistration = async (name: string) => {
    if (!userAddress) throw new Error('No wallet connected');
    await blockchainService.requestUserRegistration(userAddress, name);
    await refreshData();
  };

  const requestCandidateRegistration = async (partyName: string, symbol: string) => {
    if (!userAddress) throw new Error('No wallet connected');
    await blockchainService.requestCandidateRegistration(userAddress, partyName, symbol);
    await refreshData();
  };

  const enrollToVote = async (electionId: number) => {
    if (!userAddress) throw new Error('No wallet connected');
    await blockchainService.enrollToVote(electionId, userAddress);
    await refreshData();
  };

  const vote = async (electionId: number, candidateId: number) => {
    if (!userAddress) throw new Error('No wallet connected');
    await blockchainService.vote(electionId, candidateId, userAddress);
    await refreshData();
  };

  // Admin actions
  const approveUser = async (userAddress: string) => {
    await blockchainService.approveUser(userAddress);
    await refreshData();
  };

  const approveCandidate = async (candidateId: number) => {
    await blockchainService.approveCandidate(candidateId);
    await refreshData();
  };

  const createElection = async (title: string, description: string, votingStartDate: number, votingEndDate: number, resultAnnounceDate: number) => {
    await blockchainService.createElection(title, description, votingStartDate, votingEndDate, resultAnnounceDate);
    await refreshData();
  };

  const addCandidateToElection = async (electionId: number, candidateId: number) => {
    await blockchainService.addCandidateToElection(electionId, candidateId);
    await refreshData();
  };

  const startElection = async (electionId: number) => {
    await blockchainService.startElection(electionId);
    await refreshData();
  };

  const endElection = async (electionId: number) => {
    await blockchainService.endElection(electionId);
    await refreshData();
  };

  const pauseElection = async (electionId: number) => {
    await blockchainService.pauseElection(electionId);
    await refreshData();
  };

  const updateElectionDates = async (electionId: number, votingStartDate: number, votingEndDate: number, resultAnnounceDate: number) => {
    await blockchainService.updateElectionDates(electionId, votingStartDate, votingEndDate, resultAnnounceDate);
    await refreshData();
  };

  // Getters
  const getElectionResults = async (electionId: number) => {
    return await blockchainService.getElectionResults(electionId);
  };

  const hasUserVoted = async (electionId: number) => {
    if (!userAddress) return false;
    return await blockchainService.hasUserVoted(electionId, userAddress);
  };

  const isUserEnrolled = async (electionId: number) => {
    if (!userAddress) return false;
    return await blockchainService.isUserEnrolled(electionId, userAddress);
  };

  const value: BlockchainContextType & { error: string | null } = {
    currentUser,
    userRole,
    elections,
    pendingUsers,
    pendingCandidates,
    allCandidates,
    isContractMode,
    isLoading,
    refreshData,
    requestRegistration,
    requestCandidateRegistration,
    enrollToVote,
    vote,
    approveUser,
    approveCandidate,
    createElection,
    addCandidateToElection,
    startElection,
    endElection,
    pauseElection,
    updateElectionDates,
    getElectionResults,
    hasUserVoted,
    isUserEnrolled,
    error,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};