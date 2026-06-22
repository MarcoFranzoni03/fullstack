import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';

import book_styles from '../css/books.module.css';
import { fetchAuthorById, updateAuthor } from './authors.api';

export function EditAuthorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchAuthorById(Number(id))
      .then((author) => {
        setFirstName(author.firstName);
        setLastName(author.lastName);
        setStreet(author.address?.street ?? '');
        setCity(author.address?.city ?? '');
        setZipCode(author.address?.zipCode ?? '');
        setCountry(author.address?.country ?? '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id) return;

    setError(null);
    setSaving(true);

    try {
      await updateAuthor(Number(id), {
        firstName,
        lastName,
        address: {
          street,
          city,
          zipCode,
          country,
        },
      });

      navigate('/authors');
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
          <p className={book_styles.message}>Caricamento autore...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardSmall)}>
        <h1 className={book_styles.title}>✏️ Modifica autore</h1>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          <div className={book_styles.field}>
            <label>Nome</label>
            <input
              className={book_styles.input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Cognome</label>
            <input
              className={book_styles.input}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Via</label>
            <input
              className={book_styles.input}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Città</label>
            <input
              className={book_styles.input}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>CAP</label>
            <input
              className={book_styles.input}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Paese</label>
            <input
              className={book_styles.input}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
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