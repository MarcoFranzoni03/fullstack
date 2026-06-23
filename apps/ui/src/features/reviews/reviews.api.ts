import { handleApiError } from '../shared/utils.api';
import { ReviewListItem } from '@org/books';
import { CreateReviewDto } from '@org/books';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function fetchReviewsByBookId(bookId: number): Promise<ReviewListItem[]> {
    return fetch(`${API_URL}/reviews/book/${bookId}`, {
        headers: getAuthHeaders(),
    }).then(async (res) => {
        if (!res.ok) await handleApiError(res);
        return res.json();
    });
}

export async function createReviewByBookId(payload: CreateReviewDto, bookId: number): Promise<ReviewListItem> {
    return fetch(`${API_URL}/reviews/${bookId}`, { 
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    }).then(async (res) => {
        if (!res.ok) await handleApiError(res);
        return res.json();
    });
}

export async function deleteReview(id: number): Promise<void> {
    return fetch(`${API_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(async (res) => {
        if (!res.ok) await handleApiError(res);
    });
}