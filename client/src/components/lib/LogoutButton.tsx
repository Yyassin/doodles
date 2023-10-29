import React, { useState } from 'react';
import { useAppStore } from '@/stores/AppStore';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '../../firebaseDB/firebase';
import { Button } from '@/components/ui/button';

/**
 * It is the LogOut button component that allows users to log out
 * @author Zakariyya Almalki
 */

function logOut() {
  return signOut(getAuth(firebaseApp));
}

export default function LogoutButton() {
  const { setMode } = useAppStore(['setMode']);
  const [error, setError] = useState('');

  const handleLogOut = async () => {
    setError('');
    try {
      await logOut();
      setMode('signin'); // if logout works, bring back to sign in page
    } catch (error: unknown) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="absolute top-0 right-0 mt-4 mr-4">
      <Button variant="destructive" onClick={handleLogOut}>
        Log Out
      </Button>
      {error && <div className="text-red-500 mt-2 text-sm">Error: {error}</div>}
    </div>
  );
}
