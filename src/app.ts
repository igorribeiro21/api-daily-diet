import fastify from "fastify";

export const app = fastify();

app.get('/', (request, reply) => {
    return reply.send({
        env: 'desenv',
        date: new Date()
    });
});