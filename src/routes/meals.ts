import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'node:crypto';
import { checkSessionUserIdExists } from '../utils/check-session-userId-exists';

export async function mealsRoutes(app: FastifyInstance) {
    app.post('/users', async (request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string()
        });

        const { name, email } = createUserBodySchema.parse(request.body);
        const id = randomUUID();

        await knex('users')
            .insert({
                id,
                name,
                email
            });

        reply.cookie('userId', id, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })

        return reply.status(201).send();
    });

    app.post('/meals', {
        preHandler: [checkSessionUserIdExists]
    }, async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            inside_diet: z.boolean()
        });
        const { name, description, inside_diet } = createMealBodySchema.parse(request.body);
        const { userId } = request.cookies;

        await knex('meals')
            .insert({
                id: randomUUID(),
                name,
                description,
                inside_diet,
                id_user: userId
            });

        return reply.status(201).send();
    });

    app.put('/meals/:id', {
        preHandler: [checkSessionUserIdExists]
    }, async (request, reply) => {
        const updateMealBodySchema = z.object({
            name: z.coerce.string(),
            description: z.coerce.string(),
            inside_diet: z.coerce.boolean()
        });
        const updateMealParamsSchema = z.object({
            id: z.string().uuid()
        });

        const { name, description, inside_diet } = updateMealBodySchema.parse(request.body);
        const { id } = updateMealParamsSchema.parse(request.params);
        const { userId } = request.cookies;

        const getMealsExists = await knex('meals')
            .where({
                id
            }).first();

        if (!getMealsExists) {
            return reply.status(400).send({
                error: `Não foi possível encontrar refeição cadastrada com o id ${id}`
            });
        }

        const bodyUpdate = {
            name: name ? name : getMealsExists.name,
            description: description != "undefined" ? description : getMealsExists.description,
            inside_diet: inside_diet != getMealsExists.inside_diet ? inside_diet : getMealsExists.inside_diet,
            id_user: userId != getMealsExists.id_user ? userId : getMealsExists.id_user
        };

        await knex('meals')
            .where({
                id
            }).update(bodyUpdate);

        return reply.status(204).send();
    });
}