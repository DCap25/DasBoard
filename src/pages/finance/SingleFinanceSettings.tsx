import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from '../../components/ui/use-toast';
import { SingleFinanceStorage } from '../../lib/singleFinanceStorage';
import { teamMemberSchema, type TeamMemberData } from '../../lib/validation/dealSchemas';
import { 
  Settings, 
  Users, 
  DollarSign, 
  Plus, 
  Trash2,
  Save,
  ArrowLeft
} from 'lucide-react';

// Interface for team member
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: 'salesperson' | 'sales_manager';
  active: boolean;
}

// Interface for pay configuration
interface PayConfig {
  commissionRate: number;
  baseRate: number;
  bonusThresholds: {
    vscBonus: number;
    gapBonus: number;
    ppmBonus: number;
    totalThreshold: number;
  };
}

export default function SingleFinanceSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'team' | 'pay'>('team');

  // Helper function to get user ID consistently
  const getUserId = () => {
    return user?.id || user?.user?.id || user?.email;
  };
  
  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    role: 'salesperson' as 'salesperson' | 'sales_manager'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Pay configuration state
  const [payConfig, setPayConfig] = useState<PayConfig>({
    commissionRate: 25,
    baseRate: 500,
    bonusThresholds: {
      vscBonus: 100,
      gapBonus: 50,
      ppmBonus: 75,
      totalThreshold: 15000
    }
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const userId = getUserId();
    console.log('[Settings] Loading settings for user:', userId);
    console.log('[Settings] Full user object:', user);
    
    if (!userId) {
      console.log('[Settings] No userId, skipping load');
      return;
    }
    
    // Clear old format data to ensure clean state
    SingleFinanceStorage.clearOldFormatData();
    
    try {
      const storageKey = `singleFinanceTeamMembers_${userId}`;
      const rawData = localStorage.getItem(storageKey);
      console.log('[Settings] Raw localStorage data for key:', storageKey);
      console.log('[Settings] Raw data:', rawData);
      
      const savedTeamMembers = SingleFinanceStorage.getTeamMembers(userId);
      console.log('[Settings] Parsed team members:', savedTeamMembers);
      console.log('[Settings] Team member count:', savedTeamMembers.length);
      
      setTeamMembers(savedTeamMembers);

      const savedPayConfig = SingleFinanceStorage.getPayConfig(userId);
      if (savedPayConfig) {
        setPayConfig(savedPayConfig);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, [user]);

  // Save team members to localStorage
  const saveTeamMembers = (members: TeamMember[]) => {
    const userId = getUserId();
    console.log('[Settings] saveTeamMembers called with:', { userId, memberCount: members.length, members });
    
    if (!userId) {
      console.error('[Settings] No userId found, cannot save team members');
      return;
    }
    
    try {
      const storageKey = `singleFinanceTeamMembers_${userId}`;
      console.log('[Settings] Saving to localStorage key:', storageKey);
      
      SingleFinanceStorage.setTeamMembers(userId, members);
      
      // Verify it was saved
      const savedData = localStorage.getItem(storageKey);
      console.log('[Settings] Verification - data saved to localStorage:', savedData);
      
      setTeamMembers(members);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('teamMembersUpdated', { 
        detail: { teamMembers: members, userId: userId } 
      }));
      
      console.log('[Settings] Team members updated and event dispatched:', members.length, 'members');
    } catch (error) {
      console.error('Error saving team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to save team members',
        variant: 'destructive'
      });
    }
  };

  // Save pay configuration to localStorage
  const savePayConfig = (config: PayConfig) => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      SingleFinanceStorage.setPayConfig(userId, config);
      setPayConfig(config);
      toast({
        title: 'Success',
        description: 'Pay configuration saved successfully'
      });
    } catch (error) {
      console.error('Error saving pay configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save pay configuration',
        variant: 'destructive'
      });
    }
  };

  // Add new team member
  const handleAddTeamMember = () => {
    const userId = getUserId();
    console.log('[Settings] Add team member clicked:', { newMember, userId });
    console.log('[Settings] Full user object:', user);
    console.log('[Settings] Storage key will be:', `singleFinanceTeamMembers_${userId}`);
    
    // Validate using Zod schema
    const validationResult = teamMemberSchema.safeParse({
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      role: newMember.role
    });
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      
      setValidationErrors(errors);
      
      const firstError = validationResult.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive'
      });
      return;
    }
    
    // Clear validation errors if validation passes
    setValidationErrors({});

    const initials = `${newMember.firstName.charAt(0)}${newMember.lastName.charAt(0)}`.toUpperCase();
    
    const member: TeamMember = {
      id: `member_${Date.now()}`,
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      initials,
      role: newMember.role,
      active: true
    };

    const updatedMembers = [...teamMembers, member];
    console.log('[Settings] About to save team members:', updatedMembers);
    saveTeamMembers(updatedMembers);
    
    // Reset form and clear validation errors
    setNewMember({
      firstName: '',
      lastName: '',
      role: 'salesperson'
    });
    setValidationErrors({});

    console.log('[Settings] Team member added successfully:', member);
    toast({
      title: 'Success',
      description: `${member.firstName} ${member.lastName} added to team`
    });
  };

  // Remove team member
  const handleRemoveTeamMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (confirm(`Are you sure you want to remove ${member?.firstName} ${member?.lastName} from the team?`)) {
      const updatedMembers = teamMembers.filter(m => m.id !== memberId);
      saveTeamMembers(updatedMembers);
      
      toast({
        title: 'Success',
        description: 'Team member removed'
      });
    }
  };

  // Toggle team member active status
  const handleToggleActive = (memberId: string) => {
    const updatedMembers = teamMembers.map(member =>
      member.id === memberId ? { ...member, active: !member.active } : member
    );
    saveTeamMembers(updatedMembers);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          onClick={() => navigate('/dashboard/single-finance')}
          className="mr-4 flex items-center bg-blue-500 text-white hover:bg-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Single Finance Manager Settings</h1>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> These settings are specific to your Single Finance Manager Dashboard
          and will be used for deal logging and pay calculations.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'team'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Users className="inline mr-2 h-4 w-4" />
          Team Management
        </button>
        <button
          onClick={() => setActiveTab('pay')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'pay'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <DollarSign className="inline mr-2 h-4 w-4" />
          Pay Configuration
        </button>
      </div>

      {/* Team Management Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Add New Team Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Add Team Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newMember.firstName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                    className={validationErrors.firstName ? 'border-red-500' : ''}
                  />
                  {validationErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newMember.lastName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                    className={validationErrors.lastName ? 'border-red-500' : ''}
                  />
                  {validationErrors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'salesperson' | 'sales_manager' }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="salesperson">Salesperson</option>
                    <option value="sales_manager">Sales Manager</option>
                  </select>
                </div>
                <Button onClick={handleAddTeamMember} className="bg-green-500 hover:bg-green-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List - Separated by Role */}
          {teamMembers.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Team Members (0)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  No team members added yet. Add your first team member above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Salespeople Section */}
              {teamMembers.filter(member => member.role === 'salesperson').length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Salespeople ({teamMembers.filter(member => member.role === 'salesperson').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamMembers.filter(member => member.role === 'salesperson').map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-medium">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-medium">{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-blue-600">Salesperson</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleActive(member.id)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                member.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {member.active ? 'Active' : 'Inactive'}
                            </button>
                            <Button
                              onClick={() => handleRemoveTeamMember(member.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sales Managers Section */}
              {teamMembers.filter(member => member.role === 'sales_manager').length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Sales Managers ({teamMembers.filter(member => member.role === 'sales_manager').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamMembers.filter(member => member.role === 'sales_manager').map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-purple-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-medium">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-medium">{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-purple-600">Sales Manager</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleActive(member.id)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                member.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {member.active ? 'Active' : 'Inactive'}
                            </button>
                            <Button
                              onClick={() => handleRemoveTeamMember(member.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pay Configuration Tab */}
      {activeTab === 'pay' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Commission & Base Pay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={payConfig.commissionRate}
                    onChange={(e) => setPayConfig(prev => ({ 
                      ...prev, 
                      commissionRate: parseFloat(e.target.value) || 0 
                    }))}
                  />
                  <p className="text-xs text-gray-600">Percentage of back-end gross profit</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Base Monthly Rate ($)</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    min="0"
                    step="50"
                    value={payConfig.baseRate}
                    onChange={(e) => setPayConfig(prev => ({ 
                      ...prev, 
                      baseRate: parseFloat(e.target.value) || 0 
                    }))}
                  />
                  <p className="text-xs text-gray-600">Fixed monthly base pay</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Bonuses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vscBonus">VSC Bonus ($)</Label>
                  <Input
                    id="vscBonus"
                    type="number"
                    min="0"
                    step="25"
                    value={payConfig.bonusThresholds.vscBonus}
                    onChange={(e) => setPayConfig(prev => ({ 
                      ...prev, 
                      bonusThresholds: {
                        ...prev.bonusThresholds,
                        vscBonus: parseFloat(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gapBonus">GAP Bonus ($)</Label>
                  <Input
                    id="gapBonus"
                    type="number"
                    min="0"
                    step="25"
                    value={payConfig.bonusThresholds.gapBonus}
                    onChange={(e) => setPayConfig(prev => ({ 
                      ...prev, 
                      bonusThresholds: {
                        ...prev.bonusThresholds,
                        gapBonus: parseFloat(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ppmBonus">PPM Bonus ($)</Label>
                  <Input
                    id="ppmBonus"
                    type="number"
                    min="0"
                    step="25"
                    value={payConfig.bonusThresholds.ppmBonus}
                    onChange={(e) => setPayConfig(prev => ({ 
                      ...prev, 
                      bonusThresholds: {
                        ...prev.bonusThresholds,
                        ppmBonus: parseFloat(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalThreshold">Monthly Threshold ($)</Label>
                  <Input
                    id="totalThreshold"
                    type="number"
                    min="0"
                    step="1000"
                    value={payConfig.bonusThresholds.totalThreshold}
                    onChange={(e) => setPayConfig(prev => ({ 
                      ...prev, 
                      bonusThresholds: {
                        ...prev.bonusThresholds,
                        totalThreshold: parseFloat(e.target.value) || 0
                      }
                    }))}
                  />
                  <p className="text-xs text-gray-600">Monthly gross threshold for full bonuses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => savePayConfig(payConfig)}
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Pay Configuration
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}