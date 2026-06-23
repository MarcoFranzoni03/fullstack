import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../auth/auth.api'; 
import book_styles from '../css/books.module.css';
import clsx from 'clsx';
import { FaStar, FaTrash } from 'react-icons/fa';
import { ReviewListItem } from '@org/books';
import { deleteReview, fetchReviewsByBookId } from './reviews.api';
import { RoleGuard } from '../auth/role.guard';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../../../../libs/server/users/src/lib/dto/user-role.enum';

interface ReviewsPageProps {
  bookId: number;
}

export function ReviewsPage({ bookId }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Gestione eliminazione recensione
  async function handleDelete(reviewId: number) {
    const confirmed = window.confirm('Vuoi davvero eliminare questa recensione?');
    if (!confirmed) return;

    try {
      await deleteReview(reviewId);
      // Aggiornamento ottimistico dello stato della UI
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      alert(err.message || "Errore durante l'eliminazione.");
    }
  }

  useEffect(() => {
    if (!bookId || isNaN(bookId)) {
      setError("ID Libro non valido per il caricamento delle recensioni.");
      setLoading(false);
      return;
    }

    setLoading(true);
    // Scarichiamo recensioni e utente loggato in parallelo
    Promise.all([
      fetchReviewsByBookId(bookId),
      fetchCurrentUser().catch(() => null)
    ])
      .then(([reviewsData, userData]) => {
        setReviews(reviewsData);
        setCurrentUser(userData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) {
    return (
      <div className={book_styles.card}>
        <p className={book_styles.message}>Caricamento recensioni...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={book_styles.card}>
        <p className={book_styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <section className={clsx(book_styles.card, book_styles.cardLarge, "mt-6")}>
      {/* HEADER DELLA SEZIONE RECENSIONI */}
      <header className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recensioni dei lettori</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {reviews.length === 1 ? '1 recensione presente' : `${reviews.length} recensioni presenti`}
          </p>
        </div>

        {/* PULSANTE DI REINDIRIZZAMENTO PROTETTO */}
        <RoleGuard user={currentUser} allowedRoles={[UserRole.USER]}>
          <button
            onClick={() => navigate(`/books/${bookId}/reviews/create`)}
            className={clsx(book_styles.secondaryButton, "bg-blue-600 text-white border-none hover:bg-blue-700 font-medium py-2 px-4 rounded-xl shadow-sm text-sm cursor-pointer")}
          >
            Scrivi una recensione
          </button>
        </RoleGuard>
      </header>

      {reviews.length === 0 ? (
        <p className={book_styles.message}>
          Nessuna recensione disponibile per questo libro.
        </p>
      ) : (
        <div className="space-y-4 mt-4">
          {reviews.map((review) => {
            // Un utente può cancellare la recensione se è ADMIN oppure se è il proprietario della recensione stessa
            const canDelete = currentUser && (
              currentUser.role === UserRole.ADMIN || 
              currentUser.id === review.user?.id
            );

            return (
              <div 
                key={review.id} 
                className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-start gap-4 transition-all hover:border-slate-200"
              >
                <div className="space-y-1.5 flex-1">
                  {/* Rendering dinamico delle stelline */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FaStar 
                        key={index} 
                        className={index < review.rating ? "text-amber-500" : "text-slate-200"} 
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-1.5">({review.rating}/5)</span>
                  </div>

                  {/* Commento */}
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed font-normal">
                    "{review.comment}"
                  </p>

                  {/* Autore della recensione */}
                  <p className="text-xs text-slate-400 font-medium">
                    Inviata da: <span className="text-slate-600 font-semibold">{review.user?.email ?? 'Utente Anonimo'}</span>
                  </p>
                </div>

                {/* Mostra il cestino solo se l'utente ha i permessi (Creatore o Admin) */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border-none outline-none cursor-pointer shrink-0"
                    title="Elimina recensione"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}