# Data Contract: Media Monitor Datalake Ecosystem

**Version:** 6.0.0 (High-Fidelity Engineering Document)  
**Status:** Approved & Finalized  
**Last Updated:** 2026-03-11  
**Project Owner:** MKA-UGM AITF (Data Engineering & Crawler Team)  
**Stakeholders:** Data Science, Analytics, and Product MVP Division  

---

## 1. Executive Summary
This Data Contract serves as the definitive technical agreement governing the ingestion, structuring, and quality of data migrating from raw external platforms into the **Media Monitor Datalake**. This ecosystem utilizes a hybrid extraction approach—combining autonomous HTML parsing (Crawl4AI) with API-intercepted Actors (Apify)—to populate a robust multi-layered architectural repository (Bronze, Silver, Control layers).

This document mandates the exact schema definitions, metadata semantics, asset storage rules, and Service Level Agreements (SLAs) required to ensure downstream consumers receive high-fidelity, privacy-compliant, and analytically-ready data.

---

## 2. Ingestion Architecture & Topologies

### 2.1 Ecosystem Layers
| Layer | Description | Target Consumers |
| :--- | :--- | :--- |
| **Bronze Layer** | Immutable raw data (text, metrics, comment structures) mapped exactly as it appeared at the time of extraction. | Data Engineers, Raw NLP Pipelines |
| **Silver Layer** | Master configuration data containing Taxonomy definitions, active Keyword Corpuses, and Crawler rulesets. | System Orchestrators, Platform Admins |
| **Control Layer** | Audit trails and execution manifests for pipeline success/failure tracking. | DevOps, Data Reliability Engineers |

### 2.2 Ingestion Vectors
| Platform | Target Content Type | Extraction Engine | Trigger Mechanism |
| :--- | :--- | :--- | :--- |
| **TikTok** | Short Videos (`video`) | Apify Actor (`GdWCkxBtKWOsKjdch`) | Automated Cron / Manual Batch |
| **YouTube** | YouTube Shorts (`video`) | Apify Actor (`h7sDV53CddomktSi5`) | Automated Cron / Manual Batch |
| **Media Online** | News Articles (`article`) | Crawl4AI (Custom CSS Targets) | Automated Cron / Manual Batch |
*(Note: Instagram scraping has been deprecated in v4 due to extreme authentication barriers and replaced by YouTube Shorts).*

---

## 3. Bronze Layer: Core Entity Contracts

### 3.1 Entity: `raw_content` (Fact Table)
This table acts as the fundamental entry point for all posts, short-videos, and news articles.

| Column Name | SQL Datatype | Contract / Constraint | Semantic Description |
| :--- | :--- | :--- | :--- |
| `content_id` | `VARCHAR(64)` | `PK` | Globally unique ID format: `cnt-{platform}-{uuid}`. |
| `platform` | `platform_enum` | `NOT NULL` | Permitted values: `tiktok`, `youtube_shorts`, `media_online`. |
| `content_type` | `content_type_enum` | `NOT NULL` | Permitted values: `post`, `video`, `article`. |
| `raw_text` | `TEXT` | `OPTIONAL` | The primary narrative (News Body, TikTok/YT Caption). Stripped of HTML scripts/styling. |
| `media_urls` | `JSONB` | `NOT NULL` | Local bucket keys or original URLs for assets. Keys: `thumbnail`, `audio`, `video`, `images`. |
| `url_source` | `TEXT` | `NOT NULL` | The canonical permalink directly leading to the original source payload. |
| `author_id` | `VARCHAR(64)` | `NOT NULL` | A strict privacy requirement: **SHA-256 Hashed** representation of username/handle. |
| `keyword_refs` | `VARCHAR[]` | `NOT NULL` | The root keywords that triggered the discovery of this content. |
| `taxonomy_category`| `taxonomy_category_enum` | `OPTIONAL` | Algorithmic classification result mapping to Silver taxonomy. |
| `extra_metadata` | `JSONB` | `NOT NULL` | Rich, platform-specific nested data. *(See Section 6).* |
| `publish_date` | `DATE` | `OPTIONAL` | Extracted content creation date (Normalized to UTC Date). |
| `crawl_timestamp` | `TIMESTAMPTZ` | `NOT NULL` | Exact system timestamp representing datalake ingestion. |
| `batch_id` | `VARCHAR(64)` | `FK` | Link to `batch_manifest` providing lineage trail. |

### 3.2 Entity: `post_comment` (Engagement Table)
Tracks public sentiment footprints linked directly to social video objects.

| Column Name | SQL Datatype | Contract / Constraint | Semantic Description |
| :--- | :--- | :--- | :--- |
| `comment_id` | `VARCHAR(64)` | `PK` | Globally unique ID format: `cmt-{uuid}`. |
| `post_content_id` | `VARCHAR(64)` | `FK` | Link to the parent object (`raw_content.content_id`). |
| `platform` | `platform_enum` | `NOT NULL` | Duplicate dimension to partition comment datasets safely. |
| `comment_text` | `TEXT` | `NOT NULL` | The sanitized text payload provided by the public user. |
| `likes_count` | `INTEGER` | `DEFAULT 0` | Crucial metric denoting community consensus on the comment. `min_comment_likes` system config is applied before insertion. |
| `is_reply` | `BOOLEAN` | `DEFAULT FALSE` | True if this comment acts as a threaded reply to a master comment. |
| `parent_comment_id`| `VARCHAR(64)` | `OPTIONAL` | If `is_reply` is True, identifies the master comment. |
| `author_id` | `VARCHAR(64)` | `NOT NULL` | **SHA-256 Hashed** representation of the commenter. |

---

## 4. Operational Assets: Media Manifests
To reduce latency and dependency on third-party CDNs, visual and audio assets are downloaded and physically persisted in the internal `Supabase Storage (Bucket: datalake)`.

### 4.1 Visual Manifest (`image_manifest`)
Stores dimensions and paths for article cover photos and video thumbnails.
- **Primary Schema:** `image_id` (PK, `img-...`), `content_id_ref` (FK).
- **Storage Pattern:** `bronze/images/{platform}/{YYYYMMDD}/{random}.jpg`
- **Integrity Rule:** If hotlink protection (`403 Forbidden`) triggers on download, the manifest is aborted, but `raw_content.media_urls` successfully retains the canonical proxy URL.

### 4.2 Acoustic Manifest (`audio_manifest`)
Specifically vital for TikTok "Original Sounds" transcription (Voice-to-Text pipelines).
- **Primary Schema:** `audio_id` (PK, `aud-...`), `duration_sec`, `has_speech`.
- **Storage Pattern:** `bronze/audio/tiktok/{YYYYMMDD}/{random}.mp3`
- **Network Rule:** Download requests bypass blocks by presenting headers explicitly mirroring web clients (`User-Agent`, `Referer: https://www.tiktok.com/`, `Range: bytes=0-`).

---

## 5. Silver Layer: Master Taxonomy Index
The pipeline organizes ingested data against 11 standardized intelligence categories (`TAXONOMY_CATEGORY_ENUM`).
1. `Integritas & Penegakan Hukum`
2. `Kebijakan & Layanan Publik`
3. `Kinerja Pemerintah`
4. `Keamanan Siber & Ketertiban Digital`
5. `Kesejahteraan & Bantuan Sosial`
6. `Infrastruktur & Layanan Transportasi`
7. `Ekonomi Digital`
8. `Ketenagakerjaan`
9. `Layanan Kesehatan`
10. `Pendidikan dan Pengembangan SDM`
11. `Krisis Sosial & Kebencanaan`

---

## 6. Deep Semantic Mapping: `extra_metadata` JSONB Document

Because platforms generate wildly varied data structures, `extra_metadata` enforces a strict semantic schema specific to the target platform. Downstream SQL aggregations depend on the stability of these key names.

### 6.1 TikTok Specifics
```json
{
  "views": 817500,                  // Absolute total view impressions
  "likes": 2240,                    // Total user heart responses
  "shares": 114,                    // Video distribution coefficient
  "duration_sec": 55.4,             // Floating point length of video
  "music_title": "Suara asli - Jabar Ekspres", // Identity of the audio track
  "music_author": "Jabar Ekspres"   // Original uploader of the audio
}
```

### 6.2 YouTube Shorts Specifics
```json
{
  "title": "BERTAMINA Belum Naik Harga BBM", // Short-form dedicated title
  "channel_name": "Tribun MedanTV",         // Display alias of the creator
  "channel_id": "UCwFc1...",                // Canonical YouTube Channel ID
  "views": 23876,                           // Total views generated
  "likes": 799,                             // Upvote metric
  "duration": "00:01:37",                   // Extracted ISO/string time bounds
  "comments_count": 87,                     // Total volume of expected comments
  "subscribers": 5910000                    // Audience footprint map
}
```

### 6.3 Media Online Specifics
```json
{
  "title": "Harga Beras Dunia Turun, RI Tetap Impor?", // Full extraction of <H1>
  "domain": "cnbcindonesia.com",                     // The target origin site
  "author": "Putri Anggraeni (Tim Riset)",            // Cleaned string reporter/editor identity
  "og_description": "Badan Pusat Statistik (BPS) mencatat..." // Derived SEO description / summary
}
```

---

## 7. Operational Commitments & SLAs

### 7.1 Data Integrity & Privacy (Zero-Tolerance)
1. **Personally Identifiable Information (PII) Wall**: No plain-text internal IDs, account handles, or user names are permitted in `author_id` or inside `extra_metadata` arrays across the Bronze layer. They must undergo SHA-256 transformations at the crawler level via `self.hash_author()`.
2. **Atomic Transits**: Crawled posts and their child comments are inserted using atomic database sessions via `crawl_service.py`. If a comment fails to parse, the post insert may succeed, but if the post fails, the comments are rolled back. 

<!-- ### 7.2 Service Level Agreement (Latency & Completeness)
1. **Freshness Latency**: Crawl execution (`Cron Batch`) mapping to database commit must clear within **< 180 seconds** to ensure near real-time ingestion patterns.
2. **Text Volume Compliance**: `media_online` entries must securely extract the core article narrative, mitigating `<script>` tags, navigation sidebars, and paywall overlays (driven by the Crawl4AI `JsonCssExtractionStrategy`).
3. **Actor Rate Limitations**: YouTube and TikTok extractions respect `max_results_per_keyword` limits dynamically mapped from `crawler_config` controls to avoid excessive API budget draw (Target: ~4,000 requests per 24 hours safely spread). -->

---

<!-- ## 8. Ratification Registry
Implementation of this Contract signals readiness for analytic model development, downstream dashboard building (Metabase/Looker), and AI fine-tuning.

| Role | Sign-Off Authorization | Status |
| :--- | :--- | :--- |
| **Data Engineering Lead** | `[MKA-AITF DE-Core]` | **APPROVED** |
| **Data Science Lead** | `[MKA-AITF DS-Models]` | **PENDING** |
| **Product MVP** | `[MKA-AITF Prod-Owner]` | **PENDING** | -->
