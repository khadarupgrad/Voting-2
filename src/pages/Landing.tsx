import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RegistrationForm } from '@/components/RegistrationForm';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Shield, Vote, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export const Landing = () => {
  const { currentUser, userRole, isContractMode } = useBlockchain();
  if (!isContractMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-4xl font-bold text-foreground">
              Smart Contract Required
            </h1>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The voting smart contract is not deployed on opBNB Testnet. Please deploy the contract to use this application.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser && !currentUser.approved) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <div className="space-y-6 text-center">
          <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-yellow-800 mb-2">
              ⏳ Registration Pending
            </h2>
            <p className="text-yellow-700">
              Your registration request has been submitted and is awaiting admin approval on the blockchain.
            </p>

            {currentUser.isCandidate && (
              <p className="text-yellow-700 mt-2">
                Your candidate registration is also pending approval.
              </p>
            )}
          </div>

          <div className="text-sm text-gray-500">
            🔔 You will be notified once your registration is approved by the contract owner.
          </div>
        </div>
      </div>

    );
  }

  if (userRole === 'admin' || userRole === 'user' || userRole === 'candidate') {
    // Redirect to appropriate dashboard (handled by router)
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl font-bold text-foreground">
              BlockVote
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure, Transparent, Decentralized Voting on opBNB Testnet
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Participate in democratic elections powered by smart contracts on opBNB blockchain.
              Every vote is recorded transparently and securely on-chain.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Blockchain Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All votes are recorded on opBNB blockchain, ensuring complete transparency
                and preventing tampering or fraud through smart contract verification.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Vote className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Democratic Process</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Participate in fair elections with equal opportunity for all approved
                voters and candidates to shape the future through decentralized governance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Contract Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Citizens can register as voters or candidates through smart contracts,
                creating an immutable and trustless platform for democratic participation.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Registration Section */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Get Started</h2>
            <p className="text-muted-foreground">
              Register now to participate in upcoming elections on opBNB Testnet.
              All registrations require smart contract owner approval to ensure legitimacy.
            </p>
          </div>
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
};