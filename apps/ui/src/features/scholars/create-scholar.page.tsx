import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import book_styles from '../css/books.module.css';
import { createScholar } from './scholars.api';
import { fetchResearchMacroAreas } from '../research-macro-areas/area.api'; 
import { MultiSelect } from '../components/multi-select';
import { ResearchMacroAreaListItem } from '@org/books';

export function CreateScholarPage() {
  // Stati per l'account Utente (Anagrafica)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Stati per il profilo Scholar (Specifico)
  const [universityDepartment, setUniversityDepartment] = useState('');
  
  // Stati per le Macro Aree di Ricerca (N:N)
  const [macroAreasList, setMacroAreasList] = useState<ResearchMacroAreaListItem[]>([]);
  const [selectedMacroAreas, setSelectedMacroAreas] = useState<ResearchMacroAreaListItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Carichiamo le macro aree disponibili all'avvio
  useEffect(() => {
    fetchResearchMacroAreas()
      .then(setMacroAreasList)
      .catch((err) => setError("Impossibile caricare le aree di ricerca: " + err.message))
      .finally(() => setLoadingAreas(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    // Prepariamo l'array di ID numerici scelti nel MultiSelect
    const researchMacroAreaIds = selectedMacroAreas.map((area) => area.id);

    // Strutturiamo il payload sdoppiato esattamente come lo vuole il backend (NestJS @Body('user') e @Body('scholar'))
    const payload = {
      user: {
        name,
        email,
        password,
      },
      scholar: {
        universityDepartment,
        researchMacroAreaIds,
      },
    };

    try {
      await createScholar(payload);
      navigate('/scholars');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge || 'max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md')}>
        <h1 className={book_styles.title}>➕ Nuovo Ricercatore</h1>
        <p className="text-sm text-slate-500 mb-6">Crea un account utente e configura il rispettivo profilo accademico.</p>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          
          {/* Sezione 1: Dati Anagrafici Utente */}
          <h2 className="text-md font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Dati Utente Base</h2>
          
          <div className={book_styles.field}>
            <label className="block text-sm font-semibold mb-1">Nome e Cognome</label>
            <input
              type="text"
              className={book_styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Mario Rossi"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={book_styles.field}>
              <label className="block text-sm font-semibold mb-1">Email Istituzionale</label>
              <input
                type="email"
                className={book_styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="es. m.rossi@unibs.it"
                required
                disabled={loading}
              />
            </div>

            <div className={book_styles.field}>
              <label className="block text-sm font-semibold mb-1">Password Temporanea</label>
              <input
                type="password"
                className={book_styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caratteri"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Sezione 2: Dati Profilo Ricercatore */}
          <h2 className="text-md font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4 mt-6">Competenze Scientifiche</h2>

          <div className={book_styles.field}>
            <label className="block text-sm font-semibold mb-1">Dipartimento Universitario</label>
            <input
              type="text"
              className={book_styles.input}
              value={universityDepartment}
              onChange={(e) => setUniversityDepartment(e.target.value)}
              placeholder="es. Dipartimento di Ingegneria dell'Informazione"
              required
              disabled={loading}
            />
          </div>

          {/* Assegnazione Macro Aree tramite il tuo MultiSelect */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 my-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Associa Aree di Ricerca Obbiettivo
            </label>
            {loadingAreas ? (
              <p className="text-xs text-slate-400 italic">Caricamento aree disponibili...</p>
            ) : (
              <MultiSelect<ResearchMacroAreaListItem>
                items={macroAreasList}
                selected={selectedMacroAreas}
                onChange={setSelectedMacroAreas}
                getId={(area) => area.id}
                getLabel={(area) => area.name}
                placeholder="Cerca e aggiungi un'area..."
              />
            )}
          </div>

          {/* Bottoni di Azione */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              className={book_styles.secondaryButton || 'px-4 py-2 text-slate-600 bg-slate-100 rounded-lg'}
              onClick={() => navigate('/scholars')}
              disabled={loading}
            >
              Annulla
            </button>
            <button 
              type="submit" 
              className={book_styles.button} 
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : 'Crea profilo'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}