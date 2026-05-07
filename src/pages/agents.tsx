import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Server,
  RefreshCw,
  Loader2,
  Trash2,
  Activity,
  Plus,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

interface Agent {
  id: string;
  name: string;
  host: string;
  hostname: string;
  ip_address: string;
  status: string;
  last_seen: string;
  version: string;
  tags?: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingAgent, setAddingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    host: "",
    tags: "",
    description: "",
  });
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/v1/agents`);
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      const result = await response.json();
      setAgents(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete agent");
      }
      await fetchAgents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete agent");
    }
  };

  const addAgent = async () => {
    if (!newAgent.name || !newAgent.host) {
      alert("Please fill in required fields: Name and Host");
      return;
    }

    try {
      setAddingAgent(true);
      const tagsArray = newAgent.tags
        ? newAgent.tags.split(",").map((t) => t.trim()).filter((t) => t)
        : [];

      const response = await fetch(`${API_BASE_URL}/api/v1/agents/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newAgent.name,
          host: newAgent.host,
          tags: tagsArray,
          description: newAgent.description,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to register agent");
      }

      const result = await response.json();
      setCreatedAgent(result.data);
      setShowInstructions(true);
      
      // Reset form
      setNewAgent({
        name: "",
        host: "",
        tags: "",
        description: "",
      });

      // Refresh list
      await fetchAgents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add agent");
    } finally {
      setAddingAgent(false);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setShowInstructions(false);
    setCreatedAgent(null);
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status: string, lastSeen: string) => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    // If last seen more than 5 minutes ago, mark as offline
    if (diffMins > 5) {
      return { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/30", label: "offline" };
    }

    if (status === "online") {
      return { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30", label: "online" };
    }
    if (status === "error") {
      return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", label: "error" };
    }
    return { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/30", label: "offline" };
  };

  if (loading && agents.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] font-mono">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-primary animate-pulse">[</span>
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-primary animate-pulse">]</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">SCANNING_REMOTE_NODES...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest mb-1">
              <span className="text-primary">●</span> NODE_MANAGER
            </div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Agents</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              {agents.length} REGISTERED_NODES // {agents.filter(a => a.status === 'online').length} ONLINE
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-none font-bold uppercase text-[10px] tracking-widest px-4">
                  <Plus className="w-3 h-3 mr-2" />
                  REGISTER_NODE
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] font-mono rounded-none border-border">
                {!showInstructions ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="uppercase tracking-widest">ADD_NEW_AGENT</DialogTitle>
                      <DialogDescription className="text-[10px] uppercase">
                        INITIALIZING_AGENT_REGISTRATION_SEQUENCE
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 border-y border-border/50 my-4">
                      <div className="grid gap-1.5">
                        <Label htmlFor="name" className="text-[10px] uppercase tracking-widest">AGENT_IDENTIFIER *</Label>
                        <Input
                          id="name"
                          placeholder="PROD_SRV_01"
                          className="rounded-none border-border bg-muted/20 text-xs"
                          value={newAgent.name}
                          onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="host" className="text-[10px] uppercase tracking-widest">NETWORK_ADDR (ADDR:PORT) *</Label>
                        <Input
                          id="host"
                          placeholder="192.168.1.100:9090"
                          className="rounded-none border-border bg-muted/20 text-xs"
                          value={newAgent.host}
                          onChange={(e) => setNewAgent({ ...newAgent, host: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="tags" className="text-[10px] uppercase tracking-widest">METADATA_TAGS (CSV)</Label>
                        <Input
                          id="tags"
                          placeholder="PROD, API, BACKEND"
                          className="rounded-none border-border bg-muted/20 text-xs"
                          value={newAgent.tags}
                          onChange={(e) => setNewAgent({ ...newAgent, tags: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="description" className="text-[10px] uppercase tracking-widest">NODE_DESC</Label>
                        <Textarea
                          id="description"
                          placeholder="SYSTEM_PRIMARY_API"
                          className="rounded-none border-border bg-muted/20 text-xs min-h-[80px]"
                          value={newAgent.description}
                          onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={closeDialog} className="rounded-none uppercase text-[10px] tracking-widest">ABORT</Button>
                      <Button onClick={addAgent} disabled={addingAgent} className="rounded-none uppercase text-[10px] tracking-widest px-8">
                        {addingAgent ? "PROCESSING..." : "REGISTER"}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 uppercase tracking-widest">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        NODE_HANDSHAKE_SUCCESS
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                      <div className="border border-emerald-500/30 bg-emerald-500/5 p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] uppercase tracking-tighter border-b border-emerald-500/20 pb-2">
                            <span className="text-muted-foreground">IDENTIFIER</span>
                            <span className="font-bold">{createdAgent?.name}</span>
                          </div>
                          <div className="flex justify-between text-[10px] uppercase tracking-tighter border-b border-emerald-500/20 pb-2">
                            <span className="text-muted-foreground">ADDR_HOST</span>
                            <span className="font-bold">{createdAgent?.host}</span>
                          </div>
                          <div className="flex justify-between text-[10px] uppercase tracking-tighter">
                            <span className="text-muted-foreground">CONN_STATUS</span>
                            <span className="text-emerald-500 font-bold">ONLINE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={closeDialog} className="rounded-none uppercase text-[10px] tracking-widest w-full">ACKNOWLEDGE</Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
            <Button onClick={() => fetchAgents()} size="icon" variant="ghost" className="h-10 w-10 border border-border rounded-none" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {!error && agents.length === 0 && (
          <div className="border border-dashed border-border p-16 bg-muted/5">
            <div className="text-center space-y-6">
              <Server className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]">NO_AGENTS_FOUND</h3>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
                  LIST_IS_EMPTY // AWAITING_REGISTRATION
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)} variant="outline" className="rounded-none uppercase text-[10px] tracking-widest">
                <Plus className="w-3 h-3 mr-2" />
                INIT_NEW_NODE
              </Button>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        {agents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => {
              const statusInfo = getStatusColor(agent.status, agent.last_seen);
              return (
                <div key={agent.id} className="border border-border bg-card/30 group hover:border-primary transition-colors">
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 border border-border flex items-center justify-center ${statusInfo.bg}`}>
                          <Activity className={`w-4 h-4 ${statusInfo.color}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold uppercase tracking-widest truncate" title={agent.name}>
                            {agent.name}
                          </h3>
                          <p className="text-[8px] text-muted-foreground font-mono truncate" title={agent.hostname}>
                            {agent.hostname}
                          </p>
                        </div>
                      </div>
                      <div className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 border ${statusInfo.border} ${statusInfo.color} ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-tighter">
                        <span className="text-muted-foreground">HOST_ADDR</span>
                        <span className="font-bold truncate max-w-[150px]">{agent.host}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-tighter">
                        <span className="text-muted-foreground">LAST_SEEN</span>
                        <span className="font-bold">{formatDate(agent.last_seen).toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {agent.tags && agent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {agent.tags.map((tag, idx) => (
                          <span key={idx} className="text-[8px] font-bold uppercase border border-border px-1.5 py-0.5 bg-muted/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-[8px] font-mono opacity-50 text-muted-foreground tracking-widest">VER_{agent.version}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-none text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/30"
                        onClick={() => deleteAgent(agent.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {agents.length > 0 && (
          <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-[0.2em] border-t border-border pt-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>
                {agents.filter((a) => {
                  const diffMs = new Date().getTime() - new Date(a.last_seen).getTime();
                  return Math.floor(diffMs / 60000) <= 5 && a.status === "online";
                }).length}{" "}
                ACTIVE_NODES
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
              <span>
                {agents.filter((a) => {
                  const diffMs = new Date().getTime() - new Date(a.last_seen).getTime();
                  return Math.floor(diffMs / 60000) > 5 || a.status === "offline";
                }).length}{" "}
                STALE_NODES
              </span>
            </div>
            <div className="ml-auto">TOTAL_INDEX: {agents.length}</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
