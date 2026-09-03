// 要提交的数据类型
export declare type JobApplyForFrom = {
  id?: string; // 作业申请id
  workType: string | number; // 作业类型
  start?: string[]; //时间数组
  applicationUnit?: string; // 申请单位
  applicant?: string; //  申请人
  applicantName?: string;
  startTime?: string; // 作业实施开始时间
  endTime?: string; // 作业实时结束时间
  workUnit?: string; //  作业单位
  workUnitGuardian?: string; // 作业单位监护人
  possibleDanger?: string | Array<string>; //  危险辨识
  possibleDangers?: string | Array<string>; //  危险辨识
  securityMeasuresIds?: string | Array<string>; // 安全措施
  workSecurityMeasuresList?: Array<any>; // 安全措施
  otherSecurityMeasures?: string; // 其他安全措施
  workLocation?: string; // 作业地点/吊装地点
  workContent?: string; // 作业内容/吊装内容
  workHeight?: number | string; // 作业高度
  workGrade?: string | null; // 作业等级
  operator?: string; // 作业人(动火执行人)  登高作业人/动火执行人/作业人
  otherWork?: string | Array<string>; // 涉及的其他作业
  otherWorkCode?: string | Array<string>; // 涉及的其他特殊作业安全作业证编号
  hoistingToolName?: string; // 吊装工具名称
  hoistingWeight?: number; // 吊装重物质量
  hoistingLevel?: string; // 吊装级别
  hoistingIdNumber?: string; // 吊装人员机证件号
  hoistingCommander?: string; // 吊装指挥及证件号
  limitSpaceOriginalMedium?: string; // 有限空间内原有介质
  workUnitHead?: string; // 作业单位负责人
  limitSpaceUnit?: string; // 有限空间所属单位
  limitSpaceName?: string; // 有限空间名称
  limitSpaceCode?: string; // 有限空间编号
  workRange?: string; // 作业范围(动火区域)
  annexUrl?: string; // 附件地址
  operateMethod?: string | Array<string>; // 动土方式(动火方式)  动土方式/动火方式
  consumerInfo?: string; // 用电设备名称及额定功率
  constructionUnit?: string; // 施工单位
  constructionUnitFireWatch?: string; // 施工单位看火人
  hotWorkLevel?: string; // 动火级别
  constructionPosition?: string; // 施工部位
  entrustedProjectLeader?: string; // 委托项目负责人
  sceneHead?: string; // 现场负责人
  fireWatch?: string; // A级动火监查科看火人
  validityPeriod?: []; // 有效期[];
  reviewImg?: string; // 审批图片
  locationMarker?: any;
  territoryFireWatch?: string;
  locationMarkers?: string;
  workTeam?: string;
  cardFlag?: string; // 动火 是否有证
  delayedMark?: {
    workApplyId?: string; // 作业id
    workDelayExamineId?: string;
    // 延时审批id
    applicant?: string;
    // 申请人
    applicationTime?: string;
    //申请时间
    delayTime?: string;
    // 延时时间
    delayReason?: string;
    // 延时原因
    workExamineInfo?: {
      // 详情
      nodeName?: string;
      // 节点名称
      nodeTime?: string;
      // 审批时间
      nodeNumber?: number;
      // 节点序号
      reviewComments?: string;
      // 审核意见
      nodeOperator?: string;
      // 节点操作人
      state?: string;
    }[];
  }[]; // 延期标记
  workExamineNodeList?: {
    sort: number;
    node: string;
    nodeOperator: string;
    nodeTime: string;
    state?: string;
  }[];
  validityPeriodStartTime?: string; // 有效期开始时间
  validityPeriodEndTime?: string; // 有效期结束时间
  firePrevention?: string; // 防火措施
  workStartTime?: string;
  workEndTime?: string;
  workAnalysis?: {
    // 分析
    ids: string; //渲染页面编号
    id?: string; // 分析编号
    analyst?: string; // 分析人
    analysisSite?: string; // 分析部位
    analysisTime?: string; // 分析时间
    oxygenContent?: string; // 氧含量
    gas?: string; // 可燃气体
    toxicHarmfulMedia?: string; // 有毒有害介质
  }[];
  workExamine?: Array<{
    //审批节点
    id?: string;
    nodeName?: string; // 节点名称
    nodeNumber?: number; // 节点序号
    type?: string; // 节点类型
    disabled?: boolean; //是否禁用
    state?: string;
    workExamineInfo?: {
      // 详情
      nodeOperator?: string; // 节点操作人
      id: string; // 审批信息项编号
      nodeOperatorName?: string; // 节点操作人名称
      operatorContent?: string; // 操作内容
      nodeTime?: string; // 节点时间
    }[];
    workExamineInfoList?: Array<{
      nodeOperator?: string; // 节点操作人
      id: string; // 审批信息项编号
      nodeOperatorName?: string; // 节点操作人名称
      operatorContent?: string; // 操作内容
    }>;
  }>;
  examineList?: any;
  reviewComments?: string; // 审批意见
  operatorName?: string; // 审批人
  workExamineId?: string; // 审批编号
  sign?: string; // 签字
  nodeOperator?: string; // 节点操作人
  examineInfoList?: {
    nodeName?: string; // 节点名称
    id?: string; // 节点编号
    nodeOperator?: string; // 节点操作人
    examineInfoItemList?: {
      id: string; // 审批信息项编号
      reviewComments: string; // 审批意见
      reviewImg: string; // 审批图片
      nodeOperator: string; // 节点操作人
      operatorName: string; // 审批人
      sign: string; // 签字
      electrician?: string; // 电工
      electricianCardCode?: string; // 电工证件号
      voltage?: string; // 电压
      electricityIntakeArea?: string; // 电流吸收面积
    }[]; // 审批信息项
  }[];
  operatorList?: Array<any>; 
};

// 搜索表格数据类型
export declare type searchJobList = {
  state?: string;
  workType?: string;
  workApplyId?: string;
  workApplyCode?: string;
  applicationUnit?: string;
  applicant?: string;
  start?: string[];
  startTime?: string;
  endTime?: string;
  pageNo?: number;
  pageSize?: number;
};
export declare type searchJobType = {
  workType: string;
  value?: string;
};
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
