export interface Schedule {
  id: string;
  title: string;
  content?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  category: string;
  emoji?: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  category: string;
  completed: boolean;
  emoji?: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  folderId: string;
}

export interface Folder {
  id: string;
  name: string;
  isDefault: boolean;
  notes: Note[];
}

export interface UserData {
  accessCode: string;
  schedules: Schedule[];
  todos: Todo[];
  folders: Folder[];
  categories: string[];
}

export interface CategoryColors {
  [category: string]: {
    backgroundColor: string;
    textColor: string;
  };
} 