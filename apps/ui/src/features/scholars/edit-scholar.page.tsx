import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import book_styles from '../css/books.module.css';
import { fetchScholarById, updateScholar } from './scholars.api'; // adatta il path
import { MultiSelect } from '../components/multi-select';
import { ResearchMacroAreaListItem } from '@org/books';
import { fetchResearchMacroAreas } from '../research-macro-areas/area.api';

export function EditScholarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Stati per i campi modificabili dello Scholar (il dipartimento)
  const [universityDepartment, setUniversityDepartment] = useState('');
  
  // Stati per la gestione delle sue Macro Aree di Ricerca
  const [allMacroAreas, setAllMacroAreas] = useState<ResearchMacroAreaListItem[]>([]);
  const [selectedMacroAreas, setSelectedMacroAreas] = useState<ResearchMacroAreaListItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scholarId = Number(id);

  useEffect(() => {
    if (!id || isNaN(scholarId)) {
      setError('ID ricercatore non valido.');
      setLoading(false);
      return;
    }

    setLoading(true);

    // Carichiamo i dati dello Scholar specifico e tutte le aree disponibili
    Promise.all([
      fetchScholarById(scholarId),
      fetchResearchMacroAreas()
    ])
      .then(([scholarData, macroAreasData]) => {
        setUniversityDepartment(scholarData.universityDepartment);
        setAllMacroAreas(macroAreasData);
        
        // 1. Recuperiamo gli ID delle macro aree associate (che sono parziali)
        const partialAreas = scholarData.research_macro_areas || [];
        const savedAreaIds = partialAreas.map((area: any) => area.id);

        // 2. Intercettiamo gli oggetti completi da macroAreasData usando gli ID salvati
        const fullSelectedAreas = macroAreasData.filter((area) => savedAreaIds.includes(area.id));

        // 3. Ora lo stato riceve dati perfetti conformi a ResearchMacroAreaListItem[]
        setSelectedMacroAreas(fullSelectedAreas);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, scholarId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id || isNaN(scholarId)) return;

    setError(null);
    setSaving(true);

    // Costruiamo l'UpdateScholarDto estraendo gli ID numerici selezionati
    const payload = {
      universityDepartment,
      researchMacroAreaIds: selectedMacroAreas.map((area) => area.id),
    };

    try {
      await updateScholar(scholarId, payload);
      navigate('/scholars');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.message}>Caricamento profilo ricercatore...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge || 'max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md')}>
        <h1 className={book_styles.title}>✏️ Modifica Ricercatore</h1>
        <p className="text-sm text-slate-500 mb-6">Aggiorna le informazioni accademiche e le aree di ricerca di competenza.</p>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          
          {/* Campo Dipartimento */}
          <div className={book_styles.field}>
            <label className="block text-sm font-semibold mb-1">Dipartimento Universitario</label>
            <input
              type="text"
              className={book_styles.input}
              value={universityDepartment}
              onChange={(e) => setUniversityDepartment(e.target.value)}
              placeholder="es. Dipartimento di Ingegneria dell'Informazione"
              required
              disabled={saving}
            />
          </div>

          {/* Gestione MultiSelect per le sue Macro Aree */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 my-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Modifica Aree di Ricerca di Competenza
            </label>
            <MultiSelect<ResearchMacroAreaListItem>
              items={allMacroAreas}
              selected={selectedMacroAreas}
              onChange={setSelectedMacroAreas}
              getId={(area) => area.id}
              getLabel={(area) => area.name}
              placeholder="Aggiungi o rimuovi un'area scientifica..."
            />
          </div>

          {/* Pulsanti di Azione */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              className={book_styles.secondaryButton || 'px-4 py-2 text-slate-600 bg-slate-100 rounded-lg'}
              onClick={() => navigate('/scholars')}
              disabled={saving}
            >
              Annulla
            </button>
            <button 
              type="submit" 
              className={book_styles.button} 
              disabled={saving}
            >
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
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