type Param = {
  created_at: string;
};

export const sortByCreatedAt = (a: Param, b: Param) =>
  new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
