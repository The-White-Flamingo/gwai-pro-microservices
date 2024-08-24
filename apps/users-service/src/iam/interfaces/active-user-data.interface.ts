import { Role } from "../../users/enums/role.enum";

export interface ActiveUserData {
    sub: string;
    email: string;
    role: Role;
}