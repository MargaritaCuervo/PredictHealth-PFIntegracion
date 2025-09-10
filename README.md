# PredictHealth 🏥

Una plataforma innovadora que aprovecha la inteligencia artificial para predecir el riesgo de enfermedades crónicas, como la diabetes y la hipertensión, y ofrecer recomendaciones preventivas personalizadas, empoderando a los usuarios en la gestión proactiva de su salud [1-5].

## 📋 Características Principales

PredictHealth es un ecosistema digital diseñado para la prevención y el bienestar, ofreciendo las siguientes funcionalidades clave:

*   **Detección Temprana y Predicción de Riesgos:** Utiliza modelos de Machine Learning para analizar datos de salud del usuario y clasificar el riesgo de desarrollar diabetes e hipertensión en niveles "Bajo", "Medio" o "Alto", incluso con años de antelación, sin depender de muestras clínicas.
*   **Recomendaciones Personalizadas:** Genera sugerencias específicas y accionables sobre dieta, actividad física y patrones de sueño, adaptadas dinámicamente al perfil de riesgo y hábitos del usuario para promover un estilo de vida más saludable.
*   **Empoderamiento del Usuario:** Proporciona información fácil de entender y herramientas para que los usuarios gestionen activamente su bienestar y tomen decisiones informadas sobre su salud.
*   **Visualización y Seguimiento del Progreso:** Ofrece paneles y gráficos intuitivos en la aplicación móvil y la página web para monitorear la evolución del riesgo y el cumplimiento de las recomendaciones.
*   **Gestión Integral del Perfil de Salud:** Permite actualizar información personal y demográfica (altura, peso, IMC), registrar hábitos de vida (tabaquismo, consumo de alcohol), historial médico auto-informado (condiciones preexistentes, alergias, medicamentos) y antecedentes familiares de enfermedades.
*   **Ingreso de Medidas de Salud:** Facilita el registro periódico de presión arterial y glucosa.
*   **Notificaciones y Recordatorios:** Envía alertas básicas para el registro de datos y la adherencia a los hábitos saludables.
*   **Sincronización en Tiempo Real:** Utiliza Firebase para comunicar instantáneamente información crítica a los usuarios, como alertas de riesgo o actualizaciones de estado.

## 🏗 Arquitectura Tecnológica

PredictHealth se basa en una arquitectura de microservicios moderna y escalable, con las siguientes tecnologías clave:

*   **Backend y Microservicios:**
    *   **Flask:** Para la lógica de negocio estándar.
    *   **FastAPI:** Para microservicios de alto rendimiento, incluyendo el motor de inferencia de ML y MLOps.
*   **Estrategia de Datos (Persistencia Políglota):**
    *   **PostgreSQL:** Fuente de verdad para todos los datos maestros y transaccionales críticos del sistema (perfiles de usuario, historial médico, facturación, predicciones, recomendaciones, etc.).
    *   **Firebase (Firestore o Realtime Database):** Para la sincronización de datos en tiempo real con las aplicaciones cliente (Android y web).
    *   **Redis:** Como capa de caché de alto rendimiento para acelerar el acceso a datos frecuentes y como intermediario de mensajes para comunicación asíncrona entre microservicios [15, 26, 36].
*   **Procesamiento de Datos y Machine Learning:**
    *   **Hadoop:** Implementado para el procesamiento distribuido y clasificación de grandes volúmenes de datos que alimentan los modelos predictivos.
    *   **Python con librerías:** Scikit-Learn, Pandas, NumPy, Plotly, PyCaret para la automatización del pipeline de ML.
    *   **Modelos de ML:** Se utilizan algoritmos como XGBoost y LightGBM, que han demostrado un buen rendimiento en la predicción de riesgos. Para el MVP, se puede empezar con Random Forest o Árboles de decisión.
*   **Frontend:**
    *   **Aplicación nativa para Android (Java):** Interfaz principal para el usuario final.
    *   **Página web complementaria:** Para registro, seguimiento y reportes, con diseño responsivo.

## 🧩 Componentes Clave (Microservicios)

La plataforma se organiza en microservicios especializados:

1.  **Servicio de Gestión de Usuarios:** Gestiona la información personal y demográfica, el historial médico auto-informado y los antecedentes familiares.
2.  **Servicio de Estilo de Vida y Hábitos:** Registra diariamente la actividad física, dieta, sueño y estado de ánimo/estrés del usuario.
3.  **Servicio de Gestión de Datos de Sensores y Dispositivos:** Diseñado para la ingesta, almacenamiento y normalización de datos biométricos de wearables (frecuencia cardíaca, presión arterial, glucosa).
4.  **Servicio de Procesamiento y Balanceo de Datos (para ML):** Crucial para el pipeline de ML, preparando y transformando grandes volúmenes de datos, incluyendo la generación de features derivadas como el IMC.
5.  **Servicio de Inferencia de Predicciones (ML/IA):** El "cerebro" de PredictHealth, que ejecuta los modelos de Machine Learning entrenados para calcular riesgos de enfermedades y generar predicciones personalizadas, incluyendo funcionalidades de MLOps para monitoreo y reentrenamiento.
6.  **Servicio de Recomendaciones Personalizadas:** Genera y administra sugerencias accionables sobre dieta, ejercicio y sueño, basadas en las predicciones de riesgo y hábitos de vida.
7.  **Servicio de Notificaciones:** Alerta al usuario sobre predicciones, recomendaciones y recordatorios relevantes.
8.  **Servicio de Facturación:** Gestiona planes de membresía, suscripciones, facturas y estados de pago.
9.  **API Gateway Service:** Punto de entrada único para todas las solicitudes de los clientes, centralizando el tráfico y proporcionando seguridad.
10. **Microservicio Exportador de Datos a Firebase:** Extrae datos de PostgreSQL y los exporta a Firebase para sincronización en tiempo real.
11. **Servicio de Gestión Genética (Opcional/Futuro):** Almacenaría, procesaría y analizaría datos genéticos complejos para potenciar la precisión de las predicciones y recomendaciones.

## 🧠 Modelado y Entrenamiento de Machine Learning

El motor de IA de PredictHealth se entrena mediante un pipeline riguroso:

*   **Datos Necesarios:**
    *   **Variable Objetivo (Label):** Diagnóstico confirmado de diabetes o hipertensión (sí/no) o nivel de riesgo (bajo/medio/alto).
    *   **Variables Predictoras (Features):** Datos demográficos y clínicos básicos (edad, sexo, IMC, antecedentes familiares, presión arterial, glucosa, colesterol, triglicéridos), estilo de vida y hábitos (actividad física, dieta, sueño, estrés/estado de ánimo, consumo de alcohol/tabaco), y biométricos de sensores/wearables (frecuencia cardíaca, presión arterial, glucosa continua, peso/composición corporal). Los datos genéticos se consideran para futuras expansiones.
    *   **Datos Mínimos Viables (MVP):** Edad, sexo, IMC, presión arterial, glucosa, colesterol, hábitos básicos (actividad, dieta, sueño).
*   **Pipeline de Entrenamiento:**
    1.  **Recolección de Datos:** Se utilizan datasets públicos de salud como NHANES (CDC, EE.UU.) y Framingham Heart Study, así como datos del CDC BRFSS 2023, complementados con los datos de los primeros usuarios de la app.
    2.  **Preprocesamiento:** Incluye limpieza, normalización, creación de features derivadas (ej. IMC) y, crucialmente, el balanceo de clases mediante técnicas como SMOTE y NearMiss para abordar el desequilibrio en los datos.
    3.  **Modelos Iniciales y Selección:** Se exploran modelos como Regresión Logística, Random Forest y Gradient Boosting. Para el MVP, se priorizan Random Forest o Árboles de Decisión.
    4.  **Entrenamiento y Validación:** Los datos se dividen para entrenamiento (70%), validación (15%) y prueba (15%).
    5.  **Métricas Clave:** Se evalúa el rendimiento utilizando AUC-ROC, precisión, recall y F1-score.
    6.  **MLOps:** Un aspecto fundamental es el monitoreo continuo del modelo en producción, el reentrenamiento periódico con nuevos datos de usuario y la detección de "data drift".
*   **Modelo Seleccionado:** Un estudio de implementación ha seleccionado el XGBClassifier entrenado sobre datos remuestreados con SMOTEENN debido a su mínimo sobreajuste, sensibilidad equilibrada y robusta generalización.

## 📊 Estructura de Datos (PostgreSQL)

La base de datos PostgreSQL actúa como la fuente de verdad y está diseñada para manejar de manera eficiente la información de salud de los usuarios:

*   **`usuarios`**: Información fundamental de la cuenta (id, nombre, apellido, email, fecha de nacimiento, género, contraseña_hash, preferencias de comunicación).
*   **`perfil_salud_general`**: Información de salud estática (altura, peso, IMC, si es fumador, consumo de alcohol, condiciones preexistentes, alergias, medicamentos, discapacidad).
*   **`historial_familiar`**: Registra predisposiciones familiares a enfermedades (parentesco, enfermedad_relacionada).
*   **`actividad_fisica`**: Detalles de la actividad física diaria (tipo, duración, frecuencia, pasos, fuente).
*   **`dieta`**: Hábitos alimenticios (patrones, consumo de frutas/verduras, sal, azúcar, agua, calorías estimadas).
*   **`sueno`**: Patrones de sueño (horas, calidad).
*   **`estado_animo_estres`**: Nivel de estrés y estado de ánimo.
*   **`datos_sensores`**: Medidas biométricas de dispositivos externos (frecuencia cardíaca, presión arterial, glucosa en sangre, unidad, dispositivo_fuente).
*   **`predicciones_ml`**: Resultados de las predicciones de riesgo generadas por ML (tipo_riesgo, puntuacion_riesgo, nivel_riesgo, factores_influyentes, modelo_version).
*   **`recomendaciones_usuario`**: Consejos y acciones sugeridas al usuario (categoría, título, contenido_es, prioridad, estado_recomendacion, feedback_usuario).
*   **`notificaciones_usuario`**: Registros de notificaciones enviadas (tipo_notificacion, mensaje_es, leida).
*   **`planes_membresia`**: Información de los planes de suscripción ofrecidos.
*   **`suscripciones_usuarios`**: Gestión de los periodos de suscripción de los usuarios y sus renovaciones.
*   **`facturas`**: Registros de facturación.
*   **`proveedores_pago`**: Proveedores de servicios de pasarela de pago externos.
*   **`informacion_genetica` (futuro)**: Resultados de análisis genéticos y predisposiciones para potenciar la precisión.

## 🌟 Propuesta de Valor

PredictHealth ofrece un valor diferenciado a través de:

*   **Proactividad:** Permite actuar antes de la manifestación de los síntomas, enfocándose en la prevención de enfermedades crónicas.
*   **Personalización:** Proporciona recomendaciones y un mapa de riesgo adaptados al estilo de vida y perfil de salud individual de cada usuario.
*   **Empoderamiento:** Transforma al usuario en un gestor activo de su propia salud, brindándole información y herramientas para tomar decisiones informadas.
*   **Simplicidad:** Traduce datos complejos de salud en información comprensible y pasos accionables, clasificando el riesgo de manera clara y sencilla.

## 🎨 Consideraciones de Diseño UX/UI

El diseño de PredictHealth se centra en el usuario y busca crear una experiencia óptima y segura en el ámbito de la salud:

*   **Usabilidad y Simplicidad:** La interfaz será intuitiva, con navegación clara y botones fácilmente identificables, evitando la confusión y los errores. Se utilizan diseños limpios con jerarquía visual, espaciado adecuado y consistencia.
*   **Accesibilidad:** Se asegura que la aplicación sea accesible para todos los usuarios, incluyendo aquellos con discapacidades, con opciones de ajuste de texto y contraste.
*   **Seguridad y Transparencia de Datos:** Dado que la información de salud es altamente confidencial, el diseño garantiza la protección de datos mediante cifrado, acceso seguro y una comunicación clara sobre la recopilación y uso de la información.
*   **Comunicación Eficaz:** Se emplea un lenguaje claro y sencillo, evitando la jerga médica, y se utilizan ayudas visuales como gráficos e infografías para comunicar información compleja de forma comprensible.
*   **Personalización y Motivación:** La IA y el Machine Learning permiten personalizar automáticamente la interfaz y ofrecer sugerencias y alertas proactivas basadas en el historial del usuario. Se implementarán microinteracciones que motiven, feedback positivo y gamificación útil.
*   **Diseño Responsivo:** La aplicación se adapta óptimamente a diferentes tamaños de pantalla y dispositivos, desde smartphones hasta tablets, garantizando una experiencia coherente y fluida.
*   **Tono de Voz:** El UX Writing utiliza un tono empático y positivo, con verbos suaves y mensajes anticipatorios que acompañan al usuario sin presionar.
*   **Diseño Centrado en Tareas Críticas:** Las funciones clave, como el registro de niveles de glucosa, son rápidamente accesibles y fáciles de usar.

## 🚫 Exclusiones del MVP y Futuras Expansiones

### Exclusiones del MVP:

*   **Diagnóstico Clínico Formal:** PredictHealth no proporcionará un diagnóstico clínico formal ni sustituirá la consulta médica.
*   **Interacción Directa con Profesionales Médicos:** En su fase inicial, no incluirá interacción directa con médicos u hospitales en el frontend principal.
*   **Cobertura de Enfermedades:** La plataforma se limita a la prevención y predicción de diabetes e hipertensión.
*   **Integración Compleja con Wearables:** La integración con dispositivos portátiles y avanzados será básica en el MVP, con planes de expansión futura.
*   **Datos Genéticos:** El procesamiento y análisis de biomarcadores genéticos no se incluirá en el MVP, pero se considera un pilar fundamental a mediano y largo plazo para una medicina predictiva más precisa.
*   **Simulación Avanzada:** No incluirá simulaciones avanzadas con tecnologías como LeapMotion.

### Futuras Expansiones:

*   **Integración Profunda con Wearables y Dispositivos Médicos:** Mayor interoperabilidad con una variedad de sensores y dispositivos.
*   **Notificaciones Push:** Para alertas críticas y recordatorios más efectivos.
*   **Análisis Avanzado de Tendencias:** Para proporcionar insights más profundos sobre la evolución de la salud del usuario.
*   **Integración con Sistemas de Salud Existentes:** Conexión con hospitales y clínicas para un enfoque más colaborativo en la atención.
*   **Modelos de IA más Avanzados:** Uso de Redes Neuronales para una mayor personalización y precisión predictiva.
*   **Nutrigenética:** Análisis de variantes genéticas para desarrollar modelos predictivos de riesgo de obesidad y patologías asociadas, y comprender la respuesta del cuerpo a dietas y ejercicios.

## 🚀 Instalación y Configuración (Guía General)

### Prerrequisitos:

*   Python 3.x
*   PostgreSQL
*   pip (gestor de paquetes de Python)

### Instalación:

1.  **Clonar el repositorio** (Si el proyecto fuera de código abierto)
    ```bash
    git clone https://github.com/tu-usuario/PredictHealth.git
    cd PredictHealth
    ```
2.  **Crear y activar un entorno virtual**
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Linux/macOS
    # venv\Scripts\activate   # En Windows
    ```
3.  **Instalar dependencias**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configurar base de datos PostgreSQL**
    *   Crear una base de datos PostgreSQL.
    *   Configurar las credenciales de la base de datos en las variables de entorno o archivo de configuración del proyecto.
5.  **Configurar variables de entorno** (opcional)
    *   Crear un archivo `.env` en la raíz del proyecto y añadir las variables necesarias (ej., `DATABASE_URL`, `SECRET_KEY`).

### Ejecución:

*   La aplicación del backend estará disponible en `http://localhost:5000` (o el puerto configurado).

## 👥 Usuarios de Prueba (Ejemplo)

El sistema puede incluir datos de prueba con los siguientes roles:

*   **Usuario Regular**
    *   Email: `bryan@example.com`
    *   Contraseña: `bryanpass`
*   **Usuario Regular**
    *   Email: `margarita@example.com`
    *   Contraseña: `margaritapass`
*   **Administrador**
    *   Email: `mariana@example.com`
    *   Contraseña: `marianapass`

## ⚠️ Consideraciones de Seguridad (Importante)

**ATENCIÓN**: Esta es una versión de prototipo y, como tal, puede incluir vulnerabilidades conocidas como contraseñas almacenadas en texto plano, falta de validación robusta de entrada, sin protección CSRF y sin limitación de tasas de solicitud (rate limiting).
**NO utilizar en producción sin implementar las medidas de seguridad apropiadas y realizar una auditoría de seguridad exhaustiva.**

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE.md` para más detalles.

## 📸 Screenshots

### Registro de Usuario
*Interfaz de registro con diseño limpio y moderno*
![Registro de Usuario](predicthealth/Creacion_usuario_front.jpg)

### Dashboard Principal
*Dashboard interactivo con métricas de salud, gráficos dinámicos y predicciones de riesgo*
![Dashboard Principal](predicthealth/dashboard.jpg)

### Base de Datos
*Vista de la base de datos PostgreSQL con usuarios registrados*
![Base de Datos](predicthealth/Creacion_usuario_db.jpg)

⚕️ **Desarrollado con el objetivo de mejorar el acceso a la información de salud predictiva**
