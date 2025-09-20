import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';
import { useAuth } from '../../contexts/AuthContext';
import type { MedicalReport, CreateMedicalReportRequest } from '~backend/qshe/medical_reports';

export function MedicalReports() {
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateMedicalReportRequest>({
    patientName: '',
    employeeId: '',
    reportType: '',
    medicalCondition: '',
    treatmentProvided: '',
    recommendations: '',
    dateOfIncident: new Date(),
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await backend.qshe.listMedicalReports();
      setReports(response.reports);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load medical reports',
        variant: 'destructive',
      });
      console.error('Failed to load medical reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await backend.qshe.createMedicalReport(formData);
      toast({
        title: 'Success',
        description: 'Medical report created successfully',
      });
      setShowForm(false);
      setFormData({
        patientName: '',
        employeeId: '',
        reportType: '',
        medicalCondition: '',
        treatmentProvided: '',
        recommendations: '',
        dateOfIncident: new Date(),
      });
      loadReports();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create medical report',
        variant: 'destructive',
      });
      console.error('Failed to create medical report:', error);
    }
  };

  const reviewReport = async (id: number, approvalStatus: string, approvalNotes?: string) => {
    try {
      await backend.qshe.reviewMedicalReport({ id, approvalStatus, approvalNotes });
      toast({
        title: 'Success',
        description: 'Medical report reviewed successfully',
      });
      loadReports();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to review report',
        variant: 'destructive',
      });
      console.error('Failed to review report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'revision_required': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'revision_required': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
          <p className="text-gray-600">Manage health incidents and medical documentation</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Medical Report</CardTitle>
            <CardDescription>
              Document medical incidents and treatment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Full name of patient"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID (Optional)</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="Employee identification number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Input
                    id="reportType"
                    value={formData.reportType}
                    onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                    placeholder="e.g., Workplace Injury, Occupational Health"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfIncident">Date of Incident</Label>
                  <Input
                    id="dateOfIncident"
                    type="datetime-local"
                    value={formData.dateOfIncident.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, dateOfIncident: new Date(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalCondition">Medical Condition</Label>
                <Textarea
                  id="medicalCondition"
                  value={formData.medicalCondition}
                  onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                  placeholder="Describe the medical condition or injury..."
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentProvided">Treatment Provided (Optional)</Label>
                <Textarea
                  id="treatmentProvided"
                  value={formData.treatmentProvided}
                  onChange={(e) => setFormData({ ...formData, treatmentProvided: e.target.value })}
                  placeholder="Describe treatment administered..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations (Optional)</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="Medical recommendations or follow-up actions..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-teal-600 to-green-600">
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

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No medical reports found. Create your first report above.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(report.approvalStatus)}
                      <h3 className="font-semibold text-lg text-gray-900">
                        {report.patientName} - {report.reportType}
                      </h3>
                      <Badge className={getStatusColor(report.approvalStatus)}>
                        {report.approvalStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Employee ID:</span> {report.employeeId || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(report.dateOfIncident).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-900">Medical Condition:</span>
                        <p className="text-gray-700 mt-1">{report.medicalCondition}</p>
                      </div>
                      
                      {report.treatmentProvided && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium text-blue-900">Treatment Provided:</span>
                          <p className="text-blue-800 mt-1">{report.treatmentProvided}</p>
                        </div>
                      )}
                      
                      {report.recommendations && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-green-900">Recommendations:</span>
                          <p className="text-green-800 mt-1">{report.recommendations}</p>
                        </div>
                      )}
                      
                      {report.approvalNotes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">Review Notes:</span>
                          <p className="text-gray-700 mt-1">{report.approvalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {user?.role === 'admin' && report.approvalStatus === 'pending' && (
                    <div className="ml-4 space-y-2">
                      <Button
                        size="sm"
                        onClick={() => reviewReport(report.id, 'approved')}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reviewReport(report.id, 'rejected', 'Requires additional information')}
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reviewReport(report.id, 'revision_required', 'Please provide more details')}
                        className="w-full"
                      >
                        Request Revision
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
