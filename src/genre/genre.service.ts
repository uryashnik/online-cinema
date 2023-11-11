import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "nestjs-typegoose";
import {GenreModel} from "./genre.model";
import {ModelType} from "@typegoose/typegoose/lib/types";
import {CreateGenreDto} from "./dto/createGenre.dto";

@Injectable()
export class GenreService {
    constructor(@InjectModel(GenreModel) private readonly genreModel: ModelType<GenreModel>) {}

    async bySlug(slug: string){
        return this.genreModel.findOne({slug}).exec();
    }
    async getAll(searchTerm?: string) {
        let options = {};
        if (searchTerm) {
            options = {
                $or: [
                    { name: new RegExp(searchTerm, 'i') },
                    { slug: new RegExp(searchTerm, 'i') },
                    { description: new RegExp(searchTerm, 'i') }
                ],
            };
        }

        return this.genreModel
            .find(options)
            .select('-updatedAt -__v')
            .sort({ createdAt: 'desc' })
            .exec();
    }

    async getCollections(){
        const genres = await this.getAll();
        const collections = genres;
        /*
        *  Need write logic
        * */
        return collections;
    }

    /* Admin place */

    async byId(_id: string) {
        const genre = await this.genreModel.findById(_id);
        if (!genre) throw new NotFoundException('Genre not foound!');

        return genre;
    }

    async create() {
        const defaultValue: CreateGenreDto = {
            name: '',
            slug: '',
            icon: '',
            description: '',
        }
        const genre = await this.genreModel.create(defaultValue)

        return genre._id
    }

    async update(_id: string, dto: CreateGenreDto) {
        const updatedDoc = await this.genreModel.findByIdAndUpdate(_id, dto, {
            new: true
        }).exec()

        if(!updatedDoc) throw new NotFoundException("Genre not found")

        return updatedDoc;
    }

    async delete(id: string) {
         const deletedDoc = await this.genreModel.findByIdAndDelete(id).exec();

        if(!deletedDoc) throw new NotFoundException("Genre not found")

        return deletedDoc;
    }

}
