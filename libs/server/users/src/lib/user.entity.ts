import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { UserRole } from './dto/user-role.enum.js';
import { ReviewEntity } from '../../../books/src/lib/review.entity.js'
import { ScholarEntity } from '../../../books/src/lib/scholar.entity.js'

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'varchar', length: 255, nullable: false})
    name: string;

    @Column({type:'varchar', length:320, nullable: false, unique: true})
    email: string;

    @Column()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @OneToMany(()=>ReviewEntity,(review)=>review.user)
    reviews: ReviewEntity[];

    @OneToOne(()=>ScholarEntity, (scholar)=>scholar.user)
    scholar: ScholarEntity
}

