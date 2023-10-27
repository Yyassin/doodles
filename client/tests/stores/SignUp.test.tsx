import { it, expect, describe } from 'vitest';
import { signup } from '../../src/views/SignUpPage';

/**
 * Tests SignUp functionality method
 * @author Zakariyya Almalki
 */

describe('signup', () => {
  it('should sign up given user', async () => {
    try {
      const userCredential = await signup(
        'test3453@gmail.com',
        'password',
        'test',
        'testLast',
        null,
      ); // Sign up test user with test email/pass

      const { user } = userCredential; // Access the user object from the userCredential

      expect(true).toBe(true); // It worked, they signed in
      expect(user).toBeDefined(); // Make sure user exists
      expect(user.email).toBe('test3453@gmail.com'); // Make sure email is correct

      // Delete the user so the test will work next time
      await user.delete();
    } catch (error) {
      expect(true).toBe(false); //failed, fail the test
    }
  });
});
