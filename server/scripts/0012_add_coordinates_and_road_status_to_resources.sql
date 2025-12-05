BEGIN;

ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS coordinates JSONB,
    ADD COLUMN IF NOT EXISTS road_status TEXT;

-- Optional explicit lat/lng support if you want it later
ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

COMMIT;
