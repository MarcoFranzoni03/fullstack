import { Author } from "./author.entity";
import { Category } from "./category.entity";
import { Entity, Column, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ReviewEntity } from "./review.entity";

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 255, nullable: false, unique: true})
    title: string;

    @Column({type: 'int', nullable: false})
    publishedYear: number;

    @ManyToMany(()=>Author,(author)=>author.books, {cascade: false})
    @JoinTable({
        name: 'book_authors',
        joinColumn: {name: 'book_id', referencedColumnName:'id'},
        inverseJoinColumn: {name: 'author_id', referencedColumnName:'id'}
    })
    authors: Author[];
    
    @ManyToOne(()=>Category,(category)=>category.books,{nullable:false, eager:true,onDelete:'RESTRICT'})
    @JoinColumn() // optional on OneToMany relations
    category: Category;

    @OneToMany(()=>ReviewEntity,(review)=>review.book)
    reviews: ReviewEntity[];
}
