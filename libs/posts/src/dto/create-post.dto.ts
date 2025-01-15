import { IsNotEmpty, IsUrl } from "class-validator";

export class CreatePostDto {
    @IsUrl()
    @IsNotEmpty()
    mediaUrl: string;

    @IsNotEmpty()
    caption: string;
}
