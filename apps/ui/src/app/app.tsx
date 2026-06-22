import { BooksPage } from '../features/books/books.page';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { LogoutPage } from '../features/auth/logout.page';
import { CreateBookPage } from '../features/books/create-book.page';
import { EditBookPage } from '../features/books/edit-book.page';
import { AppLayout } from '../features/layouts/app-layout';
import { HomeModulePage } from '../features/books/home-module.page';
import { HomeTailwindPage } from '../features/books/home-tailwind.page';
import { HomeBootstrapPage } from '../features/books/home-bootstrap.page';
import { AuthorsPage } from '../features/authors/authors.page';
import { CreateAuthorPage } from '../features/authors/create-author.page';
import { EditAuthorPage } from '../features/authors/edit-author.page';
import { CategoriesPage } from '../features/categories/categories.page';
import { CreateCategoryPage } from '../features/categories/create-category.page';
import { EditCategoryPage } from '../features/categories/edit-category.page';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/books" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/new" element={<CreateBookPage />} />
        <Route path="/books/:id/edit" element={<EditBookPage />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/authors/new" element={<CreateAuthorPage />} />
        <Route path="/authors/:id/edit" element={<EditAuthorPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/new" element={<CreateCategoryPage />} />
        <Route path="/categories/:id/edit" element={<EditCategoryPage />} />
      </Route>
      
      <Route path="/home-module" element={<HomeModulePage />} />
      <Route path="/home-tailwind" element={<HomeTailwindPage />} />
      <Route path="/home-bootstrap" element={<HomeBootstrapPage />} />
    </Routes>
  );
}

export default App;

