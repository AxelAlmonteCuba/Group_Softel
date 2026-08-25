# Regla 06: Stack Tecnológico y Convenciones Frontend

Este documento define la base tecnológica, los idiomas y los estándares de código para la aplicación móvil y web de SOFTEL (React Native + Expo).

---

## 1. Pila Tecnológica
- **Plataforma**: Base de código única para Android, iOS y Web.
- **Framework**: React Native con Expo SDK (TypeScript en modo estricto).
- **Enrutamiento**: Expo Router (basado en archivos dentro de `src/app`).
- **Estado Global**: Zustand.
- **Estado del Servidor y Caché**: TanStack React Query.
- **Formularios y Validación**: React Hook Form con esquemas Zod (obligatorio definir esquema antes de la UI).
- **Iconografía**: `@expo/vector-icons` (Ionicons / Feather).

---

## 2. Convención Estricta de Idiomas
- **Código (100% Inglés)**: Carpetas, archivos, rutas, componentes, funciones, hooks, interfaces, tipos y variables.
- **Estados de Negocio (100% Español)**: Roles (`ADMINISTRADOR`, `TRABAJADOR`, etc.) y estados de flujo (`ACTIVO`, `BORRADOR`, `PENDIENTE`).
- **Interfaz de Usuario (100% Español)**: Textos visibles, alertas, diálogos y placeholders.

---

## 3. Directivas de Código (Componentes)
- **Sufijo de Pantallas**: Todo componente de pantalla debe crearse en PascalCase y terminar con el sufijo `Screen` (ej. `UserListScreen.tsx`).
- **Manejo de Formularios**: Siempre definir el esquema de validación con `Zod` antes de implementar el componente visual del formulario.

---

## 4. Extensión de Archivos Frontend — Regla Absoluta `.tsx`

> [!IMPORTANT]
> **Obligatorio sin excepción**: TODO archivo del proyecto frontend (aplicación móvil React Native + Expo) debe usar la extensión **`.tsx`**, independientemente de su naturaleza.

Esto aplica a:

| Tipo de Archivo | Ejemplo Correcto |
| :--- | :--- |
| Pantallas (Screens) | `LoginScreen.tsx`, `DashboardScreen.tsx` |
| Componentes UI reutilizables | `Button.tsx`, `ExpenseCard.tsx` |
| Layouts de Expo Router | `_layout.tsx` |
| Puentes de ruta (app/) | `index.tsx`, `[id].tsx` |
| Hooks con JSX o tipos React | `useAuth.tsx`, `useExpenses.tsx` |
| Providers y Context | `AuthProvider.tsx`, `ThemeProvider.tsx` |
| Guards de ruta / HOC | `ProtectedRoute.tsx` |
| Modales y overlays | `ConfirmModal.tsx` |

**Prohibido** usar `.ts` para cualquier archivo que exporte o retorne JSX, componentes React o tipos de React Native. El uso de `.ts` queda **reservado exclusivamente** para archivos sin ningún contenido JSX, como:
- Módulos de utilidades puras (ej. `formatCurrency.ts`, `dateUtils.ts`).
- Clases de servicio de API pura (ej. `authService.ts`).
- Constantes y enumeraciones sin JSX (ej. `colors.ts`, `roles.ts`).
- Esquemas Zod sin componentes (ej. `loginSchema.ts`).
- Tiendas Zustand sin componentes (ej. `authStore.ts`).
