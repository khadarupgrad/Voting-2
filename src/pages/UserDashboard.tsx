import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ElectionCard } from '@/components/ElectionCard';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { User, Vote, CheckCircle } from 'lucide-react';

export const UserDashboard = () => {
  const { currentUser, elections, hasUserVoted } = useBlockchain();

  if (!currentUser) return null;

  const activeElections = elections.filter(e => e.isActive);
  const upcomingElections = elections.filter(e => !e.isActive && !e.isEnded);
  const pastElections = elections.filter(e => e.isEnded);

  const isEnrolled = (electionId: number) => 
    currentUser.registeredElectionIds.includes(electionId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Name:</span>
                <span>{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Address:</span>
                <span className="font-mono text-sm">
                  {currentUser.address.slice(0, 6)}...{currentUser.address.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <div className="flex gap-2">
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified Voter
                  </Badge>
                  {currentUser.isCandidate && (
                    <Badge variant="outline">Candidate</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Elections */}
        {activeElections.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Vote className="h-6 w-6 text-primary" />
              Active Elections
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {activeElections.map((election) => (
                <ElectionCard
                  key={election.electionId}
                  election={election}
                  isEnrolled={isEnrolled(election.electionId)}
                  hasVoted={hasUserVoted(election.electionId)}
                  canEnroll={currentUser.approved}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Elections */}
        {upcomingElections.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Upcoming Elections</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingElections.map((election) => (
                <ElectionCard
                  key={election.electionId}
                  election={election}
                  isEnrolled={isEnrolled(election.electionId)}
                  hasVoted={hasUserVoted(election.electionId)}
                  canEnroll={currentUser.approved}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Elections */}
        {pastElections.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Past Elections</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pastElections.map((election) => (
                <ElectionCard
                  key={election.electionId}
                  election={election}
                  isEnrolled={isEnrolled(election.electionId)}
                  hasVoted={hasUserVoted(election.electionId)}
                  canEnroll={currentUser.approved}
                />
              ))}
            </div>
          </div>
        )}

        {elections.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <CardDescription>
                No elections available at the moment. Check back later!
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};