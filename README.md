predicthealth/
├── backend-services/                 # Contenedor de todos los microservicios (Python/FastAPI)
│   ├── api_gateway/                  # 11. API Gateway Service
│   ├── auth_service/                 #  9. Servicio de Autenticación y Autorización
│   ├── audit_service/                # 10. Servicio de Auditoría y Cumplimiento
│   ├── data_ingestion_service/       #  4. Servicio de Gestión de Datos de Sensores y Clínicos
│   ├── doctors_service/              #  1. Servicio de Gestión de Doctores (NUEVO)
│   ├── lifestyle_service/            #  3. Servicio de Estilo de Vida y Hábitos del Paciente
│   ├── ml_inference_service/         #  6. Servicio de Inferencia de Predicciones (IA/ML)
│   ├── ml_processing_service/        #  5. Servicio de Procesamiento y Preparación de Datos (para ML)
│   ├── notifications_service/        #  8. Servicio de Notificaciones
│   ├── patients_service/             #  2. Servicio de Gestión de Pacientes (NUEVO)
│   ├── recommendations_service/      #  7. Servicio de Recomendaciones Personalizadas
│   ├── realtime_sync_service/        # 12. Servicio de Sincronización en Tiempo Real (Firebase)
│   ├── shared_libs/                  # Librerías comunes (modelos, schemas, etc.)
│   ├── .env
│   └── requirements.txt
│
├── frontend-web/                     # Interfaz web en React
│   ├── public/
│   ├── src/
│   │   ├── api/                      # Conectores a la API Gateway
│   │   ├── components/               # Componentes reutilizables
│   │   ├── pages/                    # Vistas principales (Doctor, Paciente)
│   │   ├── context/
│   │   └── App.js
│   └── package.json
│
├── mobile-android/                   # Aplicación nativa en Java (Android)
│   ├── app/
│   │   └── src/
│   └── build.gradle
│
└── docker-compose.yml                # Orquestación de bases de datos y otros servicios
