import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: '🏆',
    title: 'Torneos',
    desc: 'Crea y gestiona torneos con cuadros eliminatorios automáticos.',
  },
  {
    icon: '📊',
    title: 'Ligas',
    desc: 'Organiza ligas con múltiples torneos y controla a los participantes.',
  },
  {
    icon: '🎯',
    title: 'Resultados',
    desc: 'Reporta resultados en tiempo real y sigue el avance de cada ronda.',
  },
  {
    icon: '📈',
    title: 'Estadísticas',
    desc: 'Consulta tu historial de partidos, victorias y porcentaje de éxito.',
  },
];

export default function HomePage() {
  const { isGuest } = useAuth();

  return (
    <div className="space-y-16 py-4">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto">
        <span className="text-6xl">🎾</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 mt-4 mb-4 leading-tight">
          Tennis Tournament
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          Gestiona torneos locales de tenis: inscripciones, cuadros eliminatorios y
          resultados en un solo lugar.
        </p>

        {isGuest ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/register"
              className="inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
            >
              Comenzar ahora
            </Link>
            <Link
              to="/tournaments"
              className="inline-block border-2 border-green-700 text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Ver torneos
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/tournaments"
              className="inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
            >
              Explorar torneos
            </Link>
            <Link
              to="/leagues"
              className="inline-block border-2 border-green-700 text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Explorar ligas
            </Link>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">{f.icon}</span>
            <h3 className="font-bold text-gray-800 mt-3 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA bottom (guests only) */}
      {isGuest && (
        <section className="bg-green-50 rounded-xl p-8 text-center border border-green-100">
          <h2 className="text-xl font-bold text-green-800 mb-2">
            ¿Listo para competir?
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Regístrate gratis y empieza a participar en torneos ahora mismo.
          </p>
          <Link
            to="/register"
            className="inline-block bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-800 transition-colors text-sm"
          >
            Crear cuenta
          </Link>
        </section>
      )}
    </div>
  );
}
