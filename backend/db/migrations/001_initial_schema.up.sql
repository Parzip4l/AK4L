-- Users table with roles
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'visitor')),
  department VARCHAR(100),
  employee_id VARCHAR(50),
  phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Safety metrics tracking
CREATE TABLE safety_metrics (
  id BIGSERIAL PRIMARY KEY,
  reported_by BIGINT NOT NULL REFERENCES users(id),
  incident_type VARCHAR(50) NOT NULL,
  severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  location VARCHAR(200) NOT NULL,
  date_occurred TIMESTAMP WITH TIME ZONE NOT NULL,
  actions_taken TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Medical reports with approval workflow
CREATE TABLE medical_reports (
  id BIGSERIAL PRIMARY KEY,
  patient_name VARCHAR(200) NOT NULL,
  employee_id VARCHAR(50),
  report_type VARCHAR(50) NOT NULL,
  medical_condition TEXT NOT NULL,
  treatment_provided TEXT,
  recommendations TEXT,
  reported_by BIGINT NOT NULL REFERENCES users(id),
  reviewed_by BIGINT REFERENCES users(id),
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'revision_required')),
  approval_notes TEXT,
  date_of_incident TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Visitor requests
CREATE TABLE visitor_requests (
  id BIGSERIAL PRIMARY KEY,
  visitor_name VARCHAR(200) NOT NULL,
  visitor_email VARCHAR(255),
  visitor_phone VARCHAR(20),
  company VARCHAR(200),
  purpose_of_visit TEXT NOT NULL,
  host_employee BIGINT NOT NULL REFERENCES users(id),
  areas_to_visit TEXT[] NOT NULL,
  requested_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours INTEGER NOT NULL,
  special_requirements TEXT,
  security_clearance_level VARCHAR(20) NOT NULL DEFAULT 'basic' CHECK (security_clearance_level IN ('basic', 'restricted', 'confidential')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  approved_by BIGINT REFERENCES users(id),
  approval_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Security personnel and certifications
CREATE TABLE security_personnel (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  badge_number VARCHAR(50) UNIQUE NOT NULL,
  security_level VARCHAR(20) NOT NULL CHECK (security_level IN ('level1', 'level2', 'level3', 'supervisor')),
  hire_date DATE NOT NULL,
  shift_assignment VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Competency monitoring
CREATE TABLE competency_assessments (
  id BIGSERIAL PRIMARY KEY,
  personnel_id BIGINT NOT NULL REFERENCES security_personnel(id),
  competency_type VARCHAR(100) NOT NULL,
  assessment_date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  assessor_id BIGINT NOT NULL REFERENCES users(id),
  certification_valid_until DATE,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending_renewal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_safety_metrics_status ON safety_metrics(status);
CREATE INDEX idx_safety_metrics_severity ON safety_metrics(severity_level);
CREATE INDEX idx_medical_reports_status ON medical_reports(approval_status);
CREATE INDEX idx_visitor_requests_status ON visitor_requests(status);
CREATE INDEX idx_visitor_requests_date ON visitor_requests(requested_date);
CREATE INDEX idx_competency_assessments_status ON competency_assessments(status);
