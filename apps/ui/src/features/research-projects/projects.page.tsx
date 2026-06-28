import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { HiOutlineCollection } from "react-icons/hi"; 

import book_styles from '../css/books.module.css';
import { ResearchProjectListItem } from '@org/books';
import { deleteResearchProject, fetchResearchProjects } from './projects.api';
import { fetchCurrentUser } from '../auth/auth.api';
import { RoleGuard } from '../auth/role.guard';
import { UserRole } from '../../../../../libs/server/users/src/lib/dto/user-role.enum';
import { fetchScholars } from '../scholars/scholars.api'; 

export function ResearchProjectsPage() {
  const [projects, setProjects] = useState<ResearchProjectListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scholarsList, setScholarsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stati dedicati ai filtri di ricerca
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAcronym, setFilterAcronym] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterScholarId, setFilterScholarId] = useState('');
  
  // 🌟 Stato per la checkbox dei progetti personali dello Scholar
  const [onlyMyProjects, setOnlyMyProjects] = useState(false);

  const navigate = useNavigate();

  // 1. Caricamento iniziale dell'utente e della lista degli Scholar
  useEffect(() => {
    Promise.all([
      fetchCurrentUser().catch(() => null),
      fetchScholars().catch(() => [])
    ])
      .then(([userData, scholarsData]) => {
        setCurrentUser(userData);
        setScholarsList(scholarsData);
      })
      .catch((err) => setError(err.message));
  }, []);

  // 2. Effetto reattivo per ricaricare i progetti ogni volta che i filtri cambiano
  useEffect(() => {
    setLoading(true);
    setError(null);

    // 🌟 Se il tick è attivo, usiamo l'ID dell'utente corrente (visto che la guardia garantisce che sia uno Scholar)
    const effectiveScholarId = onlyMyProjects && currentUser 
      ? currentUser.id 
      : filterScholarId;

    const filters = {
      title: filterTitle || undefined,
      acronym: filterAcronym || undefined,
      year: filterYear ? parseInt(filterYear, 10) : undefined,
      scholarId: effectiveScholarId ? parseInt(effectiveScholarId, 10) : undefined
    };

    fetchResearchProjects(filters)
      .then(setProjects)
      .catch((err) => {
        if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
          setProjects([]);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [filterTitle, filterAcronym, filterYear, filterScholarId, onlyMyProjects, currentUser]); 

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Vuoi davvero cancellare questo progetto di ricerca?');
    if (!confirmed) return;

    try {
      await deleteResearchProject(id);
      setProjects((current) => current.filter((project) => project.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  function formatBudget(budget?: number): string {
    if (budget === undefined || budget === null) return 'N/D';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(budget);
  }

  function formatScholars(project: ResearchProjectListItem): string {
    if (!project.scholars || project.scholars.length === 0) return 'Nessuno';
    return project.scholars.map((s) => s.user?.name).filter(Boolean).join(', ');
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge)}>
        <header className={book_styles.headerRow}>
          <div>
            <h1><HiOutlineCollection /> Progetti di Ricerca</h1>
            <p className={book_styles.subtitle}>
              Elenco dei progetti scientifici e dei team associati.
            </p>
          </div>
          <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
            <button
              className={book_styles.primaryButton}
              onClick={() => navigate('/research-project/new')}
            >
              Nuovo Progetto
            </button>
          </RoleGuard>
        </header>

        {/* SEZIONE FILTRI DINAMICI */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', marginBottom: '4px' }}>Cerca per Titolo</label>
            <input 
              className={book_styles.input} 
              style={{ margin: 0 }}
              placeholder="Filtra titolo..." 
              value={filterTitle} 
              onChange={(e) => setFilterTitle(e.target.value)} 
            />
          </div>
          
          <div style={{ width: '130px' }}>
            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', marginBottom: '4px' }}>Acronimo</label>
            <input 
              className={book_styles.input} 
              style={{ margin: 0 }}
              placeholder="Es. AI4HEALTH" 
              value={filterAcronym} 
              onChange={(e) => setFilterAcronym(e.target.value)} 
            />
          </div>

          <div style={{ width: '100px' }}>
            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', marginBottom: '4px' }}>Anno</label>
            <input 
              type="number" 
              className={book_styles.input} 
              style={{ margin: 0 }}
              placeholder="2026" 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)} 
            />
          </div>

          {/* Nascondiamo la select se lo scholar ha attivato la visualizzazione dei soli progetti personali */}
          {!onlyMyProjects && (
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', marginBottom: '4px' }}>Filtra per Ricercatore</label>
              <select 
                className={book_styles.input} 
                style={{ margin: 0 }}
                value={filterScholarId} 
                onChange={(e) => setFilterScholarId(e.target.value)}
              >
                <option value="">Tutti i ricercatori</option>
                {scholarsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.user?.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 🌟 FILTRO PERSONALE PROTETTO CON IL TUO COMPONENTE ROLEGUARD */}
          <RoleGuard user={currentUser} allowedRoles={[UserRole.SCHOLAR]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', marginLeft: 'auto' }}>
              <input 
                type="checkbox" 
                id="onlyMyProjectsCheckbox"
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                checked={onlyMyProjects}
                onChange={(e) => setOnlyMyProjects(e.target.checked)}
              />
              <label 
                htmlFor="onlyMyProjectsCheckbox" 
                style={{ fontSize: '0.9em', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#0056b3' }}
              >
                📁 I miei progetti
              </label>
            </div>
          </RoleGuard>
        </div>

        {error && <p className={book_styles.error}>{error}</p>}

        {loading ? (
          <p className={book_styles.message}>Aggiornamento elenco...</p>
        ) : projects.length === 0 ? (
          <p className={book_styles.message}>Nessun progetto corrispondente ai filtri inseriti.</p>
        ) : (
          <div className={book_styles.tableWrapper}>
            <table className={book_styles.table}>
              <thead>
                <tr>
                  <th className={book_styles.th}>Acronimo</th>
                  <th className={book_styles.th}>Titolo</th>
                  <th className={book_styles.th}>Budget</th>
                  <th className={book_styles.th}>Inizio / Fine</th>
                  <th className={book_styles.th}>Ricercatori</th>
                  <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
                    <th className={book_styles.th}>Azioni</th>
                  </RoleGuard>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className={book_styles.row}>
                    <td className={clsx(book_styles.td, book_styles.bold)}>{project.acronym}</td>
                    <td className={book_styles.td}>{project.title}</td>
                    <td className={book_styles.td}>{formatBudget(project.budget)}</td>
                    <td className={book_styles.td}>
                      {project.startDate} / {project.endDate}
                    </td>
                    <td className={book_styles.td}>
                      <span style={{ fontSize: '0.9em', color: '#555' }}>
                        {formatScholars(project)}
                      </span>
                    </td>
                    <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
                      <td className={book_styles.td}>
                        <button
                          className={book_styles.secondaryButton}
                          onClick={() => navigate(`/research-project/${project.id}/edit`)}
                        >
                          Modifica
                        </button>

                        <button
                          className={book_styles.dangerButton}
                          onClick={() => handleDelete(project.id)}
                        >
                          Elimina
                        </button>
                      </td>
                    </RoleGuard>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}