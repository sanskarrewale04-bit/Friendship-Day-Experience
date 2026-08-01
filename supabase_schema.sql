-- ========================================================
-- SUPABASE SCHEMA FOR FRIENDSHIP DAY EXPERIENCE
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT UNIQUE NOT NULL,
  sender_name TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  theme TEXT DEFAULT 'friendship',
  opening_config JSONB DEFAULT '{}'::jsonb,
  custom_message TEXT,
  commitments JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  music_url TEXT,
  agreement_pdf TEXT,
  agreement_png TEXT,
  certificate_pdf TEXT,
  certificate_png TEXT,
  sender_signature JSONB DEFAULT '{}'::jsonb,
  recipient_signature JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published'
);

-- Index for share_id lookup
CREATE INDEX IF NOT EXISTS idx_experiences_share_id ON public.experiences(share_id);
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON public.experiences(created_at DESC);

-- 2. AGREEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  agreement_html TEXT,
  agreement_pdf TEXT,
  agreement_png TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreements_experience_id ON public.agreements(experience_id);

-- 3. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  certificate_html TEXT,
  certificate_pdf TEXT,
  certificate_png TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_experience_id ON public.certificates(experience_id);

-- 4. ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  views INT DEFAULT 0,
  shares JSONB DEFAULT '{"whatsapp":0,"telegram":0,"facebook":0,"directCopy":0}'::jsonb,
  downloads INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_analytics_experience_id ON public.analytics(experience_id);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for experiences (for guest creation & viewing)
CREATE POLICY "Allow public access to experiences" ON public.experiences
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to agreements" ON public.agreements
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to certificates" ON public.certificates
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to analytics" ON public.analytics
  FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- STORAGE BUCKETS SETUP (EXACT NAMES: photos, music, agreement, certificates)
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('photos', 'photos', true),
  ('music', 'music', true),
  ('agreement', 'agreement', true),
  ('certificates', 'certificates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies for public access
CREATE POLICY "Allow public bucket access for photos" ON storage.objects
  FOR ALL USING (bucket_id = 'photos') WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Allow public bucket access for music" ON storage.objects
  FOR ALL USING (bucket_id = 'music') WITH CHECK (bucket_id = 'music');

CREATE POLICY "Allow public bucket access for agreement" ON storage.objects
  FOR ALL USING (bucket_id = 'agreement') WITH CHECK (bucket_id = 'agreement');

CREATE POLICY "Allow public bucket access for certificates" ON storage.objects
  FOR ALL USING (bucket_id = 'certificates') WITH CHECK (bucket_id = 'certificates');
