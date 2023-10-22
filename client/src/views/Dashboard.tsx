import React, { useState } from 'react';
import { useAppStore } from '@/stores/AppStore';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '../firebaseDB/firebase';
import { Button } from '@/components/ui/button';

export function logOut() {
  return signOut(getAuth(firebaseApp));
}
export default function Dashboard() {
  const { setMode } = useAppStore(['setMode']);
  const [error, setError] = useState(''); // State for error message

  const handleLogOut = async () => {
    setError('');
    try {
      await logOut();
      setMode('signin'); //bring user to dashboard page if sign in complete
    } catch (error: unknown) {
      setError((error as Error).message); //if error thrown, setState and will display on page
    }
  };

  return (
    <div>
      <h1>Dashboard dummy text</h1>
      <button onClick={() => setMode('canvas')}>Canvas</button>

      <div className="absolute top-0 right-0 mt-4 mr-4">
        <Button variant="destructive" onClick={handleLogOut}>
          Log Out
        </Button>
      </div>

      {error && <div className="text-red-500 mt-2 text-sm">Error: {error}</div>}
    </div>
  );
}
