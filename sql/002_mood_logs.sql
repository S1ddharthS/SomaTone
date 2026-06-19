-- ============================================================
-- SomaTone Migration 002: Mood Logs Table (V2 — Dual-Hand + Biometrics)
-- Run this in the Supabase SQL Editor (after 001_profiles.sql)
-- ============================================================

-- Drop existing table if upgrading (WARNING: destroys data)
-- drop table if exists public.mood_logs;

-- mood_logs: timestamped emotional state records per user
create table if not exists public.mood_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  emotion text not null,
  confidence real not null default 0,
  valence real not null default 0,
  arousal real not null default 0,
  burnout_score real default 0,
  blendshapes jsonb,
  active_frequencies jsonb,

  -- Dual-hand tracking
  left_hand_position jsonb,
  right_hand_position jsonb,
  left_hand_gesture text,
  right_hand_gesture text,

  -- Acoustic biomarkers
  acoustic_energy real,
  acoustic_variance real,
  acoustic_jitter real,

  -- Session context
  journal_text text,
  reframe_text text,
  circadian_band text,
  accessibility_mode text,
  session_id uuid default gen_random_uuid(),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.mood_logs enable row level security;

-- RLS Policies
create policy "Users can read own mood logs"
  on public.mood_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own mood logs"
  on public.mood_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own mood logs"
  on public.mood_logs for delete
  using (auth.uid() = user_id);

-- Indexes for efficient querying
create index if not exists idx_mood_logs_user_id on public.mood_logs(user_id);
create index if not exists idx_mood_logs_created_at on public.mood_logs(created_at desc);
create index if not exists idx_mood_logs_user_created on public.mood_logs(user_id, created_at desc);
create index if not exists idx_mood_logs_emotion on public.mood_logs(emotion);
create index if not exists idx_mood_logs_burnout on public.mood_logs(burnout_score) where burnout_score > 0.7;
