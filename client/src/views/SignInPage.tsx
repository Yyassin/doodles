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
import {
  useCanvasBoardStore,
  Canvas,
  SharedUser,
} from '@/stores/CanavasBoardStore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { createStateWithRoughElement } from '@/components/lib/BoardScroll';
import {
  CanvasElement,
  CanvasElementState,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { commitImageToCache, getImageDataUrl } from '@/lib/image';
import { BinaryFileData } from '@/types';

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

export async function fetchImageFromFirebaseStorage(
  storageUrl: string,
): Promise<string | null> {
  try {
    // Create a reference to the Firebase Storage URL
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, storageUrl);

    return getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error fetching image from Firebase Storage:', error);
    return null;
  }
}
export async function getUserDetails(
  email: string,
  setUser: (
    userFirstName: string,
    userLastName: string,
    userEmail: string | null,
    userPicture: string,
    userID: string,
  ) => void,
  setCanvases: (canvases: Canvas[]) => void,
  setBoardMeta: (
    meta: Partial<{
      title: string;
      id: string;
      lastModified: string;
      roomID: string;
      shareUrl: string;
      folder: string;
      tags: string[];
      collabID: string;
      users: SharedUser[];
      permission: string;
    }>,
  ) => void,
  setCanvasElementState: (element: CanvasElementState) => void,
  editCanvasElement: (
    id: string,
    partialElement: Partial<CanvasElement>,
    isLive?: boolean | undefined,
  ) => void,
) {
  try {
    const user = await axios.get(REST.user.get, {
      params: { email },
    });

    const userID = user.data.user.uid;
    // If it's a google image, don't fetch anything.
    const profilePic = (user.data.user.avatar ?? '').includes('https')
      ? user.data.user.avatar
      : await fetchImageFromFirebaseStorage(
          `profilePictures/${user.data.user.avatar}.jpg`, //use the id generated when signing up
        );
    setUser(
      user.data.user.firstname ?? '',
      user.data.user.lastname ?? '',
      user.data.user.email ?? '',
      profilePic ?? '',
      user.data.user.uid ?? '',
    );

    return await checkURL(
      userID,
      setCanvases,
      setBoardMeta,
      setCanvasElementState,
      editCanvasElement,
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

export const checkURL = async (
  userID: string,
  setCanvases: (canvases: Canvas[]) => void,
  setBoardMeta: (
    meta: Partial<{
      title: string;
      id: string;
      lastModified: string;
      roomID: string;
      shareUrl: string;
      folder: string;
      tags: string[];
      collabID: string;
      users: SharedUser[];
      permission: string;
      collaboratorAvatarUrls: Record<string, string>;
    }>,
  ) => void,
  setCanvasElementState: (element: CanvasElementState) => void,
  editCanvasElement: (
    id: string,
    partialElement: Partial<CanvasElement>,
    isLive?: boolean | undefined,
  ) => void,
  signUp = false,
) => {
  const queryParams = new URLSearchParams(window.location.search);
  let isSharedCanvas = false;
  let board;

  if (queryParams.get('boardID')) {
    try {
      board = await axios.put(REST.board.updateBoard, {
        id: queryParams.get('boardID'),
        fields: { collaborators: userID },
      });

      console.log('users ', board.data.users);
      console.log('permissions', board.data.permission);
      console.log(board);

      const collaboratorAvatarMeta = (
        await axios.put(REST.collaborators.getAvatar, {
          collaboratorIds: board.data.collaborators,
        })
      ).data.collaborators;
      const collaboratorAvatarUrls = await Promise.all(
        Object.entries(
          collaboratorAvatarMeta as {
            id: string;
            avatar: string;
          },
        ).map(async ([id, avatar]) => ({
          id,
          avatar: (avatar ?? '').includes('https')
            ? avatar
            : await fetchImageFromFirebaseStorage(
                `profilePictures/${avatar}.jpg`,
              ),
        })),
      );
      const collaboratorAvatarUrlsMap = collaboratorAvatarUrls.reduce(
        (acc, { id, avatar }) => {
          id && avatar && (acc[id] = avatar);
          return acc;
        },
        {} as Record<string, string>,
      ) as Record<string, string>;

      setBoardMeta({
        roomID: board.data.roomID,
        title: board.data.title,
        id: board.data.uid,
        lastModified: board.data.updatedAt,
        shareUrl: board.data.shareUrl,
        folder: board.data.folder,
        tags: board.data.tags,
        collabID: board.data.collabID,
        users: board.data.users,
        permission: board.data.permission,
        collaboratorAvatarUrls: collaboratorAvatarUrlsMap,
      });

      // Fetch images from firebase storage
      Object.entries(board.data.serialized.fileIds).forEach(
        async ([elemId, fileId]) => {
          const imageUrl = await fetchImageFromFirebaseStorage(
            `boardImages/${fileId}.jpg`,
          );
          const dataUrl = imageUrl && (await getImageDataUrl(imageUrl));
          if (!dataUrl)
            throw new Error('Failed to resolve saved image dataurls');

          const binary = {
            dataURL: dataUrl,
            id: fileId,
            mimeType: 'image/jpeg',
          } as BinaryFileData;

          const imageElement = { id: elemId };
          commitImageToCache(
            {
              ...binary,
              lastRetrieved: Date.now(),
            },
            imageElement,
            // Will set fileIds, triggering a rerender. A placeholder
            // will be shown in the mean time.
            editCanvasElement,
          );
        },
      );

      setCanvasElementState(createStateWithRoughElement(board.data.serialized));
      isSharedCanvas = true;
    } catch (e: unknown) {
      console.log(e);
    }

    //remove variable from url
    const currentUrl = window.location.href;
    const queryStringIndex = currentUrl.indexOf('?');
    const updatedUrl = currentUrl.slice(0, queryStringIndex);
    window.history.replaceState({}, document.title, updatedUrl);
  }

  if (!signUp) {
    const response = await axios.get(REST.board.getBoards, {
      params: { userID },
    });

    const userBoards: Canvas[] = response.data.boards;
    setCanvases(userBoards);
  } else if (signUp && isSharedCanvas) {
    const canvas = { ...board?.data };
    canvas.id = canvas.uid;

    delete canvas.uid;
    delete canvas.serialized;
    setCanvases([canvas]);
  }
  return isSharedCanvas;
};

export default function SignInPage() {
  const { setMode } = useAppStore(['setMode']);
  const { setUser } = useAuthStore(['setUser']);
  const { setCanvases, setBoardMeta } = useCanvasBoardStore([
    'setCanvases',
    'setBoardMeta',
  ]);
  const { setCanvasElementState, editCanvasElement } = useCanvasElementStore([
    'setCanvasElementState',
    'editCanvasElement',
  ]);
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
      const isSharedCanvas = (
        await getUserDetails(
          emailRef.current?.value ?? '',
          setUser,
          setCanvases,
          setBoardMeta,
          setCanvasElementState,
          editCanvasElement,
        )
      )?.valueOf(); //get name, email, avatar of user

      localStorage.setItem(
        ACCESS_TOKEN_TAG,
        await signInToken.user.getIdToken(),
      );

      setMode(isSharedCanvas ? 'canvas' : 'dashboard'); //bring user to dashboard page if sign in complete
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
        .then(async (response) => {
          const userID = response.data.user.uid;

          setUser(
            googleSignInToken.user.displayName ?? '',
            '',
            googleSignInToken.user.email ?? '',
            googleSignInToken.user.photoURL ?? '', // add image implementation when API is done
            userID,
          );
          localStorage.setItem(
            ACCESS_TOKEN_TAG,
            await googleSignInToken.user.getIdToken(),
          );

          const isSharedCanvas = (
            await checkURL(
              userID,
              setCanvases,
              setBoardMeta,
              setCanvasElementState,
              editCanvasElement,
            )
          ).valueOf();

          setMode(isSharedCanvas ? 'canvas' : 'dashboard'); //bring user to dashboard page if sign in complete
        })
        .catch(() => {
          setError('Email is not associated with an Account. Sign Up First!');
        });
    } catch (error: unknown) {
      setError((error as Error).message);
    }
  };

  return (
    <Card className="rounded-none border-none shadow-none">
      <CardHeader className="space-y-1">
        <div className="flex">
          <img
            className="w-[12rem] h-[auto]"
            src="./doodles-icon.png"
            alt="logo"
          />
        </div>
        <CardTitle className="text-2xl text-[#98a2e3]">Log In</CardTitle>
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
        <Button
          disabled={loading}
          onClick={handleSignUp}
          className="w-full mt-6 bg-[#98a2e3] hover:bg-[#7f8cd9]"
        >
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
        <div className="w-100 text-center mt-2 select-none text-[#98a2e3]">
          Need an Account?{' '}
          <span
            className="hover:underline hover:cursor-pointer"
            onClick={() => setMode('signup')}
          >
            Sign Up Here!
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
