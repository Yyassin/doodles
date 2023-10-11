import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { firebaseApp } from '../firebaseDB/firebase';

/**
 * It is the sign in page where user either inputs email and password or
 * sign in through google. We use firebase auth for both
 * @author Zakariyya Almalki
 */

// function that uses firebase sign in method, takes email and pass
// function is here for ease of testing
export function signin(email: string, password: string) {
  return signInWithEmailAndPassword(getAuth(firebaseApp), email, password);
}

export default function SignInPage() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [loading, setLoading] = useState(false); // State to disable sign in button while loading
  const [error, setError] = useState(''); // State for error message
  const navigate = useNavigate();

  // where we handle regular email/pass sign in
  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await signin(emailRef.current.value, passwordRef.current.value);
      navigate('/dashboard'); //bring user to dashboard page if sign in complete
    } catch (error) {
      setError(error.message); //if error thrown, setState and will display on page
    }
    setLoading(false);
  };

  // where we handle google in
  const handleGoogleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard'); //bring user to dashboard page if sign in complete
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Log In</CardTitle>
        <CardDescription>
          Enter your email and password below to Log In
        </CardDescription>
        {error && ( // Conditional rendering of error message
          <div className="text-red-500 text-center mt-2">
            {'Invalid Email or Password'}
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-1">
        <div className="grid grid-cols-1 gap-6">
          <Label htmlFor="email"></Label>
          <Input
            ref={emailRef}
            id="email"
            type="email"
            placeholder="name@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password"></Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a Password"
            ref={passwordRef}
          />
        </div>
        <Button disabled={loading} onClick={handleSignUp} className="w-full">
          Log In
        </Button>
        <div />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid gap-2">
          <Button onClick={handleGoogleSignIn} variant="outline">
            Google
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-100 text-center mt-2">
          <Link to="/signup">Need an Account? Sign Up Here!</Link>
        </div>
      </CardFooter>
    </Card>
  );
}
