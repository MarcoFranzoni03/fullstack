
import { CreateScholarDto, ScholarListItem, UpdateScholarDto } from '@org/books';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

// 1. GET ALL SCHOLARS
export async function fetchScholars(): Promise<ScholarListItem[]> {
  const response = await fetch(`${API_URL}/scholar`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 2. GET SCHOLAR BY ID
export async function fetchScholarById(id: number): Promise<ScholarListItem> {
  const response = await fetch(`${API_URL}/scholar/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 3. CREATE SCHOLAR (Usa il CreateScholarDto all'interno del sotto-oggetto 'scholar')
export async function createScholar(payload: { user: any; scholar: CreateScholarDto }): Promise<ScholarListItem> {
  const response = await fetch(`${API_URL}/scholar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
}

// 4. UPDATE SCHOLAR (Usa l'UpdateScholarDto ereditato dal PartialType)
export async function updateScholar(id: number, payload: UpdateScholarDto): Promise<ScholarListItem> {
  const response = await fetch(`${API_URL}/scholar/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 5. DELETE SCHOLAR
export async function deleteScholar(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/scholar/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }
}