export interface ResearchMacroAreaListItem {
  id: number;
  name: string;
  scholars: {
    id: number,
    universityDepartment: string | null,
  }[]
}