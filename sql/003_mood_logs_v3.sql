-- ============================================================
-- SomaTone Migration 003: Mood Logs V3 — 24 Sub-Emotion Support
-- Run this in the Supabase SQL Editor (after 002_mood_logs.sql)
-- Non-destructive: adds new columns to existing table.
-- ============================================================

-- Add granular emotion columns
ALTER TABLE public.mood_logs
  ADD COLUMN IF NOT EXISTS sub_emotion text,
  ADD COLUMN IF NOT EXISTS emotion_pillar text,
  ADD COLUMN IF NOT EXISTS emotion_scores jsonb,
  ADD COLUMN IF NOT EXISTS vocal_anomaly text;

-- Index for sub-emotion queries
CREATE INDEX IF NOT EXISTS idx_mood_logs_sub_emotion ON public.mood_logs(sub_emotion);
CREATE INDEX IF NOT EXISTS idx_mood_logs_pillar ON public.mood_logs(emotion_pillar);
