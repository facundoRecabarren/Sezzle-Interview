import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('POST /v1/calculate', () => {
  it('returns 200 with result when operation is valid', async () => {
    const res = await request(app)
      .post('/v1/calculate')
      .send({ operation: '2+3*4' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      operation: '2+3*4',
      result: 14,
      error: null
    });
  });

  it('returns 200 for v2 operations (^, √, %)', async () => {
    const res1 = await request(app)
      .post('/v1/calculate')
      .send({ operation: '2^3' });
    expect(res1.status).toBe(200);
    expect(res1.body.result).toBe(8);

    const res2 = await request(app)
      .post('/v1/calculate')
      .send({ operation: '√9+7' });
    expect(res2.status).toBe(200);
    expect(res2.body.result).toBe(10);

    const res3 = await request(app)
      .post('/v1/calculate')
      .send({ operation: '10+50%' });
    expect(res3.status).toBe(200);
    expect(res3.body.result).toBe(15);
  });

  it('returns 200 for negative numbers and decimals', async () => {
    const res = await request(app)
      .post('/v1/calculate')
      .send({ operation: '-5+3' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      operation: '-5+3',
      result: -2,
      error: null
    });
  });

  it('returns 400 for division by zero', async () => {
    const res = await request(app)
      .post('/v1/calculate')
      .send({ operation: '10/0' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      operation: '10/0',
      result: null,
      error: 'Error: division by zero'
    });
  });

  it('returns 400 for operator without right number', async () => {
    const res = await request(app)
      .post('/v1/calculate')
      .send({ operation: '23+' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      operation: '23+',
      result: null,
      error: 'operator without right number'
    });
  });

  it('returns 400 for missing parenthesis', async () => {
    const res = await request(app)
      .post('/v1/calculate')
      .send({ operation: '(2+3(1*0)' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      operation: '(2+3(1*0)',
      result: null,
      error: 'parenthesis missing'
    });
  });

  it('returns 400 for bad written operation', async () => {
    const res = await request(app)
      .post('/v1/calculate')
      .send({ operation: '(2++3(1*0)' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      operation: '(2++3(1*0)',
      result: null,
      error: 'bad written operation'
    });
  });

  it('returns 400 for empty or whitespace or disallowed chars', async () => {
    const res1 = await request(app)
      .post('/v1/calculate')
      .send({ operation: '' });
    expect(res1.status).toBe(400);
    expect(res1.body.error).toBe('Error: Input bad written');

    const res2 = await request(app)
      .post('/v1/calculate')
      .send({ operation: '2 + 2' });
    expect(res2.status).toBe(400);
    expect(res2.body.error).toBe('Error: Input bad written');

    const res3 = await request(app)
      .post('/v1/calculate')
      .send({ operation: '2$3' });
    expect(res3.status).toBe(400);
    expect(res3.body.error).toBe('Error: Input bad written');
  });
});
