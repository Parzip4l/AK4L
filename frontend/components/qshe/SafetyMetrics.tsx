import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';
import { useAuth } from '../../contexts/AuthContext';
import type { SafetyMetric, CreateSafetyMetricRequest } from '~backend/qshe/safety_metrics';

export function SafetyMetrics() {
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SafetyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateSafetyMetricRequest>({
    incidentType: '',
    severityLevel: 'low',
    description: '',
    location: '',
    dateOccurred: new Date(),
    actionsTaken: '',
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await backend.qshe.listSafetyMetrics();
      setMetrics(response.metrics);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load safety metrics',
        variant: 'destructive',
      });
      console.error('Failed to load safety metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await backend.qshe.createSafetyMetric(formData);
      toast({
        title: 'Success',
        description: 'Safety metric created successfully',
      });
      setShowForm(false);
      setFormData({
        incidentType: '',
        severityLevel: 'low',
        description: '',
        location: '',
        dateOccurred: new Date(),
        actionsTaken: '',
      });
      loadMetrics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create safety metric',
        variant: 'destructive',
      });
      console.error('Failed to create safety metric:', error);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await backend.qshe.updateSafetyMetricStatus({ id, status });
      toast({
        title: 'Success',
        description: 'Safety metric status updated successfully',
      });
      loadMetrics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
      console.error('Failed to update status:', error);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'investigating': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Safety Metrics</h1>
          <p className="text-gray-600">Track and manage safety incidents and metrics</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Report Safety Incident</CardTitle>
            <CardDescription>
              Provide details about the safety incident or concern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Input
                    id="incidentType"
                    value={formData.incidentType}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    placeholder="e.g., Near Miss, Equipment Failure"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severityLevel">Severity Level</Label>
                  <Select
                    value={formData.severityLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, severityLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Production Floor A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOccurred">Date Occurred</Label>
                  <Input
                    id="dateOccurred"
                    type="datetime-local"
                    value={formData.dateOccurred.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, dateOccurred: new Date(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the incident in detail..."
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionsTaken">Actions Taken (Optional)</Label>
                <Textarea
                  id="actionsTaken"
                  value={formData.actionsTaken}
                  onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
                  placeholder="Describe any immediate actions taken..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-teal-600">
                  Submit Report
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Metrics List */}
      <div className="space-y-4">
        {metrics.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No safety metrics found. Create your first report above.</p>
            </CardContent>
          </Card>
        ) : (
          metrics.map((metric) => (
            <Card key={metric.id} className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(metric.status)}
                      <h3 className="font-semibold text-lg text-gray-900">
                        {metric.incidentType}
                      </h3>
                      <Badge className={getSeverityColor(metric.severityLevel)}>
                        {metric.severityLevel.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {metric.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Location:</span> {metric.location}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(metric.dateOccurred).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="text-gray-700">{metric.description}</p>
                    
                    {metric.actionsTaken && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-900">Actions Taken:</span>
                        <p className="text-blue-800 mt-1">{metric.actionsTaken}</p>
                      </div>
                    )}
                  </div>
                  
                  {user?.role === 'admin' && metric.status === 'open' && (
                    <div className="ml-4 space-y-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(metric.id, 'investigating')}
                        className="w-full"
                      >
                        Start Investigation
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(metric.id, 'resolved')}
                        className="w-full"
                      >
                        Mark Resolved
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
