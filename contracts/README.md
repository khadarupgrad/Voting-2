# VotingContract - Blockchain Voting System

A comprehensive Solidity smart contract for secure, transparent, and decentralized voting on the Ethereum blockchain.

## Features

- **User Registration & Approval**: Users can register and await admin approval
- **Candidate Registration**: Approved users can register as candidates with party information
- **Election Management**: Admins can create, start, pause, and end elections
- **Secure Voting**: Enrolled voters can cast votes with anti-double-voting protection
- **Transparent Results**: Public access to election results after completion
- **Time-based Automation**: Elections can auto-start and auto-end based on timestamps
- **Emergency Controls**: Pause functionality for emergency situations

## Contract Architecture

### Core Structs

- **User**: Stores user information, registration status, and election enrollments
- **Candidate**: Contains candidate details, vote counts, and approval status
- **Election**: Manages election state, timeline, and voting data

### Key Functions

#### User Management
- `requestUserRegistration(string name)`: Request user registration
- `approveUser(address userAddress)`: Admin approves user registration
- `requestCandidateRegistration(string partyName, string symbol)`: Request candidate registration
- `approveCandidate(uint256 candidateId)`: Admin approves candidate

#### Election Management
- `createElection(...)`: Create new election with timeline
- `addCandidateToElection(uint256 electionId, uint256 candidateId)`: Add candidate to election
- `startElection(uint256 electionId)`: Start election voting
- `endElection(uint256 electionId)`: End election
- `pauseElection(uint256 electionId)`: Pause/resume election

#### Voting Process
- `enrollToVote(uint256 electionId)`: Enroll to vote in specific election
- `vote(uint256 electionId, uint256 candidateId)`: Cast vote
- `getElectionResults(uint256 electionId)`: Get election results (after completion)

## Security Features

- **Access Control**: Owner-only functions for admin operations
- **Reentrancy Protection**: Prevents reentrancy attacks on voting
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive validation of all inputs
- **Time Constraints**: Voting only allowed during active periods
- **Double Voting Prevention**: Each user can only vote once per election

## Installation & Deployment

### Prerequisites

```bash
npm install
```

### Compile Contract

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy to Local Network

```bash
# Start local Hardhat network
npx hardhat node

# Deploy to local network
npm run deploy:localhost
```

### Deploy to Testnet (Sepolia)

1. Copy `.env.example` to `.env`
2. Fill in your network URLs and private key
3. Deploy:

```bash
npm run deploy:sepolia
```

### Verify Contract

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Gas Optimization

The contract is optimized for gas efficiency:
- Packed structs where possible
- Efficient array operations
- Minimal storage reads/writes
- Optimized loops and conditionals

## Integration with Frontend

After deployment, the contract ABI and address are automatically saved to `../src/contracts/VotingContract.json` for frontend integration.

## Testing

Comprehensive test suite covering:
- User registration and approval
- Candidate registration and approval
- Election creation and management
- Voting process and validation
- Results retrieval
- Security and edge cases

Run tests with:
```bash
npm run test
```

## License

MIT License - see LICENSE file for details.

## Security Considerations

- Always use a hardware wallet for mainnet deployments
- Verify contract source code on Etherscan
- Consider multi-signature wallet for admin functions
- Regular security audits recommended for production use
- Test thoroughly on testnets before mainnet deployment

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## Support

For questions or issues, please open an issue on the GitHub repository.