-- Create account_requests table
CREATE TABLE IF NOT EXISTS account_requests (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by TEXT,
  reviewed_date TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_account_requests_status ON account_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_requests_email ON account_requests(email);
CREATE INDEX IF NOT EXISTS idx_account_requests_date ON account_requests(request_date);

-- Insert some sample data for testing
INSERT OR IGNORE INTO account_requests (
  id, first_name, last_name, email, department, job_title, reason, status, request_date
) VALUES 
  ('req_001', 'John', 'Doe', 'john.doe@example.com', 'IT Department', 'System Administrator', 'Need access to manage IT assets and infrastructure', 'pending', datetime('now', '-2 days')),
  ('req_002', 'Jane', 'Smith', 'jane.smith@example.com', 'Finance Department', 'Budget Analyst', 'Require access to track financial assets and generate reports', 'pending', datetime('now', '-1 day')),
  ('req_003', 'Mike', 'Johnson', 'mike.johnson@example.com', 'Human Resources', 'HR Specialist', 'Need to manage employee equipment assignments', 'approved', datetime('now', '-3 days'));
