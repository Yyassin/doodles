import { Response, Request } from 'express';
import { HTTP_STATUS } from '../constants';
import * as admin from 'firebase-admin';

/**
 * Firebase Authentication API controllers, logic for endpoint routes.
 * @author Zakariyya Almalki
 */

// Given token
export const handleGetToken = async (req: Request, res: Response) => {
  try {
    const authToken = await admin.auth().verifyIdToken(req.body.body.token);
    return res.status(HTTP_STATUS.SUCCESS).json({ authToken });
  } catch (error) {
    console.error('Error authentication:', error);
    res.status(400).json({ error: 'Failed to find auth token' });
  }
};
