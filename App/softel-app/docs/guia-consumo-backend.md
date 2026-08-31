# 📘 Guía Completa: Cómo Consumir Datos del Backend en Softel App

Esta guía explica la arquitectura de 3 capas que usamos para traer datos del servidor y cómo replicarla paso a paso en cualquier nueva pantalla o módulo.

---

## 🏗️ La Arquitectura de 3 Capas

```text
┌─────────────────────────┐
│  1. Cliente Base        │  src/services/api.ts (Configura URL, JWT automático y Timeouts)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  2. Capa de Servicios   │  src/services/<modulo>Service.ts (Tipos TypeScript + Métodos HTTP)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  3. Pantalla / UI       │  src/features/.../Screen.tsx (useState + useEffect + Renderizado)
└─────────────────────────┘
```

---

## 🛠️ Paso 1: El Cliente Base (`api.ts`)

Ya está creado en `src/services/api.ts`. **No necesitas recrearlo**, solo entender cómo funciona:

```typescript
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = 'http://192.168.1.38:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🔥 MAGIA: Agrega el token JWT a todas las peticiones automáticamente
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

> [!TIP]
> Al usar `api.get('/ruta')`, no necesitas poner la URL completa ni preocuparte por pasar el token manual; el interceptor lo inyecta por ti en cada petición.

---

## 🛠️ Paso 2: Crear el Servicio del Módulo

Cuando quieras consumir un nuevo recurso (por ejemplo, *usuarios*, *gastos*, *cajas chicas*), creas un archivo en `src/services/`.

Ejemplo real: [`src/services/userService.ts`](file:///c:/Users/OLED/Downloads/GroupSoftel/App/softel-app/src/services/userService.ts)

```typescript
import { api } from './api';

// 1. Defines la estructura exacta que responde el backend
export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  cargo: string;
  rol: 'ADMINISTRADOR' | 'CONTADOR' | 'SUPERVISOR' | 'TRABAJADOR';
  estado: 'ACTIVO' | 'INACTIVO';
}

// 2. Creas y exportas la función asíncrona que hace la petición
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data; // response.data contiene el arreglo de objetos que envió NestJS
};
```

---

## 🛠️ Paso 3: Consumir en la Pantalla (Patrón Estándar)

En tu pantalla o componente, siempre manejas **3 estados fundamentales**:

1. `data`: Los datos que recibes del servidor.
2. `loading`: Un booleano (`true`/`false`) para saber si la petición aún está viajando por la red.
3. `error`: Un mensaje por si falla la conexión o el servidor responde con error.

Ejemplo en [`UserManagementScreen.tsx`](file:///c:/Users/OLED/Downloads/GroupSoftel/App/softel-app/src/features/users/screens/UserManagementScreen.tsx):

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { getUsers, User } from '@/services/userService';
import CardProfile from '@/components/cards/CardProfile';
import { colors } from '@/theme/colors';

const UserManagementScreen = () => {
  // 1️⃣ Declarar los 3 estados
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2️⃣ Disparar la petición al cargar la pantalla
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Llamada a la función del servicio
        const data = await getUsers();
        
        // Guardamos los datos recibidos en el estado
        setUsers(data);
      } catch (err: any) {
        console.error('Error al obtener usuarios:', err);
        setError('No se pudieron cargar los datos.');
      } finally {
        // Se ejecuta siempre (éxito o fallo) para ocultar el spinner de carga
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // 👈 Arreglo vacío [] = solo se ejecuta UNA VEZ al abrir la pantalla

  // 3️⃣ Renderizado condicional: Mientras carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 4️⃣ Renderizado condicional: Si hubo error
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: colors.error }}>{error}</Text>
      </View>
    );
  }

  // 5️⃣ Renderizado de la lista: Éxito
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {users.map((user) => (
        <CardProfile
          key={user.id}
          name={`${user.nombres} ${user.apellidos}`}
          role={user.cargo}
          email={user.correo}
          status={user.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
          onPress={() => console.log('Seleccionado:', user.id)}
        />
      ))}
    </ScrollView>
  );
};

export default UserManagementScreen;
```

---

## 📋 Plantilla Rápida para Copiar y Pegar

Cuando vayas a crear un nuevo módulo (por ejemplo `gastosService.ts`), sigue esta plantilla:

### 1. Archivo de Servicio (`src/services/miModuloService.ts`)
```typescript
import { api } from './api';

export interface MiEntidad {
  id: string;
  nombre: string;
  // ... otros campos
}

export const getMisDatos = async (): Promise<MiEntidad[]> => {
  const response = await api.get('/mi-endpoint');
  return response.data;
};

// Ejemplo para enviar datos (POST):
export const crearDato = async (payload: Partial<MiEntidad>): Promise<MiEntidad> => {
  const response = await api.post('/mi-endpoint', payload);
  return response.data;
};
```

### 2. Archivo de Pantalla (`src/features/.../MiPantalla.tsx`)
```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getMisDatos, MiEntidad } from '@/services/miModuloService';

export const MiPantalla = () => {
  const [items, setItems] = useState<MiEntidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMisDatos()
      .then(data => setItems(data))
      .catch(err => setError('Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;

  return (
    <View>
      {items.map(item => (
        <Text key={item.id}>{item.nombre}</Text>
      ))}
    </View>
  );
};
```
