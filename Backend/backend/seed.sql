-- ==============================================================================
-- Datos Semilla Iniciales para Softel (MySQL 8.0)
-- Cumplimiento estricto de Regla 01, 03 y 04
-- ==============================================================================

-- 1. Categorías oficiales de gastos de caja chica (Regla 03 §3.2)
INSERT INTO `categorias_gastos` (`id`, `nombre`, `activo`) VALUES
  (1, 'Movilidad', 1),
  (2, 'Materiales', 1),
  (3, 'Viáticos', 1),
  (4, 'Combustible', 1),
  (5, 'Otros', 1)
ON DUPLICATE KEY UPDATE `activo` = 1;

-- 2. Usuario Administrador Inicial (Acceso Base Fase 1.1)
-- Credenciales:
-- Correo: admin@g-softel.com
-- Clave:  SoftelAdmin2026!
INSERT INTO `usuarios` (
  `id`,
  `documento_identidad`,
  `nombres`,
  `apellidos`,
  `correo`,
  `clave_hash`,
  `cargo`,
  `rol`,
  `estado`,
  `creado_en`,
  `actualizado_en`
) VALUES (
  UUID(),
  '00000001',
  'Administrador',
  'Softel',
  'admin@g-softel.com',
  '$2b$10$eLfOBquBzcZJikdqDSHz1uUs990hFzpx2ezmyMj/yEFPlIs24Llmy',
  'Administrador del Sistema',
  'ADMINISTRADOR',
  'ACTIVO',
  NOW(6),
  NOW(6)
)
ON DUPLICATE KEY UPDATE `estado` = 'ACTIVO';
