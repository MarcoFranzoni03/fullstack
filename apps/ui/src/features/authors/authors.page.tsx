import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import book_styles from '../css/books.module.css';
import { AuthorListItem } from '@org/books';
import { deleteAuthor, fetchAuthors } from './authors.api';

export function AuthorsPage() {
  const [authors, setAuthors] = useState<AuthorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAuthors()
      .then(setAuthors)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Vuoi davvero cancellare questo autore?');

    if (!confirmed) return;

    try {
      await deleteAuthor(id);
      setAuthors((current) => current.filter((author) => author.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.message}>Caricamento autori...</p>
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

  function formatAddress(author: AuthorListItem): string {
    if(!author.address)
        return 'N/D';

    const {street,city,zipCode,country} = author.address;

    return [street,city,zipCode,country].filter(Boolean).join(', ');
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge)}>
        <header className={book_styles.header}>
          <h1 className={book_styles.title}>✍️ Autori</h1>
          <p className={book_styles.subtitle}>
            Elenco degli autori presenti nella libreria.
          </p>
        </header>

        <button
          className={book_styles.button}
          onClick={() => navigate('/authors/new')}
        >
          Nuovo autore
        </button>

        {authors.length === 0 ? (
          <p className={book_styles.message}>Nessun autore disponibile.</p>
        ) : (
          <div className={book_styles.tableWrapper}>
            <table className={book_styles.table}>
              <thead>
                <tr>
                  <th className={book_styles.th}>Nome</th>
                  <th className={book_styles.th}>Cognome</th>
                  <th className={book_styles.th}>Indirizzo</th>
                  <th className={book_styles.th}>Azioni</th>
                </tr>
              </thead>

              <tbody>
                {authors.map((author) => (
                  <tr key={author.id} className={book_styles.row}>
                    <td className={book_styles.td}>{author.firstName}</td>
                    <td className={book_styles.td}>{author.lastName}</td>
                    <td className={book_styles.td}>
                      {formatAddress(author)}
                    </td>
                    <td className={book_styles.td}>
                      <button
                        className={book_styles.secondaryButton}
                        onClick={() => navigate(`/authors/${author.id}/edit`)}
                      >
                        Modifica
                      </button>

                      <button
                        className={book_styles.dangerButton}
                        onClick={() => handleDelete(author.id)}
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