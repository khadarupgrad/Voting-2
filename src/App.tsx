import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { WalletConnection } from "@/components/WalletConnection";
import { OwnerValidation } from "@/components/OwnerValidation";
import { BlockchainProvider, useBlockchain as useBlockchainBase } from "@/contexts/BlockchainContext";
import { Landing } from "@/pages/Landing";
import { UserDashboard } from "@/pages/UserDashboard";
import { CandidateDashboard } from "@/pages/CandidateDashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";

const queryClient = new QueryClient();

// Patch useBlockchain to include error type
const useBlockchain = () => useBlockchainBase() as ReturnType<typeof useBlockchainBase> & { error: string | null };

export const AppRoutes = () => {
  const { userRole, isContractMode, isLoading, error } = useBlockchain();
  const { isConnected, isCorrectNetwork } = useWallet();
  const [bootstrapped, setBootstrapped] = useState(false);
  // Remove useNavigate and navigation effect

  useEffect(() => {
    if (!isLoading) setBootstrapped(true);
  }, [isLoading]);

  // If not connected or wrong network, always show landing
  if (!isConnected || !isCorrectNetwork) {
    return <Landing />;
  }

  // If wallet is connected but contract is not loaded, show spinner
  if (!bootstrapped || isLoading || !isContractMode) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <div className="text-destructive font-bold text-lg mb-2">{error}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          userRole === 'admin' ? <Navigate to="/admin" replace /> :
            userRole === 'user' || userRole === 'candidate' ? <Navigate to="/dashboard" replace /> :
              <Landing />
        }
      />
      <Route
        path="/dashboard"
        element={
          userRole === 'user' ? <UserDashboard /> :
            userRole === 'candidate' ? <CandidateDashboard /> :
              <Navigate to="/" replace />
        }
      />
      <Route
        path="/candidate"
        element={
          userRole === 'candidate' ? <CandidateDashboard /> :
            <Navigate to="/" replace />
        }
      />
      <Route
        path="/admin"
        element={
          userRole === 'admin' ? <AdminDashboard /> :
            <Navigate to="/" replace />
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BlockchainProvider>
          <WalletConnection>
            {/* <OwnerValidation> */}
              <AppRoutes />
            {/* </OwnerValidation> */}
          </WalletConnection>
        </BlockchainProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;