import { ConflictException, Injectable, InternalServerErrorException, UnprocessableEntityException, BadRequestException, ServiceUnavailableException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, In, Not, ILike, Raw } from 'typeorm';
import { Book } from './book.entity';
import { Author } from './author.entity';
import { Address } from './address.entity';
import { Category } from './category.entity';
import { BookListItem } from './interfaces/book-list-item.interface';
import { CategoryListItem } from './interfaces/category-list-item.interface';
import { AuthorListItem } from './interfaces/author-list-item.interface';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReviewEntity } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewListItem } from './interfaces/review-list-item.interface';
import { UserEntity, UserRole } from '@server/users';
import { ResearchMacroAreaEntity } from './research-macro-area.entity';
import { ResearchMacroAreaListItem } from './interfaces/research-macro-area-list-item.interface';
import { CreateResearchMacroAreaDto } from './dto/create-research-macro-area.dto';
import { UpdateResearchMacroAreaDto } from './dto/update-research-macro-area.dto';
import { ResearchProjectEntity } from './research-project.entity';
import { ResearchProjectListItem } from './interfaces/research-project-list-item.interface';
import { CreateResearchProjectDto } from './dto/create-research-project.dto';
import { UpdateResearchProjectDto } from './dto/update-research-project.dto';
import { ScholarEntity } from './scholar.entity';

type PgError = {
  code?: string;
  detail?: string;
  table?: string;
  column?: string;
  constraint?: string;
};

@Injectable()
export class OrgBooksService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,

        @InjectRepository(Author)
        private readonly authorRepository: Repository<Author>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        @InjectRepository(Address)
        private readonly addressRepository: Repository<Address>,

        @InjectRepository(ReviewEntity)
        private readonly reviewRepository: Repository<ReviewEntity>,

        @InjectRepository(ResearchMacroAreaEntity)
        private readonly researchMacroAreaRepository: Repository<ResearchMacroAreaEntity>,

        @InjectRepository(ResearchProjectEntity)
        private readonly researchProjectRepository: Repository<ResearchProjectEntity>,

        @InjectRepository(ScholarEntity)
        private readonly scholarRepository: Repository<ScholarEntity>
    ) {}

    async seed() {
        try{
            const category = this.categoryRepository.create({
                name: 'Fantascienza'
            });
            const savedCategory = await this.categoryRepository.save(category);

            const author1 = this.authorRepository.create({
                firstName: 'Isaac',
                lastName: 'Asimov',
                address: {
                    street: 'Via Roma 10',
                    city: 'Milan',
                    zipCode: '20100',
                    country: 'Italy'
                }
            });

            const author2 = this.authorRepository.create({
                firstName: 'Arthur',
                lastName: 'Clarke',
                address: {
                    street: 'Corso Torino 22',
                    city: 'Turin',
                    zipCode: '10100',
                    country: 'Italy'
                }
            });

            const savedAuthors = await this.authorRepository.save([author1,author2]);

            const book = this.bookRepository.create({
                title: 'Antology of the Sci-Fi',
                publishedYear: 2025,
                category: savedCategory,
                authors: savedAuthors
            });

            return await this.bookRepository.save(book);
        } catch(error) {
            this.handleDatabaseError(error);
        }
    }

    private readonly dbErrorFactories: Record<string, (e: PgError) => Error> = {
        '23505': (e) =>
        new ConflictException(
            this.formatMessage(
            'Violazione di unicità',
            e,
            'Esiste già un record con questi valori univoci',
            ),
        ),

        '23502': (e) =>
        new UnprocessableEntityException(
            this.formatMessage(
            'Campo obbligatorio mancante',
            e,
            `Il campo ${e.column ?? 'richiesto'} non può essere null`,
            ),
        ),

        '23503': (e) =>
        new BadRequestException(
            this.formatMessage(
            'Violazione di foreign key',
            e,
            'La relazione richiesta non è valida',
            ),
        ),

        '23514': (e) =>
        new UnprocessableEntityException(
            this.formatMessage(
            'Violazione di check constraint',
            e,
            'I dati non rispettano una regola del database',
            ),
        ),

        '23P01': (e) =>
        new ConflictException(
            this.formatMessage(
            'Violazione di exclusion constraint',
            e,
            'Il record è in conflitto con un altro record esistente',
            ),
        ),

        '40001': () =>
        new ServiceUnavailableException(
            'Conflitto concorrente sul database. Riprova.',
        ),

        '40P01': () =>
        new ServiceUnavailableException(
            'Deadlock rilevato sul database. Riprova.',
        ),
    };

    private handleDatabaseError(error: unknown): never {
        if (error instanceof QueryFailedError) {
            const e = error.driverError as PgError;

            const factory = e.code
                ? this.dbErrorFactories[e.code]
                : undefined;

            if (factory) {
                throw factory(e);
            }
        }

        throw new InternalServerErrorException('Error during database seeding');
    }

    private formatMessage(title: string,error: PgError,fallback: string): string {
        const parts = [title];

        if (error.constraint) {
        parts.push(`constraint: ${error.constraint}`);
        }

        if (error.table) {
        parts.push(`tabella: ${error.table}`);
        }

        if (error.column) {
        parts.push(`colonna: ${error.column}`);
        }

        if (error.detail) {
        parts.push(`dettaglio: ${error.detail}`);
        } else {
        parts.push(fallback);
        }

        return parts.join(' - ');
    }

    async findAllBooks(): Promise<BookListItem[]> {
        const books = await this.bookRepository.find({
            relations: {
                authors: true,
                category: true,
                reviews: true
            },
            order: {
                title: 'ASC'
            }
        });

        return books.map((book) => ({
            id: book.id,
            title: book.title,
            publishedYear: book.publishedYear,
            category: {
                id: book.category.id,
                name: book.category.name
            },
            authors: book.authors.map((author) => ({
                id: author.id,
                firstName: author.firstName,
                lastName: author.lastName
            }))
        }));
    }

    async createBook(dto: CreateBookDto): Promise<BookListItem> {
        const category = await this.categoryRepository.findOne({
            where: { id: dto.categoryId}
        });

        if (!category) {
            throw new NotFoundException(`Category ${dto.categoryId} not found`);
        }

        const authors = await this.authorRepository.find({
            where: {
                id: In(dto.authorIds),
            },
        });

        if (authors.length !== dto.authorIds.length) {
            throw new NotFoundException('One or more authors not found');
        }

        const book = this.bookRepository.create({
            title: dto.title,
            publishedYear: dto.publishedYear,
            category,
            authors,
        });

        const savedBook = await this.bookRepository.save(book);

        return savedBook;
    }

    async updateBook(id: number, dto: UpdateBookDto): Promise<BookListItem> {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: {
                authors: true,
                category: true,
            }
        });

        if (!book) {
            throw new NotFoundException(`Book ${id} not found`);
        }

        if (dto.title !== undefined) {
            book.title = dto.title;
        }

        if (dto.publishedYear !== undefined) {
            book.publishedYear = dto.publishedYear;
        }

        if (dto.categoryId !== undefined) {
            const category = await this.categoryRepository.findOne({
                where: { id: dto.categoryId },
            });

            if (!category) {
                throw new NotFoundException(`Category ${dto.categoryId} not found`);
            }

            book.category = category;
        }

        if (dto.authorIds !== undefined) {
            const authors = await this.authorRepository.find({
                where: {
                    id: In(dto.authorIds),
                },
            });

            if (authors.length !== dto.authorIds.length) {
                throw new NotFoundException('One or more authors not found');
            }

            book.authors = authors;
        }

        const savedBook = await this.bookRepository.save(book);

        return savedBook;
    }

    async findBookById(id: number): Promise<BookListItem> {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: {
                authors: true,
                category: true,
                reviews: true
            }
        });

        if (!book) {
            throw new NotFoundException(`Book ${id} not found`);
        }

        return {
            id: book.id,
            title: book.title,
            publishedYear: book.publishedYear,
            category: {
                id: book.category.id,
                name: book.category.name
            },
            authors: book.authors.map((author) => ({
                id: author.id,
                firstName: author.firstName,
                lastName: author.lastName
            }))
        }
    }

    async deleteBook(id: number): Promise<void> {
        const book = await this.bookRepository.findOne({
            where: {id},
            relations: {
                category: true,
                authors: true
            }
        });

        if (!book) {
            throw new NotFoundException(`Book ${id} not found`);
        }

        const authors = book.authors ?? [];

        await this.bookRepository.remove(book);

        for(const author of authors) {
            const bookCount = await this.bookRepository.count({
                where: {
                    authors: {
                        id: author.id
                    }
                }
            });

            if(bookCount === 0) {
                await this.authorRepository.remove(author);
            }
        }
    }

    async findAllCategories(): Promise<CategoryListItem[]> {
        const categories = await this.categoryRepository.find({
            order: {
                name: 'ASC'
            }
        });

        return categories.map((cat) => ({
            id: cat.id,
            name: cat.name
        }));
    }

    async findAllAuthors(): Promise<AuthorListItem[]> {
        const authors = await this.authorRepository.find({
            relations: {
                address: true
            },
            order: {
                lastName: 'ASC',
                firstName: 'ASC'
            }
        });

        return authors.map((author) => {
            const item: AuthorListItem = {
            id: author.id,
            firstName: author.firstName,
            lastName: author.lastName,
            };

            if (author.address) {
            item.address = {
                id: author.address.id,
                street: author.address.street,
                city: author.address.city,
                zipCode: author.address.zipCode,
                country: author.address.country,
            };
            }

            return item;
        });
    }

    async createAuthor(dto: CreateAuthorDto): Promise<AuthorListItem> {
        const existingAuthor = await this.authorRepository.findOne({
            where: { 
                firstName: dto.firstName,
                lastName: dto.lastName
            }
        });

        if (existingAuthor) {
            throw new BadRequestException(`Author ${dto.firstName} ${dto.lastName} already exists`);
        }

        const author = this.authorRepository.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            address: dto.address 
                ? this.addressRepository.create(dto.address)
                : undefined
        });

        const savedAuthor = await this.authorRepository.save(author);

        return savedAuthor;
    }

    async updateAuthor(id: number, dto: UpdateAuthorDto): Promise<AuthorListItem> {
        const author = await this.authorRepository.findOne({
            where: { id },
            relations: {
                address: true
            }
        });

        if (!author) {
            throw new NotFoundException(`Author ${id} not found`);
        }

        const newFirstName = dto.firstName ?? author.firstName;
        const newLastName = dto.lastName ?? author.lastName;

        const existingAuthor = await this.authorRepository.findOne({
            where: { 
                firstName: newFirstName,
                lastName: newLastName,
                id: Not(id)
            }
        });

        if (existingAuthor) {
            throw new BadRequestException(`Author ${dto.firstName} ${dto.lastName} already exists`);
        }

        author.firstName = newFirstName;
        author.lastName = newLastName;

        if (dto.address !== undefined) {
            if (author.address) {
                author.address.street = dto.address.street;
                author.address.city = dto.address.city;
                author.address.zipCode = dto.address.zipCode;
                author.address.country = dto.address.country;
            } else {
                author.address = this.addressRepository.create(dto.address);
            }
        }

        const savedAuthor = await this.authorRepository.save(author);

        return savedAuthor;
    }

    async findAuthorById(id: number): Promise<AuthorListItem> {
        const author = await this.authorRepository.findOne({
            where: { id },
            relations: {
                address: true
            }
        });

        if (!author) {
            throw new NotFoundException(`Author ${id} not found`);
        }

        return {
            id: author.id,
            firstName: author.firstName,
            lastName: author.lastName,

            ...(author.address && {
                address: {
                    id: author.address.id,
                    street: author.address.street,
                    city: author.address.city,
                    zipCode: author.address.zipCode,
                    country: author.address.country,
                },
            }),
        };
    }

    async deleteAuthor(id: number): Promise<void> {
        const author = await this.authorRepository.findOne({
            where: {id},
            relations: {
                address: true
            }
        });

        if (!author) {
            throw new NotFoundException(`Author ${id} not found`);
        }

        await this.authorRepository.remove(author);

        if(author.address) {
            await this.addressRepository.remove(author.address);
        }
    }

    async findCategoryById(id: number): Promise<CategoryListItem> {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Category ${id} not found`);
        }

        return category;
    }

    async createCategory(dto: CreateCategoryDto): Promise<CategoryListItem> {
        const existingCategory = await this.categoryRepository.findOne({
            where: { name: ILike(dto.name) },
        });

        if (existingCategory) {
            throw new BadRequestException(`Category ${dto.name} already exists`);
        }

        const category = this.categoryRepository.create({
            name: dto.name,
        });

        return this.categoryRepository.save(category);
    }

    async updateCategory(id: number, dto: UpdateCategoryDto): Promise<CategoryListItem> {
        const category = await this.findCategoryById(id);
        
        if (dto.name !== undefined) {
            const existingCategory = await this.categoryRepository.findOne({
                where: {
                    name: ILike(dto.name),
                    id: Not(id),
                },
            });

            if (existingCategory) {
                throw new BadRequestException(`Category ${dto.name} already exists`);
            }

            category.name = dto.name;
        }

        return this.categoryRepository.save(category);
    }

    async deleteCategory(id: number): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: {
                books: true,
            },
        });

        if (!category) {
            throw new NotFoundException(`Category ${id} not found`);
        }

        if (category.books.length > 0) {
            throw new BadRequestException(
                'Cannot delete a category associated with books'
            );
        }

        await this.categoryRepository.remove(category);
    }

    async findReviewsByBookId(bookId: number): Promise<ReviewListItem[]> {
        // 1. Usiamo find() per prendere tutte le recensioni di quel libro
        // 2. Includiamo 'book.authors' nelle relazioni per non far crashare il map
        const reviews = await this.reviewRepository.find({
            where: {
                book: { id: bookId }
            },
            relations: {
                user: true,
                book: {
                    authors: true
                }
            }
        });

        // Se il libro non ha recensioni restituiamo un array vuoto [] 
        // (A livello di API è meglio non lanciare un errore 404 se un libro non ha ancora commenti)
        if (!reviews || reviews.length === 0) {
            return [];
        }

        // 3. Mappiamo l'array di entità nell'array di ReviewListItem richiesto dal frontend
        return reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            user: {
                id: review.user.id,
                email: review.user.email,
            },
            book: {
                id: review.book.id,
                title: review.book.title,
                authors: review.book.authors.map((author) => ({
                    id: author.id,
                    firstName: author.firstName,
                    lastName: author.lastName
                }))
            }
        }));
    }

    async createReview(bookId: number, user: UserEntity, dto: CreateReviewDto): Promise<ReviewListItem> {
        // 1. CONTROLLO PREVENTIVO: L'utente ha già recensito questo libro?
        const existingReview = await this.reviewRepository.findOne({
            where: {
                book: { id: bookId },
                user: { id: user.id }
            }
        });

        if (existingReview) {
            throw new ConflictException(`You have already reviewed this book. Use update if you want to change it.`);
        }

        // 2. Recupero il libro con i suoi autori per il mapping finale
        const book = await this.bookRepository.findOne({
            where: { id: bookId },
            relations: ['authors'] 
        });

        if (!book) {
            throw new NotFoundException(`Book ${bookId} not found`);
        }

        // 3. Creazione e salvataggio della recensione
        const review = this.reviewRepository.create({
            rating: dto.rating,
            comment: dto.comment,
            user,
            book
        });

        const savedReview = await this.reviewRepository.save(review);

        // 4. Risposta mappata per il frontend
        return {
            id: savedReview.id,
            rating: savedReview.rating,
            comment: savedReview.comment,
            user: {
                id: savedReview.user.id,
                email: savedReview.user.email,
            },
            book: {
                id: savedReview.book.id,
                title: savedReview.book.title,
                authors: savedReview.book.authors.map((author) => ({
                    id: author.id,
                    firstName: author.firstName,
                    lastName: author.lastName
                }))
            }
        };
    }

    async deleteReview(id: number, user: UserEntity): Promise<void> {
        // 3. AGGIUNTO IL JOIN 'user', altrimenti review.user sarà undefined e il check fallirà
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['user'] 
        });

        if (!review) {
            throw new NotFoundException(`Review ${id} not found`);
        }

        if ((review.user.id !== user.id) && (user.role !== UserRole.ADMIN)) {
            throw new ForbiddenException(
                "Cannot delete another user's review"
            );
        }

        await this.reviewRepository.remove(review);
    }

    // 1. FIND ALL (Recupera tutte le aree con gli scholar affiliati)
    async findAllResearchMacroAreas(): Promise<ResearchMacroAreaListItem[]> {
        return this.researchMacroAreaRepository.find({
        relations: ['scholars'], // Carica la relazione N:N invertita
        order: { name: 'ASC' }   // Ordine alfabetico comodo per le liste
        });
    }

    // 2. FIND BY ID (Dettaglio di una singola macro area)
    async findResearchMacroAreaById(id: number): Promise<ResearchMacroAreaListItem> {
        const area = await this.researchMacroAreaRepository.findOne({
        where: { id },
        relations: ['scholars']
        });

        if (!area) {
        throw new NotFoundException(`Area di ricerca con ID ${id} non trovata.`);
        }

        return area;
    }

    // 3. CREATE (Creazione di una nuova area)
    async createResearchMacroArea(dto: CreateResearchMacroAreaDto): Promise<ResearchMacroAreaListItem> {
        // Gestiamo il vincolo unique sul nome per evitare crash generici del DB
        const existingArea = await this.researchMacroAreaRepository.findOne({ where: { name: dto.name } });
        if (existingArea) {
        throw new ConflictException(`L'area di ricerca "${dto.name}" esiste già.`);
        }

        const newArea = this.researchMacroAreaRepository.create({
        name: dto.name,
        scholars: [] // Inizializziamo l'array vuoto per mappare l'interfaccia
        });

        return this.researchMacroAreaRepository.save(newArea);
    }

    // 4. UPDATE (Modifica del nome dell'area)
    async updateResearchMacroArea(id: number, dto: UpdateResearchMacroAreaDto): Promise<ResearchMacroAreaListItem> {
        const area = await this.researchMacroAreaRepository.findOne({
        where: { id },
        relations: ['scholars']
        });

        if (!area) {
        throw new NotFoundException(`Area di ricerca con ID ${id} non trovata.`);
        }

        if (dto.name) {
        // Controllo duplicati anche in fase di update
        const existingArea = await this.researchMacroAreaRepository.findOne({ where: { name: dto.name } });
        if (existingArea && existingArea.id !== id) {
            throw new ConflictException(`Un'altra area di ricerca si chiama già "${dto.name}".`);
        }
        area.name = dto.name;
        }

        return this.researchMacroAreaRepository.save(area);
    }

    // 5. DELETE (Cancellazione dell'area)
    async deleteResearchMacroArea(id: number): Promise<void> {
        const area = await this.researchMacroAreaRepository.findOne({ where: { id } });
        
        if (!area) {
        throw new NotFoundException(`Area di ricerca con ID ${id} non trovata.`);
        }

        // Rimuovendo l'area, TypeORM pulirà AUTOMATICAMENTE tutte le righe 
        // corrispondenti dentro la tabella di giunzione 'areas_scholars' (o scholar_research_areas)
        await this.researchMacroAreaRepository.remove(area);
    }

    async findAllResearchProjects(filters?: { 
        title?: string; 
        acronym?: string; 
        year?: number;
        scholarId?: number;
    }): Promise<ResearchProjectListItem[]> {
        
        // Creiamo un QueryBuilder esplicito per l'entità dei progetti
        const query = this.researchProjectRepository.createQueryBuilder('project')
            // Facciamo le JOIN esplicite caricando le relazioni annidate
            .leftJoinAndSelect('project.scholars', 'scholar')
            .leftJoinAndSelect('scholar.user', 'user')
            .leftJoinAndSelect('scholar.research_macro_areas', 'macro_area');

        // 1. Filtro parziale sul Titolo
        if (filters?.title) {
            query.andWhere('project.title ILIKE :title', { title: `%${filters.title}%` });
        }

        // 2. Filtro parziale sull'Acronimo
        if (filters?.acronym) {
            query.andWhere('project.acronym ILIKE :acronym', { acronym: `%${filters.acronym}%` });
        }

        // 3. Filtro per Anno di Attività
        if (filters?.year) {
            query.andWhere('EXTRACT(YEAR FROM project.startDate) <= :year', { year: filters.year })
                .andWhere('EXTRACT(YEAR FROM project.endDate) >= :year', { year: filters.year });
        }

        // 4. Filtro sull'ID dello Scholar (Risolve il bug del tablePath!)
        if (filters?.scholarId) {
            // Filtriamo cercando se tra gli scholar del progetto c'è quello richiesto
            query.andWhere('scholar.id = :scholarId', { scholarId: filters.scholarId });
        }

        // Ordiniamo per ID del progetto
        query.orderBy('project.id', 'ASC');

        const projects = await query.getMany();

        if (!projects || projects.length === 0) {
            throw new NotFoundException(`Nessun progetto di ricerca trovato con i criteri specificati`);
        }

        // Convertiamo l'output usando la tua funzione helper
        return projects.map(project => this.mapToListItem(project));
    }

    // 2. FIND BY ID (Dettaglio di un singolo progetto di ricerca convertito per il frontend)
    async findResearchProjectById(id: number): Promise<ResearchProjectListItem> {
        const project = await this.researchProjectRepository.findOne({
            where: { id },
            relations: {
                scholars: {
                    user: true,
                    research_macro_areas: true
                }
            }
        });

        if (!project) {
            throw new NotFoundException(`Progetto di ricerca con ID ${id} non trovato.`);
        }

        // Convertiamo il singolo oggetto
        return this.mapToListItem(project);
    }

    // 3. CREATE (Creazione di un nuovo progetto)
    async createResearchProject(dto: CreateResearchProjectDto): Promise<ResearchProjectListItem> {
        const existingProject = await this.researchProjectRepository.findOne({ where: { acronym: dto.acronym } });
        if (existingProject) {
            throw new ConflictException(`Un progetto con acronimo "${dto.acronym}" esiste già.`);
        }

        // Recuperiamo gli scholar reali dal DB
        const scholars = await this.scholarRepository.find({
            where: { id: In(dto.scholarIds) }
        });

        if (scholars.length === 0) {
            throw new BadRequestException("Nessun ricercatore valido trovato per gli ID forniti.");
        }

        const newProject = this.researchProjectRepository.create({
            title: dto.title,
            acronym: dto.acronym,
            budget: dto.budget,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            scholars: scholars // Aggancio automatico alla tabella pivot
        });

        await this.researchProjectRepository.save(newProject);
        
        // Ritorniamo il progetto ricaricato e formattato tramite findResearchProjectById
        return this.findResearchProjectById(newProject.id);
    }

    // 4. UPDATE (Modifica dei dati del progetto e ricalcolo della relazione N:N)
    async updateResearchProject(id: number, dto: UpdateResearchProjectDto): Promise<ResearchProjectListItem> {
        const project = await this.researchProjectRepository.findOne({
            where: { id },
            relations: { scholars: true } // Ci servono gli scholar attuali per sovrascriverli
        });

        if (!project) {
            throw new NotFoundException(`Progetto di ricerca con ID ${id} non trovato.`);
        }

        // Controllo univocità acronimo
        if (dto.acronym) {
            const existingProject = await this.researchProjectRepository.findOne({ where: { acronym: dto.acronym } });
            if (existingProject && existingProject.id !== id) {
                throw new ConflictException(`Un altro progetto usa già l'acronimo "${dto.acronym}".`);
            }
            project.acronym = dto.acronym;
        }

        if (dto.title !== undefined) project.title = dto.title;
        if (dto.budget !== undefined) project.budget = dto.budget;
        if (dto.startDate !== undefined) project.startDate = new Date(dto.startDate);
        if (dto.endDate !== undefined) project.endDate = new Date(dto.endDate);

        // Gestione degli Scholar
        if (dto.scholarIds !== undefined) {
            if (dto.scholarIds.length > 0) {
                const newScholars = await this.scholarRepository.find({
                    where: { id: In(dto.scholarIds) }
                });
                project.scholars = newScholars;
            } else {
                project.scholars = [];
            }
        }

        await this.researchProjectRepository.save(project);
        
        return this.findResearchProjectById(project.id);
    }

    // 5. DELETE (Cancellazione del progetto)
    async deleteResearchProject(id: number): Promise<void> {
        const project = await this.researchProjectRepository.findOne({ where: { id } });
        
        if (!project) {
            throw new NotFoundException(`Progetto di ricerca con ID ${id} non trovato.`);
        }

        await this.researchProjectRepository.remove(project);
    }

    // 🌟 HELPER PRIVATO: Risolve il problema del tipo 'Date' -> 'string' e adegua l'oggetto all'interfaccia
    private mapToListItem(project: ResearchProjectEntity): ResearchProjectListItem {
        return {
            id: project.id,
            title: project.title,
            acronym: project.acronym,
            budget: project.budget ? Number(project.budget) : undefined,
            // Tagliamo la stringa ISO per ottenere il formato YYYY-MM-DD richiesto dagli input di tipo date
            startDate: project.startDate instanceof Date 
                ? project.startDate.toISOString().split('T')[0] 
                : String(project.startDate),
            endDate: project.endDate instanceof Date 
                ? project.endDate.toISOString().split('T')[0] 
                : String(project.endDate),
            scholars: (project.scholars || []).map((scholar: any) => ({
                id: scholar.id,
                universityDepartment: scholar.universityDepartment,
                user: {
                    id: scholar.user?.id,
                    name: scholar.user?.name,
                    email: scholar.user?.email,
                },
                research_macro_areas: (scholar.research_macro_areas || []).map((area: any) => ({
                    id: area.id,
                    name: area.name,
                })),
            })),
        };
    }
}
