import { it, expect, describe } from 'vitest';
import { signup } from '../../src/views/SignUpPage';

/**
 * Tests SignUp functionality method
 * @author Zakariyya Almalki
 */

describe('signup', () => {
  it('should sign up given user', async () => {
    try {
      const user = await signup('test3453@gmail.com', 'password'); //sign in test user with test email/pass
      expect(true).toBe(true); //it worked, they signed in
      expect(user.user).toBeDefined(); //make sure user exist
      expect(user.user.email).toBe('test3453@gmail.com'); //make sure email is correct
      await user.user.delete(); //delete user so test will work next time
    } catch (error) {
      expect(true).toBe(false); //failed, fail the test
    }
  });
});
