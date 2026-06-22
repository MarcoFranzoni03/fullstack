import { Link } from 'react-router-dom';

export function HomeTailwindPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">
          📚 Library App
        </h1>

        <p className="mt-4 text-slate-500">
          Benvenuto nel catalogo online della biblioteca.
        </p>

        <Link
          to="/books"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Vai al catalogo
        </Link>
      </section>
    </main>
  );
}

