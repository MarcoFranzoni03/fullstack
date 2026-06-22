import { CreateBookDto, UpdateBookDto, BookListItem, CategoryListItem, AuthorListItem } from '@org/books';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

export async function fetchBooks(): Promise<BookListItem[]> {
  const response = await fetch(`${API_URL}/books`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function createBook(payload: CreateBookDto): Promise<BookListItem> {
  const response = await fetch(`${API_URL}/books`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }
  return response.json();
}

export async function deleteBook(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }
}

export async function updateBook(id: number, payload: UpdateBookDto): Promise<BookListItem> {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function fetchBookById(id: number): Promise<BookListItem> {
  const response = await fetch(`${API_URL}/books/${id}`, {
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function fetchCategories(): Promise<CategoryListItem[]> {
  const response = await fetch(`${API_URL}/categories`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function fetchAuthors(): Promise<AuthorListItem[]> {
  const response = await fetch(`${API_URL}/authors`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

