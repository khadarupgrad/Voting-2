// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VotingContract
 * @dev A comprehensive blockchain voting system with user registration, candidate management, and election administration
 */
contract VotingContract is Ownable, ReentrancyGuard, Pausable {
    
    // Structs
    struct User {
        string name;
        bool isRegistered;
        bool isCandidate;
        bool approved;
        uint256[] registeredElectionIds;
        bool exists;
    }
    
    struct Candidate {
        uint256 candidateId;
        address userAddress;
        string partyName;
        string symbol;
        uint256 voteCount;
        uint256 electionId;
        bool approved;
        bool exists;
    }
    
    struct Election {
        uint256 electionId;
        string title;
        string description;
        bool isActive;
        bool isEnded;
        uint256[] candidateIds;
        mapping(address => bool) enrolledVoters;
        mapping(address => bool) hasVoted;
        uint256 startTime;
        uint256 endTime;
        uint256 votingStartDate;
        uint256 votingEndDate;
        uint256 resultAnnounceDate;
        bool resultAnnounced;
        bool paused;
        uint256 totalVotes;
        bool exists;
    }
    
    // State variables
    mapping(address => User) public users;
    mapping(uint256 => Candidate) public candidates;
    mapping(uint256 => Election) public elections;
    
    address[] public pendingUserApprovals;
    uint256[] public pendingCandidateApprovals;
    address[] public allUserAddresses;
    uint256[] public allCandidateIds;
    uint256[] public allElectionIds;
    
    uint256 private nextCandidateId = 1;
    uint256 private nextElectionId = 1;
    
    // Events
    event UserRegistrationRequested(address indexed userAddress, string name);
    event CandidateRegistrationRequested(uint256 indexed candidateId, address indexed userAddress, string partyName, string symbol);
    event UserApproved(address indexed userAddress);
    event CandidateApproved(uint256 indexed candidateId);
    event ElectionCreated(uint256 indexed electionId, string title);
    event CandidateAddedToElection(uint256 indexed electionId, uint256 indexed candidateId);
    event ElectionStarted(uint256 indexed electionId);
    event ElectionEnded(uint256 indexed electionId);
    event ElectionPaused(uint256 indexed electionId, bool paused);
    event VoterEnrolled(uint256 indexed electionId, address indexed voter);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter);
    event ElectionDatesUpdated(uint256 indexed electionId, uint256 votingStartDate, uint256 votingEndDate, uint256 resultAnnounceDate);
    
    // Modifiers
    modifier onlyApprovedUser() {
        require(users[msg.sender].approved, "User not approved");
        _;
    }
    
    modifier onlyRegisteredUser() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }
    
    modifier validElection(uint256 _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }
    
    modifier validCandidate(uint256 _candidateId) {
        require(candidates[_candidateId].exists, "Candidate does not exist");
        _;
    }
    
    modifier electionNotStarted(uint256 _electionId) {
        require(!elections[_electionId].isActive && !elections[_electionId].isEnded, "Election already started or ended");
        _;
    }
    
    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive && !elections[_electionId].isEnded && !elections[_electionId].paused, "Election not active");
        _;
    }
    
    constructor() {}
    
    // User Registration Functions
    function requestUserRegistration(string memory _name) external {
        require(!users[msg.sender].exists, "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        users[msg.sender] = User({
            name: _name,
            isRegistered: false,
            isCandidate: false,
            approved: false,
            registeredElectionIds: new uint256[](0),
            exists: true
        });
        
        pendingUserApprovals.push(msg.sender);
        allUserAddresses.push(msg.sender);
        
        emit UserRegistrationRequested(msg.sender, _name);
    }
    
    function requestCandidateRegistration(string memory _partyName, string memory _symbol) external onlyRegisteredUser {
        require(bytes(_partyName).length > 0, "Party name cannot be empty");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        
        uint256 candidateId = nextCandidateId++;
        
        candidates[candidateId] = Candidate({
            candidateId: candidateId,
            userAddress: msg.sender,
            partyName: _partyName,
            symbol: _symbol,
            voteCount: 0,
            electionId: 0,
            approved: false,
            exists: true
        });
        
        users[msg.sender].isCandidate = true;
        pendingCandidateApprovals.push(candidateId);
        allCandidateIds.push(candidateId);
        
        emit CandidateRegistrationRequested(candidateId, msg.sender, _partyName, _symbol);
    }
    
    // Admin Functions
    function approveUser(address _userAddress) external onlyOwner {
        require(users[_userAddress].exists, "User does not exist");
        require(!users[_userAddress].approved, "User already approved");
        
        users[_userAddress].approved = true;
        users[_userAddress].isRegistered = true;
        
        // Remove from pending approvals
        _removeFromPendingUsers(_userAddress);
        
        emit UserApproved(_userAddress);
    }
    
    function approveCandidate(uint256 _candidateId) external onlyOwner validCandidate(_candidateId) {
        require(!candidates[_candidateId].approved, "Candidate already approved");
        
        candidates[_candidateId].approved = true;
        
        // Remove from pending approvals
        _removeFromPendingCandidates(_candidateId);
        
        emit CandidateApproved(_candidateId);
    }
    
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _votingStartDate,
        uint256 _votingEndDate,
        uint256 _resultAnnounceDate
    ) external onlyOwner returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_votingStartDate > block.timestamp, "Voting start date must be in the future");
        require(_votingEndDate > _votingStartDate, "Voting end date must be after start date");
        require(_resultAnnounceDate > _votingEndDate, "Result announce date must be after voting end date");
        
        uint256 electionId = nextElectionId++;
        
        Election storage newElection = elections[electionId];
        newElection.electionId = electionId;
        newElection.title = _title;
        newElection.description = _description;
        newElection.isActive = false;
        newElection.isEnded = false;
        newElection.candidateIds = new uint256[](0);
        newElection.votingStartDate = _votingStartDate;
        newElection.votingEndDate = _votingEndDate;
        newElection.resultAnnounceDate = _resultAnnounceDate;
        newElection.resultAnnounced = false;
        newElection.paused = false;
        newElection.totalVotes = 0;
        newElection.exists = true;
        
        allElectionIds.push(electionId);
        
        emit ElectionCreated(electionId, _title);
        return electionId;
    }
    
    function addCandidateToElection(uint256 _electionId, uint256 _candidateId) 
        external 
        onlyOwner 
        validElection(_electionId) 
        validCandidate(_candidateId) 
        electionNotStarted(_electionId) 
    {
        require(candidates[_candidateId].approved, "Candidate not approved");
        require(candidates[_candidateId].electionId == 0, "Candidate already assigned to an election");
        
        elections[_electionId].candidateIds.push(_candidateId);
        candidates[_candidateId].electionId = _electionId;
        
        emit CandidateAddedToElection(_electionId, _candidateId);
    }
    
    function startElection(uint256 _electionId) external onlyOwner validElection(_electionId) electionNotStarted(_electionId) {
        require(elections[_electionId].candidateIds.length > 0, "No candidates in election");
        require(block.timestamp >= elections[_electionId].votingStartDate, "Voting period has not started yet");
        
        elections[_electionId].isActive = true;
        elections[_electionId].startTime = block.timestamp;
        
        emit ElectionStarted(_electionId);
    }
    
    function endElection(uint256 _electionId) external onlyOwner validElection(_electionId) {
        require(elections[_electionId].isActive, "Election not active");
        
        elections[_electionId].isActive = false;
        elections[_electionId].isEnded = true;
        elections[_electionId].endTime = block.timestamp;
        
        emit ElectionEnded(_electionId);
    }
    
    function pauseElection(uint256 _electionId) external onlyOwner validElection(_electionId) {
        require(elections[_electionId].isActive, "Election not active");
        
        elections[_electionId].paused = !elections[_electionId].paused;
        
        emit ElectionPaused(_electionId, elections[_electionId].paused);
    }
    
    function updateElectionDates(
        uint256 _electionId,
        uint256 _votingStartDate,
        uint256 _votingEndDate,
        uint256 _resultAnnounceDate
    ) external onlyOwner validElection(_electionId) electionNotStarted(_electionId) {
        require(_votingStartDate > block.timestamp, "Voting start date must be in the future");
        require(_votingEndDate > _votingStartDate, "Voting end date must be after start date");
        require(_resultAnnounceDate > _votingEndDate, "Result announce date must be after voting end date");
        
        elections[_electionId].votingStartDate = _votingStartDate;
        elections[_electionId].votingEndDate = _votingEndDate;
        elections[_electionId].resultAnnounceDate = _resultAnnounceDate;
        
        emit ElectionDatesUpdated(_electionId, _votingStartDate, _votingEndDate, _resultAnnounceDate);
    }
    
    // Voting Functions
    function enrollToVote(uint256 _electionId) external onlyApprovedUser validElection(_electionId) {
        require(!elections[_electionId].isEnded, "Election has ended");
        require(!elections[_electionId].enrolledVoters[msg.sender], "Already enrolled");
        
        elections[_electionId].enrolledVoters[msg.sender] = true;
        users[msg.sender].registeredElectionIds.push(_electionId);
        
        emit VoterEnrolled(_electionId, msg.sender);
    }
    
    function vote(uint256 _electionId, uint256 _candidateId) 
        external 
        onlyApprovedUser 
        validElection(_electionId) 
        validCandidate(_candidateId) 
        electionActive(_electionId) 
        nonReentrant 
    {
        require(elections[_electionId].enrolledVoters[msg.sender], "Not enrolled to vote");
        require(!elections[_electionId].hasVoted[msg.sender], "Already voted");
        require(candidates[_candidateId].electionId == _electionId, "Candidate not in this election");
        require(block.timestamp <= elections[_electionId].votingEndDate, "Voting period has ended");
        
        elections[_electionId].hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        elections[_electionId].totalVotes++;
        
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }
    
    // View Functions
    function getUser(address _userAddress) external view returns (
        string memory name,
        bool isRegistered,
        bool isCandidate,
        bool approved,
        uint256[] memory registeredElectionIds
    ) {
        User memory user = users[_userAddress];
        return (user.name, user.isRegistered, user.isCandidate, user.approved, user.registeredElectionIds);
    }
    
    function getCandidate(uint256 _candidateId) external view validCandidate(_candidateId) returns (
        uint256 candidateId,
        address userAddress,
        string memory partyName,
        string memory symbol,
        uint256 voteCount,
        uint256 electionId,
        bool approved
    ) {
        Candidate memory candidate = candidates[_candidateId];
        return (
            candidate.candidateId,
            candidate.userAddress,
            candidate.partyName,
            candidate.symbol,
            candidate.voteCount,
            candidate.electionId,
            candidate.approved
        );
    }
    
    function getElection(uint256 _electionId) external view validElection(_electionId) returns (
        uint256 electionId,
        string memory title,
        string memory description,
        bool isActive,
        bool isEnded,
        uint256[] memory candidateIds,
        uint256 startTime,
        uint256 endTime,
        uint256 votingStartDate,
        uint256 votingEndDate,
        uint256 resultAnnounceDate,
        bool resultAnnounced,
        bool paused,
        uint256 totalVotes
    ) {
        Election storage election = elections[_electionId];
        return (
            election.electionId,
            election.title,
            election.description,
            election.isActive,
            election.isEnded,
            election.candidateIds,
            election.startTime,
            election.endTime,
            election.votingStartDate,
            election.votingEndDate,
            election.resultAnnounceDate,
            election.resultAnnounced,
            election.paused,
            election.totalVotes
        );
    }
    
    function getElectionResults(uint256 _electionId) external view validElection(_electionId) returns (
        uint256[] memory candidateIds,
        uint256[] memory voteCounts
    ) {
        require(elections[_electionId].isEnded, "Election not ended");
        
        uint256[] memory electionCandidates = elections[_electionId].candidateIds;
        uint256[] memory votes = new uint256[](electionCandidates.length);
        
        for (uint256 i = 0; i < electionCandidates.length; i++) {
            votes[i] = candidates[electionCandidates[i]].voteCount;
        }
        
        return (electionCandidates, votes);
    }
    
    function hasUserVoted(uint256 _electionId, address _voter) external view validElection(_electionId) returns (bool) {
        return elections[_electionId].hasVoted[_voter];
    }
    
    function isUserEnrolled(uint256 _electionId, address _voter) external view validElection(_electionId) returns (bool) {
        return elections[_electionId].enrolledVoters[_voter];
    }
    
    function getPendingUsers() external view returns (address[] memory) {
        return pendingUserApprovals;
    }
    
    function getPendingCandidates() external view returns (uint256[] memory) {
        return pendingCandidateApprovals;
    }
    
    function getAllElections() external view returns (uint256[] memory) {
        return allElectionIds;
    }
    
    function getAllCandidates() external view returns (uint256[] memory) {
        return allCandidateIds;
    }
    
    function getAllUsers() external view returns (address[] memory) {
        return allUserAddresses;
    }
    
    // Emergency Functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Internal Functions
    function _removeFromPendingUsers(address _userAddress) internal {
        for (uint256 i = 0; i < pendingUserApprovals.length; i++) {
            if (pendingUserApprovals[i] == _userAddress) {
                pendingUserApprovals[i] = pendingUserApprovals[pendingUserApprovals.length - 1];
                pendingUserApprovals.pop();
                break;
            }
        }
    }
    
    function _removeFromPendingCandidates(uint256 _candidateId) internal {
        for (uint256 i = 0; i < pendingCandidateApprovals.length; i++) {
            if (pendingCandidateApprovals[i] == _candidateId) {
                pendingCandidateApprovals[i] = pendingCandidateApprovals[pendingCandidateApprovals.length - 1];
                pendingCandidateApprovals.pop();
                break;
            }
        }
    }
    
    // Auto-management functions (can be called by anyone to update election states)
    function updateElectionState(uint256 _electionId) external validElection(_electionId) {
        Election storage election = elections[_electionId];
        
        if (!election.paused && !election.isEnded) {
            // Auto start election if voting period has begun
            if (!election.isActive && block.timestamp >= election.votingStartDate) {
                election.isActive = true;
                election.startTime = block.timestamp;
                emit ElectionStarted(_electionId);
            }
            
            // Auto end election if voting period has ended
            if (election.isActive && block.timestamp >= election.votingEndDate) {
                election.isActive = false;
                election.isEnded = true;
                election.endTime = block.timestamp;
                emit ElectionEnded(_electionId);
            }
            
            // Auto announce results if announcement time has arrived
            if (election.isEnded && !election.resultAnnounced && block.timestamp >= election.resultAnnounceDate) {
                election.resultAnnounced = true;
            }
        }
    }
}