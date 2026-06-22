import { AuthorListItem, CreateAuthorDto, UpdateAuthorDto } from "@org/books";
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
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

export async function fetchAuthorById(id: number): Promise<AuthorListItem> {
  const response = await fetch(`${API_URL}/authors/${id}`, {
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function createAuthor(payload: CreateAuthorDto): Promise<AuthorListItem> {
  const response = await fetch(`${API_URL}/authors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }
  return response.json();
}

export async function deleteAuthor(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/authors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }
}

export async function updateAuthor(id: number, payload: UpdateAuthorDto): Promise<AuthorListItem> {
  const response = await fetch(`${API_URL}/authors/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}