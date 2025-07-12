import { useEffect, useState } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, Loader2, AlertTriangle } from 'lucide-react';

export const OwnerValidation = ({ children }: { children: React.ReactNode }) => {
  const { userAddress, isCorrectNetwork } = useWallet();
  const { userRole, isContractMode, isLoading } = useBlockchain();
  const [isCheckingOwner, setIsCheckingOwner] = useState(true);

  useEffect(() => {
    // Give some time for the blockchain context to initialize
    const timer = setTimeout(() => {
      setIsCheckingOwner(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [userRole]);

  if (!isCorrectNetwork) {
    return <>{children}</>;
  }

  if (isLoading || isCheckingOwner) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Checking smart contract permissions...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If contract is not available, show error
  if (!isContractMode) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="flex items-center justify-center gap-2">
              Smart Contract Not Available
              <Badge variant="destructive">Error</Badge>
            </CardTitle>
            <CardDescription>
              The voting smart contract is not deployed on opBNB Testnet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please deploy the VotingContract.sol to opBNB Testnet and update the contract address in the application.
              </AlertDescription>
            </Alert>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Steps to deploy:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Navigate to the contracts folder</li>
                <li>Configure your .env file with opBNB Testnet RPC</li>
                <li>Run: npm run deploy:opbnb</li>
                <li>Update the contract address in the UI</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is admin, show admin verification
  if (userRole === 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="flex items-center justify-center gap-2">
              Contract Owner Verified
              <Badge variant="success">Admin</Badge>
            </CardTitle>
            <CardDescription>
              You are the smart contract owner with full administrative privileges on opBNB Testnet.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Redirecting to admin dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular user flow
  return <>{children}</>;
};