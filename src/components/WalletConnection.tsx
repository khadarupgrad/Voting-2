import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/useWallet';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Wallet, Loader2, AlertTriangle, Network } from 'lucide-react';

interface WalletConnectionProps {
  children?: React.ReactNode;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ children }) => {
  const { 
    isConnected, 
    userAddress, 
    isCorrectNetwork, 
    connectWallet, 
    disconnectWallet, 
    switchToOpBNB 
  } = useWallet();
  const { isLoading } = useBlockchain();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your MetaMask wallet to participate in blockchain voting on opBNB Testnet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Network className="h-4 w-4" />
              <AlertDescription>
                This application requires opBNB Testnet. The network will be added automatically when you connect.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={connectWallet} 
              className="w-full" 
              variant="civic"
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect MetaMask
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-warning" />
            </div>
            <CardTitle>Wrong Network</CardTitle>
            <CardDescription>
              Please switch to opBNB Testnet to use this application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're connected to the wrong network. This application only works on opBNB Testnet.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button 
                onClick={switchToOpBNB} 
                className="w-full" 
                variant="civic"
                size="lg"
              >
                <Network className="mr-2 h-5 w-5" />
                Switch to opBNB Testnet
              </Button>
              <Button 
                onClick={disconnectWallet} 
                className="w-full" 
                variant="outline"
              >
                Disconnect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Connecting to smart contract on opBNB Testnet...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">BlockVote</h1>
            <span className="text-sm text-muted-foreground">
              Decentralized Voting Platform
            </span>
            <Badge variant="success">
              opBNB Testnet
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {userAddress && `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}
            </span>
            <Button variant="outline" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
};