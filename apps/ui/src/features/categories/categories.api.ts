import { CategoryListItem, CreateCategoryDto, UpdateCategoryDto } from '@org/books';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function fetchCategories(): Promise<CategoryListItem[]> {
    const response = await fetch(`${API_URL}/categories`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function fetchCategoryById(id: number): Promise<CategoryListItem> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createCategory(payload: CreateCategoryDto): Promise<CategoryListItem> {
    const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function updateCategory(id: number,payload: UpdateCategoryDto): Promise<CategoryListItem> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response);
    }
}