# Script de Seeding - Base de Datos PredictHealth

> **Propósito:** Poblar la base de datos `predicthealth_db` con 3 usuarios de prueba y sus datos médicos completos

---

## 📋 Información del Script

**Base de datos:** `predicthealth_db`
**Usuarios creados:** 3 (2 usuarios regulares + 1 administrador)
**Tablas pobladas:** Usuario, DatosHistorialMedico, RegistroSaludDiario, PrediccionRiesgo

---

## 🔧 PASO 1: Limpieza de Datos

```sql
-- Limpiar los datos existentes en las tablas para evitar duplicados
-- TRUNCATE es más rápido que DELETE y resetea los contadores SERIAL
-- La opción CASCADE se encarga de las relaciones con claves foráneas
TRUNCATE TABLE Usuario, DatosHistorialMedico, RegistroSaludDiario, 
               DatosWearable, PrediccionRiesgo RESTART IDENTITY CASCADE;
```

---

## 👥 PASO 2: Creación de Usuarios

![Creación de Usuario - Frontend](https://github.com/MargaritaCuervo/PredictHealth-PFIntegracion/blob/main/predicthealth/Creacion_usuario_front.jpg)

```sql
-- Insertar los tres usuarios principales
-- Las contraseñas se insertan en texto plano como se configuró en el prototipo
INSERT INTO Usuario (nombre, apellido, email, password, rol) VALUES
    ('Bryan', 'Garcia', 'bryan@example.com', 'bryanpass', 'usuario'),
    ('Margarita', 'Lopez', 'margarita@example.com', 'margaritapass', 'usuario'),
    ('Mariana', 'Rojas', 'mariana@example.com', 'marianapass', 'admin');
```

![Verificación en Base de Datos](https://github.com/MargaritaCuervo/PredictHealth-PFIntegracion/blob/main/predicthealth/Creacion_usuario_db.jpg)

---

## 🏥 BRYAN GARCIA - Usuario Regular

### Historial Médico
```sql
INSERT INTO DatosHistorialMedico (
    id_usuario, tipo_sangre, alergias, condiciones_preexistentes, 
    altura_cm, peso_kg, antecedentes_familiares
) VALUES (
    (SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), 
    'A+', 
    'Ninguna', 
    'Ninguna', 
    182, 
    85.0, 
    'Diabetes (Abuelo)'
);
```

### Registros de Salud Diarios (últimos 3 días)
```sql
INSERT INTO RegistroSaludDiario (
    id_usuario, fecha_registro, peso_kg, presion_sistolica, presion_diastolica, 
    horas_sueno, nivel_actividad_fisica, estado_animo
) VALUES
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), 
        CURRENT_DATE - INTERVAL '2 days', 
        85.2, 122, 81, 7.5, 'Moderado', 'Bien'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), 
        CURRENT_DATE - INTERVAL '1 day', 
        85.1, 120, 80, 8.0, 'Alto', 'Bien'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), 
        CURRENT_DATE, 
        85.0, 118, 78, 7.0, 'Bajo', 'Cansado'
    );
```

### Predicciones de Riesgo
```sql
INSERT INTO PrediccionRiesgo (
    id_usuario, fecha_prediccion, riesgo_diabetes_porcentaje, 
    riesgo_hipertension_porcentaje, recomendacion_ia, factores_clave_ia
) VALUES
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), 
        CURRENT_DATE - INTERVAL '1 week', 
        12.5, 15.2, 
        'Nivel de riesgo bajo. Continuar con hábitos saludables.', 
        '{"factores": ["IMC", "Actividad Física"]}'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'bryan@example.com'), 
        CURRENT_DATE, 
        14.0, 16.5, 
        'Ligero aumento en el riesgo. Se recomienda monitorear la dieta.', 
        '{"factores": ["Dieta Reciente", "Genética"]}'
    );
```

---

## 🩺 MARGARITA LOPEZ - Usuario Regular

### Historial Médico
```sql
INSERT INTO DatosHistorialMedico (
    id_usuario, tipo_sangre, alergias, condiciones_preexistentes, 
    altura_cm, peso_kg, antecedentes_familiares
) VALUES (
    (SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), 
    'O-', 
    'Polvo', 
    'Hipertensión Leve', 
    165, 
    72.5, 
    'Hipertensión (Padre)'
);
```

### Registros de Salud Diarios (últimos 3 días)
```sql
INSERT INTO RegistroSaludDiario (
    id_usuario, fecha_registro, peso_kg, presion_sistolica, presion_diastolica, 
    horas_sueno, nivel_actividad_fisica, estado_animo
) VALUES
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), 
        CURRENT_DATE - INTERVAL '2 days', 
        72.8, 136, 89, 6.5, 'Bajo', 'Estresado'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), 
        CURRENT_DATE - INTERVAL '1 day', 
        72.6, 135, 88, 7.0, 'Moderado', 'Bien'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), 
        CURRENT_DATE, 
        72.5, 138, 90, 6.0, 'Bajo', 'Cansado'
    );
```

### Predicciones de Riesgo
```sql
INSERT INTO PrediccionRiesgo (
    id_usuario, fecha_prediccion, riesgo_diabetes_porcentaje, 
    riesgo_hipertension_porcentaje, recomendacion_ia, factores_clave_ia
) VALUES
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), 
        CURRENT_DATE - INTERVAL '1 week', 
        25.0, 30.5, 
        'Riesgo moderado. Incrementar actividad física y reducir sodio.', 
        '{"factores": ["Presión Arterial", "Sedentarismo"]}'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'margarita@example.com'), 
        CURRENT_DATE, 
        26.2, 32.0, 
        'Riesgo en aumento. Es crucial consultar a un médico.', 
        '{"factores": ["Presión Arterial", "IMC", "Estrés"]}'
    );
```

---

## 👩‍💼 MARIANA ROJAS - Administrador

### Historial Médico
```sql
INSERT INTO DatosHistorialMedico (
    id_usuario, tipo_sangre, alergias, condiciones_preexistentes, 
    altura_cm, peso_kg, antecedentes_familiares
) VALUES (
    (SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), 
    'B+', 
    'Lactosa', 
    'Asma', 
    170, 
    68.0, 
    'Ninguno'
);
```

### Registros de Salud Diarios (últimos 3 días)
```sql
INSERT INTO RegistroSaludDiario (
    id_usuario, fecha_registro, peso_kg, presion_sistolica, presion_diastolica, 
    horas_sueno, nivel_actividad_fisica, estado_animo
) VALUES
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), 
        CURRENT_DATE - INTERVAL '2 days', 
        68.1, 118, 76, 8.0, 'Alto', 'Bien'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), 
        CURRENT_DATE - INTERVAL '1 day', 
        68.0, 117, 75, 7.5, 'Moderado', 'Bien'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), 
        CURRENT_DATE, 
        68.2, 120, 78, 8.5, 'Alto', 'Bien'
    );
```

### Predicciones de Riesgo
```sql
INSERT INTO PrediccionRiesgo (
    id_usuario, fecha_prediccion, riesgo_diabetes_porcentaje, 
    riesgo_hipertension_porcentaje, recomendacion_ia, factores_clave_ia
) VALUES
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), 
        CURRENT_DATE - INTERVAL '1 week', 
        18.0, 22.3, 
        'Riesgo bajo-moderado. Mantener el buen trabajo.', 
        '{"factores": ["Genética"]}'
    ),
    (
        (SELECT id_usuario FROM Usuario WHERE email = 'mariana@example.com'), 
        CURRENT_DATE, 
        18.5, 22.8, 
        'Riesgo estable. Sin cambios significativos.', 
        '{"factores": ["IMC"]}'
    );
```

---

## ✅ Confirmación

```sql
-- Mensaje de confirmación
SELECT 'La base de datos ha sido poblada exitosamente con 3 usuarios y sus datos de prueba.' AS mensaje;
```

---

## 📊 Resumen de Usuarios Creados

| Usuario | Email | Rol | Tipo Sangre | Condición | Nivel de Riesgo |
|---------|--------|-----|-------------|-----------|----------------|
| **Bryan Garcia** | bryan@example.com | Usuario | A+ | Ninguna | Bajo |
| **Margarita Lopez** | margarita@example.com | Usuario | O- | Hipertensión Leve | Moderado |
| **Mariana Rojas** | mariana@example.com | Admin | B+ | Asma | Bajo-Moderado |

---

## 🚀 Instrucciones de Uso

1. **Ejecutar el script completo** en PostgreSQL
2. **Verificar la creación** de usuarios con: `SELECT * FROM Usuario;`
3. **Confirmar datos médicos** con consultas de prueba
4. **Listo para desarrollo** y testing del sistema PredictHealth

> ⚠️ **Nota:** Este script está diseñado para entornos de desarrollo. En producción, asegúrate de usar contraseñas hasheadas y datos anonimizados.
