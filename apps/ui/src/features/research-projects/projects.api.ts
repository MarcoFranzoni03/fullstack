import { 
  ResearchProjectListItem, 
  CreateResearchProjectDto, 
  UpdateResearchProjectDto 
} from "@org/books"; 
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

export interface ResearchProjectFilters {
  title?: string;
  acronym?: string;
  year?: number;
  scholarId?: number;
}

// 1. GET ALL
export async function fetchResearchProjects(filters?: ResearchProjectFilters): Promise<ResearchProjectListItem[]> {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.title) queryParams.append('title', filters.title);
    if (filters.acronym) queryParams.append('acronym', filters.acronym);
    if (filters.year) queryParams.append('year', filters.year.toString());
    if (filters.scholarId) queryParams.append('scholarId', filters.scholarId.toString());
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}/research-project?${queryString}` : `${API_URL}/research-project`;

  const response = await fetch(url, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 2. GET BY ID
export async function fetchResearchProjectById(id: number): Promise<ResearchProjectListItem> {
  const response = await fetch(`${API_URL}/research-project/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 3. CREATE (Usa il DTO)
export async function createResearchProject(payload: CreateResearchProjectDto): Promise<ResearchProjectListItem> {
  const response = await fetch(`${API_URL}/research-project`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
}

// 4. UPDATE (Usa il DTO)
export async function updateResearchProject(id: number, payload: UpdateResearchProjectDto): Promise<ResearchProjectListItem> {
  const response = await fetch(`${API_URL}/research-project/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// 5. DELETE
export async function deleteResearchProject(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/research-project/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }
}