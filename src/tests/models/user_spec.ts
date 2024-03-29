import { User, UserHashed, UserClass } from '../../models/user';
import client from '../../database';
import bcrypt from 'bcrypt';
import config from '../../config/config';

const { pepper, salt_rounds } = config;

const store = new UserClass();

const u0: User = {
  first_name: 'mock0_f_name',
  last_name: 'mock0_l_name',
  user_name: 'mock0_u_name',
  password: 'mock0_pass',
};

const u: User = {
  first_name: 'mock_f_name',
  last_name: 'mock_l_name',
  user_name: 'mock_u_name',
  password: 'mock_pass',
};

let u0_hashed: UserHashed;
let u_hashed: UserHashed;

const compare_u2uh = (u: User, uh: UserHashed): boolean => {
  let same;
  if (
    (u.first_name, u.last_name, u.user_name) === (uh.first_name, uh.last_name, uh.user_name) &&
    bcrypt.compareSync(u.password + pepper, uh.password_digest)
  ) {
    same = true;
  } else {
    same = false;
  }
  return same;
};

const compare_uh2uh = (uh1: UserHashed, uh2: UserHashed): boolean => {
  let same;
  if (
    (uh1.first_name, uh1.last_name, uh1.user_name) ===
    (uh2.first_name, uh2.last_name, uh2.user_name)
  ) {
    same = true;
  } else {
    same = false;
  }
  return same;
};

describe('User Model Structure:', () => {
  it('should have an index method', () => {
    expect(store.index).toBeDefined();
  });

  it('should have a show method', () => {
    expect(store.show).toBeDefined();
  });

  it('should have a create method', () => {
    expect(store.create).toBeDefined();
  });

  it('should have a delete method', () => {
    expect(store.delete).toBeDefined();
  });

  it('should have an authenticate method', () => {
    expect(store.authenticate).toBeDefined();
  });
});

describe('User Model Functionality:', () => {
  beforeAll(async () => {
    // Reset the tables in the test database
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const conn = await client.connect();
    await conn.query('DELETE FROM users');
    await conn.query('DELETE FROM products');
    await conn.query('DELETE FROM orders');
    await conn.query('DELETE FROM order_products');
    await conn.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await conn.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
    await conn.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');
    await conn.query('ALTER SEQUENCE order_products_id_seq RESTART WITH 1');

    // Creating the first mock user
    const sql =
      'INSERT INTO users (first_name, last_name, user_name, password_digest) VALUES($1, $2, $3, $4) RETURNING *';
    const pass_hash = bcrypt.hashSync(u0.password + pepper, salt_rounds);
    const result = await conn.query(sql, [u0.first_name, u0.last_name, u0.user_name, pass_hash]);
    u0_hashed = result.rows[0];
    conn.release();
  });

  it('authenticate method should reject a non-valid user', async () => {
    await expectAsync(store.authenticate('bad', 'user')).toBeRejectedWithError();
  });

  it('create method should add a user', async () => {
    await store.create(u);
    u_hashed = await store.authenticate(u.user_name, u.password);
    expect(compare_u2uh(u, u_hashed)).toBeTrue;
  });

  it('create method should not add a duplicate username', async () => {
    await expectAsync(store.create(u)).toBeRejectedWithError();
  });

  it('index method should return a list of users', async () => {
    const result = await store.index();
    expect(u0_hashed).toBeDefined();
    expect(u_hashed).toBeDefined();
    expect(compare_uh2uh(result[0], u0_hashed)).toBeTrue;
    expect(compare_uh2uh(result[1], u_hashed)).toBeTrue;
  });

  it('show method should return the correct user', async () => {
    const result = await store.show(u_hashed.user_name);
    expect(compare_uh2uh(result, u_hashed)).toBeTrue;
  });

  it('delete method should remove the user', async () => {
    await store.delete(u0.user_name);
    await store.delete(u.user_name);
    const result = await store.index();
    expect(result).toEqual([]);
  });
});
