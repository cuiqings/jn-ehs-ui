//下拉框类型
export declare type selectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  key?: string;
  children?: Array<selectOption>;
  isLeaf?: boolean;
  selectable?: boolean;
};
//卡片数据类型
export declare type CardList = {
  applicantName: string;
  applicationTimeStr: string;
  applicationUnitName: string;
  id: string;
  mark?: string;
  workApplyCode: string;
  workGrade: string;
  workTypeName: string;
  delayedMark?: string;
  timeoutMark?: string;
  workStopMark?: string;
  workExamineId?: string;
  consumerInfo?: string;
  workStartTime?: string;
  workEndTime?: string;
};
