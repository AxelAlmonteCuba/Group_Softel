# Cambios — Listado dinámico de usuarios desde el backend
> Fecha: 2026-08-28 | Módulo: Frontend
eporte Softel - 28 Agosto 🚀

Buenas tardes equipo,

Avance
## Archivos Afectados
| Estado | Archivo |
| :--- | :--- |
| [NUEVO] | `src/services/userService.ts` |
| [NUEVO] | `src/components/bars/SearchBar.tsx` |
| [MODIFICADO] | `src/features/users/screens/UserManagementScreen.tsx` |

## Dependencias Instaladas (si aplica)
*Ninguna dependencia nueva instalada.*

## Explicación por Archivo

### `src/components/bars/SearchBar.tsx`
- **Qué hace el código:** Define un componente reutilizable de barra de búsqueda con un input de texto y un ícono de lupa (`Feather`).
- **Por qué se tomó esa decisión de diseño:** Centralizar el input de búsqueda permite mantener la consistencia visual y de comportamiento (colores, bordes) en toda la aplicación.

### `src/services/userService.ts`
- **Qué hace el código:** Define la interfaz `User` que mapea la entidad del backend y exporta la función `getUsers` que realiza una petición GET a la ruta `/users` de nuestra API.
- **Por qué se tomó esa decisión de diseño:** Separar la lógica de acceso a datos (servicios) de la interfaz gráfica es una buena práctica (Separation of Concerns). Nos permite reutilizar la obtención de usuarios en otros componentes en el futuro sin duplicar las llamadas con `axios`.

### `src/features/users/screens/UserManagementScreen.tsx`
- **Qué hace el código:** Se integró el componente `SearchBar` y se agregó un estado local `searchQuery`. Se utiliza un `useMemo` para calcular `filteredUsers`, filtrando la lista de usuarios obtenida de la API base al query del buscador (por nombre, apellido, correo o cargo).
- **Por qué se tomó esa decisión de diseño:** El filtrado se realiza en el cliente (frontend) ya que la lista de usuarios no es gigantesca en esta etapa, mejorando la velocidad de respuesta (instantánea) sin recargar al backend. El uso de `useMemo` evita recalculaciones innecesarias del array en cada re-render.

## Flujo / Diagrama (si aplica)
```text
UserManagementScreen (UI) 
    │
    ├── (useEffect al montar) ──> userService.getUsers()
    │                                  │
    │                                  └──> axios.get('/api/v1/users') ──> NestJS Backend
    │
    └── <Itera `users`> ──> Renderiza <CardProfile /> por cada usuario
```

## Impacto
- **Variables de entorno afectadas:** Ninguna. (Utiliza la `BASE_URL` preconfigurada en `api.ts`).
- **Endpoints nuevos o modificados:** Se consume el endpoint existente `GET /api/v1/users`.
- **Efectos sobre otros módulos:** La pantalla de gestión de usuarios ahora es completamente funcional y dependiente de la conectividad con el backend. En caso de fallar, muestra un mensaje de error amigable.
