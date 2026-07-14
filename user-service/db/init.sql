CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id),
    followee_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_follow UNIQUE (follower_id, followee_id)
);

CREATE INDEX idx_follows_followee ON follows(followee_id);
