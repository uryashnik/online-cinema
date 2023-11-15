import {IsArray, IsNumber, IsObject, IsString} from "class-validator";

export class Parameters {
    @IsNumber()
    year: string;

    @IsNumber()
    duration: string;

    @IsString()
    country: string;
}

export class UpdateMovieDto {
    @IsString()
    poster: string;

    @IsString()
    bigPoster: string;

    @IsString()
    title: string;

    @IsString()
    slug: string;

    @IsObject()
    parameters?: Parameters;

    @IsNumber()
    rating?: number

    @IsString()
    videoUrl: string;

    @IsArray()
    @IsString({each: true})
    genres: string[];

    @IsArray()
    @IsString({each: true})
    actors: string[];

    isSendTelegram?: boolean;
}