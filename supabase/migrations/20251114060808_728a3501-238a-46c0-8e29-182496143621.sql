-- Enable pgvector extension for vector embeddings
create extension if not exists vector;

-- Create enum for user roles
create type public.app_role as enum ('admin', 'engineer', 'analyst');

-- Create enum for artifact types
create type public.artifact_type as enum ('code', 'dashboard', 'report', 'document', 'presentation');

-- Create projects table
create table public.projects (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.projects enable row level security;

-- Create artifacts table with vector embeddings
create table public.artifacts (
  id uuid not null default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type public.artifact_type not null,
  source_path text,
  content text,
  tags text[],
  embedding vector(1536),
  success_score integer check (success_score >= 0 and success_score <= 100),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

alter table public.artifacts enable row level security;

-- Create blueprints table
create table public.blueprints (
  id uuid not null default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  intent text,
  content_json jsonb not null default '{}'::jsonb,
  artifact_ids uuid[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.blueprints enable row level security;

-- Create user_roles table
create table public.user_roles (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamp with time zone not null default now(),
  unique(user_id, role)
);

alter table public.user_roles enable row level security;

-- Create audit_log table
create table public.audit_log (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target text not null,
  details jsonb default '{}'::jsonb,
  timestamp timestamp with time zone not null default now()
);

alter table public.audit_log enable row level security;

-- Create profiles table for user metadata
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

-- Create function to check user roles (security definer to avoid RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger update_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at_column();

create trigger update_blueprints_updated_at
  before update on public.blueprints
  for each row execute function public.update_updated_at_column();

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Create trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email
  );
  
  -- Assign default role (analyst)
  insert into public.user_roles (user_id, role)
  values (new.id, 'analyst');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS Policies for projects
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- RLS Policies for artifacts
create policy "Users can view their own artifacts"
  on public.artifacts for select
  using (auth.uid() = user_id);

create policy "Users can create their own artifacts"
  on public.artifacts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own artifacts"
  on public.artifacts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own artifacts"
  on public.artifacts for delete
  using (auth.uid() = user_id);

-- RLS Policies for blueprints
create policy "Users can view their own blueprints"
  on public.blueprints for select
  using (auth.uid() = user_id);

create policy "Users can create their own blueprints"
  on public.blueprints for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own blueprints"
  on public.blueprints for update
  using (auth.uid() = user_id);

create policy "Users can delete their own blueprints"
  on public.blueprints for delete
  using (auth.uid() = user_id);

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can manage all roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for audit_log
create policy "Users can view their own audit logs"
  on public.audit_log for select
  using (auth.uid() = user_id);

create policy "Admins can view all audit logs"
  on public.audit_log for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "All authenticated users can insert audit logs"
  on public.audit_log for insert
  with check (auth.uid() = user_id);

-- RLS Policies for profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create indexes for performance
create index idx_artifacts_user_id on public.artifacts(user_id);
create index idx_artifacts_project_id on public.artifacts(project_id);
create index idx_artifacts_embedding on public.artifacts using ivfflat (embedding vector_cosine_ops);
create index idx_blueprints_user_id on public.blueprints(user_id);
create index idx_projects_user_id on public.projects(user_id);
create index idx_audit_log_user_id on public.audit_log(user_id);
create index idx_audit_log_timestamp on public.audit_log(timestamp desc);