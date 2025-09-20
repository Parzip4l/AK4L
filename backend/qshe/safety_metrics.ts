import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateSafetyMetricRequest {
  incidentType: string;
  severityLevel: "low" | "medium" | "high" | "critical";
  description: string;
  location: string;
  dateOccurred: Date;
  actionsTaken?: string;
}

export interface SafetyMetric {
  id: number;
  reportedBy: number;
  incidentType: string;
  severityLevel: string;
  description: string;
  location: string;
  dateOccurred: Date;
  actionsTaken?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListSafetyMetricsResponse {
  metrics: SafetyMetric[];
}

// Creates a new safety metric report.
export const createSafetyMetric = api<CreateSafetyMetricRequest, SafetyMetric>(
  { expose: true, method: "POST", path: "/qshe/safety-metrics", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    const metric = await db.queryRow<SafetyMetric>`
      INSERT INTO safety_metrics (reported_by, incident_type, severity_level, description, location, date_occurred, actions_taken)
      VALUES (${auth.userID}, ${req.incidentType}, ${req.severityLevel}, ${req.description}, ${req.location}, ${req.dateOccurred}, ${req.actionsTaken})
      RETURNING id, reported_by as "reportedBy", incident_type as "incidentType", severity_level as "severityLevel", 
                description, location, date_occurred as "dateOccurred", actions_taken as "actionsTaken", 
                status, created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!metric) {
      throw APIError.internal("Failed to create safety metric");
    }

    return metric;
  }
);

// Retrieves all safety metrics, ordered by creation date (latest first).
export const listSafetyMetrics = api<void, ListSafetyMetricsResponse>(
  { expose: true, method: "GET", path: "/qshe/safety-metrics", auth: true },
  async () => {
    const metrics = await db.queryAll<SafetyMetric>`
      SELECT id, reported_by as "reportedBy", incident_type as "incidentType", severity_level as "severityLevel",
             description, location, date_occurred as "dateOccurred", actions_taken as "actionsTaken",
             status, created_at as "createdAt", updated_at as "updatedAt"
      FROM safety_metrics
      ORDER BY created_at DESC
    `;

    return { metrics };
  }
);

// Updates the status of a safety metric.
export const updateSafetyMetricStatus = api<{id: number; status: string}, SafetyMetric>(
  { expose: true, method: "PUT", path: "/qshe/safety-metrics/:id/status", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only admins can update safety metric status");
    }

    const metric = await db.queryRow<SafetyMetric>`
      UPDATE safety_metrics 
      SET status = ${req.status}, updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING id, reported_by as "reportedBy", incident_type as "incidentType", severity_level as "severityLevel",
                description, location, date_occurred as "dateOccurred", actions_taken as "actionsTaken",
                status, created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!metric) {
      throw APIError.notFound("Safety metric not found");
    }

    return metric;
  }
);
