import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  FileText, 
  Users, 
  Plus, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';
import type { DashboardStats } from '~backend/dashboard/stats';

export function VisitorDashboard() {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
      title: 'Safety Reports',
      description: 'Submit and track safety incidents',
      icon: Activity,
      value: stats.safetyMetrics.total,
      change: '+12%',
      color: 'from-blue-500 to-blue-600',
      href: '/qshe/safety-metrics',
    },
    {
      title: 'Medical Reports',
      description: 'Health incidents and medical tracking',
      icon: FileText,
      value: stats.medicalReports.total,
      change: '+8%',
      color: 'from-teal-500 to-teal-600',
      href: '/qshe/medical-reports',
    },
    {
      title: 'Visitor Requests',
      description: 'Manage facility access requests',
      icon: Users,
      value: stats.visitorRequests.total,
      change: '+15%',
      color: 'from-green-500 to-green-600',
      href: '/security/visitor-requests',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your safety reports, medical records, and visitor requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} to={card.href}>
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{card.change}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {card.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total submissions
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/qshe/safety-metrics">
              <Button variant="outline" className="w-full justify-start text-blue-800 border-blue-200 hover:bg-blue-100">
                <Activity className="w-4 h-4 mr-2" />
                Report Safety Incident
              </Button>
            </Link>
            <Link to="/qshe/medical-reports">
              <Button variant="outline" className="w-full justify-start text-teal-800 border-teal-200 hover:bg-teal-100">
                <FileText className="w-4 h-4 mr-2" />
                Submit Medical Report
              </Button>
            </Link>
            <Link to="/security/visitor-requests">
              <Button variant="outline" className="w-full justify-start text-green-800 border-green-200 hover:bg-green-100">
                <Users className="w-4 h-4 mr-2" />
                Request Visitor Access
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">Visitors Today</span>
              </div>
              <span className="font-bold text-orange-900">{stats.visitorRequests.today}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">Open Safety Issues</span>
              </div>
              <span className="font-bold text-orange-900">{stats.safetyMetrics.open}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">Pending Medical Reviews</span>
              </div>
              <span className="font-bold text-orange-900">{stats.medicalReports.pending}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
