-- Identifica dónde vive el archivo físico. Los adjuntos existentes permanecen
-- en Supabase y los nuevos videos pueden almacenarse en Cloudinary.
alter table public.shipment_attachments
  add column if not exists storage_provider text not null default 'supabase'
  check (storage_provider in ('supabase', 'cloudinary'));

