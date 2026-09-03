import type { Rule } from 'ant-design-vue/es/form';
//高处作业危险行为识别
export const upHazardIdentification: { value?: string; label?: string }[] = [
  { value: '高处坠落', label: '高处坠落' },
  { value: '火灾', label: '火灾' },
  { value: '物体打击', label: '物体打击' },
  { value: '机械伤害', label: '机械伤害' },
  { value: '触电', label: '触电' },
  { value: '灼伤', label: '灼伤' },
  { value: '中毒和窒息', label: '中毒和窒息' },
  { value: '高噪音、高温、低温', label: '高噪音、高温、低温' },
  { value: '雨雪、湿滑', label: '雨雪、湿滑' },
  { value: '其他伤害', label: '其他伤害' },
];
//有限空间作业危险行为识别
export const confinedSpacesHazardIdentification: { value?: string; label?: string }[] = [
  { value: '中毒和窒息', label: '中毒和窒息' },
  { value: '火灾', label: '火灾' },
  { value: '其他爆炸', label: '其他爆炸' },
  { value: '物体打击', label: '物体打击' },
  { value: '机械伤害', label: '机械伤害' },
  { value: '触电', label: '触电' },
  { value: '坍塌', label: '坍塌' },
  { value: '灼烫', label: '灼烫' },
  { value: '高噪音、高温、低温', label: '高噪音、高温、低温' },
  { value: '其他伤害', label: '其他伤害' },
];
//动火作业危险行为识别
export const startBuildingHazardIdentification: { value?: string; label?: string }[] = [
  { value: '火灾', label: '火灾' },
  { value: '其他爆炸', label: '其他爆炸' },
  { value: '触电', label: '触电' },
  { value: '灼烫', label: '灼烫' },
  { value: '中毒和窒息', label: '中毒和窒息' },
  { value: '物体打击', label: '物体打击' },
  { value: '其他伤害', label: '其他伤害' },
];
//脚手架搭拆
export const temporaryElectricityHazardIdentification: { value?: string; label?: string }[] = [
  { value: '中毒和窒息', label: '中毒和窒息' },
  { value: '火灾', label: '火灾' },
  { value: '其他爆炸', label: '其他爆炸' },
  { value: '物体打击', label: '物体打击' },
  { value: '机械伤害', label: '机械伤害' },
  { value: '触电', label: '触电' },
  { value: '坍塌', label: '坍塌' },
  { value: '灼烫', label: '灼烫' },
  { value: '高噪音、高温、低温', label: '高噪音、高温、低温' },
  { value: '其他伤害', label: '其他伤害' },
];
// 其他
export const hoistingHazardIdentification: { value?: string; label?: string }[] = [
  { value: '中毒和窒息', label: '中毒和窒息' },
  { value: '火灾', label: '火灾' },
  { value: '其他爆炸', label: '其他爆炸' },
  { value: '物体打击', label: '物体打击' },
  { value: '机械伤害', label: '机械伤害' },
  { value: '触电', label: '触电' },
  { value: '坍塌', label: '坍塌' },
  { value: '灼烫', label: '灼烫' },
  { value: '高噪音、高温、低温', label: '高噪音、高温、低温' },
  { value: '起重伤害', label: '起重伤害' },
  { value: '其他伤害', label: '其他伤害' },
];
export const possibleDanger = {
  '1': upHazardIdentification,
  '2': confinedSpacesHazardIdentification,
  '3': startBuildingHazardIdentification,
  '4': temporaryElectricityHazardIdentification,
  '5': hoistingHazardIdentification,
};
//动火作业危险行为识别
export const getAngryHazardIdentification: { value?: string; label?: string }[] = [];
//长期动火作业危险行为识别
export const longTermGetAngryHazardIdentification: { value?: string; label?: string }[] = [];
//高处作业表单验证
export const highPlaceWorkFormValidation: Record<string, Rule[]> = {
  applicationUnit: [{ required: true, message: '请选择申请单位！' }],
  applicant: [{ required: true, message: '请选择申请人！' }],
  start: [{ type: 'array', required: true, message: '请选择作业实施时间！' }],
  workLocation: [{ required: true, message: '作业地点不可为空！' }],
  workContent: [{ required: true, message: '作业内容不可为空！' }],
  // workHeight: [{ required: true, message: '作业高度必填' }],
  workHeight: [
    { required: true, message: '作业高度不可为空！' },
    {
      validator: async (_rule: Rule, val: string) => {
        val = val.toString();
        const res = /^([1-9][0-9]*)(\.[\d]{1})?$/.test(val);
        if (!res) return Promise.reject('作业高度范围不正确！');
        if (val.indexOf('.') > -1 && val.length > 4) return Promise.reject('作业高度范围不正确！');
        if (val.indexOf('.') < 0 && val.length > 2) return Promise.reject('作业高度范围不正确！');
        return Promise.resolve();
      },
      message: '作业高度范围不正确！',
      trigger: 'blur',
    },
  ],
  workUnit: [{ required: true, message: '请选择作业单位！' }],
  workUnitGuardian: [{ required: true, message: '请选择作业单位监护人！' }],
  operator: [{ required: true, message: '请选择登高作业人！' }],
  securityMeasuresIds: [{ required: true, message: '请选择涉及安全措施！' }],
  possibleDanger: [{ required: true, message: '请选择危险辨识结果！' }],
  workGrade: [{ required: true, message: '请选择作业等级！' }],
  otherWork: [{ required: true, message: '请选择是否涉及其他作业！' }],
};
//有限空间作业表单验证
export const limitedSpaceFormValidation = () => ({
  checkAdmin: [{ required: true, message: '请选择！', trigger: 'change' }],
  workType: [{ required: true, message: '请选择！', trigger: 'change' }],
  highWorkLevel: [{ required: true, message: '请选择高危作业等级！', trigger: 'change' }],
  hoistingWeight: [{ required: true, message: '请输入吊装重量！', trigger: 'change' }],
  // hoistingCode: [{ required: true, message: '请输入吊车车牌号！', trigger: 'change' }],
  hoistingIdNumber: [{ required: true, message: '请输入！', trigger: 'change' }],
  commanderPriest: [{ required: true, message: '请选择指挥人员！', trigger: 'change' }],
  workGrade: [{ required: true, message: '请选择作业等级！', trigger: 'change' }],
  applicationUnit: [{ required: true, message: '请选择申请单位！', trigger: 'change' }],
  applicant: [{ required: true, message: '请选择申请人！', trigger: 'change' }],
  affiliation: [{ required: true, message: '请选择！', trigger: 'change' }],
  workHeight: [{ required: true, message: '请输入作业高度！', trigger: 'change' }],
  workTeam: [{ required: true, message: '请选择作业班组！', trigger: 'change' }],
  workOrgCode: [{ required: true, message: '请选择生产单位！', trigger: 'change' }],
  workLocation: [{ required: true, message: '请输入作业地点！', trigger: 'change' }],
  limitSpaceCode: [{ required: true, message: '请选择有限空间名称！', trigger: 'change' }],
  limitSpaceUnit: [{ required: true, message: '请选择有限空间所属单位！', trigger: 'change' }],
  rescuers: [{ required: true, message: '请选择救援人员！', trigger: 'change' }],
  limitSpaceOriginalMedium: [{ required: true, message: '请输入原有介质！', trigger: 'change' }],
  start: [{ type: 'array', required: true, message: '请选择计划作业时间！', trigger: 'change' }],
  securityMeasuresIds: [{ required: true, message: '请选择涉及安全措施！', trigger: 'change' }],
  workContent: [{ required: true, message: '请输入作业内容！', trigger: 'change' }],
  locationMarkers: [{ required: true, message: '请选择！', trigger: 'change' }],
  possibleDanger: [{ required: true, message: '请选择', trigger: 'change' }],
  otherWork: [{ required: true, message: '请选择是否涉及其他作业！', trigger: 'change' }],
  workUnit: [{ required: true, message: '请选择作业车间！', trigger: 'change' }],
  sceneHead: [{ required: true, message: '请选择作业负责人！' }],
  compiler: [{ required: true, message: '请选择！', trigger: 'change' }],
  workUnitGuardian: [{ required: true, message: '请选择现场监护人！', trigger: 'change' }],
  securityMeasuresUser: [{ required: true, message: '请选择！', trigger: 'change' }],
  operator: [{ required: true, message: '请选择作业人！', trigger: 'change' }],
  operatorName: [{ required: true, message: '请选择作业人！', trigger: 'change' }],
  cardFlag: [{ required: true, message: '请选择！', trigger: 'change' }],
  powerPoint: [{ required: true, message: '请输入！', trigger: 'change' }],
  consumerInfo: [{ required: true, message: '请输入！', trigger: 'change' }],
  operatingVoltage: [{ required: true, message: '请输入！', trigger: 'change' }],
  postWorker: [{ required: true, message: '请选择！', trigger: 'change' }],
  protectiveEquipmentIds: [{ required: true, message: '请选择！', trigger: 'change' }],
  procedureIds: [{ required: true, message: '请选择！', trigger: 'change' }],
});

//作业保存修改添加时的字段类型修改
export const workSaveFormType = (formState: any, workExamine?) => {
  const data = Object.assign({}, formState);
  //@ts-ignore
  if (data.possibleDanger && data.possibleDanger.length >= 0) {
    //@ts-ignore
    data.possibleDanger = data.possibleDanger.map((item) => {
      if (item == '其他伤害') {
        return item + '-' + data.possibleDangerInput;
      }
      return item;
    });
    //@ts-ignore
    data.possibleDanger = data.possibleDanger.join(',');
  }
  //@ts-ignore
  if (data.start && data.start.length >= 0) {
    //@ts-ignore
    data.startTime = data.start[0]; //@ts-ignore
    data.endTime = data.start[1];
  }
  if (data.hoistingCommander && Array.isArray(data.hoistingCommander) && data.hoistingCommander.length >= 0) {
    //@ts-ignore
    data.hoistingCommander = data.hoistingCommander.join(',');
  }
  if (data.hoistingIdNumber && Array.isArray(data.hoistingIdNumber)) {
    //@ts-ignore
    data.hoistingIdNumber = data.hoistingIdNumber.join(',');
  }

  if (Array.isArray(data.securityMeasuresIds)) {
    data.securityMeasuresIds = data.securityMeasuresIds.join(',');
  }
  if (workExamine && workExamine.length >= 0) {
    // if(formState.workType == 9) {
    //   // 其他类型作业 5-8 节点相同 只保留6,8
    //   let sliceArr = workExamine.slice(4, 8);
    //   let resultArr = sliceArr.map(item => {
    //     return item.type+JSON.stringify(item.workExamineInfoList)
    //   })
    //   let same = new Set(resultArr);
    //   if(same.size == 1) {
    //     workExamine.splice(6, 1);
    //     workExamine.splice(4, 1);
    //   }
    // }
    workExamine = workExamine.filter((item: any) => {
      const tag = item.hasOwnProperty('needNode') && !item.needNode ? false : true;
      return tag;
    });
    workExamine.forEach((item, idx) => (item.nodeNumber = idx));
    //@ts-ignore
    data.workExamine = workExamine;
  }
  if (data.workAnalysis && data.workAnalysis.length >= 0) {
    //@ts-ignore
    data.workAnalysis = data.workAnalysis
      .map(({ ids: _ids, ...item }) => {
        if (JSON.stringify(item) !== '{}') {
          const filteredItem = {};
          for (const key in item) {
            if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
              filteredItem[key] = item[key];
            }
          }
          return filteredItem;
        } else {
          return {};
        }
      })
      .filter((item) => JSON.stringify(item) !== '{}');
  }
  if (formState.workType != 4 && formState.operateMethod && formState.operateMethod.length >= 0) {
    //@ts-ignore
    data.operateMethod = formState.operateMethod.join(',');
  }
  return data;
};
