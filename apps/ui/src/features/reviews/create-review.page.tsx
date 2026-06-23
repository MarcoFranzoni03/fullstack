import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import book_styles from '../css/books.module.css';
import { createReviewByBookId } from '../reviews/reviews.api'; 

export function CreateReviewPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);
  const navigate = useNavigate();

  // Stati del form conformi al CreateReviewPayload (senza DTO di backend)
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5); // Default a 5 stelle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isNaN(bookId)) {
      setError("ID libro non valido.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Passiamo il payload { rating, comment } e il bookId richiesto dalla funzione
      await createReviewByBookId({ rating, comment }, bookId);
      
      // A creazione completata, torniamo alla scheda di dettaglio del libro centrata
      navigate(`/books/${bookId}`);
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio della recensione.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={clsx(book_styles.page, "justify-center")}>
      <section className={clsx(book_styles.card, book_styles.cardSmall, "mx-auto w-full max-w-md")}>
        <h1 className={book_styles.title}>⭐ Scrivi una recensione</h1>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          
          {/* SELETTORE DEL VOTO (RATING) */}
          <div className={book_styles.field}>
            <label className="flex items-center gap-1.5 font-semibold text-slate-700">
              Valutazione dell'opera
            </label>
            <select
              className={clsx(book_styles.input, "cursor-pointer bg-white")}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5/5) Eccellente</option>
              <option value={4}>⭐⭐⭐⭐ (4/5) Molto buono</option>
              <option value={3}>⭐⭐⭐ (3/5) Buono</option>
              <option value={2}>⭐⭐ (2/5) Accettabile</option>
              <option value={1}>⭐ (1/5) Scarso</option>
            </select>
          </div>

          {/* AREA DI TESTO PER IL COMMENTO */}
          <div className={book_styles.field}>
            <label className="font-semibold text-slate-700">Il tuo commento</label>
            <textarea
              className={clsx(book_styles.input, "min-h-[120px] resize-none p-3")}
              placeholder="Cosa ne pensi di questo libro? Condividi la tua opinione..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          {/* PULSANTI DI AZIONE ALLINEATI E COORIDNATI */}
          <div className="flex gap-4 mt-6 w-full">
            <button 
              type="button"
              onClick={() => navigate(`/books/${bookId}`)}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer text-center"
              disabled={loading}
            >
              Annulla
            </button>
            
            <button 
              type="submit" 
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 transition-colors border-none cursor-pointer text-center" 
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : 'Invia recensione'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
            ⚠️ {error}
          </div>
        )}
      </section>
    </main>
  );
}