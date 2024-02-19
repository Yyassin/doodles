import React, { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from '../../firebaseDB/firebase';
import { Link2Icon } from '@radix-ui/react-icons';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';

/**
 * Defines a context menu option that allows users to attatch a file to a
 * canvas element by uploading it to firebase
 * @author Dana El Sherif
 */
const FileUpload: React.FC = () => {
  const [, setFile] = useState<File | null>(null);
  const { selectedElementIds, updateAttachedFileUrl } = useCanvasElementStore([
    'selectedElementIds',
    'updateAttachedFileUrl',
  ]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const fileToUpload = files ? files[0] : null;
    setFile(fileToUpload);

    if (fileToUpload && selectedElementIds.length > 0) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `uploads/${fileToUpload.name}`);
      uploadBytes(storageRef, fileToUpload)
        .then((snapshot) => {
          alert('File uploaded successfully');
          return getDownloadURL(snapshot.ref);
        })
        .then((downloadURL) => {
          updateAttachedFileUrl(selectedElementIds[0], downloadURL);
        })
        .catch(() => {
          alert('Error uploading');
        });
    }
  };

  return (
    <div className="ml-auto pl-5 text-violet-500 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
      <input type="file" onChange={onFileChange} />
      <Link2Icon />
    </div>
  );
};

export default FileUpload;
