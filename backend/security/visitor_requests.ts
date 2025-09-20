import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateVisitorRequestRequest {
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  company?: string;
  purposeOfVisit: string;
  areasToVisit: string[];
  requestedDate: Date;
  durationHours: number;
  specialRequirements?: string;
  securityClearanceLevel: "basic" | "restricted" | "confidential";
}

export interface VisitorRequest {
  id: number;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  company?: string;
  purposeOfVisit: string;
  hostEmployee: number;
  areasToVisit: string[];
  requestedDate: Date;
  durationHours: number;
  specialRequirements?: string;
  securityClearanceLevel: string;
  status: string;
  approvedBy?: number;
  approvalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListVisitorRequestsResponse {
  requests: VisitorRequest[];
}

// Creates a new visitor request.
export const createVisitorRequest = api<CreateVisitorRequestRequest, VisitorRequest>(
  { expose: true, method: "POST", path: "/security/visitor-requests", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    const request = await db.queryRow<VisitorRequest>`
      INSERT INTO visitor_requests (visitor_name, visitor_email, visitor_phone, company, purpose_of_visit, 
                                   host_employee, areas_to_visit, requested_date, duration_hours, 
                                   special_requirements, security_clearance_level)
      VALUES (${req.visitorName}, ${req.visitorEmail}, ${req.visitorPhone}, ${req.company}, ${req.purposeOfVisit},
              ${auth.userID}, ${req.areasToVisit}, ${req.requestedDate}, ${req.durationHours},
              ${req.specialRequirements}, ${req.securityClearanceLevel})
      RETURNING id, visitor_name as "visitorName", visitor_email as "visitorEmail", visitor_phone as "visitorPhone",
                company, purpose_of_visit as "purposeOfVisit", host_employee as "hostEmployee",
                areas_to_visit as "areasToVisit", requested_date as "requestedDate", duration_hours as "durationHours",
                special_requirements as "specialRequirements", security_clearance_level as "securityClearanceLevel",
                status, approved_by as "approvedBy", approval_notes as "approvalNotes",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!request) {
      throw APIError.internal("Failed to create visitor request");
    }

    return request;
  }
);

// Retrieves all visitor requests, ordered by creation date (latest first).
export const listVisitorRequests = api<void, ListVisitorRequestsResponse>(
  { expose: true, method: "GET", path: "/security/visitor-requests", auth: true },
  async () => {
    const requests = await db.queryAll<VisitorRequest>`
      SELECT id, visitor_name as "visitorName", visitor_email as "visitorEmail", visitor_phone as "visitorPhone",
             company, purpose_of_visit as "purposeOfVisit", host_employee as "hostEmployee",
             areas_to_visit as "areasToVisit", requested_date as "requestedDate", duration_hours as "durationHours",
             special_requirements as "specialRequirements", security_clearance_level as "securityClearanceLevel",
             status, approved_by as "approvedBy", approval_notes as "approvalNotes",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM visitor_requests
      ORDER BY created_at DESC
    `;

    return { requests };
  }
);

// Approves or rejects a visitor request.
export const reviewVisitorRequest = api<{id: number; status: string; approvalNotes?: string}, VisitorRequest>(
  { expose: true, method: "PUT", path: "/security/visitor-requests/:id/review", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only admins can review visitor requests");
    }

    const request = await db.queryRow<VisitorRequest>`
      UPDATE visitor_requests 
      SET status = ${req.status}, approval_notes = ${req.approvalNotes}, approved_by = ${auth.userID}, updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING id, visitor_name as "visitorName", visitor_email as "visitorEmail", visitor_phone as "visitorPhone",
                company, purpose_of_visit as "purposeOfVisit", host_employee as "hostEmployee",
                areas_to_visit as "areasToVisit", requested_date as "requestedDate", duration_hours as "durationHours",
                special_requirements as "specialRequirements", security_clearance_level as "securityClearanceLevel",
                status, approved_by as "approvedBy", approval_notes as "approvalNotes",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!request) {
      throw APIError.notFound("Visitor request not found");
    }

    return request;
  }
);
