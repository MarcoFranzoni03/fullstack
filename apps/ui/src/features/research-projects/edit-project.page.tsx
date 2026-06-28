import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';

import book_styles from '../css/books.module.css';
import { fetchResearchProjectById, updateResearchProject } from './projects.api';
import { fetchScholars } from '../scholars/scholars.api'; 
import { ScholarListItem } from '@org/books';
import { MultiSelect } from '../components/multi-select'; 

export function EditResearchProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [acronym, setAcronym] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 🌟 Usiamo gli oggetti interi per gestire lo stato del MultiSelect
  const [selectedScholars, setSelectedScholars] = useState<ScholarListItem[]>([]);

  const [scholarsList, setScholarsList] = useState<ScholarListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Scarichiamo in parallelo il progetto corrente e la lista di tutti i ricercatori
    Promise.all([
      fetchResearchProjectById(Number(id)),
      fetchScholars().catch(() => [])
    ])
      .then(([project, scholarsData]) => {
        setScholarsList(scholarsData);
        
        // Popoliamo gli stati del form con i dati attuali del progetto
        setTitle(project.title);
        setAcronym(project.acronym);
        setBudget(project.budget !== undefined && project.budget !== null ? project.budget.toString() : '');
        setStartDate(project.startDate);
        setEndDate(project.endDate);
        
        // 🌟 Troviamo gli oggetti completi dei ricercatori attualmente associati al progetto
        const currentScholarIds = project.scholars?.map(s => s.id) || [];
        const currentScholars = scholarsData.filter(scholar => currentScholarIds.includes(scholar.id));
        setSelectedScholars(currentScholars);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id) return;
    
    // Validazione basata sull'array di oggetti
    if (selectedScholars.length === 0) {
      setError('Il progetto deve essere assegnato ad almeno un ricercatore.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await updateResearchProject(Number(id), {
        title,
        acronym,
        budget: budget ? parseFloat(budget) : undefined,
        startDate,
        endDate,
        // 🌟 Estraiamo gli ID solo adesso per il payload finale del DTO
        scholarIds: selectedScholars.map((s) => s.id),
      });

      navigate('/research-projects');
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
          <p className={book_styles.message}>Caricamento progetto di ricerca...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardSmall)}>
        <h1 className={book_styles.title}>✏️ Modifica Progetto di Ricerca</h1>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          <div className={book_styles.field}>
            <label>Acronimo Progetto</label>
            <input
              className={book_styles.input}
              placeholder="es. AI4HEALTH"
              value={acronym}
              onChange={(e) => setAcronym(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Titolo Esteso</label>
            <input
              className={book_styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Budget (€)</label>
            <input
              type="number"
              step="0.01"
              className={book_styles.input}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className={book_styles.field}>
            <label>Data Inizio</label>
            <input
              type="date"
              className={book_styles.input}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Data Fine</label>
            <input
              type="date"
              className={book_styles.input}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {/* 🌟 NUOVA INTEGRAZIONE COMPONENTE MULTISELECT */}
          <div className={book_styles.field}>
            <MultiSelect<ScholarListItem>
              label="Ricercatori Assegnati"
              placeholder="Digita il nome di un ricercatore..."
              items={scholarsList}
              selected={selectedScholars}
              onChange={setSelectedScholars}
              getId={(scholar) => scholar.id}
              getLabel={(scholar) => `${scholar.user?.name} (${scholar.universityDepartment || 'N/D'})`}
              className={book_styles.input}
            />
          </div>

          <button className={book_styles.button} disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </section>
    </main>
  );
}