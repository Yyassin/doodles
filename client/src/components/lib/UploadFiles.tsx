import React, { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from '../../firebaseDB/firebase';

/**
 * Defines a context menu option that allows users to upload
 * file to firebase
 * @author Dana El Sherif
 */

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const fileToUpload = files ? files[0] : null;
    setFile(fileToUpload);

    if (fileToUpload) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `uploads/${fileToUpload.name}`);
      uploadBytes(storageRef, fileToUpload)
        .then((snapshot) => {
          console.log('Uploaded file', snapshot);
          alert('File uploaded successfully');
          return getDownloadURL(snapshot.ref);
        })
        .then((downloadURL) => {
          console.log('Download URL is', downloadURL);
        })
        .catch((error) => {
          console.error('Upload failed', error);
          alert('Error uploading');
        });
    }
  };

  return (
    <div className="ml-auto pl-5 text-violet-500 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
      <input type="file" onChange={onFileChange} />
    </div>
  );
};

export default FileUpload;
