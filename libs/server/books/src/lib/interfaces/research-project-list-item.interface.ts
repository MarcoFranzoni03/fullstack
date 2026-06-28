export interface ResearchProjectListItem {
  id: number;
  title: string;
  acronym: string;
  budget?: number;
  startDate: string;
  endDate: string;
  
  scholars: {
    id: number;
    universityDepartment: string | null;
    user: {
      id: number;
      name: string;
      email: string;
    };
    research_macro_areas: {
        id: number;
        name: string;
    }[];
  }[];
}