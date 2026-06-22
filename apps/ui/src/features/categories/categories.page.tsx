import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import book_styles from '../css/books.module.css';
import { CategoryListItem } from '@org/books';
import { deleteCategory, fetchCategories } from './categories.api';

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Vuoi davvero cancellare questa categoria?'
    );

    if (!confirmed) return;

    try {
      await deleteCategory(id);
      setCategories((current) =>
        current.filter((category) => category.id !== id)
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.message}>Caricamento categorie...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.error}>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge)}>
        <header className={book_styles.header}>
          <h1 className={book_styles.title}>🏷️ Categorie</h1>
          <p className={book_styles.subtitle}>
            Elenco delle categorie disponibili nella libreria.
          </p>
        </header>

        <button
          className={book_styles.button}
          onClick={() => navigate('/categories/new')}
        >
          Nuova categoria
        </button>

        {categories.length === 0 ? (
          <p className={book_styles.message}>Nessuna categoria disponibile.</p>
        ) : (
          <div className={book_styles.tableWrapper}>
            <table className={book_styles.table}>
              <thead>
                <tr>
                  <th className={book_styles.th}>Nome</th>
                  <th className={book_styles.th}>Azioni</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className={book_styles.row}>
                    <td className={book_styles.titleCell}>{category.name}</td>
                    <td className={book_styles.td}>
                      <button
                        className={book_styles.secondaryButton}
                        onClick={() =>
                          navigate(`/categories/${category.id}/edit`)
                        }
                      >
                        Modifica
                      </button>

                      <button
                        className={book_styles.dangerButton}
                        onClick={() => handleDelete(category.id)}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}