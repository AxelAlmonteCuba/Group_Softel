# Regla 07: Estructura de Directorios y Enrutamiento (Expo Router)

Define cómo organizar los archivos de la app de SOFTEL, separando el enrutamiento de la lógica de negocio.

---

## 1. Separación `app/` vs `features/`
- `src/app/`: **Exclusivo para enrutamiento**. Estos archivos deben ser "puentes delgados". Prohibido incluir lógica pesada, consultas a base de datos o componentes UI complejos aquí.
- `src/features/`: Aloja toda la **lógica de negocio**, pantallas (`screens/`), hooks y llamadas a la API agrupadas por dominio.

### Árbol Base
```txt
src/
├── app/               # Puentes de ruta de Expo Router
│   ├── (auth)/        # Rutas de autenticación
│   ├── (tabs)/        # Barra de navegación inferior
│   └── photo-reports/ # Flujos modulares (fuera de tabs)
├── components/        # UI compartida (botones, modales, cards)
├── features/          # Dominios (auth, home, users, expenses, photoReports)
├── store/             # Tiendas globales Zustand
├── theme/             # Sistema de diseño
└── utils/             # Formateadores (fechas, monedas)
```

---

## 2. Reglas de Enrutamiento y Flujo
- **Redirección Post-Login**: Todos los roles navegan al Home (`/(tabs)/index`). El componente Home renderizará la vista adecuada según el rol (`HomeAdminScreen` o `HomeOperatorScreen`).
- **Barra Inferior (`(tabs)`)**:
  - `Inicio` (Dinámico según rol).
  - `Usuarios` (Exclusivo Administrador).
  - `Caja Chica` (Consulta y gestión).
  - `Más` (Perfil, cerrar sesión).
- **Asistentes y Formularios**: Al ingresar a un flujo de creación (ej. Nuevo Reporte Fotográfico o Registrar Gasto), la barra inferior debe ocultarse mediante un sub-stack independiente para dar enfoque total a la tarea.
