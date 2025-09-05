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
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'Raul1313')

# Configuración de la base de datos PostgreSQL
db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'Integracion25')  # <- contraseña real
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
        existing_user = Usuario.query.filter_by(email=email).first()
        if existing_user:
            error = "El correo electrónico ya está registrado."
            return render_template('sign_up.html', error=error)

        new_user = Usuario(
            nombre=request.form['nombre'],
            apellido=request.form['apellido'],
            telefono=request.form['telefono'],
            email=email
        )
        new_user.set_password(request.form['password'])

        db.session.add(new_user)
        db.session.commit()

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
    user_name = session.get('name', 'Usuario')
    return render_template('user_dashboard.html', name=user_name)

@app.route('/admin_dashboard')
@login_required
def admin_dashboard():
    if session.get('role') != 'admin':
        return redirect(url_for('user_dashboard'))
        
    admin_name = session.get('name', 'Admin')
    total_users = Usuario.query.count()
    
    return render_template('admin_dashboard.html', name=admin_name, total_users=total_users)

# ===============================================================
# 6. API PARA DATOS DINÁMICOS (NUEVO)
# ===============================================================
@app.route('/api/dashboard_data')
@login_required
def dashboard_data():
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
    with app.app_context():
        # Descomenta la siguiente línea la primera vez que ejecutes la app
        # db.create_all()
        pass

    app.run(debug=True)
