import type { Rule } from 'ant-design-vue/es/form';
import { JobApplyForFrom } from '../type';
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
//吊装作业危险行为识别
export const hoistingHazardIdentification: { value?: string; label?: string }[] = [
  { value: '高处坠落', label: '高处坠落' },
  { value: '易燃易爆场所', label: '易燃易爆场所' },
  { value: '中毒和窒息', label: '中毒和窒息' },
  { value: '高嗓音、高温、低温', label: '高嗓音、高温、低温' },
  { value: '雨雪、湿滑', label: '雨雪、湿滑' },
  { value: '触电', label: '触电' },
  { value: '粉尘', label: '粉尘' },
  { value: '转动设备', label: '转动设备' },
  { value: '淹溺', label: '淹溺' },
  { value: '地基强度不足', label: '地基强度不足' },
  { value: '其他', label: '其他' },
];
//动土作业危险行为识别
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
export const possibleDanger = {
  '1': upHazardIdentification,
  '2': confinedSpacesHazardIdentification,
  '3': startBuildingHazardIdentification,
  '4': temporaryElectricityHazardIdentification,
}
//动火作业危险行为识别
export const getAngryHazardIdentification: { value?: string; label?: string }[] = [];
//长期动火作业危险行为识别
export const longTermGetAngryHazardIdentification: { value?: string; label?: string }[] = [];
//高处作业表单验证
export const highPlaceWorkFormValidation: Record<string, Rule[]> = {
  securityMeasuresIds: [{ required: true, message: '请选择涉及安全措施！' }],
  possibleDanger: [{ required: true, message: '请选择危险辨识结果！' }],
  reviewComments: [{ required: true, message: '请填写审核意见！' }],
  sign: [{ required: true }],
  nodeOperator: [{ required: true }],
};
//有限空间作业表单验证
export const limitedSpaceFormValidation: Record<string, Rule[]> = {
  securityMeasuresIds: [{ required: true, message: '请选择涉及安全措施！' }],
  possibleDanger: [{ required: true, message: '请选择危险辨识结果！' }],
  reviewComments: [{ required: true, message: '请填写审核意见！' }],
  sign: [{ required: true }],
  nodeOperator: [{ required: true }],
};
//吊装作业表单验证
export const hoistingWorkFormValidation: Record<string, Rule[]> = {
  securityMeasuresIds: [{ required: true, message: '请选择涉及安全措施！' }],
  possibleDanger: [{ required: true, message: '请选择危险辨识结果！' }],
  reviewComments: [{ required: true, message: '请填写审核意见！' }],
  sign: [{ required: true }],
  nodeOperator: [{ required: true }],
};
//动土作业表单验证
export const startBuildingFormValidation: Record<string, Rule[]> = {
  securityMeasuresIds: [{ required: true, message: '请选择涉及安全措施！' }],
  possibleDanger: [{ required: true, message: '请选择危险辨识结果！' }],
  reviewComments: [{ required: true, message: '请填写审核意见！' }],
  sign: [{ required: true }],
  nodeOperator: [{ required: true }],
};
//临时用电作业表单验证
export const temporaryElectricityFormValidation: Record<string, Rule[]> = {
  securityMeasuresIds: [{ required: true, message: '请选择涉及安全措施！' }],
  possibleDanger: [{ required: true, message: '请选择危险辨识结果！' }],
  reviewComments: [{ required: true, message: '请填写审核意见！' }],
  sign: [{ required: true }],
  nodeOperator: [{ required: true }],
};
//动火作业表单验证
export const fireFormValidation: Record<string, Rule[]> = {};
//长期动火作业表单验证
export const longTermFireFormValidation: Record<string, Rule[]> = {};
//作业实施时间验证
export const workTimeValidation = (title, value): Rule => {
  return {
    required: true,
    validator: async (_rule, time) => {
      if (title === '1') {
        if (time.length > 0) {
          if (value == '一级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 7 * 24 * 60 * 60 * 1000) {
            return Promise.reject('高处作业等级为一级的作业实施时间最长为7天！');
          } else if (value == '二级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 5 * 24 * 60 * 60 * 1000) {
            return Promise.reject(' 高处作业等级为二级的作业实施时间最长为5天！');
          } else if (value == '三级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 3 * 24 * 60 * 60 * 1000) {
            return Promise.reject('高处作业等级为三级的作业实施时间最长为3天！');
          } else if ((value == '四级' || value == '五级') && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 8 * 60 * 60 * 1000) {
            return Promise.reject('高处作业等级为四级/五级的作业实施时间最长为8小时！');
          } else {
            return Promise.resolve();
          }
        } else {
          return Promise.reject('请输入作业实施时间！');
        }
        // 高处作业等级为一级的作业实施时间最长为7天！
        // 高处作业等级为二级的作业实施时间最长为5天！
        // 高处作业等级为三级的作业实施时间最长为3天！
        // 高处作业等级为四级/五级的作业实施时间最长为8小时！
      } else if (title === '2') {
        if (time.length > 0) {
          if (value == '一级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 8 * 60 * 60 * 1000) {
            return Promise.reject('吊装作业等级为一级的作业实施时间最长为8小时！');
          } else if (value == '二级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 3 * 24 * 60 * 60 * 1000) {
            return Promise.reject('吊装作业等级为二级的作业实施时间最长为3天！');
          } else if (value == '三级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 5 * 24 * 60 * 60 * 1000) {
            return Promise.reject('吊装作业等级为三级的作业实施时间最长为5天！');
          } else {
            return Promise.resolve();
          }
        } else {
          return Promise.reject('请输入作业实施时间！');
        }
        // 吊装作业等级为一级的作业实施时间最长为8小时！
        // 吊装作业等级为二级的作业实施时间最长为3天！
        // 吊装作业等级为三级的作业实施时间最长为5天！
      } else if (title === '3') {
        if (time.length > 0) {
          if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 24 * 60 * 60 * 1000) {
            return Promise.reject('有限空间的作业实施时间最长为24小时！');
          } else {
            return Promise.resolve();
          }
        } else {
          return Promise.reject('请输入作业实施时间！');
        }
      } else if (title === '4') {
      } else if (title == '5') {
        if (time.length > 0) {
          if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 15 * 24 * 60 * 60 * 1000) {
            return Promise.reject('动土作业实施时间最长为15天！');
          } else {
            return Promise.resolve();
          }
        } else {
          return Promise.reject('请输入作业实施时间！');
        }
      }
    },
    trigger: 'change',
  };
};
//作业保存修改添加时的字段类型修改
export const workSaveFormType = (formState: JobApplyForFrom) => {
  const data = { ...formState };
  //@ts-ignore
  if (formState.possibleDanger && formState.possibleDanger.length > 0) {
    //@ts-ignore
    formState.possibleDanger = formState.possibleDanger.map((item) => {
      if (item == '其他伤害') {
        return item + '-' + formState.possibleDangers;
      }
      return item;
    });
    //@ts-ignore
    data.possibleDanger = formState.possibleDanger.join(',');
  }
  //@ts-ignore
  if (formState.start && formState.start.length > 0) {
    //@ts-ignore
    data.startTime = formState.start[0]; //@ts-ignore
    data.endTime = formState.start[1];
  }
  
  if (formState.hoistingCommander && formState.hoistingCommander.length > 0) {
    //@ts-ignore
    data.hoistingCommander = formState.hoistingCommander.join(',');
  }
  if (formState.hoistingIdNumber && formState.hoistingIdNumber.length > 0) {
    //@ts-ignore
    data.hoistingIdNumber = formState.hoistingIdNumber.join(',');
  }
  if (formState.workExamine && formState.workExamine.length > 0) {
    //@ts-ignore
    data.workExamine = formState.workExamine.map((item) => {
      if (item.workExamineInfoList && item.workExamineInfoList.length > 0) {
        //@ts-ignore
        return {
          ...item,
          workExamineInfoList: item.workExamineInfoList.map((value) => {
            if (value.nodeOperator && value.nodeOperator.length > 0) {
              return {
                ...value,
                //@ts-ignore
                nodeOperator: value.nodeOperator.map((v) => v[1]).join(','),
              };
            } else {
              return {
                ...value,
                nodeOperator: '',
              };
            }
          }),
        };
      }
    });
  }
  if (formState.workAnalysis && formState.workAnalysis.length > 0) {
    data.workAnalysis = formState.workAnalysis.map((item) => ({ ...item, id: item.ids }));
  }
  if (formState.operateMethod && formState.operateMethod.length > 0) {
    //@ts-ignore
    data.operateMethod = formState.operateMethod.join(',');
  }
  return data;
};
