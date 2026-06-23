import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookById } from './books.api';
import { BookListItem } from '@org/books';
import book_styles from '../css/books.module.css';
import clsx from 'clsx';
import { GiSecretBook } from "react-icons/gi";
import { ReviewsPage } from '../reviews/reviews.page'; 

export function BookPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);
  const navigate = useNavigate();

  const [book, setBook] = useState<BookListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(bookId)) {
      setError("ID Libro non valido");
      setLoading(false);
      return;
    }

    fetchBookById(bookId)
      .then(setBook)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) {
    return (
      <main className={book_styles.page}>
        <div className={book_styles.card}>
          <p className={book_styles.message}>Caricamento dettagli libro...</p>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className={book_styles.page}>
        <div className={book_styles.card}>
          <p className={book_styles.error}>{error || "Libro non trovato"}</p>
          <button className={book_styles.secondaryButton} onClick={() => navigate('/books')}>
            Torna al catalogo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      
      {/* AGGIUNGIAMO mx-auto, max-w-5xl E ALLINEIAMO AL CENTRO IL PADRE SE SERVE */}
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-4 md:px-0">
        
        {/* SCHEDA DEL LIBRO */}
        <section className={clsx(book_styles.card, book_styles.cardLarge)}>
          <header className={book_styles.headerRow}>
            <div>
              <h1><GiSecretBook/> Scheda Libro</h1>
              <p className={book_styles.subtitle}>
                Informazioni dettagliate sull'opera selezionata.
              </p>
            </div>
            <button className={book_styles.secondaryButton} onClick={() => navigate('/books')}>
              Torna al catalogo
            </button>
          </header>

          <div className="mt-6 border-t border-gray-100 pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Titolo dell'opera</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{book.title}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Anno di pubblicazione</p>
                <p className="text-lg text-gray-800 mt-1">{book.publishedYear}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 pt-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Categoria / Genere</p>
                <p className="mt-2">
                  <span className={book_styles.badge}>
                    {book.category?.name ?? 'N/D'}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Autori</p>
                <p className="text-base text-gray-800 mt-1">
                  {book.authors?.length
                    ? book.authors
                        .map((author) => `${author.firstName} ${author.lastName}`)
                        .join(', ')
                    : 'N/D'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RECENSIONI */}
        <ReviewsPage bookId={bookId} />

      </div>
    </main>
  );
}