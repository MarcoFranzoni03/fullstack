import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import book_styles from '../css/books.module.css';
import { createAuthor } from './authors.api';

export function CreateAuthorPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await createAuthor({
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
      setLoading(false);
    }
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardSmall)}>
        <h1 className={book_styles.title}>➕ Nuovo autore</h1>

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

          <button className={book_styles.button} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Crea autore'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </section>
    </main>
  );
}