import { Link } from 'react-router-dom';

export function HomeBootstrapPage() {
  return (
    <main className="min-vh-100 bg-light d-flex align-items-center justify-content-center px-3">
      <section className="card shadow p-5 text-center" style={{ maxWidth: 420 }}>
        <h1 className="fw-bold">📚 Library App</h1>

        <p className="text-muted mt-3">
          Benvenuto nel catalogo online della biblioteca.
        </p>

        <Link to="/books" className="btn btn-primary mt-4">
          Vai al catalogo
        </Link>
      </section>
    </main>
  );
}

