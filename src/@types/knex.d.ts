import { Knex } from "knex";

declare module "knex/types/tables" {
    export interface Tables {
        users: {
            id: string;
            name: string;
            email:string;
            created_at: string;
        },
        meals: {
            id: string;
            name: string;
            description: string;
            created_at: string;
            inside_diet: boolean;
            id_user: string;
        }
    }
}