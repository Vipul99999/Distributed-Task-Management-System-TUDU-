/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.sql(`
-- Create ENUM for user roles
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'user');

-- Create ENUM for authentication providers
CREATE TYPE IF NOT EXISTS auth_provider AS ENUM ('local', 'google', 'github');

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id UUID DEFAULT gen_random_uuid() UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role user_role DEFAULT 'user',
    auth_providers auth_provider[] DEFAULT '{}',
    github_id VARCHAR(100) UNIQUE,
    google_id VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- GIN index for auth_providers array
CREATE INDEX IF NOT EXISTS users_auth_providers_idx
ON users USING GIN (auth_providers);

-- Partial index for local providers
CREATE INDEX IF NOT EXISTS users_auth_providers_local_idx
ON users (id)
WHERE 'local' = ANY(auth_providers) OR password_hash IS NOT NULL;

-- Check constraint for local accounts
ALTER TABLE users
ADD CONSTRAINT check_password_hash_local
CHECK (
  NOT ('local' = ANY(auth_providers))
  OR password_hash IS NOT NULL
);

-- Email verification table
CREATE TABLE IF NOT EXISTS email_verifications (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(100) UNIQUE NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Password reset table
CREATE TABLE IF NOT EXISTS password_resets (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table (optimized)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(public_id) ON DELETE CASCADE,
    token TEXT NOT NULL,                -- bcrypt hash of refresh token
    sha256_token TEXT UNIQUE,           -- SHA256 hash for fast lookup
    device_name VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE
);

-- Index for fast queries per user
CREATE INDEX IF NOT EXISTS idx_refresh_user_revoked_exp 
ON refresh_tokens(user_id, revoked, expires_at);

-- Index for fast lookup by SHA256 hash
CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_sha256_token 
ON refresh_tokens(sha256_token);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP FUNCTION IF EXISTS update_updated_at_column();
  `);

  pgm.dropTable("refresh_tokens", { ifExists: true });
  pgm.dropTable("password_resets", { ifExists: true });
  pgm.dropTable("email_verifications", { ifExists: true });
  pgm.dropTable("users", { ifExists: true });

  pgm.sql(`DROP TYPE IF EXISTS auth_provider CASCADE;`);
  pgm.sql(`DROP TYPE IF EXISTS user_role CASCADE;`);
};
