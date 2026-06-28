import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { ScholarEntity } from './scholar.entity';

@Entity('research_projects')
export class ResearchProjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  acronym: string; // es. "AI4HEALTH", "GREEN-COMP"

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @ManyToMany(() => ScholarEntity, (scholar) => scholar.research_projects)
  @JoinTable({
    name: 'project_scholars_mapping', // Nome della tabella di giunzione
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'scholar_id', referencedColumnName: 'id' }
  })
  scholars: ScholarEntity[];
}