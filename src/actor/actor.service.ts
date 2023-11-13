import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "nestjs-typegoose";
import {ModelType} from "@typegoose/typegoose/lib/types";

import {ActorModel} from "./actor.model";
import {ActorDto} from "./actor.dto";

@Injectable()
export class ActorService {
    constructor(@InjectModel(ActorModel) private readonly actorModel: ModelType<ActorModel> ) {}

    async bySlug(slug: string){
        const doc = await this.actorModel.findOne({slug}).exec();
        if(!doc) throw new NotFoundException('Actor not found');
        return doc;
    }
    async getAll(searchTerm?: string) {
        let options = {};
        if (searchTerm) {
            options = {
                $or: [
                    { name: new RegExp(searchTerm, 'i') },
                    { slug: new RegExp(searchTerm, 'i') }
                ],
            };
        }

        // Aggregation

        return this.actorModel
            .find(options)
            .select('-updatedAt -__v')
            .sort({ createdAt: 'desc' })
            .exec();
    }

    /* Admin place */

    async byId(_id: string) {
        const genre = await this.actorModel.findById(_id);
        if (!genre) throw new NotFoundException('Actor not found!');

        return genre;
    }

    async create() {
        const defaultValue: ActorDto = {
            name: '',
            slug: '',
            photo: '',
        }
        const genre = await this.actorModel.create(defaultValue)

        return genre._id
    }

    async update(_id: string, dto: ActorDto) {
        const updatedDoc = await this.actorModel.findByIdAndUpdate(_id, dto, {
            new: true
        }).exec()

        if(!updatedDoc) throw new NotFoundException("Actor not found")

        return updatedDoc;
    }

    async delete(id: string) {
        const deletedDoc = await this.actorModel.findByIdAndDelete(id).exec();

        if(!deletedDoc) throw new NotFoundException("Actor not found")

        return deletedDoc;
    }
}
