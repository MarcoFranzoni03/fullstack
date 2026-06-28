import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';
import styles from '../css/books.module.css';
import { IoIosLogOut } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { RoleGuard } from '../auth/role.guard';
import { UserRole } from '../../../../../libs/server/users/src/lib/dto/user-role.enum';

export function AppLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch((err) => setUser(null));
  }, []);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navBrand} onClick={() => navigate('/books')}>
          📚 Library
        </div>

        <div className={styles.navLinks}>
          <button onClick={() => navigate('/books')}>Catalogo</button>
          <RoleGuard user={user} allowedRoles={[UserRole.ADMIN]}>
            <button onClick={() => navigate('/books/new')}>Nuovo libro</button>
            <button onClick={() => navigate('/authors')}>Autori</button>
            <button onClick={() => navigate('/categories')}>Categorie</button>
          </RoleGuard>
          <RoleGuard user={user} allowedRoles={[UserRole.ADMIN,UserRole.SCHOLAR]}>
            <button onClick={() => navigate('/macro-areas')}>Aree di ricerca</button>
          </RoleGuard>
          <RoleGuard user={user} allowedRoles={[UserRole.ADMIN,UserRole.SCHOLAR]}>
            <button onClick={() => navigate('/scholars')}>Ricercatori</button>
          </RoleGuard>
          <RoleGuard user={user} allowedRoles={[UserRole.ADMIN,UserRole.SCHOLAR]}>
            <button onClick={() => navigate('/research-projects')}>Progetti</button>
          </RoleGuard>
          
          <div className={styles.userSection}>
            <button
              className={styles.userButton}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <FaUser/>

              <span className={styles.userName}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email ?? 'Utente'}
              </span>

              <IoMdArrowDropdown />
            </button>

            {menuOpen && (
              <div className={styles.dropdownMenu}>
            {/* NUOVO PULSANTE PER IL PROFILO */}
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false); // Chiudiamo il menu dopo il click!
                  }}
                >
                  <FaUser /> Il mio profilo
                </button>

                {/* SEPARATORE GRAFICO (OPZIONALE MA MOLTO BELLO SE HAI LE CLASSI TAILWIND) */}
                <div className="border-t border-slate-100 my-1" />

                <button
                  className={styles.dropdownItem}
                  onClick={() => navigate('/logout')}
                >
                  <IoIosLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}