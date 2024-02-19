import { getStorage, ref, deleteObject } from 'firebase/storage';
import { firebaseApp } from '../../firebaseDB/firebase';

/**
 * Is used by context menu option to delete attatched files from
 * firebase before they are removed from state
 * @author Dana El Sherif
 */

function deleteFilefromFirebase(downloadURL: string) {
  const storage = getStorage(firebaseApp);

  const decodedUrl = decodeURIComponent(downloadURL);
  const pathRegex = /\/o\/(.+?)\?/;
  const matches = decodedUrl.match(pathRegex);

  if (!matches || matches.length < 2) {
    console.error('Invalid URL');
    return;
  }
  const filePath = matches[1];
  const fileRef = ref(storage, filePath);
  deleteObject(fileRef)
    .then(() => {
      console.log('File deleted successfully'); //Will replace with toast next sprint
    })
    .catch((error) => {
      console.error('Error deleting file: ', error); //Will replace with toast next sprint
    });
}

export default deleteFilefromFirebase;
