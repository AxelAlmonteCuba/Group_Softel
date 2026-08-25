/**
 * Tipos del dominio de Autenticación — Softel
 */

/** Roles del sistema tal como llegan desde el backend */
export type Rol = 'ADMINISTRADOR' | 'CONTADOR' | 'SUPERVISOR' | 'TRABAJADOR';

/** Estado de usuario en el sistema */
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

/** Payload del JWT decodificado */
export interface JwtPayload {
  sub: string;           // UUID del usuario
  correo: string;
  rol: Rol;
  exp: number;
  iat: number;
}

/** DTO de credenciales enviadas al endpoint POST /api/v1/auth/login */
export interface LoginCredenciales {
  correo: string;
  clave: string;
}

/** Respuesta exitosa del endpoint de login */
export interface LoginRespuesta {
  exito: true;
  token: string;
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    correo: string;
    cargo: string;
    rol: Rol;
    estado: EstadoUsuario;
  };
}
