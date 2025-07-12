import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Election } from '@/types/blockchain';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Vote, Clock, CheckCircle, Users } from 'lucide-react';
import { VotingDialog } from './VotingDialog';

interface ElectionCardProps {
  election: Election;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({ election }) => {
  const [showVoting, setShowVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { enrollToVote, currentUser, hasUserVoted, isUserEnrolled } = useBlockchain();

  useEffect(() => {
    checkUserStatus();
  }, [election.electionId, currentUser]);

  const checkUserStatus = async () => {
    if (!currentUser) return;
    
    try {
      const [enrolled, voted] = await Promise.all([
        isUserEnrolled(election.electionId),
        hasUserVoted(election.electionId)
      ]);
      setIsEnrolled(enrolled);
      setHasVoted(voted);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      await enrollToVote(election.electionId);
      await checkUserStatus();
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (election.isEnded) {
      return <Badge variant="secondary">Ended</Badge>;
    }
    if (election.isActive) {
      return <Badge className="bg-success text-success-foreground">Active</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const getActionButton = () => {
    if (!currentUser?.approved) {
      return (
        <Button variant="outline" disabled>
          <Users className="mr-2 h-4 w-4" />
          Registration Required
        </Button>
      );
    }

    if (hasVoted) {
      return (
        <Button variant="outline" disabled>
          <CheckCircle className="mr-2 h-4 w-4" />
          Vote Submitted
        </Button>
      );
    }

    if (isEnrolled && election.isActive) {
      return (
        <Button 
          variant="civic" 
          onClick={() => setShowVoting(true)}
        >
          <Vote className="mr-2 h-4 w-4" />
          Cast Vote
        </Button>
      );
    }

    if (!isEnrolled && !election.isEnded) {
      return (
        <Button 
          variant="default" 
          onClick={handleEnroll}
          disabled={isLoading}
        >
          <Users className="mr-2 h-4 w-4" />
          {isLoading ? "Enrolling..." : "Enroll to Vote"}
        </Button>
      );
    }

    return (
      <Button variant="outline" disabled>
        <Clock className="mr-2 h-4 w-4" />
        Not Available
      </Button>
    );
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{election.title}</CardTitle>
              <CardDescription>{election.description}</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Candidates: {election.candidateIds.length}
            </div>
            {getActionButton()}
          </div>
        </CardContent>
      </Card>

      {showVoting && (
        <VotingDialog
          election={election}
          isOpen={showVoting}
          onClose={() => setShowVoting(false)}
          onVoteSuccess={checkUserStatus}
        />
      )}
    </>
  );
};