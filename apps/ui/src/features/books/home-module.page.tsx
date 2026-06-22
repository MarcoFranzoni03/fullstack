import styles from '../css/home.module.css';

export function HomeModulePage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>📚 Library App</h1>
        <p className={styles.description}>
          Benvenuto nel catalogo online della biblioteca.
        </p>
        <a className={styles.button} href="/books">
          Vai al catalogo
        </a>
      </section>
    </main>
  );
}

