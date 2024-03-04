import React from 'react';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from '../../firebaseDB/firebase';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useToast } from '@/components/ui/use-toast';

const FileUpload = () => {
  const { selectedElementIds, updateAttachedFileUrl } = useCanvasElementStore([
    'selectedElementIds',
    'updateAttachedFileUrl',
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const fileToUpload = files ? files[0] : null;

    if (fileToUpload !== null && selectedElementIds.length > 0) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `uploads/${fileToUpload.name}`);
      uploadBytes(storageRef, fileToUpload)
        .then((snapshot) => {
          toast({
            title: 'Success',
            description: 'File uploaded successfully',
          });
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
          toast({
            title: 'Error',
            description: 'Error uploading file',
          });
        });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="ml-auto pl-6 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
      <input
        type="file"
        onChange={onFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <span
        onClick={triggerFileInput}
        className="cursor-pointer text-[13px] leading-none text-violet-500"
      >
        Choose File
      </span>
    </div>
  );
};

export default FileUpload;
