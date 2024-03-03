import React from 'react';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from '../../firebaseDB/firebase';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';

/**
 * Defines a context menu option that allows users to attatch a file to a
 * canvas element by uploading it to firebase
 * @author Dana El Sherif
 */
const FileUpload = () => {
  const { selectedElementIds, updateAttachedFileUrl } = useCanvasElementStore([
    'selectedElementIds',
    'updateAttachedFileUrl',
  ]);
  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const fileToUpload = files ? files[0] : null;

    if (fileToUpload !== null && selectedElementIds.length > 0) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `uploads/${fileToUpload.name}`);
      uploadBytes(storageRef, fileToUpload)
        .then((snapshot) => {
          alert('File uploaded successfully');
          return getDownloadURL(snapshot.ref);
        })
        .then((downloadURL) => {
          updateAttachedFileUrl(selectedElementIds[0], downloadURL);
          setWebsocketAction(
            { selectedElementIds, downloadURL },
            'addAttachedFileUrl',
          );
        })
        .catch(() => {
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
