export interface UserInfo {
  code: number,
  nickname: string
}

export interface BoardAndPostId {
  boardId: string,
  postId: number
}

export interface Board {
  boardId: string,
  boardName: string,
  subBoardId: string | null,
  subBoardName: string | null,
  categoryList: {
    [index: string]: Category
  },
  postPermission: boolean,
  commentPermission: boolean
}

export interface Category {
  id: string,
  name: string
}

export interface Post {
  id: number,
  user: UserInfo,
  category: string | null,
  title: string,
  createdAt: string,
  view: number,
  totalComments: number,
  totalLikes: number
}

export interface DetailPost extends Post {
  content: string,
  permission: boolean,
  myLike: number,
  anonymous: boolean
}

export interface BoardListRes extends Omit<Board, 'categoryList'> {
  categoryList: Category[]
}

export interface PostListRes {
  postList: Post[],
  totalPages: number,
  page: number,
  limit: number
}

export interface Comment {
  id: number,
  user: {
    code: number,
    nickname: string
  },
  content: string,
  createdAt: string,
  permission: boolean,
  depth: number,
  delete: false,
  child?: (Comment | DeletedComment)[]
}

export interface DeletedComment {
  id: number,
  depth: number,
  delete: true
  child?: (Comment | DeletedComment)[]
}

export interface Emoticon {
  id: number,
  name: string,
  description: string,
  createdAt: string
}

export interface EmoticonItem {
  idx: number,
  type: string
}