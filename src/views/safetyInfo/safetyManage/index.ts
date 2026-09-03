export interface treeList {
  data: treeList[];
  date: string;
  downCount: number;
  id: string;
  isFolder?: string;
  open: boolean;
  readCount: number;
  size: number;
  type: string;
  value: string;
  isLeaf?: boolean;
  class?: string;
  identifying: string;
}
export interface logTableType {
  id: null | number | string;
  userId: null | number | string;
  operateType: string;
  operateTime: string;
  userIp: null | number | string;
  docId: null | number | string;
}
