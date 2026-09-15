-- El tamaño local conserva el archivo original seleccionado por el usuario.
-- El tamaño optimizado se completa al finalizar el procesamiento asíncrono de Cloudinary.
alter table public.shipment_attachments
  add column if not exists optimized_file_size bigint,
  add column if not exists optimized_at timestamptz;

