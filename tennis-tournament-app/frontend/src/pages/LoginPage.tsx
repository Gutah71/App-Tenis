import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginService(email, password);
      login(result.token, result.user);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16 bg-brand-black">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-brand-green rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2 C6 8, 18 16, 12 22"/>
                <path d="M2 12 C8 6, 16 18, 22 12"/>
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight">
              <span className="text-brand-green">Tennis</span>
              <span className="text-white">Tournament</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenido de nuevo</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="mt-5 text-sm text-gray-500 text-center">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-brand-green hover:text-brand-green-light font-medium transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

