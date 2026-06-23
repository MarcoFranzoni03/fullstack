import { useNavigate } from 'react-router-dom';
import book_styles from '../css/books.module.css';
import clsx from 'clsx';

export function Page403() {
  const navigate = useNavigate();

  return (
    <main className={book_styles.page}>
      <div className={clsx(book_styles.card, "max-w-md w-full text-center mx-auto")}>
        
        {/* Icona di Avviso stilizzata */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-6 mx-auto">
          <svg 
            className="w-8 h-8" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="2" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Testo dell'errore */}
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          403
        </h1>
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Accesso Negato
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Non hai i permessi necessari per visualizzare questa pagina. 
          Se ritieni che si tratti di un errore, verifica le tue credenziali di accesso.
        </p>

        {/* Pulsante Indietro coerente con i button del sito */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={clsx(book_styles.secondaryButton, "w-full justify-center gap-2 py-3")}
        >
          <svg 
            className="w-4 h-4 shrink-0 stroke-[2.5px]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          <span>Torna indietro</span>
        </button>

      </div>
    </main>
  );
}