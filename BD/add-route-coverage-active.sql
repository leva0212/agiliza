-- Cobertura reversible: no elimina barrios, distritos ni sus configuraciones.
alter table public.routes
  add column if not exists coverage_active boolean not null default true;

create index if not exists routes_coverage_active_idx
  on public.routes (coverage_active)
  where coverage_active is true;
