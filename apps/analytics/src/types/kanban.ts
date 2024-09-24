export interface KanbanStateProps {
  selectedItem: string | false;
}

export type KanbanColumn = {
  id: string;
  title: string;
  itemIds: string[];
};

export type KanbanComment = {
  id: string;
  comment: string;
  profileId: string;
};

export type KanbanItem = {
  assign?: string | null;
  attachments: [];
  commentIds?: string[];
  description: string;
  dueDate: Date;
  id: string;
  image: string | false;
  priority: 'low' | 'medium' | 'high';
  title: string;
};

export type KanbanProfile = {
  id: string;
  name: string;
  avatar: string;
  time: string;
};

export type KanbanUserStory = {
  acceptance: string;
  assign?: string;
  columnId: string;
  commentIds?: string[];
  description: string;
  dueDate: Date;
  id: string;
  itemIds: string[];
  title: string;
  priority: string;
};
