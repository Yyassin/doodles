import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TrashIcon } from '@radix-ui/react-icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/misc';
import { useAuthStore } from '@/stores/AuthStore';
import { useCommentsStore, Comment } from '@/stores/CommentsStore';
import axios from 'axios';
import { REST } from '@/constants';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { useAppStore } from '@/stores/AppStore';
import { idToColour } from '@/lib/userColours';

/**
 * Defines a CommentsSheetContent component that displays the comments of a board, and allows the user to add a comment or like existing ones.
 * @author Yousef Yassin
 */

/**
 * A filled thumbs up liking icon, used
 * if the user has liked a comment.
 */
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

/**
 * An outlined thumbs up liking icon, used
 * if the user has not liked a comment.
 */
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

const CommentsSheetContent = () => {
  const { userFirstName, userLastName, userPicture, userID } = useAuthStore([
    'userFirstName',
    'userLastName',
    'userPicture',
    'userID',
  ]);
  const { socket, setWebsocketAction } = useWebSocketStore([
    'socket',
    'setWebsocketAction',
  ]);
  const { boardMeta, setBoardMeta, updateCanvas } = useCanvasBoardStore([
    'boardMeta',
    'setBoardMeta',
    'updateCanvas',
  ]);
  const [textInput, setTextInput] = useState('');
  const {
    selectedElementIds,
    allIds,
    types,
    strokeColors,
    fillColors,
    fontFamilies,
    fontSizes,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    freehandPoints,
    p1,
    p2,
    textStrings,
    isImagePlaceds,
    freehandBounds,
    angles,
    fileIds,
  } = useCanvasElementStore([
    'selectedElementIds',
    'allIds',
    'types',
    'strokeColors',
    'fillColors',
    'fontFamilies',
    'fontSizes',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'freehandPoints',
    'p1',
    'p2',
    'textStrings',
    'isImagePlaceds',
    'freehandBounds',
    'angles',
    'fileIds',
  ]);
  const { comments, updateComment, addComment, removeComment, setComments } =
    useCommentsStore([
      'comments',
      'updateComment',
      'addComment',
      'removeComment',
      'setComments',
    ]);

  const { isViewingComments } = useAppStore(['isViewingComments']);

  useEffect(() => {
    socket?.on('addComment', (msg) => {
      const { elemID, comment } = (
        msg as { payload: { elemID: string; comment: Comment } }
      ).payload;
      selectedElementIds[0] === elemID &&
        isViewingComments &&
        addComment(comment);
    });

    socket?.on('removeComment', (msg) => {
      const { elemID, comment } = (
        msg as { payload: { elemID: string; comment: Comment } }
      ).payload;
      selectedElementIds[0] === elemID &&
        isViewingComments &&
        removeComment(comment.uid);
    });

    socket?.on('updateComment', (msg) => {
      const { elemID, comment } = (
        msg as { payload: { elemID: string; comment: Comment } }
      ).payload;
      selectedElementIds[0] === elemID &&
        isViewingComments &&
        updateComment(comment);
    });
  }, [socket, isViewingComments, selectedElementIds]);

  useEffect(() => {
    const getComments = async () => {
      const comments = await axios.get(REST.comment.getComments, {
        params: { elemID: selectedElementIds[0], collabID: boardMeta.collabID },
      });
      setComments(
        comments.data.comments.map((comment: Comment) => ({
          ...comment,
          collabId: comment.outlineColor,
          // Outline colour is the collaborator id
          outlineColor: `${idToColour(comment.outlineColor)}`,
        })),
      );
    };

    isViewingComments && selectedElementIds.length === 1 && getComments();
  }, [selectedElementIds, isViewingComments]);

  const isOwner =
    boardMeta.users.find((user) => user.collabID === boardMeta.collabID)
      ?.permission === 'owner';

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="bg-[#9493D3] text-left p-[1.5rem]">
        <SheetTitle className="text-white">Comments</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col p-[1.5rem] h-full max-h-full overflow-y-scroll">
        {comments.map((comment) => (
          <div
            key={`${comment.username}-${comment.time}`}
            className="flex flex-row gap-4"
          >
            <Avatar
              style={{
                border: `0.2rem solid ${comment.outlineColor ?? 'white'}`,
              }}
            >
              <AvatarImage
                src={boardMeta.collaboratorAvatars[comment.collabId] ?? ''}
              />
              <AvatarFallback>{comment.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col select-none">
              <p className="text-sm font-semibold text-white pb-[0.25rem]">
                {comment.username}
              </p>
              <p className="text-xs text-[#ffffff80] pb-[0.75rem]">
                {comment.time}
              </p>
              <p className="text-sm font-normal text-white pb-[0.5rem]">
                {comment.comment}
              </p>
              <div className="flex flex-row pb-[2rem] gap-2">
                <div
                  onClick={() => {
                    // Copy to maintain immutability and add a like.
                    const newLike = (comment.likes += !comment.isLiked
                      ? 1
                      : -1);
                    updateComment({
                      uid: comment.uid,
                      likes: newLike,
                      isLiked: !comment.isLiked,
                    });
                    axios.put(REST.comment.update, {
                      commentID: comment.uid,
                      userID: userID,
                      boardID: boardMeta.id,
                      action: !comment.isLiked ? 'add' : 'remove',
                    });

                    setWebsocketAction(
                      {
                        comment: {
                          uid: comment.uid,
                          likes: newLike,
                        },
                        elemID: selectedElementIds[0],
                      },
                      'updateComment',
                    );
                  }}
                >
                  {comment.isLiked ? (
                    <LikeFilledIcon className="cursor-pointer" />
                  ) : (
                    <LikeOutlineIcon className="cursor-pointer" />
                  )}
                </div>

                <p className="text-sm font-normal text-white pb-[0.5rem]">
                  {comment.likes}
                </p>
              </div>
            </div>
            {(isOwner || boardMeta.collabID === comment.collabId) && (
              <Button
                className="p-0 h-7 w-15 bg-[#7f7dcf] hover:text-red-600 hover:bg-[#7f7dcf]"
                onClick={() => {
                  removeComment(comment.uid);
                  axios.delete(REST.comment.delete, {
                    params: { id: comment.uid },
                  });

                  setWebsocketAction(
                    {
                      comment: { uid: comment.uid },
                      elemID: selectedElementIds[0],
                    },
                    'removeComment',
                  );
                }}
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <SheetFooter className="justify-end bg-[#9493D3] p-4 ">
        <div className="w-full flex flex-row items-center">
          <textarea
            className="w-full h-24 p-2 bg-[#ffffff00] text-white placeholder-gray-100 border-none outline-none focus:none resize-none"
            placeholder="Write a comment"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <Button
            className="bg-white hover:bg-gray-200 text-[#9493D3]"
            disabled={textInput.length === 0}
            onClick={async () => {
              const state = {
                allIds,
                types,
                strokeColors,
                fillColors,
                fontFamilies,
                fontSizes,
                bowings,
                roughnesses,
                strokeWidths,
                fillStyles,
                strokeLineDashes,
                opacities,
                freehandPoints,
                p1,
                p2,
                textStrings,
                isImagePlaceds,
                freehandBounds,
                angles,
                fileIds,
              };

              const updated = await axios.put(REST.board.updateBoard, {
                id: boardMeta.id,
                fields: { serialized: state },
              });
              setBoardMeta({ lastModified: updated.data.updatedAt });
              updateCanvas(boardMeta.id, updated.data.updatedAt);
              setWebsocketAction(
                {
                  boardID: boardMeta.id,
                  lastModified: updated.data.updatedAt,
                },
                'updateUpdatedTime',
              );

              const comment = await axios.post(REST.comment.create, {
                elemID: selectedElementIds[0],
                commentText: textInput,
                userID: userID,
                boardID: boardMeta.id,
              });

              const newComment: Comment = {
                uid: comment.data.comment.uid,
                username: `${userFirstName} ${userLastName}`,
                avatar: userPicture,
                time: comment.data.comment.createdAt,
                comment: comment.data.comment.comment,
                likes: 0,
                initials: getInitials(`${userFirstName} ${userLastName}`),
                outlineColor: `${idToColour(boardMeta.collabID)}`,
                collabId: boardMeta.collabID,
                isLiked: false,
              };

              addComment(newComment);
              setTextInput('');
              setWebsocketAction(
                { comment: newComment, elemID: selectedElementIds[0] },
                'addComment',
              );
            }}
          >
            Send
          </Button>
        </div>
      </SheetFooter>
    </div>
  );
};

export default CommentsSheetContent;
