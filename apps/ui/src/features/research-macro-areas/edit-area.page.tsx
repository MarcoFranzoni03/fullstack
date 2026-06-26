import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchResearchMacroAreaById, updateResearchMacroArea } from './area.api';
import { fetchScholars, updateScholar } from '../scholars/scholars.api'; 
import form_styles from '../css/books.module.css';
import { ScholarListItem } from '@org/books';
import { MultiSelect } from '../components/multi-select';

export function MacroAreaUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  
  // Stati per la gestione del MultiSelect dei ricercatori
  const [allScholars, setAllScholars] = useState<ScholarListItem[]>([]);
  const [selectedScholars, setSelectedScholars] = useState<ScholarListItem[]>([]);
  const [initialScholarsIds, setInitialScholarsIds] = useState<number[]>([]); // Per capire chi aggiungere/rimuovere al submit

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const areaId = parseInt(id || '', 10);

  useEffect(() => {
    if (isNaN(areaId)) {
      setError('ID area non valido.');
      setLoading(false);
      return;
    }

    setLoading(true);

    // Carichiamo in parallelo i dati dell'area corrente e la lista di TUTTI i ricercatori esistenti
    Promise.all([
      fetchResearchMacroAreaById(areaId),
      fetchScholars()
    ])
      .then(([area, scholars]) => {
        setName(area.name);
        setAllScholars(scholars);
        
        // Estraggo gli ID dei ricercatori parziali inviati dal backend per questa area
        const partialScholars = area.scholars || [];
        const savedScholarIds = partialScholars.map((s: any) => s.id);

        // Mappatura correttiva dei tipi: cerco e filtro solo gli oggetti "ricchi" (ScholarListItem) che hanno quegli ID
        const fullSelectedScholars = scholars.filter((s) => savedScholarIds.includes(s.id));
        
        // Imposto lo stato con i dati tipizzati correttamente per il MultiSelect
        setSelectedScholars(fullSelectedScholars);
        
        // Teniamo traccia degli ID iniziali per fare il confronto differenziale al submit
        setInitialScholarsIds(savedScholarIds);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [areaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || isNaN(areaId)) return;

    setSubmitting(true);
    setError(null);

    try {
      // 1. Aggiorniamo il nome dell'area macro
      await updateResearchMacroArea(areaId, { name: name.trim() });

      // 2. Calcoliamo chi è stato aggiunto e chi è stato rimosso dal MultiSelect
      const currentSelectedIds = selectedScholars.map(s => s.id);
      
      const addedScholars = selectedScholars.filter(s => !initialScholarsIds.includes(s.id));
      const removedScholars = allScholars.filter(s => initialScholarsIds.includes(s.id) && !currentSelectedIds.includes(s.id));

      const updatePromises: Promise<any>[] = [];

      // Per gli aggiunti: prendiamo le loro macro-aree attuali e pushiamo anche questa
      addedScholars.forEach((scholar) => {
        const currentAreaIds = scholar.research_macro_areas?.map(a => a.id) || [];
        updatePromises.push(
          updateScholar(scholar.id, { researchMacroAreaIds: [...currentAreaIds, areaId] })
        );
      });

      // Per i rimossi: filtriamo via l'id di questa macro-area dal loro profilo
      removedScholars.forEach((scholar) => {
        const currentAreaIds = scholar.research_macro_areas?.map(a => a.id) || [];
        updatePromises.push(
          updateScholar(scholar.id, { researchMacroAreaIds: currentAreaIds.filter(id => id !== areaId) })
        );
      });

      // Eseguiamo tutti i salvataggi in parallelo
      await Promise.all(updatePromises);

      navigate('/macro-areas');
    } catch (err: any) {
      setError(err.message || "Errore durante l'aggiornamento dei dati.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className={`${form_styles.page} min-h-screen bg-slate-50 py-8 flex items-center justify-center`}>
        <div className={form_styles.card}>
          <p className="text-slate-600 font-medium animate-pulse">Caricamento dati area in corso...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`${form_styles.page} min-h-screen bg-slate-50 py-8 px-4`}>
      <div className={`${form_styles.card} max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-100`}>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Modifica Area di Ricerca</h1>
        <p className="text-sm text-slate-500 mb-6">Aggiorna il nome della macro area tecnologica e gestisci i relativi ricercatori affiliati.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome dell'Area */}
          <div className={form_styles.formGroup}>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Nome Area</label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder-slate-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Inserisci il nuovo nome"
              required
              disabled={submitting}
            />
          </div>

          {/* Strumento MultiSelect per Agganciare/Sganciare i Ricercatori */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="block text-sm font-semibold text-slate-700 mb-2">
              Modifica Ricercatori Affiliati
            </span>
            <MultiSelect<ScholarListItem>
              items={allScholars}
              selected={selectedScholars}
              onChange={setSelectedScholars}
              getId={(scholar) => scholar.id}
              getLabel={(scholar) => `${scholar.user?.name || 'Ricercatore'} (${scholar.universityDepartment || 'N/D'})`}
              placeholder="Aggiungi o rimuovi ricercatori da questa area..."
            />
          </div>

          {/* Bottoni Graficamente Curati */}
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
              {submitting ? 'Aggiornamento...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}