import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CompetencyAssessment {
  id: number;
  personnelId: number;
  competencyType: string;
  assessmentDate: Date;
  score: number;
  assessorId: number;
  certificationValidUntil?: Date;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityPersonnel {
  id: number;
  userId: number;
  badgeNumber: string;
  securityLevel: string;
  hireDate: Date;
  shiftAssignment: string;
  isActive: boolean;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ListCompetencyAssessmentsResponse {
  assessments: CompetencyAssessment[];
}

export interface ListSecurityPersonnelResponse {
  personnel: SecurityPersonnel[];
}

// Retrieves all competency assessments, ordered by assessment date (latest first).
export const listCompetencyAssessments = api<void, ListCompetencyAssessmentsResponse>(
  { expose: true, method: "GET", path: "/security/competency-assessments", auth: true },
  async () => {
    const auth = getAuthData()!;
    
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only admins can view competency assessments");
    }

    const assessments = await db.queryAll<CompetencyAssessment>`
      SELECT id, personnel_id as "personnelId", competency_type as "competencyType", assessment_date as "assessmentDate",
             score, assessor_id as "assessorId", certification_valid_until as "certificationValidUntil",
             notes, status, created_at as "createdAt", updated_at as "updatedAt"
      FROM competency_assessments
      ORDER BY assessment_date DESC
    `;

    return { assessments };
  }
);

// Retrieves all security personnel with their user information.
export const listSecurityPersonnel = api<void, ListSecurityPersonnelResponse>(
  { expose: true, method: "GET", path: "/security/personnel", auth: true },
  async () => {
    const auth = getAuthData()!;
    
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only admins can view security personnel");
    }

    const personnel = await db.queryAll<SecurityPersonnel & { firstName: string; lastName: string; email: string }>`
      SELECT sp.id, sp.user_id as "userId", sp.badge_number as "badgeNumber", sp.security_level as "securityLevel",
             sp.hire_date as "hireDate", sp.shift_assignment as "shiftAssignment", sp.is_active as "isActive",
             u.first_name as "firstName", u.last_name as "lastName", u.email
      FROM security_personnel sp
      JOIN users u ON sp.user_id = u.id
      ORDER BY sp.badge_number
    `;

    const formattedPersonnel = personnel.map(p => ({
      id: p.id,
      userId: p.userId,
      badgeNumber: p.badgeNumber,
      securityLevel: p.securityLevel,
      hireDate: p.hireDate,
      shiftAssignment: p.shiftAssignment,
      isActive: p.isActive,
      user: {
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
      },
    }));

    return { personnel: formattedPersonnel };
  }
);
