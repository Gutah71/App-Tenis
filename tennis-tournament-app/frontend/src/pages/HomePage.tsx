import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Torneos eliminatorios',
    desc: 'Genera cuadros automáticos para cualquier número de jugadores (potencia de 2). El sistema cruza rivales, gestiona rondas y decide el ganador final.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Ligas privadas',
    desc: 'Crea tu propia liga, invite a jugadores y organiza múltiples torneos bajo el mismo paraguas. Anuncios internos, estadísticas y rankings en tiempo real.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Notificaciones por email',
    desc: 'Recibes un correo cuando se crea tu partido, cuando el organizador lo programa, al reportar resultados y ante cualquier novedad en tu liga.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Resultados verificados',
    desc: 'Ambos jugadores deben confirmar el marcador. Si hay desacuerdo, el resultado pasa a revisión del organizador, garantizando total transparencia.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Estadísticas personales',
    desc: 'Consulta tu historial: torneos jugados, partidos ganados y perdidos, sets acumulados y trofeos obtenidos. Todo en tu perfil.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Gestión de fechas',
    desc: 'Programa la fecha y hora de cada partido. Los participantes visualizan el calendario de la competición y reciben recordatorios automáticos.',
  },
];

const steps = [
  { num: '01', title: 'Crea tu cuenta', desc: 'Regístrate de forma gratuita como jugador u organizador en menos de un minuto.' },
  { num: '02', title: 'Únete o crea una liga', desc: 'Explora ligas existentes o crea la tuya propia e invita a otros jugadores.' },
  { num: '03', title: 'Inscríbete en torneos', desc: 'Cuando se abra un torneo en tu liga, reserva tu plaza con un solo clic.' },
  { num: '04', title: 'Juega y reporta', desc: 'Disputa tu partido, introduce el marcador y confirma el resultado con tu rival.' },
];

const stats = [
  { value: 'Ilimitado', label: 'Jugadores por liga' },
  { value: '2–32', label: 'Plazas por torneo' },
  { value: '100%', label: 'Gratuito' },
  { value: '24/7', label: 'Disponibilidad' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const isOrganizer = user?.role === 'ORGANIZER';

  return (
    <div className="w-full">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative bg-hero-court bg-cover bg-center min-h-[580px] flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&q=80')",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
              Plataforma de tenis
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 break-words">
              Gestiona torneos de tenis{' '}
              <span className="text-brand-green">sin complicaciones</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
              Inscripciones, cuadros eliminatorios, verificación de resultados y
              notificaciones automáticas — todo en un solo lugar.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                isOrganizer ? (
                  <>
                    <Link to="/my-tournaments" className="btn-primary text-sm px-6 py-3">
                      Mis torneos
                    </Link>
                    <Link to="/my-leagues" className="btn-secondary text-sm px-6 py-3">
                      Mis ligas
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/tournaments" className="btn-primary text-sm px-6 py-3">
                      Ver torneos
                    </Link>
                    <Link to="/leagues" className="btn-secondary text-sm px-6 py-3">
                      Ver ligas
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-sm px-6 py-3">
                    Empezar gratis
                  </Link>
                  <Link to="/login" className="btn-secondary text-sm px-6 py-3">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative badge */}
        <div className="absolute bottom-0 right-0 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1531315630201-bb15abeb1653?w=600&q=80"
            alt="Jugador de tenis"
            className="h-80 object-cover object-top opacity-30 rounded-tl-3xl"
          />
        </div>
      </section>

      {/* ── Stats band ───────────────────────────────────────── */}
      <section className="bg-brand-surface-1 border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-brand-green">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="section-title">Todo lo que necesitas</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Una plataforma completa diseñada pensando en jugadores y organizadores.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="card hover:border-brand-green/50 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-11 h-11 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green mb-4 group-hover:bg-brand-green/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="bg-brand-surface-1 border-y border-brand-border py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-title">Cómo funciona</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Empieza a jugar en cuatro pasos sencillos.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-brand-border z-0" />
                )}
                <div className="relative z-10 flex flex-col items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-black border border-brand-green/30 flex items-center justify-center">
                    <span className="text-brand-green font-black text-lg">{s.num}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base mb-1.5">{s.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Court photo strip ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-brand-green text-xs font-semibold uppercase tracking-wider">Para jugadores</span>
            <h2 className="text-3xl font-black text-white mt-3 mb-5 leading-tight">
              Sigue tu evolución partido a partido
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Tu perfil recoge automáticamente cada partido que juegas: victorias, derrotas,
              sets ganados y torneos conquistados. Observa tu progresión y compara con otros
              miembros de tu liga.
            </p>
            <ul className="space-y-3">
              {[
                'Historial completo de partidos y resultados',
                'Sets ganados y perdidos acumulados',
                'Torneos jugados y campeonatos obtenidos',
                'Estado en tiempo real de inscripciones activas',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <svg className="w-4 h-4 text-brand-green mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            {!isAuthenticated && (
              <Link to="/register" className="btn-primary inline-block mt-8 text-sm px-6 py-3">
                Crear mi cuenta
              </Link>
            )}
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80"
              alt="Partido de tenis"
              className="rounded-2xl w-full h-72 object-cover border border-brand-border"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-brand-black/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Organizer strip ──────────────────────────────────── */}
      <section className="bg-brand-surface-1 border-y border-brand-border py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1 relative">
              <img
                src="https://images.unsplash.com/photo-1542144582-1ba00456b5e3?q=80&w=778&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Torneo de tenis profesional"
                className="rounded-2xl w-full h-72 object-cover border border-brand-border"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-brand-black/60 to-transparent" />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-brand-green text-xs font-semibold uppercase tracking-wider">Para organizadores</span>
              <h2 className="text-3xl font-black text-white mt-3 mb-5 leading-tight">
                Organiza torneos profesionales
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Con un simple formulario creas un torneo, defines las plazas y el sistema
                genera el cuadro eliminatorio al instante. Programa horarios, resuelve
                disputas y mantén a todos informados con anuncios de liga.
              </p>
              <ul className="space-y-3">
                {[
                  'Generación automática del cuadro eliminatorio',
                  'Programación de fecha y hora de cada partido',
                  'Resolución de disputas en resultados',
                  'Anuncios de liga con notificación por correo',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-brand-green mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              {!isAuthenticated && (
                <Link to="/register" className="btn-primary inline-block mt-8 text-sm px-6 py-3">
                  Registrarme como organizador
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-brand-surface-1 border border-brand-green/20 rounded-2xl p-12 text-center relative overflow-hidden">
            {/* BG glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.08)_0%,_transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4">
                ¿Listo para jugar?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Únete gratis y empieza a competir en tu club o liga local esta misma semana.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-3.5">
                  Crear cuenta gratuita
                </Link>
                <Link to="/tournaments" className="btn-secondary text-base px-8 py-3.5">
                  Ver torneos disponibles
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

