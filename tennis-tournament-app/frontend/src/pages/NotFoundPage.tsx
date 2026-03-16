import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-gray-500 mb-6">Página no encontrada.</p>
      <Link to="/" className="text-green-700 underline hover:text-green-900">
        Volver al inicio
      </Link>
    </div>
  );
}
