-- Privacy consents for GDPR/data governance compliance
CREATE TABLE privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  consent_type TEXT NOT NULL,
  consented_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT
);

ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consents" ON privacy_consents
  FOR ALL USING (auth.uid() = user_id);
