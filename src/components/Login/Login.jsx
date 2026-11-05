import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import api from '../../services/api';
import { Alert } from '../ui/ui';
import senatiLogo from '../../assets/senati-logo.png';
import { guardarSesion } from '../../auth/modulos';

const Login = () => {
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Petición al backend para iniciar sesión
      const response = await api.post('/api/auth/login', credenciales);

      // 1. Guardar el token en localStorage
      localStorage.setItem('token', response.data.token);

      // Guardar también datos del usuario y sus módulos habilitados
      if (response.data.usuario) {
        guardarSesion(response.data);
      }

      // 2. Redirigir a la ruta protegida que se intentó abrir (o a la primera pantalla habilitada)
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      setError(error.response?.data?.error || 'Credenciales inválidas. Intente nuevamente.');
    }
  };

  // Si ya hay una sesión activa, no se muestra el login
  if (localStorage.getItem('token')) return <Navigate to="/" replace />;

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', padding: 'var(--space-5)', background: 'var(--canvas)' }}
    >
      <div style={{ width: '100%', maxWidth: 'var(--modal-sm)' }}>
        <div className="ui-card">
          <div
            style={{
              background: 'var(--nav-bg)',
              padding: 'var(--space-5)',
              borderBottom: '1px solid var(--nav-border)',
            }}
          >
            <div className="sidebar-logo-frame" style={{ marginBottom: 'var(--space-1)' }}>
              <img src={senatiLogo} alt="SENATI" className="sidebar-logo" />
            </div>
            <span className="sidebar-brand-caption">PANEL ADMINISTRATIVO DE INVENTARIO</span>
          </div>

          <div className="ui-card-header">
            <h1 className="ui-card-title" style={{ fontSize: '1.0625rem' }}>
              Iniciar sesión
            </h1>
            <span className="badge-ui badge-indigo">Acceso seguro</span>
          </div>

          <div className="ui-card-body">
            <Alert mensaje={{ texto: error, tipo: 'danger' }} onClose={() => setError('')} />

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label" htmlFor="login-email">
                  Correo electrónico
                </label>
                <div className="input-icon-wrap">
                  <Mail size={16} strokeWidth={1.75} />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    className="input-ui"
                    placeholder="usuario@inventario.com"
                    value={credenciales.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="login-password">
                  Contraseña
                </label>
                <div className="input-icon-wrap">
                  <Lock size={16} strokeWidth={1.75} />
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    className="input-ui"
                    placeholder="••••••••"
                    value={credenciales.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-ui btn-primary-ui btn-block">
                  <LogIn size={16} strokeWidth={1.75} />
                  Ingresar al panel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
