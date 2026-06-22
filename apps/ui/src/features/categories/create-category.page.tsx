import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import book_styles from '../css/books.module.css';
import { createCategory } from './categories.api';

export function CreateCategoryPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await createCategory({ name });
      navigate('/categories');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardSmall)}>
        <h1 className={book_styles.title}>➕ Nuova categoria</h1>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          <div className={book_styles.field}>
            <label>Nome categoria</label>
            <input
              className={book_styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <button className={book_styles.button} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Crea categoria'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </section>
    </main>
  );
}