import { Response, Request } from 'express';
import { HTTP_STATUS, LOG_LEVEL } from '../../constants';
import * as admin from 'firebase-admin';
import { Logger } from '../../utils/Logger';

/**
 * Firebase Authentication API controllers, logic for endpoint routes.
 * @author Zakariyya Almalki
 */

/** Logger */
const authLogger = new Logger('Auth', LOG_LEVEL);

/** Verifies token for authentication */
export const handleGetToken = async (req: Request, res: Response) => {
  try {
    const authToken = await admin.auth().verifyIdToken(req.body.body.token);
    return res.status(HTTP_STATUS.SUCCESS).json({ authToken });
  } catch (error) {
    authLogger.debug('Error authentication:', error);
    res.status(HTTP_STATUS.ERROR).json({ error: 'Failed to find auth token' });
  }
};
