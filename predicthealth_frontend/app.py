from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = 'your_secret_key_here' # ¡Cambia esto por una clave secreta fuerte!

# Base de datos de usuarios (demo, para un sistema real usarías una DB de verdad)
users = {
    "user_demo": {"password": "password_demo", "role": "user", "name": "Usuario Demo"},
    "admin_demo": {"password": "admin_password", "role": "admin", "name": "Admin Demo"}
}

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/log_in', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users and users[username]['password'] == password:
            session['username'] = username
            session['role'] = users[username]['role']
            session['name'] = users[username]['name']
            if users[username]['role'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('user_dashboard'))
        else:
            error = "Usuario o contraseña incorrectos."
            return render_template('log_in.html', error=error)
    return render_template('log_in.html')

@app.route('/sign_up', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'POST':
        nombre = request.form['nombre']
        apellido = request.form['apellido']
        telefono = request.form['telefono']
        username = request.form['user'] # Campo 'user' en el formulario
        correo = request.form['correo']
        password = request.form['password']

        if username in users:
            error = "El nombre de usuario ya existe."
            return render_template('sign_up.html', error=error)
        
        users[username] = {"password": password, "role": "user", "name": f"{nombre} {apellido}", "email": correo, "phone": telefono}
        session['username'] = username
        session['role'] = 'user'
        session['name'] = f"{nombre} {apellido}"
        return redirect(url_for('user_dashboard'))
    return render_template('sign_up.html')

# ===============================================================
# AQUÍ ESTÁ LA NUEVA CORRECCIÓN
# ===============================================================
@app.route('/user_dashboard')
def user_dashboard():
    # Si hay un nombre en la sesión, lo usamos. Si no, es modo demo.
    user_name = session.get('name', 'Usuario Demo')
    return render_template('user_dashboard.html', name=user_name)

@app.route('/admin_dashboard')
def admin_dashboard():
    # Si hay un nombre en la sesión, lo usamos. Si no, es modo demo.
    admin_name = session.get('name', 'Admin Demo')
    return render_template('admin_dashboard.html', name=admin_name)
# ===============================================================
# FIN DE LA CORRECCIÓN
# ===============================================================

@app.route('/logout')
def logout():
    session.clear() # Usamos clear() para limpiar toda la sesión de forma segura
    return redirect(url_for('login'))

# Rutas para los datos mock (JSON y XML)
@app.route('/data/mock_predict.json')
def mock_predict_json():
    return app.send_static_file('data/mock_predict.json')

@app.route('/data/mock_predictions.xml')
def mock_predictions_xml():
    return app.send_static_file('data/mock_predictions.xml')

if __name__ == '__main__':
    app.run(debug=True)
