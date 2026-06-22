export interface AuthorListItem {
    id: number;
    firstName: string;
    lastName: string;
    address?: {
        id: number;
        street: string;
        city: string;
        zipCode: string;
        country: string;
    };
}