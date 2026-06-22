import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { fetchBookById, updateBook, fetchCategories, fetchAuthors } from './books.api';
import { CategoryListItem, AuthorListItem } from "@org/books";
import book_styles from '../css/books.module.css';

export function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [authors, setAuthors] = useState<AuthorListItem[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<AuthorListItem[]>([]);
  const [authorSearch, setAuthorSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetchBookById(Number(id)),
      fetchCategories(),
      fetchAuthors(),
    ])
      .then(([book, categories, authors]) => {
        setTitle(book.title);
        setPublishedYear(String(book.publishedYear));
        setCategoryId(String(book.category.id));

        setCategories(categories);
        setAuthors(authors);
        setSelectedAuthors(book.authors);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredAuthors = authors.filter((author) => {
    const fullName = `${author.firstName} ${author.lastName}`.toLowerCase();
    const search = authorSearch.toLowerCase();

    const alreadySelected = selectedAuthors.some(
      (selected) => selected.id === author.id
    );

    return fullName.includes(search) && !alreadySelected;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id) return;

    setError(null);
    setSaving(true);

    if (selectedAuthors.length === 0) {
      setError('Seleziona almeno un autore');
      setSaving(false);
      return;
    }

    try {
      await updateBook(Number(id), {
        title,
        publishedYear: Number(publishedYear),
        categoryId: Number(categoryId),
        authorIds: selectedAuthors.map((author) => author.id),
      });

      navigate('/books');
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
          <p className={book_styles.message}>Caricamento libro...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardSmall)}>
        <h1 className={book_styles.title}>✏️ Modifica libro</h1>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          <div className={book_styles.field}>
            <label>Titolo</label>
            <input
              className={book_styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Anno pubblicazione</label>
            <input
              className={book_styles.input}
              type="number"
              value={publishedYear}
              onChange={(e) => setPublishedYear(e.target.value)}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Categoria</label>
            <select
              className={book_styles.input}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Seleziona categoria</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={book_styles.field}>
            <label>Autori</label>

            <input
              className={book_styles.input}
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              placeholder="Cerca autore..."
            />

            {authorSearch && filteredAuthors.length > 0 && (
              <div className={book_styles.autocompleteList}>
                {filteredAuthors.map((author) => (
                  <button
                    key={author.id}
                    type="button"
                    className={book_styles.autocompleteItem}
                    onClick={() => {
                      setSelectedAuthors((current) => [...current, author]);
                      setAuthorSearch('');
                    }}
                  >
                    {author.firstName} {author.lastName}
                  </button>
                ))}
              </div>
            )}

            <div className={book_styles.selectedAuthors}>
              {selectedAuthors.map((author) => (
                <span key={author.id} className={book_styles.authorChip}>
                  {author.firstName} {author.lastName}

                  <button
                    type="button"
                    className={book_styles.removeChipButton}
                    onClick={() =>
                      setSelectedAuthors((current) =>
                        current.filter((item) => item.id !== author.id)
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
