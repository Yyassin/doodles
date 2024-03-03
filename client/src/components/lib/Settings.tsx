import React, { useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { generateImageUrl } from '@/views/SignUpPage';
import { generateRandId } from '@/lib/bytes';
import { Button } from '../ui/button';
import { useAuthStore } from '@/stores/AuthStore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from '@/firebaseDB/firebase';
import { REST } from '@/constants';
import axios from 'axios';

/**
 * It is the setting page, allows users to change some params
 * @author Zakariyya Almalki
 */

export const Settings = () => {
  const profilePictureRef = useRef<HTMLInputElement | null>(null);
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const { updateUser } = useAuthStore(['updateUser']);

  const { userFirstName, userLastName, userPicture, userID } = useAuthStore([
    'userFirstName',
    'userLastName',
    'userPicture',
    'userID',
  ]);

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

  const handleUpdateUserInfo = async () => {
    try {
      const pictureId = generateRandId();
      const profilePic = profilePictureRef.current?.files
        ? generateImageUrl(profilePictureRef.current?.files[0])
        : '';
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `profilePictures/${pictureId}.jpg`); // give the image a random id
      profilePictureRef.current?.files?.[0] &&
        uploadBytes(storageRef, profilePictureRef.current?.files[0])
          .then((snapshot) => {
            return getDownloadURL(snapshot.ref);
          })
          .catch(() => {
            alert('Error uploading');
          });
      if (profilePictureRef.current?.files?.[0]) {
        updateUser({
          userFirstName: firstNameRef.current?.value ?? '',
          userLastName: lastNameRef.current?.value ?? '',
          userPicture: (await profilePic) ?? '',
        });
        axios.put(REST.user.update, {
          id: userID,
          fields: {
            firstname: firstNameRef.current?.value ?? '',
            lastname: lastNameRef.current?.value ?? '',
            avatar: pictureId,
          },
        });
      } else {
        updateUser({
          userFirstName: firstNameRef.current?.value ?? '',
          userLastName: lastNameRef.current?.value ?? '',
        });
        axios.put(REST.user.update, {
          id: userID,
          fields: {
            firstname: firstNameRef.current?.value ?? '',
            lastname: lastNameRef.current?.value ?? '',
          },
        });
      }
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };
  const [profilePictureThumbnail, setProfilePictureThumbnail] = useState<
    string | null
  >(null);
  if (userPicture.includes('googleuser')) {
    // Here you can return a message or a different component indicating the page is disabled
    return <div>This page is not available for Google Sign-In users.</div>;
  }
  return (
    <Card className="rounded-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Update Account Information</CardTitle>
        <CardDescription>Edit Account Information Below</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor="firstName">Enter New First Name</Label>
          <Input
            id="firstName"
            type="text"
            defaultValue={userFirstName}
            ref={firstNameRef}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor="lastName">Enter New Last Name</Label>
          <Input
            id="lastName"
            type="text"
            defaultValue={userLastName}
            ref={lastNameRef}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor="profilePicture">Upload New Profile Picture</Label>
          <Input
            ref={profilePictureRef}
            id="profilePicture"
            type="file"
            accept=".png, .jpg, .jpeg"
            onChange={handleProfilePictureChange}
          />
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
        </div>
      </CardContent>
      <CardFooter>
        <div className="">
          <Button onClick={handleUpdateUserInfo}>Save</Button>
        </div>
      </CardFooter>
    </Card>
  );
};
