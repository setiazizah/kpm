ALTER TABLE raw_content
ADD COLUMN IF NOT EXISTS embedded BOOLEAN DEFAULT FALSE;

-- Index untuk mempercepat query ingestion task
CREATE INDEX IF NOT EXISTS idx_raw_content_embedded
ON raw_content (embedded)
WHERE embedded = FALSE;

-- Verifikasi
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE embedded = true)  as sudah_embed,
       COUNT(*) FILTER (WHERE embedded = false) as belum_embed
FROM raw_content;