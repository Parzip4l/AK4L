import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Users, Clock, CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';
import { useAuth } from '../../contexts/AuthContext';
import type { VisitorRequest, CreateVisitorRequestRequest } from '~backend/security/visitor_requests';

export function VisitorRequests() {
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateVisitorRequestRequest>({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    company: '',
    purposeOfVisit: '',
    areasToVisit: [],
    requestedDate: new Date(),
    durationHours: 2,
    specialRequirements: '',
    securityClearanceLevel: 'basic',
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await backend.security.listVisitorRequests();
      setRequests(response.requests);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load visitor requests',
        variant: 'destructive',
      });
      console.error('Failed to load visitor requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await backend.security.createVisitorRequest(formData);
      toast({
        title: 'Success',
        description: 'Visitor request created successfully',
      });
      setShowForm(false);
      setFormData({
        visitorName: '',
        visitorEmail: '',
        visitorPhone: '',
        company: '',
        purposeOfVisit: '',
        areasToVisit: [],
        requestedDate: new Date(),
        durationHours: 2,
        specialRequirements: '',
        securityClearanceLevel: 'basic',
      });
      loadRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create visitor request',
        variant: 'destructive',
      });
      console.error('Failed to create visitor request:', error);
    }
  };

  const reviewRequest = async (id: number, status: string, approvalNotes?: string) => {
    try {
      await backend.security.reviewVisitorRequest({ id, status, approvalNotes });
      toast({
        title: 'Success',
        description: 'Visitor request reviewed successfully',
      });
      loadRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to review request',
        variant: 'destructive',
      });
      console.error('Failed to review request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getClearanceColor = (level: string) => {
    switch (level) {
      case 'confidential': return 'bg-red-100 text-red-800 border-red-200';
      case 'restricted': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'basic': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitor Requests</h1>
          <p className="text-gray-600">Manage facility access requests and visitor management</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Visitor Request</CardTitle>
            <CardDescription>
              Submit a request for visitor access to facility areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitorName">Visitor Name</Label>
                  <Input
                    id="visitorName"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    placeholder="Full name of visitor"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Visitor's company or organization"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitorEmail">Email</Label>
                  <Input
                    id="visitorEmail"
                    type="email"
                    value={formData.visitorEmail}
                    onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                    placeholder="visitor@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitorPhone">Phone</Label>
                  <Input
                    id="visitorPhone"
                    value={formData.visitorPhone}
                    onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                    placeholder="+1-555-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedDate">Visit Date & Time</Label>
                  <Input
                    id="requestedDate"
                    type="datetime-local"
                    value={formData.requestedDate.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, requestedDate: new Date(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationHours">Duration (Hours)</Label>
                  <Input
                    id="durationHours"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityClearanceLevel">Security Level</Label>
                  <Select
                    value={formData.securityClearanceLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, securityClearanceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="areasToVisit">Areas to Visit</Label>
                <Input
                  id="areasToVisit"
                  value={formData.areasToVisit.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    areasToVisit: e.target.value.split(',').map(area => area.trim()).filter(Boolean)
                  })}
                  placeholder="Reception, Conference Room A, Production Floor"
                  required
                />
                <p className="text-xs text-gray-500">Separate multiple areas with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
                <Textarea
                  id="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={(e) => setFormData({ ...formData, purposeOfVisit: e.target.value })}
                  placeholder="Describe the purpose and nature of the visit..."
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
                <Textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  placeholder="Any special requirements or accommodations needed..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-green-600 to-teal-600">
                  Submit Request
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No visitor requests found. Create your first request above.</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusIcon(request.status)}
                      <h3 className="font-semibold text-lg text-gray-900">
                        {request.visitorName}
                      </h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.toUpperCase()}
                      </Badge>
                      <Badge className={getClearanceColor(request.securityClearanceLevel)}>
                        {request.securityClearanceLevel.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(request.requestedDate).toLocaleDateString()} at {new Date(request.requestedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{request.durationHours} hour{request.durationHours !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{request.areasToVisit.join(', ')}</span>
                      </div>
                    </div>
                    
                    {request.company && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Company:</span> {request.company}
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium text-gray-900">Purpose:</span>
                      <p className="text-gray-700 mt-1">{request.purposeOfVisit}</p>
                    </div>
                    
                    {request.specialRequirements && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-900">Special Requirements:</span>
                        <p className="text-blue-800 mt-1">{request.specialRequirements}</p>
                      </div>
                    )}
                    
                    {request.approvalNotes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">Approval Notes:</span>
                        <p className="text-gray-700 mt-1">{request.approvalNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  {user?.role === 'admin' && request.status === 'pending' && (
                    <div className="ml-4 space-y-2">
                      <Button
                        size="sm"
                        onClick={() => reviewRequest(request.id, 'approved')}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reviewRequest(request.id, 'rejected', 'Does not meet security requirements')}
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
