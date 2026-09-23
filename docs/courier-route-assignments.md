# Relación entre mensajeros y rutas — Fase 1

## Esquema inspeccionado

Se revisó el esquema proporcionado el 22/09/2026 y el OpenAPI de Supabase:

- `profiles.id` identifica al usuario; `couriers.profile_id` referencia ese perfil.
- `courier_routes.courier_id` referencia **couriers.id**, no profiles.id.
- `courier_routes.route_id` referencia routes.id.
- Ya existe UNIQUE(courier_id, route_id), y ambas FK tienen ON DELETE CASCADE.
- La FK couriers.profile_id → profiles.id conserva su restricción de borrado.
- No había UNIQUE sobre couriers.profile_id; se agrega sin fusionar registros.
- RLS estaba desactivado en couriers y courier_routes. Profiles tenía la política profiles_select_company_privacy.

## Despliegue necesario

Ejecutar **BD/manage-courier-route-assignments.sql** en el editor SQL de Supabase **antes de desplegar el código**. Es una transacción y se puede volver a ejecutar. No crea tablas ni borra asignaciones existentes. Si encuentra varios couriers para un perfil, aborta antes de realizar cambios; esos casos deben resolverse considerando inventarios y tarifas, sin fusionarlos automáticamente.

La migración se probó en PostgreSQL local con un fixture reconstruido del esquema entregado. **No se ha ejecutado en Supabase**. No ejecutar los archivos de `scripts/tests` en producción.

## Administración

- Rutas → lista → **Mensajeros**: buscar, seleccionar varios y guardar o desvincular.
- Usuarios → editar → habilitado para entregar → **Rutas asignadas**: se reutiliza la tabla y el selector existentes; solo se ofrecen rutas activas para nuevas asignaciones.
- El guardado vuelve a consultar el courier_id cuando se habilita un usuario como mensajero, incluso si antes no existía ese registro.
- Las rutas inactivas ya asignadas siguen visibles y pueden desvincularse.
- La administración corresponde a usuarios **super_admin activos**, siguiendo el criterio actual de creación de usuarios. No se concede administración global a company_admin de empresas externas.

## Decisiones

Se mantiene una sola relación N:N, `courier_routes`. La RPC `save_courier_route_assignments` administra cualquiera de sus dos lados mediante diferencias, sin borrar primero toda la selección. Todos los cambios de asignación se confirman o revierten juntos.

La selección original se envía como `p_expected_ids`. Si otro administrador cambió esa misma selección, se rechaza el guardado y se pide recargar. Un bloqueo transaccional serializa las ediciones desde ambas pantallas. Las filas existentes conservan sus identificadores.

Desactivar un perfil o quitarle `can_deliver` sincroniza `couriers.active` mediante un trigger y conserva los vínculos. Una asignación vigente requiere perfil activo, can_deliver, courier activo y ruta activa. No se aceptan nuevas asignaciones a participantes inactivos; sí conservarlas o retirarlas. Reactivar recupera los vínculos conservados.

Eliminar una ruta o un courier utiliza las cascadas ya existentes. No se cambia la restricción de eliminación de perfiles: se prefiere desactivar si tiene relaciones. Reasignar aquí no modifica envíos, inventario, tarifas, historial ni `route_coverage`.

`current_courier_route_ids()` devuelve las rutas vigentes del usuario autenticado y queda disponible para las políticas de la fase 2. **Esta fase todavía no limita los envíos ni inventarios por ruta.**

## RLS y autorización

- Se habilita RLS en `couriers` y `courier_routes`.
- Nuevas políticas SELECT: `couriers_read_assignments` y `courier_routes_read_assignments`.
- Administradores activos y personal operativo de la empresa propietaria pueden consultar; un usuario de rol courier solo consulta su propio registro y sus vínculos, incluso si pertenece a Agiliza. Usuarios inactivos no consultan.
- Se retiran privilegios directos de escritura para anon/authenticated. Las escrituras de asignaciones pasan por la RPC con autorización explícita; service_role sigue disponible para las API administrativas.
- Funciones SECURITY DEFINER con search_path vacío, nombres calificados y ejecución pública revocada.
- No se cambia `profiles_select_company_privacy` ni se habilita/modifica RLS en routes, route_coverage, envíos o inventarios.
- Se corrigen las API de edición y activación de usuarios, que antes solo exigían sesión: ahora también requieren super_admin activo. Esto impide que un usuario común cambie roles o habilite mensajeros por esas API.
- El guardado de los datos generales del usuario y sus permisos sigue siendo el flujo preexistente; no forma parte de la transacción de asignaciones.

## Archivos

| Archivo | Cambio |
| --- | --- |
| BD/manage-courier-route-assignments.sql | Índices, RPC, RLS y sincronización de estado |
| src/modules/courier-routes/api/assignment-management.ts | Consulta desde ruta y llamada RPC |
| src/modules/courier-routes/api/save-courier-routes.ts | Reutiliza el guardado transaccional |
| src/modules/courier-routes/components/route-couriers-dialog.tsx | Selector múltiple por ruta |
| src/modules/courier-routes/components/courier-routes-table.tsx | Identifica rutas inactivas |
| src/modules/courier-routes/components/route-search-dialog.tsx | Nuevas asignaciones solo a rutas activas |
| src/modules/routes/api/get-routes-options.ts | Incluye active |
| src/modules/routes/types/route-option.ts | Tipo de estado de ruta |
| src/app/dashboard/(protected)/routes/list/page.tsx | Acción Mensajeros |
| src/app/dashboard/(protected)/users/edit/[id]/page.tsx | Detecta courier recién creado y cambios concurrentes |
| src/app/api/users/[id]/route.ts | Autorización, upsert del courier y manejo de errores |
| src/app/api/users/toggle-active/route.ts | Autorización administrativa |
| scripts/tests/courier-routes-fixture.sql | Esquema de prueba sin datos personales |
| scripts/tests/courier-routes-integration.sql | Pruebas SQL de comportamiento |
| docs/courier-route-assignments.md | Esta documentación |

## Validación

- Build de producción y TypeScript.
- ESLint de archivos nuevos y principales archivos modificados.
- PostgreSQL local: migración aplicada dos veces, N:N en ambos sentidos, duplicados, rollback ante asignaciones inválidas, conflicto por selección obsoleta, lectura propia de mensajeros internos y externos, rechazo de escrituras directas/anónimas, perfiles inactivos, reactivación, can_deliver, rutas inactivas, cascadas y conservación de cobertura.
- Pendiente: aplicar la migración en Supabase y probar las pantallas con las sesiones reales del administrador y del mensajero.

Para repetir las pruebas, usar una base PostgreSQL vacía y desechable:

```sh
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/tests/courier-routes-fixture.sql -f BD/manage-courier-route-assignments.sql -f BD/manage-courier-route-assignments.sql -f scripts/tests/courier-routes-integration.sql
```
