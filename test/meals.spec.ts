import { it, beforeAll, afterAll, describe, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Meals routes', () => {
    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should be able to create a new meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'Teste',
                email: 'teste@teste.com'
            });

        const cookies = userResponse.get('Set-Cookie');

        await request(app.server)
            .post('/meals')
            .send({
                name: 'Teste',
                description: 'Teste descrição',
                inside_diet: true
            })
            .set('Cookie', cookies)
            .expect(201);
    });

    it('should be able to get list meals', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'Teste',
                email: 'teste@teste.com'
            });

        const cookies = userResponse.get('Set-Cookie');

        await request(app.server)
            .post('/meals')
            .send({
                name: 'Teste',
                description: 'Teste descrição',
                inside_diet: true
            })
            .set('Cookie', cookies)

        await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200);
    });

    it('should be able to get a specific meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'Teste',
                email: 'teste@teste.com'
            });

        const cookies = userResponse.get('Set-Cookie');

        await request(app.server)
            .post('/meals')
            .send({
                name: 'Teste',
                description: 'Teste descrição',
                inside_diet: true
            })
            .set('Cookie', cookies)

        const listResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies);


        const response = await request(app.server)
            .get(`/meals/${listResponse.body[0].id}`)
            .set('Cookie', cookies);            

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(expect.any(Object));
        expect(response.body.name).toEqual('Teste');
    });

    it('should be able to update a meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'Teste',
                email: 'teste@teste.com'
            });

        const cookies = userResponse.get('Set-Cookie');

        await request(app.server)
            .post('/meals')
            .send({
                name: 'Teste',
                description: 'Teste descrição',
                inside_diet: true
            })
            .set('Cookie', cookies)

        const listResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies);


        await request(app.server)
            .put(`/meals/${listResponse.body[0].id}`)
            .send({
                name: 'Teste Atualizado'
            })
            .set('Cookie', cookies)
            .expect(204);
    });

    it('should be able to delete a meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'Teste',
                email: 'teste@teste.com'
            });

        const cookies = userResponse.get('Set-Cookie');

        await request(app.server)
            .post('/meals')
            .send({
                name: 'Teste',
                description: 'Teste descrição',
                inside_diet: true
            })
            .set('Cookie', cookies)

        const listResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies);


        await request(app.server)
            .delete(`/meals/${listResponse.body[0].id}`)
            .set('Cookie', cookies)
            .expect(204);
    });

    it('should be able to get metrics', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'Teste',
                email: 'teste@teste.com'
            });

        const cookies = userResponse.get('Set-Cookie');

        await request(app.server)
            .post('/meals')
            .send({
                name: 'Teste',
                description: 'Teste descrição',
                inside_diet: true
            })
            .set('Cookie', cookies)

        const metricsResponse = await request(app.server)
            .get('/meals/metrics')
            .set('Cookie', cookies);

        expect(metricsResponse.status).toEqual(200);
        expect(metricsResponse.body).toEqual(expect.any(Object));
        expect(metricsResponse.body.totalMeals).toEqual(1);
        expect(metricsResponse.body.totalMealDiet).toEqual(1);
        expect(metricsResponse.body.totalSequenceMealDiet).toEqual(1);
        expect(metricsResponse.body.totalNotMealDiet).toEqual(0);
    });
});