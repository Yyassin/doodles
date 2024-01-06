import React, { useRef, useState } from 'react';
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
import { useAppStore } from '@/stores/AppStore';
import axios from 'axios';
import { REST } from '@/constants';
import { ACCESS_TOKEN_TAG } from '@/constants';
import { useAuthStore } from '@/stores/AuthStore';

/**
 * It is the sign in page where user either inputs email and password or
 * sign in through google. We use firebase auth for both
 * @author Zakariyya Almalki
 */

// TODO: Add a loading state for google popup, disable button.

// function that uses firebase sign in method, takes email and pass
// function is here for ease of testing
export function signin(email: string, password: string) {
  return signInWithEmailAndPassword(getAuth(firebaseApp), email, password);
}

export function checkToken(token: string) {
  return axios.post(REST.auth.token, {
    body: { token: token },
  });
}

export async function getUserDetails(
  email: string,
  setUser: (
    userFirstName: string,
    userLastName: string,
    userEmail: string | null,
    userPicture: string,
  ) => void,
) {
  await axios
    .get(REST.user.get, {
      params: { email },
    })
    .then((response) => {
      setUser(
        response.data.user.firstname ?? '',
        response.data.user.lastname ?? '',
        response.data.user.email ?? '',
        response.data.user.avatar ?? '',
      );
    })
    .catch((error) => {
      console.error(
        'Error:',
        error.response ? error.response.data : error.message,
      );
    });
}

export default function SignInPage() {
  const { setMode } = useAppStore(['setMode']);
  const { setUser } = useAuthStore(['setUser']);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false); // State to disable sign in button while loading
  const [error, setError] = useState(''); // State for error message

  // where we handle regular email/pass sign in
  const handleSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const signInToken = await signin(
        emailRef.current?.value ?? '',
        passwordRef.current?.value ?? '',
      );
      getUserDetails(emailRef.current?.value ?? '', setUser); //get name, email, avatar of user

      localStorage.setItem(
        ACCESS_TOKEN_TAG,
        await signInToken.user.getIdToken(),
      );

      setMode('dashboard'); //bring user to dashboard page if sign in complete
    } catch (error: unknown) {
      setError((error as Error).message); //if error thrown, setState and will display on page
    }
    setLoading(false);
  };

  // where we handle google in
  const handleGoogleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();

    try {
      const googleSignInToken = await signInWithPopup(auth, provider);

      await axios
        .get(REST.user.get, {
          params: { email: googleSignInToken.user.email },
        })
        .then(async () => {
          setUser(
            googleSignInToken.user.displayName ?? '',
            '',
            googleSignInToken.user.email ?? '',
            googleSignInToken.user.photoURL ?? '', // add image implementation when API is done
          );
          localStorage.setItem(
            ACCESS_TOKEN_TAG,
            await googleSignInToken.user.getIdToken(),
          );

          setMode('dashboard'); //bring user to dashboard page if sign in complete
        })
        .catch(() => {
          setError('Email is not associated with an Account. Sign Up First!');
        });
    } catch (error: unknown) {
      setError((error as Error).message);
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
          <div className="text-red-500 text-center mt-2">{error}</div>
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
          <button onClick={() => setMode('signup')}>
            Need an Account? Sign Up Here!
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
