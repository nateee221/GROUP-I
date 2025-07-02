-- Create account_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS account_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by VARCHAR(100),
    reviewed_date TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_account_requests_status ON account_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_requests_email ON account_requests(email);
CREATE INDEX IF NOT EXISTS idx_account_requests_created_at ON account_requests(created_at);

-- Enable Row Level Security
ALTER TABLE account_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this based on your needs)
CREATE POLICY IF NOT EXISTS "Allow all operations on account_requests" ON account_requests
    FOR ALL USING (true);

-- Insert some sample data if table is empty
INSERT INTO account_requests (first_name, last_name, email, department, job_title, reason)
SELECT 'John', 'Doe', 'john.doe@company.com', 'IT Department', 'Software Developer', 'Need access to manage development assets and track project equipment.'
WHERE NOT EXISTS (SELECT 1 FROM account_requests WHERE email = 'john.doe@company.com');

INSERT INTO account_requests (first_name, last_name, email, department, job_title, reason)
SELECT 'Jane', 'Smith', 'jane.smith@company.com', 'Finance Department', 'Financial Analyst', 'Require access to track financial assets and generate cost reports.'
WHERE NOT EXISTS (SELECT 1 FROM account_requests WHERE email = 'jane.smith@company.com');
