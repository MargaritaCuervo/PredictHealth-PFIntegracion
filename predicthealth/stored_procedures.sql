-- =================================================================
-- Base de datos: predicthealth_db
-- Script de Stored Procedures (Funciones)
-- Propósito: Crear 5 funciones complejas para análisis de datos
-- y operaciones automatizadas.
-- =================================================================

-- ========= Función 1: Obtener Resumen de Salud del Usuario =========
-- Propósito: Recupera un resumen de los 5 registros de salud más recientes
-- para un usuario específico, basado en su email.
-- Cómo ejecutar: SELECT * FROM obtener_resumen_salud_usuario('margarita@example.com');

CREATE OR REPLACE FUNCTION obtener_resumen_salud_usuario(user_email VARCHAR)
RETURNS TABLE (
    nombre_completo VARCHAR,
    fecha_registro_diario DATE,
    presion_arterial VARCHAR,
    riesgo_hipertension DECIMAL,
    recomendacion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (u.nombre || ' ' || u.apellido)::VARCHAR AS nombre_completo,
        rsd.fecha_registro AS fecha_registro_diario,
        rsd.presion_sistolica || '/' || rsd.presion_diastolica AS presion_arterial,
        pr.riesgo_hipertension_porcentaje AS riesgo_hipertension,
        pr.recomendacion_ia AS recomendacion
    FROM
        Usuario u
    JOIN
        RegistroSaludDiario rsd ON u.id_usuario = rsd.id_usuario
    JOIN
        PrediccionRiesgo pr ON u.id_usuario = pr.id_usuario AND rsd.fecha_registro = pr.fecha_prediccion
    WHERE
        u.email = user_email
    ORDER BY
        rsd.fecha_registro DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- ========= Función 2: Calcular Presión Arterial Promedio (Últimos 30 días) =========
-- Propósito: Calcula la presión arterial sistólica y diastólica promedio
-- para un usuario durante los últimos 30 días.
-- Cómo ejecutar: SELECT * FROM calcular_presion_arterial_promedio_30d(2); -- (ID de Margarita Lopez)

CREATE OR REPLACE FUNCTION calcular_presion_arterial_promedio_30d(p_id_usuario INT)
RETURNS TABLE (
    promedio_sistolica DECIMAL,
    promedio_diastolica DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(AVG(presion_sistolica), 2),
        ROUND(AVG(presion_diastolica), 2)
    FROM
        RegistroSaludDiario
    WHERE
        id_usuario = p_id_usuario
        AND fecha_registro >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;


-- ========= Función 3: Obtener Usuarios con Riesgo Alto de Diabetes =========
-- Propósito: Devuelve una lista de usuarios cuyo riesgo de diabetes más reciente
-- supera un umbral porcentual especificado.
-- Cómo ejecutar: SELECT * FROM obtener_usuarios_con_riesgo_diabetes_alto(20.0);

CREATE OR REPLACE FUNCTION obtener_usuarios_con_riesgo_diabetes_alto(umbral_porcentaje DECIMAL)
RETURNS TABLE (
    nombre_usuario VARCHAR,
    email_usuario VARCHAR,
    riesgo_diabetes_actual DECIMAL,
    fecha_ultima_prediccion DATE
) AS $$
BEGIN
    RETURN QUERY
    WITH UltimaPrediccion AS (
        SELECT
            id_usuario,
            riesgo_diabetes_porcentaje,
            fecha_prediccion,
            ROW_NUMBER() OVER(PARTITION BY id_usuario ORDER BY fecha_prediccion DESC) as rn
        FROM
            PrediccionRiesgo
    )
    SELECT
        (u.nombre || ' ' || u.apellido)::VARCHAR AS nombre_usuario,
        u.email AS email_usuario,
        up.riesgo_diabetes_porcentaje AS riesgo_diabetes_actual,
        up.fecha_prediccion AS fecha_ultima_prediccion
    FROM
        UltimaPrediccion up
    JOIN
        Usuario u ON up.id_usuario = u.id_usuario
    WHERE
        up.rn = 1 AND up.riesgo_diabetes_porcentaje > umbral_porcentaje;
END;
$$ LANGUAGE plpgsql;


-- ========= Función 4: Actualizar IMC Automáticamente (Función de Trigger) =========
-- Propósito: Esta función se ejecuta automáticamente para recalcular el IMC
-- de un usuario cada vez que su altura o peso son insertados o actualizados
-- en la tabla DatosHistorialMedico.
-- NOTA: Esta función se debe asociar a un TRIGGER.

CREATE OR REPLACE FUNCTION actualizar_imc()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.altura_cm IS NOT NULL AND NEW.altura_cm > 0 AND NEW.peso_kg IS NOT NULL THEN
        NEW.imc := round(NEW.peso_kg / ((NEW.altura_cm / 100.0) ^ 2), 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creación del Trigger que utiliza la función anterior
-- Se activa antes de cualquier INSERT o UPDATE en la tabla DatosHistorialMedico.
DROP TRIGGER IF EXISTS trg_actualizar_imc ON DatosHistorialMedico;
CREATE TRIGGER trg_actualizar_imc
BEFORE INSERT OR UPDATE ON DatosHistorialMedico
FOR EACH ROW
EXECUTE FUNCTION actualizar_imc();


-- ========= Función 5: Obtener Último Dato de Wearable por Usuario =========
-- Propósito: Recupera el registro más reciente de la tabla DatosWearable
-- para un ID de usuario específico. Maneja el caso de que no existan datos.
-- Cómo ejecutar: SELECT * FROM obtener_ultimo_dato_wearable(1);

CREATE OR REPLACE FUNCTION obtener_ultimo_dato_wearable(p_id_usuario INT)
RETURNS SETOF DatosWearable AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM DatosWearable
    WHERE id_usuario = p_id_usuario
    ORDER BY "timestamp" DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ========= Mensaje de Confirmación =========
SELECT 'Las 5 funciones (stored procedures) han sido creadas exitosamente.' AS mensaje;
