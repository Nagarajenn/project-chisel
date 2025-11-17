-- Create storage bucket for project files
insert into storage.buckets (id, name, public) 
values ('project-files', 'project-files', false);

-- Create storage policies for project files
create policy "Users can view their own files"
  on storage.objects for select
  using (bucket_id = 'project-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own files"
  on storage.objects for insert
  with check (bucket_id = 'project-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own files"
  on storage.objects for update
  using (bucket_id = 'project-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own files"
  on storage.objects for delete
  using (bucket_id = 'project-files' and auth.uid()::text = (storage.foldername(name))[1]);