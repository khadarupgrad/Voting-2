import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Trophy, TrendingUp, Users, Vote } from 'lucide-react';
import { ElectionCard } from '@/components/ElectionCard';
import React, { useEffect, useState } from 'react';

export const CandidateDashboard = () => {
  const { currentUser, elections, allCandidates, getElectionResults } = useBlockchain();

  if (!currentUser) return null;

  const myCandidateProfiles = allCandidates.filter(c => c.userAddress === currentUser.address);
  const myActiveElections = elections.filter(e => 
    e.isActive && e.candidateIds.some(cId => 
      myCandidateProfiles.some(cp => cp.candidateId === cId)
    )
  );
  const myPastElections = elections.filter(e => 
    e.isEnded && e.candidateIds.some(cId => 
      myCandidateProfiles.some(cp => cp.candidateId === cId)
    )
  );

  const [electionResults, setElectionResults] = useState<{ [electionId: number]: any[] }>({});

  useEffect(() => {
    // Load results for all past elections
    myPastElections.forEach(election => {
      if (!electionResults[election.electionId]) {
        getElectionResults(election.electionId).then(results => {
          setElectionResults(prev => ({ ...prev, [election.electionId]: results }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPastElections, getElectionResults]);

  const getTotalVotes = () => {
    return myCandidateProfiles.reduce((total, candidate) => total + candidate.voteCount, 0);
  };

  const getElectionPosition = (electionId: number) => {
    const results = electionResults[electionId] || [];
    const myCandidate = myCandidateProfiles.find(cp => cp.electionId === electionId);
    if (!myCandidate) return null;
    
    const position = results.findIndex(r => r.candidateId === myCandidate.candidateId) + 1;
    return { position, total: results.length, votes: myCandidate.voteCount };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
            <p className="text-muted-foreground">Monitor your campaign performance</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalVotes()}</div>
              <p className="text-xs text-muted-foreground">
                Across all elections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myActiveElections.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCandidateProfiles.length}</div>
              <p className="text-xs text-muted-foreground">
                Participated in
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Candidate Profiles */}
        <Card>
          <CardHeader>
            <CardTitle>My Candidate Profiles</CardTitle>
            <CardDescription>Your registered political parties and platforms</CardDescription>
          </CardHeader>
          <CardContent>
            {myCandidateProfiles.length === 0 ? (
              <p className="text-muted-foreground">No candidate profiles found.</p>
            ) : (
              <div className="space-y-3">
                {myCandidateProfiles.map((candidate) => (
                  <div key={candidate.candidateId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{candidate.symbol}</div>
                      <div>
                        <div className="font-medium">{candidate.partyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.voteCount} votes received
                        </div>
                      </div>
                    </div>
                    <Badge className={candidate.approved ? "bg-success text-success-foreground" : ""}>
                      {candidate.approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Elections - allow candidate to cast vote */}
        {myActiveElections.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Vote className="h-6 w-6 text-primary" />
              Active Elections (Cast Your Vote)
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {myActiveElections.map((election) => (
                <ElectionCard
                  key={election.electionId}
                  election={election}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Elections */}
        {myActiveElections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Active Elections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myActiveElections.map((election) => {
                  const myCandidate = myCandidateProfiles.find(cp => 
                    election.candidateIds.includes(cp.candidateId)
                  );
                  return (
                    <div key={election.electionId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{election.title}</h3>
                          <p className="text-sm text-muted-foreground">{election.description}</p>
                        </div>
                        <Badge className="bg-success text-success-foreground">Active</Badge>
                      </div>
                      {myCandidate && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Running as: {myCandidate.partyName} {myCandidate.symbol}</span>
                          <span className="font-medium">{myCandidate.voteCount} votes</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Elections Results */}
        {myPastElections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Election Results</CardTitle>
              <CardDescription>Your performance in completed elections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myPastElections.map((election) => {
                  const position = getElectionPosition(election.electionId);
                  const myCandidate = myCandidateProfiles.find(cp => 
                    election.candidateIds.includes(cp.candidateId)
                  );
                  
                  return (
                    <div key={election.electionId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{election.title}</h3>
                          <p className="text-sm text-muted-foreground">{election.description}</p>
                        </div>
                        <Badge variant="secondary">Ended</Badge>
                      </div>
                      {position && myCandidate && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Position:</span>
                            <div className="font-medium">
                              {position.position === 1 && "🥇 "}
                              {position.position === 2 && "🥈 "}
                              {position.position === 3 && "🥉 "}
                              #{position.position} of {position.total}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Votes:</span>
                            <div className="font-medium">{position.votes}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Party:</span>
                            <div className="font-medium">{myCandidate.partyName} {myCandidate.symbol}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};