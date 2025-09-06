# PredictHealth 🏥

Una plataforma web para la predicción de riesgos de salud que permite a los usuarios monitorear y predecir riesgos de diabetes e hipertensión basándose en datos médicos y registros diarios.

## 📋 Características

- **Dashboard Interactivo**: Visualización en tiempo real de datos de salud con gráficos dinámicos
- **Predicción de Riesgos**: Análisis predictivo para diabetes e hipertensión
- **Gestión de Usuarios**: Sistema de autenticación con roles de usuario y administrador
- **Historial Médico**: Almacenamiento y seguimiento de datos médicos históricos
- **Registros Diarios**: Capacidad de registrar métricas diarias de salud
- **Exportación de Datos**: Funcionalidad para exportar reportes en formato JSON

## 🛠️ Stack Tecnológico

### Backend
- **Python 3.x**
- **Flask** - Framework web
- **SQLAlchemy** - ORM para base de datos
- **PostgreSQL** - Base de datos principal

### Frontend
- **HTML5/CSS3**
- **JavaScript (Vanilla)**
- **Bootstrap 5** - Framework CSS
- **Chart.js** - Librería de gráficos
- **Tailwind CSS** - Utilidades CSS (para admin dashboard)

## 📁 Estructura del Proyecto

```
predicthealth/
├── app.py                 # Aplicación principal Flask
├── init.sql              # Script de inicialización de BD
├── templates/
│   ├── log_in.html       # Página de inicio de sesión
│   ├── sign_up.html      # Página de registro
│   ├── user_dashboard.html # Dashboard del usuario
│   └── admin_dashboard.html # Dashboard del administrador
├── static/
│   ├── css/
│   │   └── styles.css    # Estilos personalizados
│   ├── js/
│   │   └── app.js        # Lógica del frontend
│   └── images/
│       ├── logo.jpg      # Logo de la aplicación
│       └── background.jpg # Imagen de fondo
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Python 3.7+
- PostgreSQL 12+
- pip (gestor de paquetes de Python)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/predicthealth.git
cd predicthealth
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install flask flask-sqlalchemy psycopg2-binary
```

4. **Configurar base de datos PostgreSQL**
```bash
# Crear base de datos
createdb predicthealth_db

# Ejecutar script de inicialización
psql -d predicthealth_db -f init.sql
```

5. **Configurar variables de entorno** (opcional)
```bash
export SECRET_KEY="tu_clave_secreta_aqui"
export DB_USER="postgres"
export DB_PASSWORD="tu_password"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="predicthealth_db"
```

### Ejecución

```bash
python app.py
```

La aplicación estará disponible en `http://localhost:5000`

## 👥 Usuarios de Prueba

El sistema incluye datos de prueba con los siguientes usuarios:

### Usuario Regular
- **Email**: `bryan@example.com`
- **Contraseña**: `bryanpass`
- **Rol**: Usuario

### Usuario Regular
- **Email**: `margarita@example.com`
- **Contraseña**: `margaritapass`
- **Rol**: Usuario

### Administrador
- **Email**: `mariana@example.com`
- **Contraseña**: `marianapass`
- **Rol**: Admin

## 🗄️ Modelo de Base de Datos

### Tablas Principales

1. **Usuario**: Información básica de usuarios y credenciales
2. **DatosHistorialMedico**: Historial médico estático del usuario
3. **RegistroSaludDiario**: Métricas diarias registradas por el usuario
4. **DatosWearable**: Datos de dispositivos wearable (futuro)
5. **PrediccionRiesgo**: Resultados de predicciones de IA

## 🔧 API Endpoints

### Rutas de Autenticación
- `GET /` - Redirección al login
- `GET|POST /log_in` - Inicio de sesión
- `GET|POST /sign_up` - Registro de usuarios
- `GET /logout` - Cerrar sesión

### Dashboards
- `GET /user_dashboard` - Dashboard del usuario (requiere login)
- `GET /admin_dashboard` - Dashboard del administrador (requiere rol admin)

### API
- `GET /api/dashboard_data` - Datos del dashboard en formato JSON

## 🎨 Características de la Interfaz

### Dashboard de Usuario
- **KPIs en Tiempo Real**: Visualización de riesgos actuales
- **Gráficos Interactivos**: 
  - Evolución temporal de riesgos
  - Distribución de categorías de riesgo
  - Medidores (gauges) de riesgo
- **Tabla de Predicciones**: Historial de predicciones anteriores
- **Insights de IA**: Explicaciones y recomendaciones automáticas
- **Exportación**: Descarga de datos en formato JSON

### Dashboard de Administrador
- **Métricas del Sistema**: Usuarios activos, sistemas conectados, alertas
- **Gráfico de Actividad**: Seguimiento de la actividad de usuarios
- **Gestión de Usuarios**: Tabla con estado de usuarios del sistema

## ⚠️ Consideraciones de Seguridad

**IMPORTANTE**: Esta es una versión de prototipo que incluye las siguientes vulnerabilidades conocidas:

- ❌ Contraseñas almacenadas en texto plano
- ❌ Sin validación robusta de entrada
- ❌ Sin protección CSRF
- ❌ Sin rate limiting

**NO utilizar en producción sin implementar medidas de seguridad apropiadas.**

## 🔮 Funcionalidades Futuras

- [ ] Integración con dispositivos wearable
- [ ] Modelo de IA real para predicciones
- [ ] Notificaciones push para alertas críticas
- [ ] API REST completa
- [ ] Aplicación móvil
- [ ] Análisis avanzado de tendencias
- [ ] Integración con sistemas de salud existentes

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 📸 Screenshots

### Registro de Usuario
![Registro](https://github.com/MargaritaCuervo/PredictHealth-PFIntegracion/blob/main/predicthealth/Creacion_usuario_front.jpg)
*Interfaz de registro con diseño limpio y moderno*

### Dashboard Principal
![Dashboard](https://github.com/MargaritaCuervo/PredictHealth-PFIntegracion/blob/main/predicthealth/dashboard.jpg)
*Dashboard interactivo con métricas de salud, gráficos dinámicos y predicciones de riesgo*

### Base de Datos
![Base de Datos](https://github.com/MargaritaCuervo/PredictHealth-PFIntegracion/blob/main/predicthealth/Creacion_usuario_db.jpg)
*Vista de la base de datos PostgreSQL con usuarios registrados*

## 📞 Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter) - email@example.com

Enlace del Proyecto: [https://github.com/tu-usuario/predicthealth](https://github.com/tu-usuario/predicthealth)

## 🙏 Agradecimientos

- [Flask](https://flask.palletsprojects.com/) - Framework web
- [Chart.js](https://www.chartjs.org/) - Librería de gráficos
- [Bootstrap](https://getbootstrap.com/) - Framework CSS
- [PostgreSQL](https://www.postgresql.org/) - Base de datos

---

⚕️ **Desarrollado con el objetivo de mejorar el acceso a la información de salud predictiva**
