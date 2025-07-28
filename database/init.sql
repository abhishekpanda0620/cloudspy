-- CloudSpy Database Initialization Script
-- This script sets up the initial database schema for CloudSpy

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE cloud_provider AS ENUM ('aws', 'gcp', 'azure');
CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error', 'pending');
CREATE TYPE resource_status AS ENUM ('running', 'stopped', 'pending', 'terminated');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cloud integrations table
CREATE TABLE cloud_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider cloud_provider NOT NULL,
    name VARCHAR(255) NOT NULL,
    status integration_status DEFAULT 'pending',
    credentials JSONB NOT NULL, -- Encrypted credentials
    configuration JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider, name)
);

-- Cost data table
CREATE TABLE cost_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES cloud_integrations(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255),
    cost_amount DECIMAL(12, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    usage_quantity DECIMAL(12, 4),
    usage_unit VARCHAR(100),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    region VARCHAR(100),
    tags JSONB DEFAULT '{}',
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES cloud_integrations(id) ON DELETE CASCADE,
    resource_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(255) NOT NULL,
    resource_name VARCHAR(255),
    status resource_status,
    region VARCHAR(100),
    tags JSONB DEFAULT '{}',
    configuration JSONB DEFAULT '{}',
    monthly_cost DECIMAL(10, 2),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_id, resource_id)
);

-- Cost alerts table
CREATE TABLE cost_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES cloud_integrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    threshold_amount DECIMAL(10, 2) NOT NULL,
    threshold_type VARCHAR(50) DEFAULT 'monthly', -- monthly, daily, total
    is_active BOOLEAN DEFAULT true,
    notification_channels JSONB DEFAULT '[]', -- email, slack, webhook
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync logs table
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES cloud_integrations(id) ON DELETE CASCADE,
    sync_type VARCHAR(100) NOT NULL, -- cost_data, resources, both
    status VARCHAR(50) NOT NULL, -- success, error, in_progress
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER
);

-- Create indexes for better performance
CREATE INDEX idx_cost_data_integration_period ON cost_data(integration_id, billing_period_start, billing_period_end);
CREATE INDEX idx_cost_data_service ON cost_data(service_name);
CREATE INDEX idx_cost_data_region ON cost_data(region);
CREATE INDEX idx_cost_data_created_at ON cost_data(created_at);

CREATE INDEX idx_resources_integration ON resources(integration_id);
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_region ON resources(region);

CREATE INDEX idx_cloud_integrations_user ON cloud_integrations(user_id);
CREATE INDEX idx_cloud_integrations_provider ON cloud_integrations(provider);
CREATE INDEX idx_cloud_integrations_status ON cloud_integrations(status);

CREATE INDEX idx_sync_logs_integration ON sync_logs(integration_id);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cloud_integrations_updated_at BEFORE UPDATE ON cloud_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_alerts_updated_at BEFORE UPDATE ON cost_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO users (email, hashed_password, full_name, is_superuser) VALUES
('admin@cloudspy.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5/Qe2', 'CloudSpy Admin', true),
('demo@cloudspy.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5/Qe2', 'Demo User', false);

-- Create a view for cost summaries
CREATE VIEW cost_summary AS
SELECT 
    ci.user_id,
    ci.provider,
    ci.name as integration_name,
    DATE_TRUNC('month', cd.billing_period_start) as month,
    SUM(cd.cost_amount) as total_cost,
    COUNT(DISTINCT cd.service_name) as service_count,
    COUNT(DISTINCT cd.resource_id) as resource_count
FROM cost_data cd
JOIN cloud_integrations ci ON cd.integration_id = ci.id
GROUP BY ci.user_id, ci.provider, ci.name, DATE_TRUNC('month', cd.billing_period_start);

-- Create a view for resource summaries
CREATE VIEW resource_summary AS
SELECT 
    ci.user_id,
    ci.provider,
    r.resource_type,
    r.region,
    r.status,
    COUNT(*) as resource_count,
    SUM(r.monthly_cost) as total_monthly_cost
FROM resources r
JOIN cloud_integrations ci ON r.integration_id = ci.id
GROUP BY ci.user_id, ci.provider, r.resource_type, r.region, r.status;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cloudspy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cloudspy_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO cloudspy_user;