import app from '../server';
import supertest from 'supertest';

const request = supertest(app);

describe('Test the main route', () => {
  it('checks the api response', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
  });
});
