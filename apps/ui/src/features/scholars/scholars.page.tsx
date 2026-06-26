import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { GiGraduateCap } from "react-icons/gi"; 
import book_styles from '../css/books.module.css';
import { ScholarListItem } from '@org/books';
import { fetchScholars, deleteScholar } from './scholars.api'; 
import { fetchCurrentUser } from '../auth/auth.api';
import { RoleGuard } from '../auth/role.guard';
import { UserRole } from '../../../../../libs/server/users/src/lib/dto/user-role.enum';

export function ScholarsPage() {
  const [scholars, setScholars] = useState<ScholarListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchScholars(),
      fetchCurrentUser().catch(() => null)
    ])
      .then(([scholarsData, userData]) => {
        setScholars(scholarsData);
        setCurrentUser(userData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Vuoi davvero rimuovere questo profilo ricercatore?'
    );

    if (!confirmed) return;

    try {
      await deleteScholar(id);
      setScholars((current) =>
        current.filter((scholar) => scholar.id !== id)
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.message}>Caricamento ricercatori...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.error}>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge)}>
        {/* Header modificata: titolo a sinistra e bottone "Nuovo" ancorato a destra */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
              <GiGraduateCap /> Ricercatori
            </h1>
            <p className={book_styles.subtitle}>
              Elenco dei ricercatori (Scholar) registrati nel sistema e relative affiliazioni.
            </p>
          </div>

          {/* Il bottone ora si posiziona elegantemente a destra grazie al justify-between di Flexbox */}
          <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
            <button
              className={book_styles.button}
              onClick={() => navigate('/scholars/new')}
            >
              Nuovo ricercatore
            </button>
          </RoleGuard>
        </header>

        {scholars.length === 0 ? (
          <p className={book_styles.message}>Nessun ricercatore disponibile.</p>
        ) : (
          <div className={book_styles.tableWrapper}>
            <table className={book_styles.table}>
              <thead>
                <tr>
                  <th className={book_styles.th}>Nome</th>
                  <th className={book_styles.th}>Email</th>
                  <th className={book_styles.th}>Dipartimento</th>
                  <th className={book_styles.th}>Aree di Ricerca</th>
                  <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
                    <th className={book_styles.th}>Azioni</th>
                  </RoleGuard>
                </tr>
              </thead>

              <tbody>
                {scholars.map((scholar) => (
                  <tr key={scholar.id} className={book_styles.row}>
                    <td className={book_styles.titleCell}>
                      {scholar.user?.name ?? 'N/D'}
                    </td>
                    <td className={book_styles.td}>
                      {scholar.user?.email ?? 'N/D'}
                    </td>
                    <td className={book_styles.td}>
                      {scholar.universityDepartment}
                    </td>
                    <td className={book_styles.td}>
                      <div className="flex flex-wrap gap-1">
                        {scholar.research_macro_areas?.length ? (
                          scholar.research_macro_areas.map((area) => (
                            <span key={area.id} className={book_styles.badge}>
                              {area.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-xs">Nessuna</span>
                        )}
                      </div>
                    </td>
                    {/* Bottoni d'azione affiancati in orizzontale mediante flex e gap-2 */}
                    <RoleGuard user={currentUser} allowedRoles={[UserRole.ADMIN]}>
                      <td className={`${book_styles.td}`}>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <button
                            className={book_styles.secondaryButton}
                            onClick={() => navigate(`/scholars/${scholar.id}/edit`)}
                          >
                            Modifica
                          </button>

                          <button
                            className={book_styles.dangerButton}
                            onClick={() => handleDelete(scholar.id)}
                          >
                            Elimina
                          </button>
                        </div>
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