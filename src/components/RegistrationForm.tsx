import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users } from 'lucide-react';

export const RegistrationForm = () => {
  const [name, setName] = useState('');
  const [wantsToBeCandidate, setWantsToBeCandidate] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [partySymbol, setPartySymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { requestRegistration, requestCandidateRegistration } = useBlockchain();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await requestRegistration(name);

      if (wantsToBeCandidate && partyName.trim() && partySymbol.trim()) {
        await requestCandidateRegistration(partyName, partySymbol);
        toast({
          title: "Registration Submitted",
          description: "Your voter and candidate registration requests have been submitted for admin approval.",
        });
      } else {
        toast({
          title: "Registration Submitted",
          description: "Your voter registration request has been submitted for admin approval.",
        });
      }

      // Reset form
      setName('');
      setWantsToBeCandidate(false);
      setPartyName('');
      setPartySymbol('');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.reason || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            Voter Registration
          </CardTitle>
          <CardDescription>
            Register to participate in democratic elections. All registrations require admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="candidate"
                checked={wantsToBeCandidate}
                onCheckedChange={(checked) => setWantsToBeCandidate(checked as boolean)}
              />
              <Label htmlFor="candidate" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                I also want to register as a candidate
              </Label>
            </div>

            {wantsToBeCandidate && (
              <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
                <h3 className="font-semibold">Candidate Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="partyName">Party Name</Label>
                  <Input
                    id="partyName"
                    type="text"
                    placeholder="Enter your party name"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    required={wantsToBeCandidate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partySymbol">Party Symbol</Label>
                  <Input
                    id="partySymbol"
                    type="text"
                    placeholder="Enter party symbol (e.g., 🦅, ⭐, 🌟)"
                    value={partySymbol}
                    onChange={(e) => setPartySymbol(e.target.value)}
                    required={wantsToBeCandidate}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              variant="civic"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};