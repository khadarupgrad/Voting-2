import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Election, Candidate } from '@/types/blockchain';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useToast } from '@/hooks/use-toast';
import { Vote, User } from 'lucide-react';

interface VotingDialogProps {
  election: Election;
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess?: () => void;
}

export const VotingDialog: React.FC<VotingDialogProps> = ({ 
  election, 
  isOpen, 
  onClose, 
  onVoteSuccess 
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [electionCandidates, setElectionCandidates] = useState<Candidate[]>([]);
  const { vote, allCandidates } = useBlockchain();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadElectionCandidates();
    }
  }, [isOpen, election.candidateIds, allCandidates]);

  const loadElectionCandidates = () => {
    const candidates = allCandidates.filter(
      candidate => election.candidateIds.includes(candidate.candidateId) && candidate.approved
    );
    setElectionCandidates(candidates);
  };

  const handleVote = async () => {
    if (!selectedCandidate) return;

    setIsLoading(true);
    try {
      await vote(election.electionId, parseInt(selectedCandidate));
      toast({
        title: "Vote Submitted",
        description: "Your vote has been successfully recorded on the blockchain.",
      });
      onVoteSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            {election.title}
          </DialogTitle>
          <DialogDescription>
            Select your preferred candidate. Your vote will be recorded on the blockchain and cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
            {electionCandidates.map((candidate) => (
              <div key={candidate.candidateId} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={candidate.candidateId.toString()} 
                  id={`candidate-${candidate.candidateId}`} 
                />
                <Label 
                  htmlFor={`candidate-${candidate.candidateId}`} 
                  className="flex-1 cursor-pointer"
                >
                  <Card className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{candidate.partyName}</div>
                          <div className="text-sm text-muted-foreground">
                            Address: {candidate.userAddress.slice(0, 6)}...{candidate.userAddress.slice(-4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl">{candidate.symbol}</div>
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {electionCandidates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No approved candidates available for this election.
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="civic" 
              onClick={handleVote}
              disabled={!selectedCandidate || isLoading}
              className="flex-1"
            >
              {isLoading ? "Submitting Vote..." : "Submit Vote"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};