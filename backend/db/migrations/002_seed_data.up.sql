-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, department, employee_id, phone) VALUES
('admin@ak4l.com', '$2a$10$rQ8KJ4gZJ4gZJ4gZJ4gZJOX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Admin', 'User', 'admin', 'Administration', 'EMP001', '+1-555-0001'),
('visitor@ak4l.com', '$2a$10$rQ8KJ4gZJ4gZJ4gZJ4gZJOX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Visitor', 'User', 'visitor', 'General', 'EMP002', '+1-555-0002');

-- Insert sample safety metrics
INSERT INTO safety_metrics (reported_by, incident_type, severity_level, description, location, date_occurred, actions_taken, status) VALUES
(1, 'Near Miss', 'medium', 'Employee almost slipped on wet floor in cafeteria', 'Cafeteria', NOW() - INTERVAL '2 days', 'Added warning signs and increased cleaning frequency', 'resolved'),
(1, 'Equipment Malfunction', 'high', 'Conveyor belt safety guard was loose', 'Production Floor A', NOW() - INTERVAL '5 days', 'Immediate shutdown and repair completed', 'closed'),
(2, 'Chemical Spill', 'low', 'Small cleaning solution spill in storage room', 'Storage Room B', NOW() - INTERVAL '1 day', 'Area cleaned and ventilated', 'open');

-- Insert sample medical reports
INSERT INTO medical_reports (patient_name, employee_id, report_type, medical_condition, treatment_provided, recommendations, reported_by, approval_status, date_of_incident) VALUES
('John Smith', 'EMP001', 'Workplace Injury', 'Minor cut on left hand from handling materials', 'First aid administered, wound cleaned and bandaged', 'Use protective gloves when handling materials', 1, 'pending', NOW() - INTERVAL '1 day'),
('Jane Doe', 'EMP002', 'Occupational Health', 'Complaint of eye strain from computer work', 'Eye examination recommended', 'Adjust monitor height and lighting, schedule regular eye breaks', 1, 'approved', NOW() - INTERVAL '3 days');

-- Insert sample visitor requests
INSERT INTO visitor_requests (visitor_name, visitor_email, visitor_phone, company, purpose_of_visit, host_employee, areas_to_visit, requested_date, duration_hours, security_clearance_level, status) VALUES
('Michael Johnson', 'mjohnson@contractor.com', '+1-555-1234', 'ABC Contractors', 'Equipment installation and setup', 1, '{"Production Floor A", "Storage Area"}', NOW() + INTERVAL '2 days', 4, 'restricted', 'pending'),
('Sarah Wilson', 'swilson@vendor.com', '+1-555-5678', 'XYZ Suppliers', 'Quarterly vendor meeting and facility tour', 1, '{"Conference Room", "Reception"}', NOW() + INTERVAL '1 day', 2, 'basic', 'approved');

-- Insert sample security personnel
INSERT INTO security_personnel (user_id, badge_number, security_level, hire_date, shift_assignment) VALUES
(1, 'SEC001', 'supervisor', '2023-01-15', 'day_shift'),
(2, 'SEC002', 'level2', '2023-06-01', 'night_shift');

-- Insert sample competency assessments
INSERT INTO competency_assessments (personnel_id, competency_type, assessment_date, score, assessor_id, certification_valid_until, notes, status) VALUES
(1, 'Emergency Response', '2024-01-15', 95, 1, '2025-01-15', 'Excellent performance in all scenarios', 'active'),
(1, 'Access Control Systems', '2024-02-01', 88, 1, '2025-02-01', 'Good understanding, minor improvements needed', 'active'),
(2, 'Basic Security Protocols', '2024-01-20', 92, 1, '2025-01-20', 'Strong knowledge of procedures', 'active');
