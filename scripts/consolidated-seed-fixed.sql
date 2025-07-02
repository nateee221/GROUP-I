-- Asset Tracking System - Sample Data
-- Run this second in Supabase SQL Editor

-- Insert sample departments
INSERT INTO departments (id, name, description, budget, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Information Technology', 'Manages IT infrastructure and systems', 500000.00, 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Human Resources', 'Handles employee relations and recruitment', 200000.00, 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Finance', 'Manages financial operations and budgets', 300000.00, 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Operations', 'Oversees daily operations and logistics', 400000.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, password, first_name, last_name, job_title, department, role, status) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'admin@lgu.gov', 'admin123', 'System', 'Administrator', 'IT Administrator', 'Information Technology', 'admin', 'active'),
('550e8400-e29b-41d4-a716-446655440011', 'head@lgu.gov', 'head123', 'Department', 'Head', 'Department Manager', 'Human Resources', 'department_head', 'active'),
('550e8400-e29b-41d4-a716-446655440012', 'staff@lgu.gov', 'staff123', 'Staff', 'Member', 'Asset Coordinator', 'Operations', 'staff', 'active')
ON CONFLICT (email) DO NOTHING;

-- Update department heads
UPDATE departments SET head_id = '550e8400-e29b-41d4-a716-446655440010' WHERE name = 'Information Technology';
UPDATE departments SET head_id = '550e8400-e29b-41d4-a716-446655440011' WHERE name = 'Human Resources';

-- Insert sample assets
INSERT INTO assets (id, asset_number, name, description, category, brand, model, serial_number, purchase_date, purchase_cost, current_value, condition, status, location, department_id) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'LGU-IT-001', 'Dell OptiPlex Desktop', 'Desktop computer for office use', 'Computer Equipment', 'Dell', 'OptiPlex 7090', 'DL7090001', '2023-01-15', 45000.00, 40000.00, 'good', 'assigned', 'IT Office Room 101', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440021', 'LGU-IT-002', 'HP LaserJet Printer', 'Network printer for document printing', 'Office Equipment', 'HP', 'LaserJet Pro M404n', 'HP404001', '2023-02-20', 15000.00, 13000.00, 'excellent', 'available', 'IT Office Room 102', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440022', 'LGU-HR-001', 'Office Chair', 'Ergonomic office chair', 'Furniture', 'Steelcase', 'Leap V2', 'SC2023001', '2023-03-10', 25000.00, 22000.00, 'good', 'assigned', 'HR Office Room 201', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440023', 'LGU-FIN-001', 'Filing Cabinet', '4-drawer steel filing cabinet', 'Furniture', 'Steelcase', 'Series 9', 'SC9001', '2023-01-25', 12000.00, 10000.00, 'good', 'available', 'Finance Office Room 301', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (asset_number) DO NOTHING;

-- Insert sample assignments
INSERT INTO assignments (id, asset_id, user_id, assigned_by, assigned_date, status, notes) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', '2023-01-16 09:00:00+00', 'active', 'Primary workstation assignment'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010', '2023-03-11 10:30:00+00', 'active', 'Office furniture assignment')
ON CONFLICT (id) DO NOTHING;

-- Update asset assignments
UPDATE assets SET assigned_to = '550e8400-e29b-41d4-a716-446655440010' WHERE id = '550e8400-e29b-41d4-a716-446655440020';
UPDATE assets SET assigned_to = '550e8400-e29b-41d4-a716-446655440011' WHERE id = '550e8400-e29b-41d4-a716-446655440022';

-- Insert sample maintenance records
INSERT INTO maintenance_records (id, asset_id, maintenance_type, description, performed_by, performed_date, cost, next_maintenance_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440020', 'preventive', 'System cleanup and software updates', 'IT Support Team', '2023-06-15', 500.00, '2023-12-15', 'completed'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440021', 'preventive', 'Printer maintenance and toner replacement', 'IT Support Team', '2023-07-20', 2000.00, '2024-01-20', 'completed')
ON CONFLICT (id) DO NOTHING;

-- Insert sample account requests
INSERT INTO account_requests (id, email, first_name, last_name, department, job_title, reason, status, requested_at) VALUES
('550e8400-e29b-41d4-a716-446655440050', 'newuser@lgu.gov', 'New', 'User', 'Operations', 'Asset Manager', 'Need access to manage department assets', 'pending', '2023-12-01 14:30:00+00'),
('550e8400-e29b-41d4-a716-446655440051', 'contractor@external.com', 'External', 'Contractor', 'IT', 'System Analyst', 'Temporary access for system upgrade project', 'pending', '2023-12-02 09:15:00+00')
ON CONFLICT (id) DO NOTHING;
