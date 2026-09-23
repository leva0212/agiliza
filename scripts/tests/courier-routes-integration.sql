-- Ejecutar solo en una base vacía con courier-routes-fixture.sql y la migración aplicadas.
create function public.test_assert(ok boolean, label text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAIL: %', label; end if; end $$;
insert into public.companies values ('00000000-0000-0000-0000-000000000901',true),('00000000-0000-0000-0000-000000000902',false);
insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),('00000000-0000-0000-0000-000000000003'),('00000000-0000-0000-0000-000000000004'),('00000000-0000-0000-0000-000000000005');
insert into public.profiles(id,company_id,role,full_name,active,can_deliver) values
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000901','super_admin','Admin',true,false),
 ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000902','courier','Courier A',true,true),
 ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000902','courier','Courier B',true,true),
 ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000902','seller','Seller',true,false),
 ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000901','super_admin','Inactive Admin',false,false);
insert into public.couriers(id,profile_id,active) values ('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000002',true),('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000003',true);
insert into public.routes(id,name,active) values ('00000000-0000-0000-0000-000000000201','Route A',true),('00000000-0000-0000-0000-000000000202','Route B',true),('00000000-0000-0000-0000-000000000203','Inactive',false);
insert into public.neighborhoods values (1);
insert into public.route_coverage(route_id,neighborhood_id) values ('00000000-0000-0000-0000-000000000201',1);

set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select public.save_courier_route_assignments('courier','00000000-0000-0000-0000-000000000101',array['00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000201']::uuid[],'{}');
select public.test_assert((select count(*)=2 from public.courier_routes),'N:N, deduplicación');
select public.save_courier_route_assignments('route','00000000-0000-0000-0000-000000000201',array['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102']::uuid[],array['00000000-0000-0000-0000-000000000101']::uuid[]);
select public.test_assert((select count(*)=2 from public.courier_routes where route_id='00000000-0000-0000-0000-000000000201'),'dos mensajeros para una ruta');
-- Inválido no borra la selección anterior.
do $$ begin
 begin
  perform public.save_courier_route_assignments('courier','00000000-0000-0000-0000-000000000101',array['00000000-0000-0000-0000-000000000203']::uuid[],array['00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000202']::uuid[]);
  raise exception 'FAIL: accepted inactive route';
 exception when raise_exception then if SQLERRM like 'FAIL:%' then raise; end if; end;
end $$;
select public.test_assert((select count(*)=2 from public.courier_routes where courier_id='00000000-0000-0000-0000-000000000101'),'rollback de selección inválida');
do $$ begin
 begin
  perform public.save_courier_route_assignments('route','00000000-0000-0000-0000-000000000201','{}','{}');
  raise exception 'FAIL: accepted stale selection';
 exception when serialization_failure then null; end;
 begin
  insert into public.courier_routes(courier_id,route_id) values ('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000202');
  raise exception 'FAIL: direct insert allowed';
 exception when insufficient_privilege then null; end;
end $$;
-- Mensajero: solo sus relaciones, sin administración.
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select public.test_assert((select count(*)=2 from public.courier_routes),'lectura de relaciones propias');
select public.test_assert((select count(*)=1 from public.couriers),'lectura de mensajero propio');
select public.test_assert((select count(*)=2 from public.current_courier_route_ids()),'rutas activas propias');
do $$ begin
 begin
  perform public.save_courier_route_assignments('courier','00000000-0000-0000-0000-000000000101','{}',array['00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000202']::uuid[]);
  raise exception 'FAIL: courier write allowed';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',false);
select public.test_assert((select count(*)=0 from public.courier_routes),'vendedor externo sin asignaciones visibles');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000005',false);
select public.test_assert(not public.can_manage_courier_routes(),'administrador inactivo sin permiso');
reset role;
-- Un mensajero de la empresa propietaria también ve solo sus vínculos.
update public.profiles set company_id='00000000-0000-0000-0000-000000000901' where id='00000000-0000-0000-0000-000000000002';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select public.test_assert((select count(*)=2 from public.courier_routes),'mensajero interno solo ve sus vínculos');
select public.test_assert((select count(*)=1 from public.couriers),'mensajero interno solo ve su courier');
reset role;
-- Desactivar conserva vínculos, pero deja de dar rutas vigentes.
update public.profiles set active=false where id='00000000-0000-0000-0000-000000000002';
select public.test_assert((select active=false from public.couriers where id='00000000-0000-0000-0000-000000000101'),'sincronización al desactivar perfil');
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select public.test_assert((select count(*)=0 from public.current_courier_route_ids()),'perfil inactivo sin rutas vigentes');
select public.test_assert((select count(*)=0 from public.courier_routes),'perfil inactivo sin lectura');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select public.test_assert((select count(*)=2 from public.courier_routes where courier_id='00000000-0000-0000-0000-000000000101'),'conservar vínculos al desactivar');
select public.save_courier_route_assignments('courier','00000000-0000-0000-0000-000000000101',array['00000000-0000-0000-0000-000000000201']::uuid[],array['00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000202']::uuid[]);
reset role;
update public.profiles set active=true where id='00000000-0000-0000-0000-000000000002';
update public.routes set active=false where id='00000000-0000-0000-0000-000000000201';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select public.test_assert((select count(*)=0 from public.current_courier_route_ids()),'ruta inactiva sin acceso vigente');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select public.save_courier_route_assignments('route','00000000-0000-0000-0000-000000000201',array['00000000-0000-0000-0000-000000000101']::uuid[],array['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102']::uuid[]);
select public.test_assert((select count(*)=1 from public.courier_routes where route_id='00000000-0000-0000-0000-000000000201'),'desvincular ruta inactiva');
reset role;
update public.routes set active=true where id='00000000-0000-0000-0000-000000000201';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select public.test_assert((select count(*)=1 from public.current_courier_route_ids()),'reactivación recupera asignaciones');
reset role;
update public.profiles set can_deliver=false where id='00000000-0000-0000-0000-000000000002';
set role authenticated;
select public.test_assert((select count(*)=0 from public.current_courier_route_ids()),'sin habilitación de entrega');
reset role;
select public.test_assert((select count(*)=1 from public.route_coverage),'cobertura intacta');
-- Borrado del perfil conserva la restricción existente; no borrar historial accidentalmente.
do $$ begin
 begin
  delete from public.profiles where id='00000000-0000-0000-0000-000000000002';
  raise exception 'FAIL: deletion of referenced profile allowed';
 exception when foreign_key_violation then null; end;
 begin
  insert into public.couriers(profile_id) values ('00000000-0000-0000-0000-000000000002');
  raise exception 'FAIL: duplicate courier profile allowed';
 exception when unique_violation then null; end;
end $$;
delete from public.couriers where id='00000000-0000-0000-0000-000000000101';
select public.test_assert((select count(*)=0 from public.courier_routes),'cascada al eliminar mensajero');
insert into public.courier_routes(courier_id,route_id) values ('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000202');
delete from public.routes where id='00000000-0000-0000-0000-000000000202';
select public.test_assert((select count(*)=0 from public.courier_routes),'cascada al eliminar ruta');
set role anon;
do $$ begin
 begin
  perform 1 from public.courier_routes;
  raise exception 'FAIL: anonymous read allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform public.save_courier_route_assignments('route','00000000-0000-0000-0000-000000000201','{}','{}');
  raise exception 'FAIL: anonymous RPC allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: asignaciones N:N, RLS, rollback, concurrencia optimista, inactivos, cascadas y cobertura' as result;
