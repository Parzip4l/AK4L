import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { UserCheck, Shield, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';
import { useAuth } from '../../contexts/AuthContext';
import type { CompetencyAssessment, SecurityPersonnel } from '~backend/security/competency';

export function CompetencyMatrix() {
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<CompetencyAssessment[]>([]);
  const [personnel, setPersonnel] = useState<SecurityPersonnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [assessmentsResponse, personnelResponse] = await Promise.all([
        backend.security.listCompetencyAssessments(),
        backend.security.listSecurityPersonnel(),
      ]);
      setAssessments(assessmentsResponse.assessments);
      setPersonnel(personnelResponse.personnel);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load competency data',
        variant: 'destructive',
      });
      console.error('Failed to load competency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_renewal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending_renewal': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <UserCheck className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'supervisor': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'level3': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'level2': return 'bg-green-100 text-green-800 border-green-200';
      case 'level1': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

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

  // Group assessments by personnel
  const assessmentsByPersonnel = assessments.reduce((acc, assessment) => {
    if (!acc[assessment.personnelId]) {
      acc[assessment.personnelId] = [];
    }
    acc[assessment.personnelId].push(assessment);
    return acc;
  }, {} as Record<number, CompetencyAssessment[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Competency Matrix</h1>
        <p className="text-gray-600">Monitor security personnel certifications and training status</p>
      </div>

      {/* Security Personnel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personnel.map((person) => {
          const personAssessments = assessmentsByPersonnel[person.id] || [];
          const activeAssessments = personAssessments.filter(a => a.status === 'active');
          const averageScore = activeAssessments.length > 0 
            ? Math.round(activeAssessments.reduce((sum, a) => sum + a.score, 0) / activeAssessments.length)
            : 0;

          return (
            <Card key={person.id} className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {person.user?.firstName?.[0]}{person.user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {person.user?.firstName} {person.user?.lastName}
                      </h3>
                      <p className="text-xs text-gray-600">{person.badgeNumber}</p>
                    </div>
                  </div>
                  <Badge className={getSecurityLevelColor(person.securityLevel)}>
                    {person.securityLevel.replace('level', 'Level ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overall Score</span>
                  <span className={`font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore}%
                  </span>
                </div>
                <Progress value={averageScore} className="h-2" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Active Certifications</span>
                    <span>{activeAssessments.length}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Shift Assignment</span>
                    <span className="capitalize">{person.shiftAssignment.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Status</span>
                    <span className={person.isActive ? 'text-green-600' : 'text-red-600'}>
                      {person.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Competency Assessments</CardTitle>
          <CardDescription>
            Detailed view of all competency assessments and certifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No competency assessments found.</p>
              </div>
            ) : (
              assessments.map((assessment) => {
                const person = personnel.find(p => p.id === assessment.personnelId);
                const isExpiringSoon = assessment.certificationValidUntil 
                  ? new Date(assessment.certificationValidUntil) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  : false;

                return (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(assessment.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {assessment.competencyType}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {person?.user?.firstName} {person?.user?.lastName} ({person?.badgeNumber})
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className={`font-bold ${getScoreColor(assessment.score)}`}>
                          {assessment.score}%
                        </div>
                        <div className="text-gray-600">Score</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium text-gray-900">
                          {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-600">Assessed</div>
                      </div>
                      
                      {assessment.certificationValidUntil && (
                        <div className="text-center">
                          <div className={`font-medium ${isExpiringSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                            {new Date(assessment.certificationValidUntil).toLocaleDateString()}
                          </div>
                          <div className="text-gray-600">Expires</div>
                        </div>
                      )}
                      
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
