import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'node:crypto';
import { checkSessionUserIdExists } from '../utils/check-session-userId-exists';

export async function mealsRoutes(app: FastifyInstance) {
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
            id_user: getMealsExists.id_user
        };

        await knex('meals')
            .where({
                id,
                id_user: userId
            }).update(bodyUpdate);

        return reply.status(204).send();
    });

    app.delete('/meals/:id', {
        preHandler: checkSessionUserIdExists
    }, async (request, reply) => {
        const deleteMealParamsSchema = z.object({
            id: z.string().uuid()
        });

        const { id } = deleteMealParamsSchema.parse(request.params);
        const { userId } = request.cookies;

        await knex('meals')
            .where({
                id,
                id_user: userId
            }).delete();

        return reply.status(204).send();
    });

    app.get('/meals', {
        preHandler: [checkSessionUserIdExists]
    }, async (request, reply) => {
        const { userId } = request.cookies;

        const list = await knex('meals')
            .where('id_user', userId)
            .select('*');

        return reply.send(list);
    });

    app.get('/meals/:id', {
        preHandler: [checkSessionUserIdExists]
    }, async (request, reply) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        });

        const { id } = getMealParamsSchema.parse(request.params);
        const { userId } = request.cookies;

        const list = await knex('meals')
            .where({
                id,
                id_user: userId
            }).first();

        return reply.send(list);
    });

    app.get('/meals/metrics', {
        preHandler: [checkSessionUserIdExists]
    }, async (request, reply) => {
        const { userId } = request.cookies;

        const list = await knex('meals')
            .where({
                id_user: userId
            }).select();

        let totalMeals = 0;
        let totalMealDiet = 0;
        let totalNotMealDiet = 0;
        let totalSequenceMealDiet = 0;

        for (let i in list) {
            totalMeals++;

            if (list[i].inside_diet) {
                totalMealDiet++;
            } else {
                totalNotMealDiet++;
            }

            if (Number(i) === 0) {
                if (list[i].inside_diet) {
                    totalSequenceMealDiet = 1;
                }
            } else if (Number(i) > 0) {
                if (list[i].inside_diet && list[Number(i) - 1].inside_diet) {
                    totalSequenceMealDiet++;
                } else if (list[i].inside_diet) {
                    totalSequenceMealDiet = 1;
                }
            }

        }

        return reply.send({
            totalMeals,
            totalMealDiet,
            totalNotMealDiet,
            totalSequenceMealDiet
        });
    });
}