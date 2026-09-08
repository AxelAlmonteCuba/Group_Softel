-- ==============================================================================
-- Script de Inicialización de Bases de Datos para Softel (MySQL 8.0)
-- Cumplimiento estricto de Regla 03: CHARSET utf8mb4 y COLLATION utf8mb4_unicode_ci
-- ==============================================================================

-- 1. Base de datos de Producción Oficial
CREATE DATABASE IF NOT EXISTS `softel_prod`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Base de datos de Pruebas / Desarrollo Continuo
CREATE DATABASE IF NOT EXISTS `softel_dev`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 3. Asignación de permisos al usuario de aplicación
GRANT ALL PRIVILEGES ON `softel_prod`.* TO 'softel_app'@'%';
GRANT ALL PRIVILEGES ON `softel_dev`.* TO 'softel_app'@'%';

FLUSH PRIVILEGES;
