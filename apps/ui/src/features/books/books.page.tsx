import { useEffect, useState } from 'react';
import { fetchBooks } from './books.api';
import { BookListItem } from '@org/books';
import { useNavigate } from 'react-router-dom';
import book_styles from '../css/books.module.css';
import clsx from 'clsx';
import { GiSecretBook } from "react-icons/gi";
import { deleteBook } from './books.api';
import { Link } from 'react-router-dom';
import { RoleGuard } from '../auth/role.guard';
import { fetchCurrentUser } from '../auth/auth.api';
import { UserRole } from '../../../../../libs/server/users/src/lib/dto/user-role.enum';

export function BooksPage() {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Vuoi davvero cancellare questo libro?');

    if(!confirmed)
      return;

    try {
      await deleteBook(id);
      setBooks((books) => books.filter((book) => book.id != id));
    } catch(err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    // 2. SCARICA IN PARALLELO LIBRI E UTENTE
    Promise.all([
      fetchBooks(),
      fetchCurrentUser().catch(() => null) // Se l'utente non è loggato, fallisce silenziosamente e torna null
    ])
      .then(([booksData, userData]) => {
        setBooks(booksData);
        setCurrentUser(userData); // <-- 3. SALVA L'UTENTE NELLO STATO
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className={book_styles.page}>
        <div className={book_styles.card}>
          <p className={book_styles.message}>Caricamento libri...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={book_styles.page}>
        <div className={book_styles.card}>
          <p className={book_styles.error}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge)}>
        <header className={book_styles.headerRow}>
          <div>
            <h1><GiSecretBook/> Catalogo libri</h1>
            <p className={book_styles.subtitle}>
              Elenco dei libri disponibili nella libreria online.
            </p>
          </div>
        </header>

        {books.length === 0 ? (
          <p className={book_styles.message}>Nessun libro disponibile.</p>
        ) : (
          <div className={book_styles.tableWrapper}>
            <table className={book_styles.table}>
              <thead>
                <tr>
                  <th className={book_styles.th}>Titolo</th>
                  <th className={book_styles.th}>Anno</th>
                  <th className={book_styles.th}>Categoria</th>
                  <th className={book_styles.th}>Autori</th>
                  {/* APPENDE QUI IL ROLEGUARD */}
                  <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
                    <th className={book_styles.th}>Azioni</th>
                  </RoleGuard>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className={book_styles.row}>
                    <td className={book_styles.titleCell}>
                      <Link 
                        to={`/books/${book.id}`} 
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {book.title}
                      </Link>
                    </td>
                    <td className={book_styles.td}>{book.publishedYear}</td>
                    <td className={book_styles.td}>
                      <span className={book_styles.badge}>
                        {book.category?.name ?? 'N/D'}
                      </span>
                    </td>
                    <td className={book_styles.td}>
                      {book.authors?.length
                        ? book.authors
                            .map(
                              (author) =>
                                `${author.firstName} ${author.lastName}`
                            )
                            .join(', ')
                        : 'N/D'}
                    </td>
                    {/* AVVOLGI L'INTERA CELLA DELLE AZIONI CON IL ROLEGUARD */}
                    <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
                      <td className={book_styles.td}>
                        <button 
                          className={book_styles.secondaryButton}
                          onClick={() => navigate(`/books/${book.id}/edit`)}
                        >
                          Modifica
                        </button>

                        <button 
                          className={book_styles.dangerButton}
                          onClick={() => handleDelete(book.id)}
                        >
                          Elimina
                        </button>
                      </td>
                    </RoleGuard>
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