import React, { useState } from 'react';
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
import { User } from '@/stores/WebSocketStore';

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
  users: User[];
}) => {
  /* Controls visibility of the addition input. */
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

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
            <Button className="bg-[#818cf8] hover:bg-[#6c75c1]">
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
            />
            <Select>
              <SelectTrigger className="w-[6rem]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#818cf8] hover:bg-[#6c75c1]">Confirm</Button>
          </div>
        )}
        {/* The user list */}
        <div className="flex flex-wrap justify-center gap-4 overflow-y-scroll max-h-60 p-[1rem]">
          {users.map((user) => (
            <div key={user.email} className="flex flex-row gap-4 w-[100%]">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-row w-[100%] justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-black">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Select>
                  <SelectTrigger className="w-[6rem]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
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
