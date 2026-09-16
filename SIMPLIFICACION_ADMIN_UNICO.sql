-- SIMPLIFICACIÓN: ADMIN ÚNICO (1 rol para todo)
-- Ejecutar SOLO si deseas cambiar de 3 roles a 1 rol "admin"
-- Fecha: 16 SEPT 2026

-- PASO 1: Eliminar tabla user_roles antigua (si existe)
DROP TABLE IF EXISTS user_roles CASCADE;

-- PASO 2: Eliminar tabla roles antigua (si existe)
DROP TABLE IF EXISTS roles CASCADE;

-- PASO 3: Crear tabla roles SIMPLIFICADA (solo 1 rol)
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 4: Insertar 1 solo rol admin
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrador completo - Acceso total a todas las funcionalidades')
ON CONFLICT (name) DO NOTHING;

-- PASO 5: Crear tabla user_roles SIMPLIFICADA
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(255) NOT NULL,
  role_id BIGINT NOT NULL REFERENCES roles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, role_id)
);

-- PASO 6: Asignar rol admin a Angela
INSERT INTO user_roles (email, role_id)
SELECT 'Angela.ax@hotmail.com', id FROM roles WHERE name = 'admin'
ON CONFLICT (email, role_id) DO NOTHING;

-- PASO 7: Asignar rol admin a Elena
INSERT INTO user_roles (email, role_id)
SELECT 'promesaobca@gmail.com', id FROM roles WHERE name = 'admin'
ON CONFLICT (email, role_id) DO NOTHING;

-- PASO 8: Verificar resultado
SELECT 
  ur.email,
  r.name as role,
  r.description,
  ur.assigned_at
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
ORDER BY ur.email;

-- Resultado esperado:
-- Angela.ax@hotmail.com | admin | Administrador completo...
-- promesaobca@gmail.com | admin | Administrador completo...
