import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createResearchMacroArea } from './area.api';
import { updateScholar, fetchScholars } from '../scholars/scholars.api'; 
import { ScholarListItem } from '@org/books';
import form_styles from '../css/books.module.css';
import { MultiSelect } from '../components/multi-select';

export function MacroAreaCreatePage() {
  const [name, setName] = useState('');
  const [scholarsList, setScholarsList] = useState<ScholarListItem[]>([]);
  const [selectedScholars, setSelectedScholars] = useState<ScholarListItem[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loadingScholars, setLoadingScholars] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Carichiamo la lista dei ricercatori all'avvio della pagina
  useEffect(() => {
    fetchScholars()
      .then((data) => setScholarsList(data))
      .catch((err) => setError("Impossibile caricare l'elenco dei ricercatori: " + err.message))
      .finally(() => setLoadingScholars(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      // 1. Creiamo la macro area di ricerca nel database
      const newArea = await createResearchMacroArea({ name: name.trim() });

      // 2. Se abbiamo selezionato dei ricercatori, aggiorniamo i loro profili 
      // aggiungendo la nuova area appena creata ai loro ID esistenti
      if (selectedScholars.length > 0) {
        const updatePromises = selectedScholars.map((scholar) => {
          // Estraiamo gli ID delle macro aree già possedute dal ricercatore
          const currentAreaIds = scholar.research_macro_areas?.map(a => a.id) || [];
          
          // Inviamo la patch includendo la nuova area
          return updateScholar(scholar.id, {
            researchMacroAreaIds: [...currentAreaIds, newArea.id]
          });
        });

        await Promise.all(updatePromises);
      }

      navigate('/macro-areas'); // Ritorno trionfale alla lista
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante il salvataggio.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={`${form_styles.page} min-h-screen bg-slate-50 py-8 px-4`}>
      <div className={`${form_styles.card} max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-100`}>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
          Nuova Area di Ricerca
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Inserisci una nuova macro area scientifica o tecnologica e assegna i rispettivi ricercatori affiliati.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input del Nome dell'Area */}
          <div className={form_styles.formGroup}>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              Nome Area
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder-slate-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Intelligenza Artificiale"
              required
              disabled={submitting}
            />
          </div>

          {/* Componente MultiSelect per i Ricercatori */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="block text-sm font-semibold text-slate-700 mb-2">
              Assegna Ricercatori Affiliati
            </span>
            {loadingScholars ? (
              <p className="text-xs text-slate-400 italic animate-pulse">Caricamento ricercatori in corso...</p>
            ) : (
              <MultiSelect<ScholarListItem>
                items={scholarsList}
                selected={selectedScholars}
                onChange={setSelectedScholars}
                getId={(scholar) => scholar.id}
                getLabel={(scholar) => `${scholar.user?.name || 'Ricercatore'} (${scholar.universityDepartment || 'N/D'})`}
                placeholder="Digita il nome di un ricercatore..."
              />
            )}
          </div>

          {/* Bottoni dell'interfaccia con grafica moderna */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors cursor-pointer"
              onClick={() => navigate('/macro-areas')}
              disabled={submitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Salvataggio...' : 'Crea Area'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}