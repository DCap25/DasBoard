import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../lib/use-toast';
import {
  getDealershipGroups,
  createDealershipGroup,
  getDealerships,
  createDealership,
  testSchemaConnections,
} from '../../lib/apiService';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Loader2, Plus, RefreshCw, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface DealershipGroup {
  id: number;
  name: string;
  logo_url?: string;
}

interface Dealership {
  id: number;
  name: string;
  group_id?: number;
  schema_name: string;
  logo_url?: string;
  locations?: any[];
  brands?: any[];
  dealership_groups?: {
    name: string;
  };
}

export function AdminPanel() {
  const { user, role } = useAuth();

  const [dealershipGroups, setDealershipGroups] = useState<DealershipGroup[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);

  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [newDealershipDialogOpen, setNewDealershipDialogOpen] = useState(false);

  // Forms
  const groupForm = useForm({
    defaultValues: {
      name: '',
      logo_url: '',
    },
  });

  const dealershipForm = useForm({
    defaultValues: {
      name: '',
      group_id: undefined,
      schema_name: '',
      logo_url: '',
    },
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load dealership groups
        const groups = await getDealershipGroups();
        setDealershipGroups(groups || []);

        // Load dealerships
        const dealerships = await getDealerships();
        setDealerships(dealerships || []);

        setLoading(false);
      } catch (error) {
        console.error('[AdminPanel] Error loading data:', error);
        toast({
          title: 'Error loading data',
          description: String(error),
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Test schema connections
  const runSchemaTest = async () => {
    try {
      setLoading(true);

      // Test schema connections
      const results = await testSchemaConnections();
      setTestResults(results);

      setLoading(false);

      toast({
        title: 'Schema Test Complete',
        description: results.globalTables.success
          ? `Connected to global tables with ${results.globalTables.groups.count} groups and ${results.globalTables.dealerships.count} dealerships`
          : 'Failed to connect to global tables',
        variant: results.globalTables.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('[AdminPanel] Error testing schema connections:', error);
      toast({
        title: 'Error testing schema',
        description: String(error),
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Create new group
  const onSubmitGroup = async (data: any) => {
    try {
      console.log('[AdminPanel] Creating new dealership group:', data);

      const newGroup = await createDealershipGroup(data);

      setDealershipGroups(prev => [...prev, newGroup]);

      toast({
        title: 'Group Created',
        description: `Successfully created dealership group: ${newGroup.name}`,
      });

      setNewGroupDialogOpen(false);
      groupForm.reset();
    } catch (error) {
      console.error('[AdminPanel] Error creating dealership group:', error);
      toast({
        title: 'Error creating group',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  // Create new dealership
  const onSubmitDealership = async (data: any) => {
    try {
      console.log('[AdminPanel] Creating new dealership:', data);

      // Generate schema name if not provided
      if (!data.schema_name) {
        data.schema_name = `dealership_${Date.now()}`;
      }

      const newDealership = await createDealership(data);

      setDealerships(prev => [...prev, newDealership]);

      toast({
        title: 'Dealership Created',
        description: `Successfully created dealership: ${newDealership.name}`,
      });

      setNewDealershipDialogOpen(false);
      dealershipForm.reset();

      // Refresh data after creation
      const dealerships = await getDealerships();
      setDealerships(dealerships || []);
    } catch (error) {
      console.error('[AdminPanel] Error creating dealership:', error);
      toast({
        title: 'Error creating dealership',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  // If not admin, show access denied
  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to access the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage dealership groups, dealerships, and system settings
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runSchemaTest} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Test Schema
          </Button>
        </div>
      </div>

      <Tabs defaultValue="groups">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="groups">Dealership Groups</TabsTrigger>
          <TabsTrigger value="dealerships">Dealerships</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Dealership Groups Tab */}
        <TabsContent value="groups">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dealership Groups</CardTitle>
                <CardDescription>Manage dealership groups and their settings</CardDescription>
              </div>

              <Dialog open={newGroupDialogOpen} onOpenChange={setNewGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Dealership Group</DialogTitle>
                    <DialogDescription>
                      Add a new dealership group to organize related dealerships.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={groupForm.handleSubmit(onSubmitGroup)}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <FormLabel htmlFor="name">Group Name</FormLabel>
                        <Input
                          id="name"
                          placeholder="Enter group name"
                          {...groupForm.register('name', { required: true })}
                        />
                        {groupForm.formState.errors.name && (
                          <p className="text-sm text-red-500">Group name is required</p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <FormLabel htmlFor="logo_url">Logo URL (Optional)</FormLabel>
                        <Input
                          id="logo_url"
                          placeholder="https://example.com/logo.png"
                          {...groupForm.register('logo_url')}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit">Create Group</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : dealershipGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No dealership groups found.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setNewGroupDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first group
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Dealership Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealershipGroups.map(group => (
                      <TableRow key={group.id}>
                        <TableCell>{group.id}</TableCell>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>
                          {dealerships.filter(d => d.group_id === group.id).length}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dealerships Tab */}
        <TabsContent value="dealerships">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dealerships</CardTitle>
                <CardDescription>Manage individual dealerships and their settings</CardDescription>
              </div>

              <Dialog open={newDealershipDialogOpen} onOpenChange={setNewDealershipDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Dealership
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Dealership</DialogTitle>
                    <DialogDescription>
                      Add a new dealership to the system. This will create a new database schema.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={dealershipForm.handleSubmit(onSubmitDealership)}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <FormLabel htmlFor="name">Dealership Name</FormLabel>
                        <Input
                          id="name"
                          placeholder="Enter dealership name"
                          {...dealershipForm.register('name', { required: true })}
                        />
                        {dealershipForm.formState.errors.name && (
                          <p className="text-sm text-red-500">Dealership name is required</p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <FormLabel htmlFor="group_id">Dealership Group</FormLabel>
                        <Select
                          onValueChange={value =>
                            dealershipForm.setValue('group_id', parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group" />
                          </SelectTrigger>
                          <SelectContent>
                            {dealershipGroups.map(group => (
                              <SelectItem key={group.id} value={group.id.toString()}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <FormLabel htmlFor="schema_name">Schema Name</FormLabel>
                        <div className="flex items-center gap-2">
                          <Input
                            id="schema_name"
                            placeholder="dealership_123"
                            {...dealershipForm.register('schema_name')}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              dealershipForm.setValue('schema_name', `dealership_${Date.now()}`)
                            }
                          >
                            Generate
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Unique identifier for the database schema
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <FormLabel htmlFor="logo_url">Logo URL (Optional)</FormLabel>
                        <Input
                          id="logo_url"
                          placeholder="https://example.com/logo.png"
                          {...dealershipForm.register('logo_url')}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit">Create Dealership</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : dealerships.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No dealerships found.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setNewDealershipDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first dealership
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Schema</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealerships.map(dealership => (
                      <TableRow key={dealership.id}>
                        <TableCell>{dealership.id}</TableCell>
                        <TableCell className="font-medium">{dealership.name}</TableCell>
                        <TableCell>{dealership.dealership_groups?.name || 'None'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{dealership.schema_name}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Manage system-wide settings and view schema test results
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Schema Test Results</h3>

                {testResults ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Global Tables</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Groups</span>
                              <Badge
                                variant={
                                  testResults.globalTables.groups?.success
                                    ? 'success'
                                    : 'destructive'
                                }
                              >
                                {testResults.globalTables.groups?.count || 0}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Dealerships</span>
                              <Badge
                                variant={
                                  testResults.globalTables.dealerships?.success
                                    ? 'success'
                                    : 'destructive'
                                }
                              >
                                {testResults.globalTables.dealerships?.count || 0}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Dealership Schema</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Status</span>
                              <Badge
                                variant={
                                  testResults.dealershipSchema?.success ? 'success' : 'destructive'
                                }
                              >
                                {testResults.dealershipSchema?.success ? 'Connected' : 'Failed'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {testResults.dealershipSchema?.message}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" onClick={runSchemaTest}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Run Schema Test Again
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No schema test results available.</p>
                    <Button onClick={runSchemaTest}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Schema Test
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
