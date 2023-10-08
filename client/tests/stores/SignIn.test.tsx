import { it, expect, describe } from 'vitest';
import { signin } from '../../src/views/SignInPage';

/**
 * Tests SignIn functionality method
 * @author Zakariyya Almalki
 */

describe('signin', () => {
  it('should sign in given valid user and password', async () => {
    try {
      const user = await signin('ttttt@ttt.com', 'password'); //sign in test user
      expect(true).toBe(true);
      expect(user.user).toBeDefined(); //make sure user exist
      expect(user.user.email).toBe('ttttt@ttt.com'); //make sure email is correct
    } catch (error) {
      expect(true).toBe(false);
    }
  });
});
