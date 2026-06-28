import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import book_styles from '../css/books.module.css';
import { createResearchProject } from './projects.api';
import { fetchScholars } from '../scholars/scholars.api'; 
import { ScholarListItem } from '@org/books';
import { MultiSelect } from '../components/multi-select'; 

export function CreateResearchProjectPage() {
  const [title, setTitle] = useState('');
  const [acronym, setAcronym] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 🌟 Usiamo gli oggetti interi per il MultiSelect
  const [selectedScholars, setSelectedScholars] = useState<ScholarListItem[]>([]);

  const [scholarsList, setScholarsList] = useState<ScholarListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingScholars, setLoadingScholars] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchScholars()
      .then(setScholarsList)
      .catch((err) => setError("Impossibile caricare l'elenco dei ricercatori: " + err.message))
      .finally(() => setLoadingScholars(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validazione basata sull'array di oggetti
    if (selectedScholars.length === 0) {
      setError('Seleziona almeno un ricercatore per il progetto.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await createResearchProject({
        title,
        acronym,
        budget: budget ? parseFloat(budget) : undefined,
        startDate,
        endDate,
        // 🌟 Estraiamo gli ID solo adesso per il payload del DTO
        scholarIds: selectedScholars.map((s) => s.id),
      });

      navigate('/research-projects');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingScholars) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.message}>Inizializzazione modulo di creazione...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardSmall)}>
        <h1 className={book_styles.title}>➕ Nuovo Progetto di Ricerca</h1>

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

          {/* 🌟 INTEGRAZIONE COMPONENTE MULTISELECT */}
          <div className={book_styles.field}>
            <MultiSelect<ScholarListItem>
              label="Ricercatori Assegnati"
              placeholder="Digita il nome di un ricercatore..."
              items={scholarsList}
              selected={selectedScholars}
              onChange={setSelectedScholars}
              getId={(scholar) => scholar.id}
              getLabel={(scholar) => `${scholar.user?.name} (${scholar.universityDepartment || 'N/D'})`}
              className={book_styles.input} // Passiamo la classe per uniformare lo stile dell'input
            />
          </div>

          <button className={book_styles.button} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Crea progetto'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </section>
    </main>
  );
}