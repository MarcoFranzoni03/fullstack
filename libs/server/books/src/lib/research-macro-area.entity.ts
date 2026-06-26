import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { ScholarEntity } from "./scholar.entity";

@Entity('research_macro_areas')
export class ResearchMacroAreaEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'varchar', length: 255, nullable: false, unique: true})
    name: string;

    @ManyToMany(()=>ScholarEntity,(scholar)=>scholar.research_macro_areas)
    scholars: ScholarEntity[];

}
