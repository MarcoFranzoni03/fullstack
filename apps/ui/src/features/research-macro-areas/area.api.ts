
import { ResearchMacroAreaListItem } from '@org/books';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

// 1. GET ALL
export async function fetchResearchMacroAreas(): Promise<ResearchMacroAreaListItem[]> {
  const response = await fetch(`${API_URL}/research-macro-area`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 2. GET BY ID
export async function fetchResearchMacroAreaById(id: number): Promise<ResearchMacroAreaListItem> {
  const response = await fetch(`${API_URL}/research-macro-area/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 3. CREATE (Solo Admin)
export async function createResearchMacroArea(payload: { name: string }): Promise<ResearchMacroAreaListItem> {
  const response = await fetch(`${API_URL}/research-macro-area`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
}

// 4. UPDATE (Solo Admin)
export async function updateResearchMacroArea(id: number, payload: { name: string }): Promise<ResearchMacroAreaListItem> {
  const response = await fetch(`${API_URL}/research-macro-area/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 5. DELETE (Solo Admin)
export async function deleteResearchMacroArea(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/research-macro-area/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }
}