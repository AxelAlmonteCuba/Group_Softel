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
