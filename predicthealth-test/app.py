import os
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from datetime import datetime

# ===============================================================
# 1. INICIALIZACIÓN Y CONFIGURACIÓN
# ===============================================================
app = Flask(__name__)

# Clave secreta para la gestión de sesiones (cámbiala en producción)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'unaclavesecretaparaelprototipo')

# Configuración de la base de datos PostgreSQL
db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'Integracion25')
db_host = os.environ.get('DB_HOST', 'localhost')
db_port = os.environ.get('DB_PORT', '5432')
db_name = os.environ.get('DB_NAME', 'predicthealth_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ===============================================================
# 2. MODELOS DE LA BASE DE DATOS (ORM - VERSIÓN INSEGURA PARA PROTOTIPO)
# ===============================================================
class Usuario(db.Model):
    __tablename__ = 'usuario'
    id_usuario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False) # Contraseña en texto plano
    rol = db.Column(db.String(50), nullable=False, default='usuario')
    
    # Relaciones
    historial = db.relationship('DatosHistorialMedico', backref='usuario', uselist=False, cascade="all, delete-orphan")
    registros_diarios = db.relationship('RegistroSaludDiario', backref='usuario', lazy=True, cascade="all, delete-orphan")
    predicciones = db.relationship('PrediccionRiesgo', backref='usuario', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password_plana):
        self.password = password_plana

    def check_password(self, password_plana):
        return self.password == password_plana

class DatosHistorialMedico(db.Model):
    __tablename__ = 'datoshistorialmedico'
    id_historial = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), unique=True, nullable=False)
    # ... otros campos ...

class RegistroSaludDiario(db.Model):
    __tablename__ = 'registrosaluddiario'
    id_registro = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    # ... otros campos ...

class PrediccionRiesgo(db.Model):
    __tablename__ = 'prediccionriesgo'
    id_prediccion = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    fecha_prediccion = db.Column(db.Date, nullable=False)
    riesgo_diabetes_porcentaje = db.Column(db.Numeric(5, 2))
    riesgo_hipertension_porcentaje = db.Column(db.Numeric(5, 2))
    # ... otros campos ...

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
# 4. RUTAS DE VISTAS Y AUTENTICACIÓN
# ===============================================================

@app.route('/')
def index():
    # La página principal redirige al login
    return redirect(url_for('login'))

@app.route('/log_in', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # El campo en el HTML se llama 'username', pero es el email
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
        # El campo en el HTML se llama 'correo'
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
        new_user.set_password(request.form['password']) # Usamos el método inseguro

        db.session.add(new_user)
        db.session.commit()

        # Iniciar sesión automáticamente después de registrarse
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
    # Solo los admins pueden ver esta página
    if session.get('role') != 'admin':
        return redirect(url_for('user_dashboard'))
        
    admin_name = session.get('name', 'Admin')
    return render_template('admin_dashboard.html', name=admin_name)

# ===============================================================
# 6. API PARA DATOS DINÁMICOS (PARA app.js)
# ===============================================================
@app.route('/api/dashboard_data')
@login_required
def dashboard_data():
    user_id = session.get('user_id')
    user_name = session.get('name', 'Usuario')

    all_predictions = PrediccionRiesgo.query.filter_by(id_usuario=user_id).order_by(PrediccionRiesgo.fecha_prediccion.desc()).all()
    
    records_list = []
    for pred in all_predictions:
        records_list.append({
            "id": f"p-{pred.id_prediccion}",
            "patient": user_name,
            "age": 42, # Dato de ejemplo, ya que no lo tenemos en la BD
            "diabetes": float(pred.riesgo_diabetes_porcentaje),
            "hyper": float(pred.riesgo_hipertension_porcentaje),
            "date": pred.fecha_prediccion.isoformat()
        })
    
    return jsonify(records_list)

# ===============================================================
# 7. EJECUCIÓN DE LA APP
# ===============================================================
if __name__ == '__main__':
    # El contexto de la aplicación es necesario para operaciones como la creación de la BD
    with app.app_context():
        # Descomenta la siguiente línea SOLO la primera vez para crear las tablas
        # db.create_all()
        pass
    app.run(debug=True)