import os
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

# ===============================================================
# 1. INICIALIZACIÓN Y CONFIGURACIÓN
# ===============================================================
app = Flask(__name__)

# Clave secreta para la gestión de sesiones
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'una-clave-secreta-muy-fuerte-y-dificil-de-adivinar')

# Configuración de la base de datos PostgreSQL
db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'password') # Cambia 'password' por tu contraseña o configúrala en el entorno
db_host = os.environ.get('DB_HOST', 'localhost')
db_port = os.environ.get('DB_PORT', '5432')
db_name = os.environ.get('DB_NAME', 'predicthealth_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ===============================================================
# 2. MODELOS DE LA BASE DE DATOS (ORM con SQLAlchemy)
# ===============================================================
# Estos modelos deben coincidir con la estructura de tu base de datos.

class Usuario(db.Model):
    __tablename__ = 'usuario'
    id_usuario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(50), nullable=False, default='usuario')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Nota: Puedes añadir los otros modelos (DatosHistorialMedico, PrediccionRiesgo, etc.)
# aquí si necesitas interactuar con ellos desde el backend.

# ===============================================================
# 3. DECORADOR PARA PROTEGER RUTAS
# ===============================================================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ===============================================================
# 4. RUTAS DE AUTENTICACIÓN (ACTUALIZADAS)
# ===============================================================

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/log_in', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # El campo 'username' del formulario se usa para el email
        email = request.form['username']
        password = request.form['password']
        
        user = Usuario.query.filter_by(email=email).first()

        if user and user.check_password(password):
            session['user_id'] = user.id_usuario
            session['role'] = user.rol
            session['name'] = user.nombre
            
            if user.rol == 'admin':
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('user_dashboard'))
        else:
            error = "Email o contraseña incorrectos."
            return render_template('log_in.html', error=error)
            
    return render_template('log_in.html')

@app.route('/sign_up', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'POST':
        email = request.form['correo']
        
        # Verificar si el email ya existe
        existing_user = Usuario.query.filter_by(email=email).first()
        if existing_user:
            error = "El correo electrónico ya está registrado."
            return render_template('sign_up.html', error=error)

        # Crear nuevo usuario en la base de datos
        new_user = Usuario(
            nombre=request.form['nombre'],
            apellido=request.form['apellido'],
            telefono=request.form['telefono'],
            email=email
        )
        new_user.set_password(request.form['password'])

        db.session.add(new_user)
        db.session.commit()

        # Iniciar sesión automáticamente después del registro
        session['user_id'] = new_user.id_usuario
        session['role'] = new_user.rol
        session['name'] = new_user.nombre
        
        return redirect(url_for('user_dashboard'))

    return render_template('sign_up.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# ===============================================================
# 5. RUTAS DE LOS DASHBOARDS (PROTEGIDAS)
# ===============================================================

@app.route('/user_dashboard')
@login_required
def user_dashboard():
    # El nombre se obtiene de la sesión, que fue establecida durante el login
    user_name = session.get('name', 'Usuario')
    return render_template('user_dashboard.html', name=user_name)

@app.route('/admin_dashboard')
@login_required
def admin_dashboard():
    # Verificar que el rol sea 'admin'
    if session.get('role') != 'admin':
        return redirect(url_for('user_dashboard'))
        
    admin_name = session.get('name', 'Admin')
    # Aquí podrías hacer consultas a la DB para obtener datos agregados
    total_users = Usuario.query.count()
    
    return render_template('admin_dashboard.html', name=admin_name, total_users=total_users)

# ===============================================================
# 6. API PARA DATOS DINÁMICOS (NUEVO)
# ===============================================================
# Esta es la ruta que tu frontend (JavaScript) debe llamar para obtener
# los datos de los gráficos y KPIs en lugar de usar los archivos mock.

@app.route('/api/dashboard_data')
@login_required
def dashboard_data():
    # Aquí iría la lógica para consultar las tablas `PrediccionRiesgo`,
    # `RegistroSaludDiario`, etc., y devolver los datos del usuario.
    # Por ahora, devolvemos una estructura de ejemplo similar al mock.
    
    # user_id = session['user_id']
    # predicciones = PrediccionRiesgo.query.filter_by(id_usuario=user_id).all()
    
    mock_data = {
        "metadata": {
            "lastUpdate": "2025-09-05T10:00:00Z",
            "source": "Database (Live)"
        },
        "kpis": {
            "diabetesRisk": 22.5,
            "hypertensionRisk": 18.9
        },
        "evolution": [
            {"week": "W1", "diabetes": 15, "hypertension": 12},
            {"week": "W2", "diabetes": 17, "hypertension": 14},
            {"week": "W3", "diabetes": 16, "hypertension": 15},
            {"week": "W4", "diabetes": 22.5, "hypertension": 18.9}
        ],
        "keyFactors": [
            "Nivel de actividad física bajo",
            "Índice de Masa Corporal (IMC) elevado",
            "Horas de sueño insuficientes"
        ]
    }
    return jsonify(mock_data)

# ===============================================================
# 7. EJECUCIÓN DE LA APP
# ===============================================================

if __name__ == '__main__':
    # Este bloque te permite crear las tablas en la base de datos la primera vez.
    # Ejecuta `python app.py` en tu terminal dentro de una shell interactiva
    # y luego `db.create_all()` para inicializar la base de datos.
    with app.app_context():
        # Descomenta la siguiente línea la primera vez que ejecutes la app
        # para crear las tablas definidas en los modelos.
        # db.create_all()
        pass

    app.run(debug=True)
