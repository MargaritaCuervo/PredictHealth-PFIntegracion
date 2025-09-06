-- =================================================================
-- Base de datos: predicthealth_db
-- Script de Inicialización (init.sql)
-- Propósito: Crear la estructura de la base de datos y poblarla
-- con datos de prueba.
-- ADVERTENCIA: Las contraseñas en texto plano son solo para prototipado.
-- No usar en producción.
-- =================================================================

-- ========= Creación de Tablas =========

-- 1. Tabla: Usuario
-- Almacena la información de los usuarios (pacientes y administradores)
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rol VARCHAR(50) DEFAULT 'usuario' NOT NULL
);

-- Índice para búsquedas rápidas por email
CREATE INDEX idx_usuario_email ON Usuario (email);


-- 2. Tabla: DatosHistorialMedico
-- Almacena información médica estática del usuario
CREATE TABLE DatosHistorialMedico (
    id_historial SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    tipo_sangre VARCHAR(5),
    alergias TEXT,
    condiciones_preexistentes TEXT,
    medicamentos_actuales TEXT,
    altura_cm DECIMAL(5,2),
    peso_kg DECIMAL(5,2),
    imc DECIMAL(5,2),
    fumador BOOLEAN DEFAULT FALSE,
    bebedor BOOLEAN DEFAULT FALSE,
    antecedentes_familiares TEXT,
    fecha_ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id_usuario)
        ON DELETE CASCADE
);


-- 3. Tabla: RegistroSaludDiario
-- Datos de salud que el usuario registra diariamente
CREATE TABLE RegistroSaludDiario (
    id_registro SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_registro DATE NOT NULL,
    peso_kg DECIMAL(5,2),
    presion_sistolica INT,
    presion_diastolica INT,
    horas_sueno DECIMAL(4,2),
    nivel_actividad_fisica VARCHAR(50),
    estado_animo VARCHAR(50),
    otros_sintomas TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_registro_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT uq_registro_diario_por_usuario UNIQUE (id_usuario, fecha_registro)
);

-- Índice para búsquedas rápidas por usuario y fecha
CREATE INDEX idx_registro_salud_usuario_fecha ON RegistroSaludDiario (id_usuario, fecha_registro);


-- 4. Tabla: DatosWearable
-- Datos generados por dispositivos wearable
CREATE TABLE DatosWearable (
    id_dato_wearable SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    ritmo_cardiaco INT,
    oxigenacion_porcentaje DECIMAL(4,2),
    pasos INT,
    calorias_quemadas INT,
    distancia_km DECIMAL(5,2),
    tipo_sensor VARCHAR(100),
    CONSTRAINT fk_wearable_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id_usuario)
        ON DELETE CASCADE
);

-- Índice para búsquedas eficientes por usuario y tiempo
CREATE INDEX idx_wearable_usuario_timestamp ON DatosWearable (id_usuario, "timestamp" DESC);


-- 5. Tabla: PrediccionRiesgo
-- Resultados de predicciones del modelo de IA
CREATE TABLE PrediccionRiesgo (
    id_prediccion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_prediccion DATE NOT NULL,
    riesgo_diabetes_porcentaje DECIMAL(5,2),
    riesgo_hipertension_porcentaje DECIMAL(5,2),
    recomendacion_ia TEXT,
    factores_clave_ia JSONB,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prediccion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id_usuario)
        ON DELETE CASCADE
);

-- Índice para búsquedas rápidas por usuario y fecha
CREATE INDEX idx_prediccion_usuario_fecha ON PrediccionRiesgo (id_usuario, fecha_prediccion DESC);


-- ========= Inserción de Datos de Prueba (Seeding) =========

-- PASO 1: Creación de Usuarios
INSERT INTO Usuario (nombre, apellido, email, password_hash, rol) VALUES
('Bryan', 'Garcia', 'bryan@example.com', 'bryanpass', 'usuario'),
('Margarita', 'Lopez', 'margarita@example.com', 'margaritapass', 'usuario'),
('Mariana', 'Rojas', 'mariana@example.com', 'marianapass', 'admin');


-- PASO 2: Inserción de Datos para BRYAN GARCIA
-- Historial Médico
INSERT INTO DatosHistorialMedico (id_usuario, tipo_sangre, alergias, condiciones_preexistentes, altura_cm, peso_kg, antecedentes_familiares) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), 'A+', 'Ninguna', 'Ninguna', 182, 85.0, 'Diabetes (Abuelo)');

-- Registros de Salud Diarios
INSERT INTO RegistroSaludDiario (id_usuario, fecha_registro, peso_kg, presion_sistolica, presion_diastolica, horas_sueno, nivel_actividad_fisica, estado_animo) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), CURRENT_DATE - INTERVAL '2 days', 85.2, 122, 81, 7.5, 'Moderado', 'Bien'),
((SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), CURRENT_DATE - INTERVAL '1 day', 85.1, 120, 80, 8.0, 'Alto', 'Bien'),
((SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), CURRENT_DATE, 85.0, 118, 78, 7.0, 'Bajo', 'Cansado');

-- Predicciones de Riesgo
INSERT INTO PrediccionRiesgo (id_usuario, fecha_prediccion, riesgo_diabetes_porcentaje, riesgo_hipertension_porcentaje, recomendacion_ia, factores_clave_ia) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), CURRENT_DATE - INTERVAL '1 week', 12.5, 15.2, 'Nivel de riesgo bajo. Continuar con hábitos saludables.', '{"factores": ["IMC", "Actividad Física"]}'),
((SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), CURRENT_DATE, 14.0, 16.5, 'Ligero aumento en el riesgo. Se recomienda monitorear la dieta.', '{"factores": ["Dieta Reciente", "Genética"]}');


-- PASO 3: Inserción de Datos para MARGARITA LOPEZ
-- Historial Médico
INSERT INTO DatosHistorialMedico (id_usuario, tipo_sangre, alergias, condiciones_preexistentes, altura_cm, peso_kg, antecedentes_familiares) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), 'O-', 'Polvo', 'Hipertensión Leve', 165, 72.5, 'Hipertensión (Padre)');

-- Registros de Salud Diarios
INSERT INTO RegistroSaludDiario (id_usuario, fecha_registro, peso_kg, presion_sistolica, presion_diastolica, horas_sueno, nivel_actividad_fisica, estado_animo) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), CURRENT_DATE - INTERVAL '2 days', 72.8, 136, 89, 6.5, 'Bajo', 'Estresado'),
((SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), CURRENT_DATE - INTERVAL '1 day', 72.6, 135, 88, 7.0, 'Moderado', 'Bien'),
((SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), CURRENT_DATE, 72.5, 138, 90, 6.0, 'Bajo', 'Cansado');

-- Predicciones de Riesgo
INSERT INTO PrediccionRiesgo (id_usuario, fecha_prediccion, riesgo_diabetes_porcentaje, riesgo_hipertension_porcentaje, recomendacion_ia, factores_clave_ia) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), CURRENT_DATE - INTERVAL '1 week', 25.0, 30.5, 'Riesgo moderado. Incrementar actividad física y reducir sodio.', '{"factores": ["Presión Arterial", "Sedentarismo"]}'),
((SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), CURRENT_DATE, 26.2, 32.0, 'Riesgo en aumento. Es crucial consultar a un médico.', '{"factores": ["Presión Arterial", "IMC", "Estrés"]}');


-- PASO 4: Inserción de Datos para MARIANA ROJAS (Admin)
-- Historial Médico
INSERT INTO DatosHistorialMedico (id_usuario, tipo_sangre, alergias, condiciones_preexistentes, altura_cm, peso_kg, antecedentes_familiares) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), 'B+', 'Lactosa', 'Asma', 170, 68.0, 'Ninguno');

-- Registros de Salud Diarios
INSERT INTO RegistroSaludDiario (id_usuario, fecha_registro, peso_kg, presion_sistolica, presion_diastolica, horas_sueno, nivel_actividad_fisica, estado_animo) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), CURRENT_DATE - INTERVAL '2 days', 68.1, 118, 76, 8.0, 'Alto', 'Bien'),
((SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), CURRENT_DATE - INTERVAL '1 day', 68.0, 117, 75, 7.5, 'Moderado', 'Bien'),
((SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), CURRENT_DATE, 68.2, 120, 78, 8.5, 'Alto', 'Bien');

-- Predicciones de Riesgo
INSERT INTO PrediccionRiesgo (id_usuario, fecha_prediccion, riesgo_diabetes_porcentaje, riesgo_hipertension_porcentaje, recomendacion_ia, factores_clave_ia) VALUES
((SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), CURRENT_DATE - INTERVAL '1 week', 18.0, 22.3, 'Riesgo bajo-moderado. Mantener el buen trabajo.', '{"factores": ["Genética"]}'),
((SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), CURRENT_DATE, 18.5, 22.8, 'Riesgo estable. Sin cambios significativos.', '{"factores": ["IMC"]}');


-- ========= Mensaje de Confirmación =========
SELECT 'La base de datos ha sido poblada exitosamente con 3 usuarios y sus datos de prueba.' AS mensaje;