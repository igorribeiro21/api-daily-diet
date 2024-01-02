import fastify from 'fastify';
import { env } from './env';
import { mealsRoutes } from './routes/meals';
import cookie from '@fastify/cookie';

export const app = fastify();

app.get('/', (request, reply) => {
    return reply.send({
        env: env.NODE_ENV,
        date: new Date()
    });
});

app.register(cookie);

app.register(mealsRoutes);