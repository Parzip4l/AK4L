import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  FileText, 
  Users, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';
import type { DashboardStats } from '~backend/dashboard/stats';

export function AdminDashboard() {
  const backend = useBackend();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await backend.dashboard.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load dashboard statistics</div>;
  }

  const cards = [
    {
      title: 'Safety Metrics',
      description: 'Incident reports and safety tracking',
      icon: Activity,
      stats: [
        { label: 'Total Reports', value: stats.safetyMetrics.total, color: 'text-blue-600' },
        { label: 'Open Issues', value: stats.safetyMetrics.open, color: 'text-orange-600' },
        { label: 'Resolved', value: stats.safetyMetrics.resolved, color: 'text-green-600' },
        { label: 'Critical', value: stats.safetyMetrics.critical, color: 'text-red-600' },
      ],
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Medical Reports',
      description: 'Health incidents and medical tracking',
      icon: FileText,
      stats: [
        { label: 'Total Reports', value: stats.medicalReports.total, color: 'text-blue-600' },
        { label: 'Pending Review', value: stats.medicalReports.pending, color: 'text-orange-600' },
        { label: 'Approved', value: stats.medicalReports.approved, color: 'text-green-600' },
        { label: 'Rejected', value: stats.medicalReports.rejected, color: 'text-red-600' },
      ],
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Visitor Requests',
      description: 'Access requests and visitor management',
      icon: Users,
      stats: [
        { label: 'Total Requests', value: stats.visitorRequests.total, color: 'text-blue-600' },
        { label: 'Pending', value: stats.visitorRequests.pending, color: 'text-orange-600' },
        { label: 'Approved', value: stats.visitorRequests.approved, color: 'text-green-600' },
        { label: 'Today', value: stats.visitorRequests.today, color: 'text-purple-600' },
      ],
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Competency Assessments',
      description: 'Staff certifications and training',
      icon: UserCheck,
      stats: [
        { label: 'Total Assessments', value: stats.competencyAssessments.total, color: 'text-blue-600' },
        { label: 'Active', value: stats.competencyAssessments.active, color: 'text-green-600' },
        { label: 'Expiring Soon', value: stats.competencyAssessments.expiring, color: 'text-orange-600' },
        { label: 'Expired', value: stats.competencyAssessments.expired, color: 'text-red-600' },
      ],
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage QSHE activities across your organization
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {card.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center p-2 rounded-lg bg-gray-50/50">
                      <div className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-900">Critical Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-800">Critical Safety Issues</span>
                <span className="font-bold text-red-900">{stats.safetyMetrics.critical}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-800">Expired Certifications</span>
                <span className="font-bold text-red-900">{stats.competencyAssessments.expired}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <CardTitle className="text-orange-900">Pending Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-800">Medical Reviews</span>
                <span className="font-bold text-orange-900">{stats.medicalReports.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-800">Visitor Approvals</span>
                <span className="font-bold text-orange-900">{stats.visitorRequests.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-900">Completed Today</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800">Resolved Issues</span>
                <span className="font-bold text-green-900">{stats.safetyMetrics.resolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800">Visitor Check-ins</span>
                <span className="font-bold text-green-900">{stats.visitorRequests.today}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
