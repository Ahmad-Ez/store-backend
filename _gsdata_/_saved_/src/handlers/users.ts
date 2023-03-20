import express, { Request, Response } from 'express';
import { User, UserClass } from '../models/user';
import verifyAuthToken from '../utils/auth';
import jwt from 'jsonwebtoken';
import config from '../config/config';

const jwt_secret = config.jwt_secret;

const store = new UserClass();

// get all users
const index = async (_req: Request, res: Response) => {
  const users = await store.index();
  res.json(users);
};

// show single user based on its id
const show = async (req: Request, res: Response) => {
  console.log('token verified');
  const user = await store.show(req.params.username);
  res.json(user);
};

// create a new user
const create = async (req: Request, res: Response) => {
  const user: User = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    user_name: req.body.user_name,
    password: req.body.password,
  };
  try {
    const newUser = await store.create(user);
    const token = jwt.sign({ user: newUser }, jwt_secret);
    res.json(token);
  } catch (err) {
    res.status(400);
    res.json(<string>err + user);
  }
};

// delete a item given its username
const remove = async (req: Request, res: Response) => {
  const deleted = await store.delete(req.body.user_name);
  res.json(deleted);
};

// Authenticate a user for an operation requiring restricted access
const authenticate = async (req: Request, res: Response) => {
  try {
    const user: User = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      user_name: req.body.user_name,
      password: req.body.password,
    };
    const hashed_user = await store.authenticate(user.user_name, user.password);
    const token = jwt.sign({ user: hashed_user }, jwt_secret);
    res.json(token);
  } catch (error) {
    res.status(401);
    res.json({ error });
  }
};

// routes to operations involving users
const userRoutes = (app: express.Application) => {
  app.get('/users', verifyAuthToken, index);
  app.get('/users/:username', verifyAuthToken, show);
  app.post('/users', verifyAuthToken, create);
  app.delete('/users', verifyAuthToken, remove);
};

export default userRoutes;