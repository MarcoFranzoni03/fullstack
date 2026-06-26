import { useEffect, useState } from 'react';
import book_styles from '../css/books.module.css';
import { GiIdCard } from "react-icons/gi";
import clsx from 'clsx';
import { changePassword, fetchCurrentUser } from '../auth/auth.api';

export function ProfilePage() {
  // Stati per i dati dell'utente
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Stati per il form di cambio password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carichiamo l'utente loggato all'avvio
  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch((err) => setUserError(err.message))
      .finally(() => setLoadingUser(false));
  }, []);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Controllo di corrispondenza lato client
    if (newPassword !== confirmPassword) {
      setFormError('La nuova password e la password di conferma non coincidono.');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('La nuova password deve contenere almeno 8 caratteri.');
      return;
    }

    setSubmitting(true);

    try {
      await changePassword({ oldPassword, newPassword });
      setSuccessMessage('Password aggiornata con successo!');
      
      // Svuotiamo i campi del form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingUser) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.message}>Caricamento profilo in corso...</p>
        </section>
      </main>
    );
  }

  if (userError || !user) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.error}>Errore nel caricamento del profilo: {userError || 'Utente non valido'}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge)}>
        
        {/* Intestazione Profilo */}
        <header className="border-b border-slate-100 pb-4 mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <GiIdCard /> Il Tuo Profilo
          </h1>
          <p className={book_styles.subtitle}>Gestisci le informazioni del tuo account e le impostazioni di sicurezza.</p>
        </header>

        {/* Riepilogo Dati Utente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nome Utente</span>
            <span className="text-base font-medium text-slate-800">{user.name}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Istituzionale</span>
            <span className="text-base font-medium text-slate-800">{user.email}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Ruolo</span>
            <span className={clsx(book_styles.badge, "mt-1 inline-block font-bold")}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Form Sicurezza / Cambio Password */}
        <div className="max-w-md border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Sicurezza Account</h2>
          <p className="text-xs text-slate-500 mb-4">Usa questo modulo per aggiornare la tua password di accesso.</p>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm rounded">
              {successMessage}
            </div>
          )}

          <form className={book_styles.form} onSubmit={handlePasswordSubmit}>
            <div className={book_styles.field}>
              <label className="block text-sm font-semibold mb-1">Password Attuale</label>
              <input
                type="password"
                className={book_styles.input}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className={book_styles.field}>
              <label className="block text-sm font-semibold mb-1">Nuova Password</label>
              <input
                type="password"
                className={book_styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Almeno 8 caratteri"
                required
                disabled={submitting}
              />
            </div>

            <div className={book_styles.field}>
              <label className="block text-sm font-semibold mb-1">Conferma Nuova Password</label>
              <input
                type="password"
                className={book_styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className={book_styles.button}
                disabled={submitting || !oldPassword || !newPassword || !confirmPassword}
              >
                {submitting ? 'Aggiornamento...' : 'Aggiorna Password'}
              </button>
            </div>
          </form>
        </div>

      </section>
    </main>
  );
}