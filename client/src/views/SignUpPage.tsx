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
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { firebaseApp } from '../firebaseDB/firebase';
import { useAppStore } from '@/stores/AppStore';
import { ACCESS_TOKEN_TAG, REST } from '@/constants';
import { useAuthStore } from '@/stores/AuthStore';
import axios, { AxiosResponse } from 'axios';

/**
 * It is the sign up page where user either inputs email and password or
 * sign up through google. We use firebase auth for both
 * @author Zakariyya Almalki
 */

export function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  profilePicture: File | null,
): Promise<{ cred: UserCredential; userInfo: AxiosResponse }> {
  return new Promise(async (resolve, reject) => {
    const auth = getAuth(firebaseApp);
    console.log(profilePicture);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      // send the data as a JSON payload:
      const userData = {
        username: ' user.displayName',
        email: user.email,
        password,
        firstname: firstName,
        lastname: lastName,
        avatar: 'profilePicture',
        // handle uploading the profile picture to backend
      };

      const creatUserResp = await axios.post(REST.user.create, userData);

      resolve({ cred: userCredential, userInfo: creatUserResp });
    } catch (error: unknown) {
      reject(error as Error);
    }
  });
}

export default function SignUp() {
  const { setMode } = useAppStore(['setMode']);
  const { setUser } = useAuthStore(['setUser']);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const profilePictureRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      //setloading state to true,
      //we want to disable sign up button from user so
      //firebase doesnt create many accounts if button click multiple times
      setLoading(true);
      const { cred, userInfo } = await signup(
        emailRef.current?.value ?? '',
        passwordRef.current?.value ?? '',
        firstNameRef.current?.value ?? '',
        lastNameRef.current?.value ?? '',
        profilePictureRef.current?.files
          ? profilePictureRef.current?.files[0]
          : null,
      );

      //TODO
      setUser(
        firstNameRef.current?.value ?? '',
        lastNameRef.current?.value ?? '',
        emailRef.current?.value ?? '',
        '', // add image implementation when API is done
        userInfo.data.user.uid ?? '',
      );

      localStorage.setItem(ACCESS_TOKEN_TAG, await cred.user.getIdToken());
      setMode('dashboard'); //bring user to dashboard page if sign in complete
    } catch (error: unknown) {
      setError((error as Error).message); //if error thrown, setState and will display on page
    }
    //post reqs
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();

    try {
      const googleSignInToken = await signInWithPopup(auth, provider);

      const userData = {
        username: '  ',
        email: googleSignInToken.user.email,
        password: '  ',
        firstname: googleSignInToken.user.displayName,
        lastname: '  ',
        avatar: googleSignInToken.user.photoURL,
      };

      await axios
        .get(REST.user.get, {
          params: { email: googleSignInToken.user.email },
        })
        .then(() => {
          setError('Account is already registered. Go to Sign In Page!');
        })
        .catch(async () => {
          const createUserResp = await axios.post(REST.user.create, userData);
          //TODO
          setUser(
            googleSignInToken.user.displayName ?? '',
            '',
            googleSignInToken.user.email ?? '',
            googleSignInToken.user.photoURL ?? '',
            createUserResp.data.user.uid ?? '',
          );
          localStorage.setItem(
            ACCESS_TOKEN_TAG,
            await googleSignInToken.user.getIdToken(),
          );

          setMode('dashboard'); //bring user to dashboard page if sign in complete
        });
    } catch (error: unknown) {
      setError((error as Error).message);
    }
  };

  //use filereader to show thumbnail of pic
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Read the selected file and display it as a thumbnail
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const thumbnail = event.target.result;
          setProfilePictureThumbnail(thumbnail as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const [profilePictureThumbnail, setProfilePictureThumbnail] = useState<
    string | null
  >(null);

  return (
    <Card className="rounded-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
        {error && ( // Conditional rendering of error message
          <div className="text-red-500 text-center mt-2">{error}</div>
        )}
      </CardHeader>
      <CardContent className="grid gap-1">
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            ref={firstNameRef}
            id="firstName"
            type="text"
            placeholder="First Name"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            ref={lastNameRef}
            id="lastName"
            type="text"
            placeholder="Last Name"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor="profilePicture">Profile Picture</Label>
          <Input
            ref={profilePictureRef}
            id="profilePicture"
            type="file"
            accept=".png, .jpg, .jpeg"
            required
            onChange={handleProfilePictureChange}
          />
        </div>
        {profilePictureThumbnail && (
          <div>
            <Label>Profile Picture Thumbnail</Label>
            <img
              src={profilePictureThumbnail}
              alt="Profile Thumbnail"
              className="max-w-xs h-auto"
            />
          </div>
        )}

        <div className="h-4" />

        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            ref={emailRef}
            id="email"
            type="email"
            placeholder="name@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a Password"
            ref={passwordRef}
          />
        </div>
        <Button disabled={loading} onClick={handleSignUp} className="w-full">
          Sign Up with Email
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
          <a onClick={() => setMode('signin')}>
            Already Have an Account? Log In!
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
