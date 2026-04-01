export default function ContactPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="section-title">Contáctanos</h1>
        <p className="section-subtitle">¿Tienes alguna pregunta o sugerencia? Escríbenos, estaremos encantados de ayudarte</p>
      </div>

      <div className="card mb-8 space-y-5">
        <div>
          <label className="label">Nombre</label>
          <input
            type="text"
            className="input-field"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="label">Mensaje</label>
          <textarea
            rows={5}
            className="input-field resize-none"
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>
        <button
          type="button"
          className="btn-primary w-full"
        >
          Enviar mensaje
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold text-white mb-6">Información de contacto</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-400">tenis@tfg.local</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-400">Universidad — Campus Deportivo</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400">Lunes a viernes, 9:00 – 18:00</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
