import React, { useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '../ui/input';
import { CopyIcon, PlusCircleIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SharedUser, useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import axios from 'axios';
import { useAppStore } from '@/stores/AppStore';
import { setCursor } from '@/lib/misc';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { REST } from '@/constants';
import { useToast } from '../ui/use-toast';
import { fetchImageFromFirebaseStorage } from '@/views/SignInPage';
import { TrashIcon } from '@radix-ui/react-icons';

/**
 * An alert dialog that is controlled by the `open` prop. It displays a list of users
 * that have access to the board, along with their permissions, and allows the user to add more users.
 * @author Yousef Yassin
 */

const ShareBoardDialog = ({
  open,
  setOpen,
  boardLink,
  users,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  boardLink: string;
  users: SharedUser[];
}) => {
  /* Controls visibility of the addition input. */
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const {
    boardMeta,
    updatePermission,
    addUser,
    updateAvatars,
    setBoardMeta,
    removeCanvas,
  } = useCanvasBoardStore([
    'boardMeta',
    'updatePermission',
    'addUser',
    'updateAvatars',
    'setBoardMeta',
    'removeCanvas',
  ]);
  const { setSelectedElements, selectedElementIds } = useCanvasElementStore([
    'setSelectedElements',
    'selectedElementIds',
  ]);
  const { setTool, setMode } = useAppStore(['setTool', 'setMode']);
  const { socket, setWebsocketAction } = useWebSocketStore([
    'socket',
    'setWebsocketAction',
  ]);
  const newUserEmail = useRef<HTMLInputElement | null>(null);
  const newUserPerm = useRef<HTMLSelectElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    socket?.on('changePermission', (msg) => {
      const { collabID, permission } = (
        msg as { payload: { collabID: string; permission: string } }
      ).payload;
      const isOwnPerm = boardMeta.collabID === collabID;
      if (isOwnPerm) setSelectedElements([]);
      updatePermission(collabID, permission, isOwnPerm);
    });

    socket?.on('removeCollab', async (msg) => {
      const collabID = (msg as { payload: string }).payload;

      if (collabID === boardMeta.collabID) {
        setMode('dashboard');
        toast({
          variant: 'destructive',
          title: `You have been removed from: ${boardMeta.title}`,
          description: 'Ask another collaborator to add you again',
        });
        removeCanvas(boardMeta.id);
        setBoardMeta({
          title: '',
          id: '',
          lastModified: '',
          roomID: '',
          shareUrl: '',
          folder: '',
          tags: [],
          collabID: '',
          users: [],
          permission: '',
        });
        return;
      }
      setBoardMeta({
        users: boardMeta.users.filter(
          (metaUser) => collabID !== metaUser.collabID,
        ),
      });
    });
  }, [socket, boardMeta.collabID, updatePermission]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share this whiteboard</AlertDialogTitle>
          <AlertDialogDescription>
            Anyone with the link can view this whiteboard
          </AlertDialogDescription>
          <div className="flex flex-row">
            <Input
              className="mr-2"
              id="board-share-link"
              placeholder="There should be a link here"
              value={boardLink}
              disabled
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(boardLink);
              }}
              className="bg-[#818cf8] hover:bg-[#6c75c1]"
            >
              <CopyIcon className="w-4" />
            </Button>
          </div>
        </AlertDialogHeader>
        <Separator className="bg-gray-200 h-[0.5px]" />
        {/* The addition input */}
        <div className="flex items-center">
          <h2 className="text-sm font-semibold text-black">
            People with access
          </h2>
          <PlusCircleIcon
            className="w-4 ml-2 cursor-pointer text-[#818cf8] hover:text-[#6c75c1]"
            onClick={() => setIsAddUserOpen(!isAddUserOpen)}
          />
        </div>
        {isAddUserOpen && (
          <div className="flex flex-row gap-4">
            <Input
              placeholder="Enter an email address or username"
              className="p-[1rem]"
              ref={newUserEmail}
            />
            <Select>
              <SelectTrigger className="w-[6rem]">
                <SelectValue placeholder="View" ref={newUserPerm} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="bg-[#818cf8] hover:bg-[#6c75c1]"
              onClick={async () => {
                const email = newUserEmail.current?.value;
                let isAlreadyShared = false;
                for (const user of boardMeta.users) {
                  if (user.email === email) {
                    isAlreadyShared = true;
                  }
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(newUserEmail.current?.value as string)) {
                  toast({
                    title: 'Oops! The email you entered is not valid.',
                    description: 'Please check and try again.',
                  });
                } else if (isAlreadyShared) {
                  toast({
                    title:
                      'Oops! This user seems to already be a Collaborator.',
                    description: 'Please try again.',
                  });
                  (newUserEmail.current as HTMLInputElement).value = '';
                } else {
                  try {
                    const response = await axios.put(REST.board.addUser, {
                      boardId: boardMeta.id,
                      email: email,
                      perm: newUserPerm.current?.textContent?.toLocaleLowerCase(),
                    });
                    (newUserEmail.current as HTMLInputElement).value = '';
                    addUser(response.data.user);
                    const avatar = (response.data.user.avatar ?? '').includes(
                      'https',
                    )
                      ? response.data.user.avatar
                      : await fetchImageFromFirebaseStorage(
                          `profilePictures/${response.data.user.avatar}.jpg`,
                        );
                    updateAvatars(response.data.user.collabID, avatar);
                    setWebsocketAction(response.data.user, 'addNewCollab');
                  } catch {
                    toast({
                      title: "Oops! We couldn't find a user with that email.",
                      description: 'Please try again.',
                    });
                  }
                }
              }}
            >
              Confirm
            </Button>
          </div>
        )}
        {/* The user list */}
        <div className="flex flex-wrap justify-center gap-4 overflow-y-scroll max-h-60 p-[1rem]">
          {users.map((user) => (
            <div key={user.email} className="flex flex-row gap-4 w-[100%]">
              <Avatar>
                <AvatarImage
                  src={boardMeta.collaboratorAvatars[user.collabID]}
                />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-row w-[100%] justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-black">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-row">
                  <Select
                    value={user.permission}
                    disabled={
                      user.permission === 'owner' ||
                      boardMeta.permission === 'view'
                    }
                    onValueChange={(value) => {
                      if (boardMeta.collabID === user.collabID) {
                        updatePermission(user.collabID, value, true);
                        setTool('pan');
                        setSelectedElements([]);
                        setCursor('');
                      } else {
                        updatePermission(user.collabID, value, false);
                      }
                      console.log(selectedElementIds);
                      setWebsocketAction(
                        { collabID: user.collabID, permission: value },
                        'changePermission',
                      );
                      axios.put(REST.collaborator.update, {
                        id: user.collabID,
                        fields: {
                          permissionLevel: value,
                        },
                      });
                    }}
                  >
                    <SelectTrigger className="w-[6rem]">
                      <SelectValue placeholder={user.permission} />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                      {user.permission === 'owner' && (
                        <SelectItem value="owner">Owner</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    className="ml-2 p-0 bg-[#ffffff] text-black hover:text-red-600 hover:bg-[#ffffff]"
                    disabled={
                      user.permission === 'owner' ||
                      user.collabID === boardMeta.collabID
                    }
                    onClick={() => {
                      const newCollabs = boardMeta.users.filter(
                        (shareUser) => user.collabID !== shareUser.collabID,
                      );
                      setBoardMeta({
                        users: newCollabs,
                      });
                      setWebsocketAction(user.collabID, 'removeCollab');

                      axios.put(REST.board.removeCollab, {
                        boardId: boardMeta.id,
                        newCollabs: newCollabs.map(
                          (shareUser) => shareUser.collabID,
                        ),
                      });
                    }}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-[#818cf8] border-[#818cf8] hover:text-[#6c75c1] hover:border-[#6c75c1]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className="bg-[#818cf8] hover:bg-[#6c75c1]">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShareBoardDialog;
