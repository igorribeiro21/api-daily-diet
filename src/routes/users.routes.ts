import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'node:crypto';

export async function usersRoutes(app: FastifyInstance) {
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
}