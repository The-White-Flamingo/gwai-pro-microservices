import { Role } from "@app/users";

export interface ActiveUserData {
    sub: string;
    email: string;
    role: Role;
}