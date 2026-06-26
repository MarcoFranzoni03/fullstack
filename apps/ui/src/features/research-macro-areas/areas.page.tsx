import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { GiAtom } from "react-icons/gi"; // Un'icona adatta per le aree di ricerca
import { ResearchMacroAreaListItem } from '@org/books'; // adatta il path
import { fetchResearchMacroAreas, deleteResearchMacroArea } from './area.api'; // adatta il path
import { fetchCurrentUser } from '../auth/auth.api';
import { RoleGuard } from '../auth/role.guard';
import { UserRole } from '../../../../../libs/server/users/src/lib/dto/user-role.enum';
import macro_styles from '../css/books.module.css'; // Riutilizziamo gli stessi stili tabelle per coerenza

export function MacroAreasPage() {
  const [macroAreas, setMacroAreas] = useState<ResearchMacroAreaListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Vuoi davvero cancellare questa macro area di ricerca?');

    if (!confirmed) return;

    try {
      await deleteResearchMacroArea(id);
      setMacroAreas((areas) => areas.filter((area) => area.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    // SCARICA IN PARALLELO MACRO AREE E UTENTE
    Promise.all([
      fetchResearchMacroAreas(),
      fetchCurrentUser().catch(() => null)
    ])
      .then(([areasData, userData]) => {
        setMacroAreas(areasData);
        setCurrentUser(userData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className={macro_styles.page}>
        <div className={macro_styles.card}>
          <p className={macro_styles.message}>Caricamento aree di ricerca...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={macro_styles.page}>
        <div className={macro_styles.card}>
          <p className={macro_styles.error}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={macro_styles.page}>
      <section className={clsx(macro_styles.card, macro_styles.cardLarge)}>
        <header className={macro_styles.headerRow}>
          <div>
            <h1><GiAtom /> Aree di Ricerca</h1>
            <p className={macro_styles.subtitle}>
              Configurazione delle macro aree tecnologiche e scientifiche dei ricercatori.
            </p>
          </div>
          {/* Mostra il bottone di creazione solo all'Admin */}
          <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
            <button 
              className={macro_styles.primaryButton} // assumendo che tu abbia un bottone primario negli stili
              onClick={() => navigate('/macro-areas/new')}
            >
              Nuova Area
            </button>
          </RoleGuard>
        </header>

        {macroAreas.length === 0 ? (
          <p className={macro_styles.message}>Nessuna area di ricerca disponibile.</p>
        ) : (
          <div className={macro_styles.tableWrapper}>
            <table className={macro_styles.table}>
              <thead>
                <tr>
                  <th className={macro_styles.th}>ID</th>
                  <th className={macro_styles.th}>Nome Area di Ricerca</th>
                  <th className={macro_styles.th}>Ricercatori Affiliati</th>
                  {/* Intestazione protetta */}
                  <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
                    <th className={macro_styles.th}>Azioni</th>
                  </RoleGuard>
                </tr>
              </thead>

              <tbody>
                {macroAreas.map((area) => (
                  <tr key={area.id} className={macro_styles.row}>
                    <td className={macro_styles.td}>{area.id}</td>
                    <td className={macro_styles.titleCell}>
                      <span className="font-medium text-gray-900">
                        {area.name}
                      </span>
                    </td>
                    <td className={macro_styles.td}>
                      {area.scholars?.length ? (
                        <span className={macro_styles.badge}>
                          {area.scholars.length} {area.scholars.length === 1 ? 'Ricercatore' : 'Ricercatori'}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Nessuno</span>
                      )}
                    </td>
                    {/* Celle di azione protette */}
                    <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
                      <td className={macro_styles.td}>
                        <button 
                          className={macro_styles.secondaryButton}
                          onClick={() => navigate(`/macro-areas/${area.id}/edit`)}
                        >
                          Modifica
                        </button>

                        <button 
                          className={macro_styles.dangerButton}
                          onClick={() => handleDelete(area.id)}
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