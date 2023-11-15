import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "nestjs-typegoose";
import {MovieModel} from "./movie.model";
import {ModelType} from "@typegoose/typegoose/lib/types";
import {UpdateMovieDto} from "./update-movie.dto";
import {Types} from "mongoose";

@Injectable()
export class MovieService {
    constructor(@InjectModel(MovieModel) private readonly movieModel: ModelType<MovieModel>) {}

    async getAll(searchTerm?: string) {
        let options = {};
        if (searchTerm) {
            options = {
                $or: [
                    { title: new RegExp(searchTerm, 'i') },
                ],
            };
        }

        return this.movieModel
            .find(options)
            .select('-updatedAt -__v')
            .sort({ createdAt: 'desc' })
            .populate('actors genres')
            .exec();
    }

    async bySlug(slug: string){
        const doc = await this.movieModel.findOne({slug}).populate('actors genres').exec();
        if(!doc) throw new NotFoundException('Movie not found');
        return doc;
    }

    async byActor(actorId: Types.ObjectId){
        const docs = await this.movieModel.findOne({actors: actorId}).exec();
        if(!docs) throw new NotFoundException('Movies not found');
        return docs;
    }

    async byGenres(genreIds: Types.ObjectId[]){
        const docs = await this.movieModel.find({genres: {$in: genreIds}}).exec();
        if(!docs) throw new NotFoundException('Movies not found');
        return docs;
    }

    async getMostPopular(){
        return this.movieModel
            .find({countOpened: {$gt: 0}})
            .populate('genres')
            .sort({countOpened: -1})
            .exec();
    }

    async updateCountOpened(slug: string) {
        const updatedDoc = await this.movieModel.findOneAndUpdate({slug}, {
            $inc: {countOpened: 1}
        }, {new: true}).exec()
        if(!updatedDoc) throw new NotFoundException("Movie not found")
        return updatedDoc;
    }

    /* Admin place */

    async byId(_id: string) {
        const doc = await this.movieModel.findById(_id);
        if (!doc) throw new NotFoundException('Movie not found!');

        return doc;
    }

    async create() {
        const defaultValue: UpdateMovieDto = {
            poster: '',
            bigPoster: '',
            title: '',
            slug: '',
            videoUrl: '',
            genres: [],
            actors: [],
        }
        const genre = await this.movieModel.create(defaultValue)

        return genre._id
    }

    async update(_id: string, dto: UpdateMovieDto) {
        const updatedDoc = await this.movieModel.findByIdAndUpdate(_id, dto, {
            new: true
        }).exec()

        if(!updatedDoc) throw new NotFoundException("Movie not found")

        return updatedDoc;
    }

    async delete(id: string) {
        const deletedDoc = await this.movieModel.findByIdAndDelete(id).exec();

        if(!deletedDoc) throw new NotFoundException("Movie not found")

        return deletedDoc;
    }
}
