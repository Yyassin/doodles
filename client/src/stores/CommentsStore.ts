import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Define Global comment states and reducers
 * @author Abdalla Abdelhadi
 */

/** Boards blueprint */
export interface Comment {
  uid: string;
  collabId: string;
  username: string;
  avatar: string;
  time: string;
  comment: string;
  likes: number;
  initials: string;
  outlineColor: string;
  isLiked: boolean;
}

/** Definitions */
interface CommentsState {
  comments: Comment[];
}

interface CommentsActions {
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  removeComment: (id: string) => void;
  updateComment: (newComment: Partial<Comment>) => void;
}

type CommentsStore = CommentsActions & CommentsState;

// Initialize CanvasBoard State to default state.
export const initialCommentsState: CommentsState = {
  comments: [],
};

/** Actions / Reducers */
const setComments = (set: SetState<CommentsStore>) => (comments: Comment[]) =>
  set(() => ({
    comments: comments.sort((a, b) => {
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);

      return timeA.getTime() - timeB.getTime();
    }),
  }));

const addComment = (set: SetState<CommentsStore>) => (comment: Comment) =>
  set((state) => {
    const comments = [...state.comments, comment];

    return { comments };
  });

const removeComment = (set: SetState<CommentsStore>) => (id: string) =>
  set((state) => {
    const comments = state.comments.filter((comment) => comment.uid !== id);

    return { comments };
  });

const updateComment =
  (set: SetState<CommentsStore>) => (newComment: Partial<Comment>) =>
    set((state) => {
      const comments = state.comments.map((comment) =>
        comment.uid === newComment.uid
          ? { ...comment, ...newComment }
          : comment,
      );

      return { comments };
    });

/** Store Hook */
const CommentsStore = create<CommentsStore>()((set) => ({
  ...initialCommentsState,
  setComments: setComments(set),
  addComment: addComment(set),
  removeComment: removeComment(set),
  updateComment: updateComment(set),
}));
export const useCommentsStore = createStoreWithSelectors(CommentsStore);
