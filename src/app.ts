import fastify from "fastify";
import { env } from "./env";

export const app = fastify();

app.get('/', (request, reply) => {
    return reply.send({
        env: env.NODE_ENV,
        date: new Date()
    });
});