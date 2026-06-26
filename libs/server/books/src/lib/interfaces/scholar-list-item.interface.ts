import { UserRole } from "@server/users";

export interface ScholarListItem {
  id: number;
  universityDepartment: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
  research_macro_areas: {
    id: number;
    name: string;
  }[];
}