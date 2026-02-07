import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Zap, 
  ArrowLeft,
  Loader2,
  Database,
  Activity,
  CreditCard,
  UserPlus,
  Search,
  MoreHorizontal,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    isAdmin, 
    isLoading: adminLoading, 
    users, 
    systemSettings, 
    apiLogs,
    fetchUsers, 
    fetchSystemSettings, 
    fetchApiLogs,
    updateUserRole,
    updateUserSubscription,
    updateSystemSetting,
    promoteToAdmin,
    removeAdmin
  } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/dashboard");
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchSystemSettings();
      fetchApiLogs();
    }
  }, [isAdmin, fetchUsers, fetchSystemSettings, fetchApiLogs]);

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'pro': return 'secondary';
      default: return 'outline';
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handlePlanChange = async (userId: string, newPlan: 'free' | 'pro' | 'enterprise') => {
    const maxSlides = newPlan === 'enterprise' ? 999 : newPlan === 'pro' ? 50 : 12;
    try {
      await updateUserSubscription(userId, newPlan, maxSlides);
      toast.success(`User plan updated to ${newPlan}`);
    } catch {
      toast.error("Failed to update plan");
    }
  };

  const handleSettingChange = async (key: string, value: string) => {
    try {
      await updateSystemSetting(key, value);
      toast.success("Setting updated");
    } catch {
      toast.error("Failed to update setting");
    }
  };

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const proUsers = users.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length;
  const totalPresentations = users.reduce((sum, u) => sum + u.presentation_count, 0);
  const apiCallsToday = apiLogs.filter(l => {
    const today = new Date().toDateString();
    return new Date(l.created_at).toDateString() === today;
  }).length;

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive">
                  <Shield className="h-5 w-5 text-destructive-foreground" />
                </div>
                <span className="text-xl font-bold">Admin Dashboard</span>
              </div>
            </div>
            
            <Badge variant="destructive" className="gap-1">
              <Crown className="h-3 w-3" />
              Admin
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Activity className="h-4 w-4" />
              API Usage
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminCount} admins
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{proUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Paid subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Presentations</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPresentations}</div>
                  <p className="text-xs text-muted-foreground">
                    Total created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{apiCallsToday}</div>
                  <p className="text-xs text-muted-foreground">
                    Requests today
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent API Activity</CardTitle>
                <CardDescription>Last 10 API calls across the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>API</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiLogs.slice(0, 10).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.api_name}</TableCell>
                        <TableCell>{log.model_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.response_time_ms ? `${log.response_time_ms}ms` : '-'}</TableCell>
                        <TableCell>{formatDate(log.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Max Slides</TableHead>
                      <TableHead>Presentations</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>
                          <Select 
                            value={u.role} 
                            onValueChange={(v) => handleRoleChange(u.id, v as 'admin' | 'moderator' | 'user')}
                          >
                            <SelectTrigger className="w-28">
                              <Badge variant={getRoleColor(u.role)}>{u.role}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={u.plan} 
                            onValueChange={(v) => handlePlanChange(u.id, v as 'free' | 'pro' | 'enterprise')}
                          >
                            <SelectTrigger className="w-28">
                              <Badge variant={getPlanColor(u.plan)}>{u.plan}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{u.max_slides}</TableCell>
                        <TableCell>{u.presentation_count}</TableCell>
                        <TableCell>{formatDate(u.created_at)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {u.role !== 'admin' ? (
                                <DropdownMenuItem onClick={() => promoteToAdmin(u.id)}>
                                  <Crown className="h-4 w-4 mr-2" />
                                  Promote to Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => removeAdmin(u.id)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Remove Admin
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure application-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {['subscription', 'features', 'presentation'].map(category => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold capitalize">{category} Settings</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {systemSettings
                        .filter(s => s.category === category)
                        .map(setting => (
                          <div key={setting.id} className="space-y-2">
                            <label className="text-sm font-medium">{setting.setting_key.replace(/_/g, ' ')}</label>
                            <Input
                              value={setting.setting_value.replace(/"/g, '')}
                              onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                              placeholder={setting.description || ''}
                            />
                            {setting.description && (
                              <p className="text-xs text-muted-foreground">{setting.description}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Usage Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Usage Logs</CardTitle>
                <CardDescription>Monitor API calls and model usage</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>API</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{log.api_name}</TableCell>
                        <TableCell>{log.model_name || '-'}</TableCell>
                        <TableCell>{log.request_type || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.tokens_used || '-'}</TableCell>
                        <TableCell>{log.response_time_ms ? `${log.response_time_ms}ms` : '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-destructive">
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
