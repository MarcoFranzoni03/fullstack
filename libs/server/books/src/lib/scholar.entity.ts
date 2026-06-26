import { UserEntity } from '@server/users';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { ResearchMacroAreaEntity } from './research-macro-area.entity';

@Entity('scholars')
export class ScholarEntity {
    @PrimaryColumn()
    id: number;

    @Column({type:'varchar', length: 255, nullable: true})
    universityDepartment: string;

    @OneToOne(()=>UserEntity, (user)=>user.scholar, {nullable: false, onDelete: 'CASCADE', eager: true})
    @JoinColumn({ name: 'id'})
    user: UserEntity;

    @ManyToMany(()=>ResearchMacroAreaEntity,(research_macro_area)=>research_macro_area.scholars)
    @JoinTable({
        name: 'scholar_research_areas', // Nome più intuitivo: prima l'entità proprietaria
        joinColumn: {
            name: 'scholar_id', referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'area_id', referencedColumnName: 'id'
        }
    })
    research_macro_areas: ResearchMacroAreaEntity[];

}


