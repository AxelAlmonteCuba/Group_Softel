# 🗄️ Guía Rápida: Cómo Conectarse a la Base de Datos en la VPS

Esta guía documenta los pasos exactos que seguiste para entrar a tu base de datos de producción/desarrollo alojada en tu VPS y hacer consultas SQL.

## 1. Conectarse a la VPS
Abre tu terminal (PowerShell o Git Bash) y conéctate usando SSH:
```bash
ssh softel-vps
```

## 2. Ir a la carpeta del proyecto
Una vez dentro de la VPS, muévete a la carpeta donde están los archivos de despliegue:
```bash
cd /opt/softel
```

*(Opcional: puedes ejecutar `docker compose ps` para ver los nombres de tus contenedores activos).*

## 3. Entrar al contenedor de MySQL
Abre una terminal directamente dentro del contenedor donde está corriendo tu base de datos:
```bash
docker exec -it softel_mysql bash
```
*(Tu terminal cambiará y dirá algo como `bash-5.1#`, lo que significa que estás dentro del contenedor como administrador root).*

## 4. Iniciar sesión en MySQL
Ahora, ejecuta el cliente de MySQL:
```bash
mysql -u root -p
```
Te pedirá la contraseña. Escríbela y presiona Enter (recuerda que por seguridad no verás asteriscos mientras escribes).
Si todo está correcto, verás el prompt `mysql>`.

## 5. Consultar los datos
Primero, asegúrate de seleccionar la base de datos correcta:
```sql
USE softel_db;
```

A partir de aquí, puedes ejecutar tus consultas SQL, por ejemplo:
```sql
-- Ver los gastos registrados:
SELECT fecha_gasto, motivo FROM gastos;

-- Ver el estado de las cajas chicas:
SELECT * FROM cajas_chicas;

-- Ver las tablas existentes:
SHOW TABLES;
```

## 6. Salir correctamente
Para cerrar todo de forma segura y volver a tu computadora local, debes salir "en cadena" (tres veces):

1. **Salir de MySQL:** escribe `exit` o `\q` (te dirá *Bye*).
2. **Salir del contenedor:** escribe `exit` (volverás a `root@vmi...:/opt/softel#`).
3. **Salir de la VPS:** escribe `exit` de nuevo (te dirá *logout* y *Connection closed*).
