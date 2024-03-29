import { DashboardQueries } from '../../services/dashboard';
import { OrderClass, Order } from '../../models/order';
import { User, UserHashed, UserClass } from '../../models/user';
import bcrypt from 'bcrypt';
import config from '../../config/config';
import client from '../../database';

const { pepper } = config;

const dash_store = new DashboardQueries();
const order_store = new OrderClass();
const user_store = new UserClass();

const u: User = {
  first_name: 'mock_f_name',
  last_name: 'mock_l_name',
  user_name: 'mock_u_name',
  password: 'mock_pass',
};

let u_hashed: UserHashed;

const active_in: Order = {
  status: 'active',
  user_id: '1',
};

const active_out: Order = {
  id: 1,
  status: 'active',
  user_id: '1',
};

const complete_in: Order = {
  status: 'complete',
  user_id: '1',
};

const complete_out: Order = {
  id: 2,
  status: 'complete',
  user_id: '1',
};

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

describe('Dashboard Service', () => {
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
    conn.release();
  });

  it('should have a user_active_order method', () => {
    expect(dash_store.user_active_order).toBeDefined();
  });

  it('should have a user_completed_orders method', () => {
    expect(dash_store.user_completed_orders).toBeDefined();
  });

  it('adds a mock user first for testing', async () => {
    await user_store.create(u);
    u_hashed = await user_store.authenticate(u.user_name, u.password);
    expect(compare_u2uh(u, u_hashed)).toBeTrue;
  });

  it('creates an active order first for testing', async () => {
    const result = await order_store.create(active_in);
    expect(result).toEqual(active_out);
  });

  it('Creates a complete order first for testing', async () => {
    const result = await order_store.create(complete_in);
    expect(result).toEqual(complete_out);
  });

  it('user_active_order method should return the active order', async () => {
    const result = await dash_store.user_active_order(1);
    expect(result).toEqual([active_out]);
  });

  it('user_completed_orders method should return the completed order', async () => {
    const result = await dash_store.user_completed_orders(1);
    expect(result).toEqual([complete_out]);
  });

  it('deletes the mock orders', async () => {
    await order_store.delete(1);
    await order_store.delete(2);
    const result = await order_store.index();
    expect(result).toEqual([]);
  });

  it('deletes the mock user', async () => {
    await user_store.delete(u.user_name);
    const result = await user_store.index();
    expect(result).toEqual([]);
  });
});
