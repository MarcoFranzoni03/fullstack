export interface BookListItem {
  id: number;
  title: string;
  publishedYear: number;
  category: {
    id: number;
    name: string;
  };
  authors: {
    id: number;
    firstName: string;
    lastName: string;
  }[];
}

