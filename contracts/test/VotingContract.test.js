const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingContract", function () {
  let VotingContract;
  let votingContract;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    VotingContract = await ethers.getContractFactory("VotingContract");
    votingContract = await VotingContract.deploy();
    await votingContract.waitForDeployment();
  });

  describe("User Registration", function () {
    it("Should allow user registration", async function () {
      await votingContract.connect(user1).requestUserRegistration("Alice");
      
      const [name, isRegistered, isCandidate, approved] = await votingContract.getUser(user1.address);
      expect(name).to.equal("Alice");
      expect(isRegistered).to.be.false;
      expect(approved).to.be.false;
    });

    it("Should not allow empty name registration", async function () {
      await expect(
        votingContract.connect(user1).requestUserRegistration("")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not allow duplicate registration", async function () {
      await votingContract.connect(user1).requestUserRegistration("Alice");
      
      await expect(
        votingContract.connect(user1).requestUserRegistration("Alice Again")
      ).to.be.revertedWith("User already registered");
    });
  });

  describe("User Approval", function () {
    beforeEach(async function () {
      await votingContract.connect(user1).requestUserRegistration("Alice");
    });

    it("Should allow owner to approve user", async function () {
      await votingContract.connect(owner).approveUser(user1.address);
      
      const [, isRegistered, , approved] = await votingContract.getUser(user1.address);
      expect(isRegistered).to.be.true;
      expect(approved).to.be.true;
    });

    it("Should not allow non-owner to approve user", async function () {
      await expect(
        votingContract.connect(user2).approveUser(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Candidate Registration", function () {
    beforeEach(async function () {
      await votingContract.connect(user1).requestUserRegistration("Alice");
      await votingContract.connect(owner).approveUser(user1.address);
    });

    it("Should allow candidate registration", async function () {
      await votingContract.connect(user1).requestCandidateRegistration("Democratic Party", "🦅");
      
      const [, , , , , , approved] = await votingContract.getCandidate(1);
      expect(approved).to.be.false;
    });

    it("Should not allow candidate registration without user registration", async function () {
      await expect(
        votingContract.connect(user2).requestCandidateRegistration("Republican Party", "🐘")
      ).to.be.revertedWith("User not registered");
    });
  });

  describe("Election Management", function () {
    let futureDate1, futureDate2, futureDate3;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      futureDate1 = currentTime + 86400; // 1 day from now
      futureDate2 = currentTime + 172800; // 2 days from now
      futureDate3 = currentTime + 259200; // 3 days from now
    });

    it("Should allow owner to create election", async function () {
      await votingContract.connect(owner).createElection(
        "Presidential Election 2024",
        "Vote for the next president",
        futureDate1,
        futureDate2,
        futureDate3
      );

      const [, title, description, isActive, isEnded] = await votingContract.getElection(1);
      expect(title).to.equal("Presidential Election 2024");
      expect(description).to.equal("Vote for the next president");
      expect(isActive).to.be.false;
      expect(isEnded).to.be.false;
    });

    it("Should not allow invalid election dates", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      
      await expect(
        votingContract.connect(owner).createElection(
          "Invalid Election",
          "Invalid dates",
          currentTime - 1000, // Past date
          futureDate2,
          futureDate3
        )
      ).to.be.revertedWith("Voting start date must be in the future");
    });
  });

  describe("Voting Process", function () {
    let electionId;
    let candidateId;
    let futureDate1, futureDate2, futureDate3;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      futureDate1 = currentTime + 86400;
      futureDate2 = currentTime + 172800;
      futureDate3 = currentTime + 259200;

      // Register and approve users
      await votingContract.connect(user1).requestUserRegistration("Alice");
      await votingContract.connect(user2).requestUserRegistration("Bob");
      await votingContract.connect(owner).approveUser(user1.address);
      await votingContract.connect(owner).approveUser(user2.address);

      // Register and approve candidate
      await votingContract.connect(user1).requestCandidateRegistration("Democratic Party", "🦅");
      await votingContract.connect(owner).approveCandidate(1);

      // Create election
      electionId = 1;
      await votingContract.connect(owner).createElection(
        "Test Election",
        "Test Description",
        futureDate1,
        futureDate2,
        futureDate3
      );

      // Add candidate to election
      candidateId = 1;
      await votingContract.connect(owner).addCandidateToElection(electionId, candidateId);
    });

    it("Should allow voter enrollment", async function () {
      await votingContract.connect(user2).enrollToVote(electionId);
      
      const isEnrolled = await votingContract.isUserEnrolled(electionId, user2.address);
      expect(isEnrolled).to.be.true;
    });

    it("Should allow voting when election is active", async function () {
      // Enroll voter
      await votingContract.connect(user2).enrollToVote(electionId);
      
      // Start election
      await votingContract.connect(owner).startElection(electionId);
      
      // Vote
      await votingContract.connect(user2).vote(electionId, candidateId);
      
      // Check vote was recorded
      const hasVoted = await votingContract.hasUserVoted(electionId, user2.address);
      expect(hasVoted).to.be.true;
      
      const [, , , , voteCount] = await votingContract.getCandidate(candidateId);
      expect(voteCount).to.equal(1);
    });

    it("Should not allow double voting", async function () {
      await votingContract.connect(user2).enrollToVote(electionId);
      await votingContract.connect(owner).startElection(electionId);
      await votingContract.connect(user2).vote(electionId, candidateId);
      
      await expect(
        votingContract.connect(user2).vote(electionId, candidateId)
      ).to.be.revertedWith("Already voted");
    });

    it("Should not allow voting without enrollment", async function () {
      await votingContract.connect(owner).startElection(electionId);
      
      await expect(
        votingContract.connect(user2).vote(electionId, candidateId)
      ).to.be.revertedWith("Not enrolled to vote");
    });
  });

  describe("Election Results", function () {
    let electionId;
    let candidateId1, candidateId2;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const futureDate1 = currentTime + 86400;
      const futureDate2 = currentTime + 172800;
      const futureDate3 = currentTime + 259200;

      // Setup users and candidates
      await votingContract.connect(user1).requestUserRegistration("Alice");
      await votingContract.connect(user2).requestUserRegistration("Bob");
      await votingContract.connect(user3).requestUserRegistration("Charlie");
      
      await votingContract.connect(owner).approveUser(user1.address);
      await votingContract.connect(owner).approveUser(user2.address);
      await votingContract.connect(owner).approveUser(user3.address);

      await votingContract.connect(user1).requestCandidateRegistration("Party A", "🦅");
      await votingContract.connect(user2).requestCandidateRegistration("Party B", "🐘");
      
      await votingContract.connect(owner).approveCandidate(1);
      await votingContract.connect(owner).approveCandidate(2);

      // Create election
      electionId = 1;
      candidateId1 = 1;
      candidateId2 = 2;
      
      await votingContract.connect(owner).createElection(
        "Test Election",
        "Test Description",
        futureDate1,
        futureDate2,
        futureDate3
      );

      await votingContract.connect(owner).addCandidateToElection(electionId, candidateId1);
      await votingContract.connect(owner).addCandidateToElection(electionId, candidateId2);
    });

    it("Should return election results after election ends", async function () {
      // Enroll and vote
      await votingContract.connect(user3).enrollToVote(electionId);
      await votingContract.connect(owner).startElection(electionId);
      await votingContract.connect(user3).vote(electionId, candidateId1);
      
      // End election
      await votingContract.connect(owner).endElection(electionId);
      
      // Get results
      const [candidateIds, voteCounts] = await votingContract.getElectionResults(electionId);
      expect(candidateIds.length).to.equal(2);
      expect(voteCounts[0]).to.equal(1); // candidateId1 got 1 vote
      expect(voteCounts[1]).to.equal(0); // candidateId2 got 0 votes
    });

    it("Should not return results before election ends", async function () {
      await votingContract.connect(owner).startElection(electionId);
      
      await expect(
        votingContract.getElectionResults(electionId)
      ).to.be.revertedWith("Election not ended");
    });
  });
});