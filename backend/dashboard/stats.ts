import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DashboardStats {
  safetyMetrics: {
    total: number;
    open: number;
    resolved: number;
    critical: number;
  };
  medicalReports: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  visitorRequests: {
    total: number;
    pending: number;
    approved: number;
    today: number;
  };
  competencyAssessments: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
  };
}

// Retrieves dashboard statistics for the current user's role.
export const getDashboardStats = api<void, DashboardStats>(
  { expose: true, method: "GET", path: "/dashboard/stats", auth: true },
  async () => {
    const auth = getAuthData()!;

    // Safety metrics stats
    const safetyStats = await db.queryAll<{status: string; severity_level: string; count: number}>`
      SELECT status, severity_level, COUNT(*)::integer as count
      FROM safety_metrics
      GROUP BY status, severity_level
    `;

    let safetyMetrics = {
      total: 0,
      open: 0,
      resolved: 0,
      critical: 0,
    };

    safetyStats.forEach(stat => {
      safetyMetrics.total += stat.count;
      if (stat.status === 'open') safetyMetrics.open += stat.count;
      if (stat.status === 'resolved' || stat.status === 'closed') safetyMetrics.resolved += stat.count;
      if (stat.severity_level === 'critical') safetyMetrics.critical += stat.count;
    });

    // Medical reports stats
    const medicalStats = await db.queryAll<{approval_status: string; count: number}>`
      SELECT approval_status, COUNT(*)::integer as count
      FROM medical_reports
      GROUP BY approval_status
    `;

    let medicalReports = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    medicalStats.forEach(stat => {
      medicalReports.total += stat.count;
      if (stat.approval_status === 'pending') medicalReports.pending += stat.count;
      if (stat.approval_status === 'approved') medicalReports.approved += stat.count;
      if (stat.approval_status === 'rejected') medicalReports.rejected += stat.count;
    });

    // Visitor requests stats
    const visitorStats = await db.queryAll<{status: string; count: number}>`
      SELECT status, COUNT(*)::integer as count
      FROM visitor_requests
      GROUP BY status
    `;

    const todayVisitors = await db.queryRow<{count: number}>`
      SELECT COUNT(*)::integer as count
      FROM visitor_requests
      WHERE requested_date::date = CURRENT_DATE
    `;

    let visitorRequests = {
      total: 0,
      pending: 0,
      approved: 0,
      today: todayVisitors?.count || 0,
    };

    visitorStats.forEach(stat => {
      visitorRequests.total += stat.count;
      if (stat.status === 'pending') visitorRequests.pending += stat.count;
      if (stat.status === 'approved') visitorRequests.approved += stat.count;
    });

    // Competency assessments stats (admin only)
    let competencyAssessments = {
      total: 0,
      active: 0,
      expiring: 0,
      expired: 0,
    };

    if (auth.role === 'admin') {
      const competencyStats = await db.queryAll<{status: string; count: number}>`
        SELECT status, COUNT(*)::integer as count
        FROM competency_assessments
        GROUP BY status
      `;

      const expiringCount = await db.queryRow<{count: number}>`
        SELECT COUNT(*)::integer as count
        FROM competency_assessments
        WHERE certification_valid_until <= CURRENT_DATE + INTERVAL '30 days'
        AND certification_valid_until > CURRENT_DATE
        AND status = 'active'
      `;

      competencyStats.forEach(stat => {
        competencyAssessments.total += stat.count;
        if (stat.status === 'active') competencyAssessments.active += stat.count;
        if (stat.status === 'expired') competencyAssessments.expired += stat.count;
      });

      competencyAssessments.expiring = expiringCount?.count || 0;
    }

    return {
      safetyMetrics,
      medicalReports,
      visitorRequests,
      competencyAssessments,
    };
  }
);
