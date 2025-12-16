-- Create blueprint_versions table for version history
CREATE TABLE public.blueprint_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  change_summary text
);

-- Enable RLS
ALTER TABLE public.blueprint_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for blueprint_versions
CREATE POLICY "Users can view versions of their blueprints"
ON public.blueprint_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blueprints 
    WHERE blueprints.id = blueprint_versions.blueprint_id 
    AND blueprints.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create versions for their blueprints"
ON public.blueprint_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.blueprints 
    WHERE blueprints.id = blueprint_versions.blueprint_id 
    AND blueprints.user_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_blueprint_versions_blueprint_id ON public.blueprint_versions(blueprint_id);
CREATE INDEX idx_blueprint_versions_version_number ON public.blueprint_versions(blueprint_id, version_number DESC);