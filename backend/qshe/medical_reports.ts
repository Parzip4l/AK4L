import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateMedicalReportRequest {
  patientName: string;
  employeeId?: string;
  reportType: string;
  medicalCondition: string;
  treatmentProvided?: string;
  recommendations?: string;
  dateOfIncident: Date;
}

export interface MedicalReport {
  id: number;
  patientName: string;
  employeeId?: string;
  reportType: string;
  medicalCondition: string;
  treatmentProvided?: string;
  recommendations?: string;
  reportedBy: number;
  reviewedBy?: number;
  approvalStatus: string;
  approvalNotes?: string;
  dateOfIncident: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListMedicalReportsResponse {
  reports: MedicalReport[];
}

// Creates a new medical report.
export const createMedicalReport = api<CreateMedicalReportRequest, MedicalReport>(
  { expose: true, method: "POST", path: "/qshe/medical-reports", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    const report = await db.queryRow<MedicalReport>`
      INSERT INTO medical_reports (patient_name, employee_id, report_type, medical_condition, treatment_provided, recommendations, reported_by, date_of_incident)
      VALUES (${req.patientName}, ${req.employeeId}, ${req.reportType}, ${req.medicalCondition}, ${req.treatmentProvided}, ${req.recommendations}, ${auth.userID}, ${req.dateOfIncident})
      RETURNING id, patient_name as "patientName", employee_id as "employeeId", report_type as "reportType",
                medical_condition as "medicalCondition", treatment_provided as "treatmentProvided", 
                recommendations, reported_by as "reportedBy", reviewed_by as "reviewedBy",
                approval_status as "approvalStatus", approval_notes as "approvalNotes",
                date_of_incident as "dateOfIncident", created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!report) {
      throw APIError.internal("Failed to create medical report");
    }

    return report;
  }
);

// Retrieves all medical reports, ordered by creation date (latest first).
export const listMedicalReports = api<void, ListMedicalReportsResponse>(
  { expose: true, method: "GET", path: "/qshe/medical-reports", auth: true },
  async () => {
    const reports = await db.queryAll<MedicalReport>`
      SELECT id, patient_name as "patientName", employee_id as "employeeId", report_type as "reportType",
             medical_condition as "medicalCondition", treatment_provided as "treatmentProvided",
             recommendations, reported_by as "reportedBy", reviewed_by as "reviewedBy",
             approval_status as "approvalStatus", approval_notes as "approvalNotes",
             date_of_incident as "dateOfIncident", created_at as "createdAt", updated_at as "updatedAt"
      FROM medical_reports
      ORDER BY created_at DESC
    `;

    return { reports };
  }
);

// Approves or rejects a medical report.
export const reviewMedicalReport = api<{id: number; approvalStatus: string; approvalNotes?: string}, MedicalReport>(
  { expose: true, method: "PUT", path: "/qshe/medical-reports/:id/review", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only admins can review medical reports");
    }

    const report = await db.queryRow<MedicalReport>`
      UPDATE medical_reports 
      SET approval_status = ${req.approvalStatus}, approval_notes = ${req.approvalNotes}, reviewed_by = ${auth.userID}, updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING id, patient_name as "patientName", employee_id as "employeeId", report_type as "reportType",
                medical_condition as "medicalCondition", treatment_provided as "treatmentProvided",
                recommendations, reported_by as "reportedBy", reviewed_by as "reviewedBy",
                approval_status as "approvalStatus", approval_notes as "approvalNotes",
                date_of_incident as "dateOfIncident", created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!report) {
      throw APIError.notFound("Medical report not found");
    }

    return report;
  }
);
