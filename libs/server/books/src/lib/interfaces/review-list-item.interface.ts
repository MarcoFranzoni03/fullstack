export interface ReviewListItem {
    id: number;
    rating: number;
    comment: string;
    user: {
        id: number;
        email: string;
    }
    book: {
        id: number;
        title: string;
        authors: {
            id: number;
            firstName: string;
            lastName: string;
        }[];
    }
}