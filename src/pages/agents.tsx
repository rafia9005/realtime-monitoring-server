import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  AlertCircle,
  Monitor,
  Clock,
  Trash2,
  Circle,
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
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading agents...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage monitoring agents across multiple servers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {!showInstructions ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Add New Agent</DialogTitle>
                      <DialogDescription>
                        Enter the agent name and host (address:port) of the running monitoring agent.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Agent Name *</Label>
                        <Input
                          id="name"
                          placeholder="Production Server 1"
                          value={newAgent.name}
                          onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="host">Host (address:port) *</Label>
                        <Input
                          id="host"
                          placeholder="localhost:9090 or 192.168.1.100:9090"
                          value={newAgent.host}
                          onChange={(e) => setNewAgent({ ...newAgent, host: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          The agent must be running and accessible at this address
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          placeholder="production, api, backend"
                          value={newAgent.tags}
                          onChange={(e) => setNewAgent({ ...newAgent, tags: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Main API backend server"
                          value={newAgent.description}
                          onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                      <Button onClick={addAgent} disabled={addingAgent}>
                        {addingAgent ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Agent"
                        )}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Agent Connected Successfully!
                      </DialogTitle>
                      <DialogDescription>
                        Agent <strong>{createdAgent?.name}</strong> is now connected and being monitored.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
                        <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Agent Details:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{createdAgent?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Host:</span>
                            <span className="font-mono text-xs">{createdAgent?.host}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-500">
                              <Circle className="w-2 h-2 mr-1 fill-current" />
                              Online
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-sm">
                        <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">What's Next?</p>
                        <p className="text-muted-foreground">
                          The agent is now being polled every 30 seconds. Metrics will appear on the dashboard shortly.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={closeDialog}>Done</Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
            <Button onClick={() => fetchAgents()} size="sm" variant="ghost" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!error && agents.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Server className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">No agents registered</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Add Agent" to register your first monitoring agent
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Agent
              </Button>
            </div>
          </Card>
        )}

        {/* Agents Grid */}
        {agents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const statusInfo = getStatusColor(agent.status, agent.last_seen);
              return (
                <Card key={agent.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="mt-1">
                          <Activity className={`w-5 h-5 ${statusInfo.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate" title={agent.name}>
                            {agent.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate" title={agent.hostname}>
                            {agent.hostname}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${statusInfo.bg} ${statusInfo.border} ${statusInfo.color} shrink-0`}
                      >
                        <Circle className="w-2 h-2 mr-1 fill-current" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Monitor className="w-4 h-4 shrink-0" />
                        <span className="truncate font-mono text-xs" title={agent.host}>
                          {agent.host}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Last seen {formatDate(agent.last_seen)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {agent.tags && agent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    {agent.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">v{agent.version}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteAgent(agent.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {agents.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              <span>
                {agents.filter((a) => {
                  const diffMs = new Date().getTime() - new Date(a.last_seen).getTime();
                  return Math.floor(diffMs / 60000) <= 5 && a.status === "online";
                }).length}{" "}
                online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-2 h-2 fill-gray-500 text-gray-500" />
              <span>
                {agents.filter((a) => {
                  const diffMs = new Date().getTime() - new Date(a.last_seen).getTime();
                  return Math.floor(diffMs / 60000) > 5 || a.status === "offline";
                }).length}{" "}
                offline
              </span>
            </div>
            <div className="ml-auto">Total: {agents.length} agents</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
