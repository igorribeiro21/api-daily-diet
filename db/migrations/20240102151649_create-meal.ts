import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals',(table) => {
        table.uuid('id').primary();
        table.text('name').notNullable();
        table.text('description').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.boolean('inside_diet').notNullable();
        table.uuid('id_user').notNullable();
        table.foreign('id_user','FK_meals_users').references('users.id');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals');
}

