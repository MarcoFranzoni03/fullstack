import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { UserEntity } from '../../../users/src/lib/user.entity';
import { Book } from './book.entity';

@Entity('reviews')
export class ReviewEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int', nullable: false})
    rating: number;

    @Column({type:'varchar', length: 2000, nullable: false})
    comment: string;

    @ManyToOne(()=>UserEntity,(user)=>user.reviews)
    user: UserEntity;

    @ManyToOne(()=>Book,(book)=>book.reviews)
    book: Book;
}
