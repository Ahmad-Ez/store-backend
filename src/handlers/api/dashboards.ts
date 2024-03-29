import express, { Request, Response } from 'express';
import { DashboardQueries } from '../../services/dashboard';
import verifyAuthToken from '../../utils/auth';

const dashboard = new DashboardQueries();

// Current order with the status 'active' for a given user
const user_active_order = async (req: Request, res: Response) => {
  try {
    const order = await dashboard.user_active_order(parseInt(req.params.id));
    res.json(order);
  } catch (err) {
    res.status(500);
    res.json(err);
  }
};

// Completed orders with the status 'complete' for a given user
const user_completed_orders = async (req: Request, res: Response) => {
  try {
    const order = await dashboard.user_completed_orders(parseInt(req.params.id));
    res.json(order);
  } catch (err) {
    res.status(500);
    res.json(err);
  }
};

// routes to operations involving custom queries
const dashboardRoutes = express.Router();
dashboardRoutes.get('/user_active_order/:id', verifyAuthToken, user_active_order);
dashboardRoutes.get('/user_completed_orders/:id', verifyAuthToken, user_completed_orders);

export default dashboardRoutes;
