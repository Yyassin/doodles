import React from 'react';
import { Button } from '@/components/ui/button';
import {
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { unixToFormattedDate } from '@/lib/misc';

const LikeFilledIcon = ({ className }: { className: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_13_473)">
      <path
        d="M1.66671 7.5H4.16671V17.5H1.66671C1.44569 17.5 1.23373 17.4122 1.07745 17.2559C0.921171 17.0996 0.833374 16.8877 0.833374 16.6667V8.33333C0.833374 8.11232 0.921171 7.90036 1.07745 7.74408C1.23373 7.5878 1.44569 7.5 1.66671 7.5ZM6.07754 6.4225L11.4109 1.08917C11.4818 1.01808 11.5759 0.974974 11.6761 0.967778C11.7762 0.960582 11.8756 0.989779 11.9559 1.05L12.6667 1.58333C12.8641 1.73154 13.0132 1.93488 13.0953 2.16771C13.1773 2.40055 13.1885 2.65246 13.1275 2.89167L12.1667 6.66667H17.5C17.9421 6.66667 18.366 6.84226 18.6786 7.15482C18.9911 7.46738 19.1667 7.89131 19.1667 8.33333V10.0867C19.1669 10.3045 19.1245 10.5202 19.0417 10.7217L16.4625 16.9842C16.3996 17.1369 16.2928 17.2674 16.1555 17.3592C16.0183 17.4511 15.8568 17.5001 15.6917 17.5H6.66671C6.44569 17.5 6.23373 17.4122 6.07745 17.2559C5.92117 17.0996 5.83337 16.8877 5.83337 16.6667V7.01167C5.83342 6.79067 5.92125 6.57875 6.07754 6.4225Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_13_473">
        <rect width="20" height="20" fill="current-color" />
      </clipPath>
    </defs>
  </svg>
);

const LikeOutlineIcon = ({ className }: { className: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="white"
    strokeWidth={2}
    className={className}
  >
    <g clipPath="url(#clip0_13_473)">
      <path
        d="M1.66671 7.5H4.16671V17.5H1.66671C1.44569 17.5 1.23373 17.4122 1.07745 17.2559C0.921171 17.0996 0.833374 16.8877 0.833374 16.6667V8.33333C0.833374 8.11232 0.921171 7.90036 1.07745 7.74408C1.23373 7.5878 1.44569 7.5 1.66671 7.5ZM6.07754 6.4225L11.4109 1.08917C11.4818 1.01808 11.5759 0.974974 11.6761 0.967778C11.7762 0.960582 11.8756 0.989779 11.9559 1.05L12.6667 1.58333C12.8641 1.73154 13.0132 1.93488 13.0953 2.16771C13.1773 2.40055 13.1885 2.65246 13.1275 2.89167L12.1667 6.66667H17.5C17.9421 6.66667 18.366 6.84226 18.6786 7.15482C18.9911 7.46738 19.1667 7.89131 19.1667 8.33333V10.0867C19.1669 10.3045 19.1245 10.5202 19.0417 10.7217L16.4625 16.9842C16.3996 17.1369 16.2928 17.2674 16.1555 17.3592C16.0183 17.4511 15.8568 17.5001 15.6917 17.5H6.66671C6.44569 17.5 6.23373 17.4122 6.07745 17.2559C5.92117 17.0996 5.83337 16.8877 5.83337 16.6667V7.01167C5.83342 6.79067 5.92125 6.57875 6.07754 6.4225Z"
        fill="transparent"
      />
    </g>
    <defs>
      <clipPath id="clip0_13_473">
        <rect width="20" height="20" fill="current-color" />
      </clipPath>
    </defs>
  </svg>
);

const time = 1671880200;
const avatar = 'https://github.com/shadcn.png';
const comments = [
  {
    username: 'Zayn Malik',
    avatar,
    time,
    comment:
      'I haven’t seen it called the Sieve Principle... is that new? I’m used to calling this Inclusion-Exclusion.',
    likes: 2,
    initials: 'ZM',
    outlineColor: 'border-[#0000ff]',
    iLiked: true,
  },
  {
    username: 'Yousef Yassin',
    avatar,
    time,
    comment:
      'Ah, yea Sieve is the more modern term -- you’re right it used to be I.E., I’ll add a note below',
    likes: 1,
    initials: 'YY',
    outlineColor: 'border-[#ff0000]',
    iLiked: true,
  },
  {
    username: 'Zayn Malik',
    avatar,
    time,
    comment: 'Ah, cool. Thanks for clarifying!!',
    likes: 1,
    initials: 'ZM',
    outlineColor: 'border-[#0000ff]',
    iLiked: false,
  },
];

const CommentsSheetContent = () => {
  return (
    <div>
      <SheetHeader className="bg-[#9493D3] text-left p-[1.5rem]">
        <SheetTitle className="text-white">Comments</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col p-[1.5rem]">
        {comments.map((comment) => (
          <div
            key={`${comment.username}-${comment.time}`}
            className="flex flex-row gap-4"
          >
            <Avatar>
              <AvatarImage src={comment.avatar} />
              <AvatarFallback>{comment.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-white pb-[0.25rem]">
                {comment.username}
              </p>
              <p className="text-xs text-[#ffffff80] pb-[0.75rem]">
                {unixToFormattedDate(comment.time)}
              </p>
              <p className="text-sm font-normal text-white pb-[0.5rem]">
                {comment.comment}
              </p>
              <div className="flex flex-row pb-[2rem] gap-2">
                {comment.iLiked ? (
                  <LikeFilledIcon className="cursor-pointer" />
                ) : (
                  <LikeOutlineIcon className="cursor-pointer" />
                )}
                <p className="text-sm font-normal text-white pb-[0.5rem]">
                  {comment.likes}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <SheetFooter className="sm:justify-start pt-4">
        <SheetClose asChild>
          <Button
            onClick={async () => {
              console.log('yo');
            }}
          >
            Done
          </Button>
        </SheetClose>
      </SheetFooter>
    </div>
  );
};

export default CommentsSheetContent;
