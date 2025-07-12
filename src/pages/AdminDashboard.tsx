import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserCheck, Users, Plus, Play, Square, BarChart3, Calendar as CalendarIcon, Pause, Edit, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Candidate } from '@/types/blockchain';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export const AdminDashboard = () => {
  const {
    pendingUsers,
    pendingCandidates,
    elections,
    allCandidates,
    isContractMode,
    isLoading,
    approveUser,
    approveCandidate,
    createElection,
    addCandidateToElection,
    startElection,
    endElection,
    pauseElection,
    updateElectionDates,
    getElectionResults,
  } = useBlockchain();

  const [newElectionTitle, setNewElectionTitle] = useState('');
  const [newElectionDescription, setNewElectionDescription] = useState('');
  const [votingStartDate, setVotingStartDate] = useState<Date>();
  const [votingEndDate, setVotingEndDate] = useState<Date>();
  const [resultAnnounceDate, setResultAnnounceDate] = useState<Date>();
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [isCreateElectionOpen, setIsCreateElectionOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [isEditDatesOpen, setIsEditDatesOpen] = useState(false);
  const [editElectionId, setEditElectionId] = useState<number | null>(null);
  const [electionResults, setElectionResults] = useState<Record<number, Candidate[]>>({});
  const [loadingResults, setLoadingResults] = useState<Record<number, boolean>>({});

  const { toast } = useToast();

  useEffect(() => {
    // Load results for ended elections
    elections.forEach(election => {
      if (election.isEnded && !electionResults[election.electionId]) {
        loadElectionResults(election.electionId);
      }
    });
    console.log("MAIN")
  }, [elections]);

  const loadElectionResults = async (electionId: number) => {
    setLoadingResults(prev => ({ ...prev, [electionId]: true }));
    try {
      const results = await getElectionResults(electionId);
      setElectionResults(prev => ({ ...prev, [electionId]: results }));
    } catch (error) {
      console.error('Failed to load election results:', error);
    } finally {
      setLoadingResults(prev => ({ ...prev, [electionId]: false }));
    }
  };

  const handleApproveUser = async (userAddress: string) => {
    try {
      await approveUser(userAddress);
      toast({
        title: "User Approved",
        description: "User has been approved and can now participate in elections.",
      });
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveCandidate = async (candidateId: number) => {
    try {
      await approveCandidate(candidateId);
      toast({
        title: "Candidate Approved",
        description: "Candidate has been approved and can be added to elections.",
      });
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve candidate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateElection = async () => {
    if (!newElectionTitle.trim() || !newElectionDescription.trim() || !votingStartDate || !votingEndDate || !resultAnnounceDate) return;

    try {
      await createElection(
        newElectionTitle,
        newElectionDescription,
        votingStartDate.getTime(),
        votingEndDate.getTime(),
        resultAnnounceDate.getTime()
      );
      toast({
        title: "Election Created",
        description: "New election has been created successfully.",
      });
      setNewElectionTitle('');
      setNewElectionDescription('');
      setVotingStartDate(undefined);
      setVotingEndDate(undefined);
      setResultAnnounceDate(undefined);
      setIsCreateElectionOpen(false);
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create election. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCandidate = async () => {
    if (!selectedElection || !selectedCandidate) return;

    try {
      await addCandidateToElection(parseInt(selectedElection), parseInt(selectedCandidate));
      toast({
        title: "Candidate Added",
        description: "Candidate has been added to the election.",
      });
      setSelectedElection('');
      setSelectedCandidate('');
      setIsAddCandidateOpen(false);
    } catch (error: any) {
      toast({
        title: "Addition Failed",
        description: error.message || "Failed to add candidate to election. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartElection = async (electionId: number) => {
    try {
      await startElection(electionId);
      toast({
        title: "Election Started",
        description: "Election is now active and voting can begin.",
      });
    } catch (error: any) {
      toast({
        title: "Start Failed",
        description: error.message || "Failed to start election. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEndElection = async (electionId: number) => {
    try {
      await endElection(electionId);
      toast({
        title: "Election Ended",
        description: "Election has been ended and results are available.",
      });
    } catch (error: any) {
      toast({
        title: "End Failed",
        description: error.message || "Failed to end election. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePauseElection = async (electionId: number) => {
    try {
      await pauseElection(electionId);
      toast({
        title: "Election Status Changed",
        description: "Election has been paused/resumed.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update election status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDates = async () => {
    if (!editElectionId || !votingStartDate || !votingEndDate || !resultAnnounceDate) return;

    try {
      await updateElectionDates(
        editElectionId,
        votingStartDate.getTime(),
        votingEndDate.getTime(),
        resultAnnounceDate.getTime()
      );
      toast({
        title: "Dates Updated",
        description: "Election dates have been updated successfully.",
      });
      setIsEditDatesOpen(false);
      setEditElectionId(null);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update election dates. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDates = (election: any) => {
    setEditElectionId(election.electionId);
    setVotingStartDate(new Date(election.votingStartDate));
    setVotingEndDate(new Date(election.votingEndDate));
    setResultAnnounceDate(new Date(election.resultAnnounceDate));
    setIsEditDatesOpen(true);
  };

  const approvedCandidates = allCandidates.filter(c => c.approved);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }
  console.log("ADMIN DASHBOARD")
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, candidates, and elections
              <Badge variant="success" className="ml-2">opBNB Testnet</Badge>
            </p>
          </div>
        </div>

        {/* Pending User Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending User Registrations
              {pendingUsers.length > 0 && (
                <Badge variant="warning">{pendingUsers.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <p className="text-muted-foreground">No pending user registrations.</p>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div key={user.address} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {user.address.slice(0, 6)}...{user.address.slice(-4)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleApproveUser(user.address)}
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Candidate Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending Candidate Registrations
              {pendingCandidates.length > 0 && (
                <Badge variant="warning">{pendingCandidates.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCandidates.length === 0 ? (
              <p className="text-muted-foreground">No pending candidate registrations.</p>
            ) : (
              <div className="space-y-3">
                {pendingCandidates.map((candidate) => (
                  <div key={candidate.candidateId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{candidate.partyName} {candidate.symbol}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {candidate.userAddress.slice(0, 6)}...{candidate.userAddress.slice(-4)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleApproveCandidate(candidate.candidateId)}
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Election Management */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold mb-2 text-primary">All Elections</h2>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Election Management
              </div>
              <div className="flex gap-2">
                {/* Create Election Dialog */}
                <Dialog open={isCreateElectionOpen} onOpenChange={setIsCreateElectionOpen}>
                  <DialogTrigger asChild>
                    <Button variant="civic">
                      <Plus className="mr-1 h-4 w-4" />
                      Create Election
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Election</DialogTitle>
                      <DialogDescription>
                        Create a new election that candidates can participate in.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={newElectionTitle}
                          onChange={(e) => setNewElectionTitle(e.target.value)}
                          placeholder="Election title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newElectionDescription}
                          onChange={(e) => setNewElectionDescription(e.target.value)}
                          placeholder="Election description"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Voting Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !votingStartDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {votingStartDate ? format(votingStartDate, "PPP") : "Pick start date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={votingStartDate}
                                onSelect={setVotingStartDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Voting End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !votingEndDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {votingEndDate ? format(votingEndDate, "PPP") : "Pick end date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={votingEndDate}
                                onSelect={setVotingEndDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Result Announce Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !resultAnnounceDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {resultAnnounceDate ? format(resultAnnounceDate, "PPP") : "Pick announce date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={resultAnnounceDate}
                                onSelect={setResultAnnounceDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateElectionOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="civic"
                          onClick={handleCreateElection}
                          className="flex-1"
                          disabled={!newElectionTitle.trim() || !newElectionDescription.trim() || !votingStartDate || !votingEndDate || !resultAnnounceDate}
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {/* Add Candidate Dialog */}
                <Dialog open={isAddCandidateOpen} onOpenChange={setIsAddCandidateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Candidate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Candidate to Election</DialogTitle>
                      <DialogDescription>
                        Add an approved candidate to an election.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Election</Label>
                        <Select value={selectedElection} onValueChange={setSelectedElection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select election" />
                          </SelectTrigger>
                          <SelectContent>
                            {elections.filter(e => !e.isEnded).map((election) => (
                              <SelectItem key={election.electionId} value={election.electionId.toString()}>
                                {election.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Candidate</Label>
                        <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select candidate" />
                          </SelectTrigger>
                          <SelectContent>
                            {approvedCandidates.map((candidate) => (
                              <SelectItem key={candidate.candidateId} value={candidate.candidateId.toString()}>
                                {candidate.partyName} {candidate.symbol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddCandidateOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="civic"
                          onClick={handleAddCandidate}
                          className="flex-1"
                          disabled={!selectedElection || !selectedCandidate}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {/* Edit Election Dates Dialog */}
                <Dialog open={isEditDatesOpen} onOpenChange={setIsEditDatesOpen}>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Edit Election Dates</DialogTitle>
                      <DialogDescription>
                        Update the election timeline dates.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Voting Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !votingStartDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {votingStartDate ? format(votingStartDate, "PPP") : "Pick start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={votingStartDate}
                              onSelect={setVotingStartDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Voting End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !votingEndDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {votingEndDate ? format(votingEndDate, "PPP") : "Pick end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={votingEndDate}
                              onSelect={setVotingEndDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Result Announce Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !resultAnnounceDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {resultAnnounceDate ? format(resultAnnounceDate, "PPP") : "Pick announce date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={resultAnnounceDate}
                              onSelect={setResultAnnounceDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditDatesOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="civic"
                        onClick={handleUpdateDates}
                        className="flex-1"
                        disabled={!votingStartDate || !votingEndDate || !resultAnnounceDate}
                      >
                        Update Dates
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {elections.length === 0 ? (
              <p className="text-muted-foreground">No elections created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voting Dates</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {elections.map((election) => {
                      const [showMore, setShowMore] = useState(false);
                      const truncated = election.description.length > 60 && !showMore;
                      return (
                        <>
                          <tr key={election.electionId} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2 max-w-xs align-top">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <div className="font-semibold truncate max-w-[180px]">{election.title}</div>
                                    <div className="text-xs text-muted-foreground max-w-[220px] truncate">
                                      {truncated ? election.description.slice(0, 60) + '...' : election.description}
                                      {election.description.length > 60 && (
                                        <button
                                          className="ml-2 text-primary underline text-xs focus:outline-none"
                                          onClick={() => setShowMore((prev) => !prev)}
                                        >
                                          {showMore ? 'Show Less' : 'Show More'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs whitespace-pre-line">
                                  <div className="font-bold mb-1">{election.title}</div>
                                  <div className="text-xs text-muted-foreground">{election.description}</div>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-1 min-h-[28px]">
                                {election.paused && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="warning" className="flex items-center gap-1"><Pause className="w-4 h-4 mr-1 align-middle" />Paused</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Paused</TooltipContent>
                                  </Tooltip>
                                )}
                                {election.isEnded && election.resultAnnounced ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="success" className="flex items-center gap-1"><BarChart3 className="w-4 h-4 mr-1 align-middle" />Results</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Results Announced</TooltipContent>
                                  </Tooltip>
                                ) : election.isEnded ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" className="flex items-center gap-1"><Square className="w-4 h-4 mr-1 align-middle" />Ended</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Ended</TooltipContent>
                                  </Tooltip>
                                ) : election.isActive ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-success text-success-foreground flex items-center gap-1"><Play className="w-4 h-4 mr-1 align-middle" />Active</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Active</TooltipContent>
                                  </Tooltip>
                                ) :<></>
                                // : (
                                //   <Tooltip>
                                //     <TooltipTrigger asChild>
                                //       <Badge variant="outline" className="flex items-center gap-1" style={{ height: 24 }}>
                                //         <Clock className="w-4 h-4 mr-1 text-primary align-middle" />
                                //         <span className="inline-block align-middle">Upcoming</span>
                                //       </Badge>
                                //     </TooltipTrigger>
                                //     <TooltipContent>Upcoming</TooltipContent>
                                //   </Tooltip>
                                // )
                                }
                              </div>
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {format(new Date(election.votingStartDate), "MMM dd")} - {format(new Date(election.votingEndDate), "MMM dd, yyyy")}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {election.candidateIds.length}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-wrap gap-2">
                                {!election.isActive && !election.isEnded && (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleStartElection(election.electionId)}
                                    disabled={election.candidateIds.length === 0}
                                    title="Start Election"
                                  >
                                    <Play className="mr-1 h-3 w-3" />
                                  </Button>
                                )}
                                {(election.isActive || !election.isEnded) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePauseElection(election.electionId)}
                                    title={election.paused ? 'Resume Election' : 'Pause Election'}
                                  >
                                    <Pause className="mr-1 h-3 w-3" />
                                  </Button>
                                )}
                                {!election.isEnded && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDates(election)}
                                    title="Edit Dates"
                                  >
                                    <Edit className="mr-1 h-3 w-3" />
                                  </Button>
                                )}
                                {election.isActive && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleEndElection(election.electionId)}
                                    title="End Election"
                                  >
                                    <Square className="mr-1 h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {/* Results bar chart row */}
                          {election.isEnded && electionResults[election.electionId]?.length > 0 && (
                            <tr>
                              <td colSpan={5} className="bg-muted/50 px-6 py-4">
                                <div className="max-w-2xl mx-auto">
                                  <div className="text-sm font-semibold mb-2 text-primary">Results</div>
                                  {(() => {
                                    const results = electionResults[election.electionId];
                                    const maxVotes = Math.max(...results.map(c => c.voteCount), 1);
                                    return results.map(candidate => (
                                      <div key={candidate.candidateId} className="flex items-center gap-3 mb-2">
                                        {/* Avatar or Initials */}
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs shadow-sm">
                                          {candidate.partyName?.[0] || '?'}
                                        </div>
                                        <span className="w-32 truncate text-xs font-medium">{candidate.partyName} {candidate.symbol}</span>
                                        <div className="flex-1 bg-gray-200 rounded h-5 relative overflow-hidden shadow-sm">
                                          <div
                                            className="bg-primary h-5 rounded transition-all duration-300"
                                            style={{ width: `${(candidate.voteCount / maxVotes) * 100}%`, minWidth: 8 }}
                                          />
                                        </div>
                                        <span className="ml-2 text-xs font-semibold min-w-[32px] text-right">{candidate.voteCount}</span>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Election Results Bar Charts */}
        
      </div>
    </div>
  );
};