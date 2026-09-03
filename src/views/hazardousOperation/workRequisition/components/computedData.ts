import { useWorkStore } from '/@/store/modules/dangerousWork';
import { userListByOrg } from '/@/api/common/api';
import { getListByType } from '../../api';

const nodes = ['安全措施确认(作业负责人)', '安全措施确认(作业单位安全员)', '机动科', '主管设备部长', '一把手'];
export const computedStepData = async () => {
  const workStore = useWorkStore();
  const workList = workStore.getWorkList;
  const detail = workList[0];
  let operatorUsers = '';
  let operatorNames = '';
  if (workList.length > 0) {
    operatorUsers = workList.map((item) => item.operator).join(',');
    operatorUsers = [...new Set(operatorUsers.split(','))].join(',');
    operatorNames = workList.map((item) => item.operatorName).join(',');
    operatorNames = [...new Set(operatorNames.split(','))].join(',');
  }
  let workTypes: string[] = [];
  if (workList && workList.length > 0) {
    workTypes.push(...workList.map((item) => item.workType));
  }

  const steps = await getListByType({
    workType: workTypes.includes('2') ? '2' : workTypes.includes('3') ? '3' : detail.workType,
    value: detail.workGrade,
    territorial: detail.workUnit, // 0相同单位 1不同单位
  });
  let result: Array<any> = [];

  const workshop_director = await userListByOrg({ roleCode: 'workshop_director', orgCode: detail.workUnit });
  const workshop_director2 = await userListByOrg({ roleCode: 'workshop_director', orgCode: detail.applicationUnit });
  const safety_chief = await userListByOrg({ roleCode: 'safety_chief', orgCode: detail.applicationUnit.slice(0, 9) });
  const safety_chief2 = await userListByOrg({ roleCode: 'safety_chief', orgCode: detail.workUnit ? detail.workUnit.slice(0, 9) : detail.applicationUnit.slice(0, 9) });
  const deputy_minister_security = await userListByOrg({ roleCode: 'deputy_minister_security', orgCode: detail.applicationUnit.slice(0, 9) });
  const number_one = await userListByOrg({ roleCode: 'number_one', orgCode: detail.applicationUnit.slice(0, 9) });
  const roleList = {
    作业申请: '',
    '安全措施确认(安全措施确认人)': '',
    '安全措施确认(监护人)': '',
    '安全措施确认(作业负责人)': '',
    '安全措施确认(作业单位安全员)': '',
    '作业单位负责人(车间主任)': { roleCode: 'workshop_director', orgCode: detail.workUnit, users: workshop_director.records },
    '生产单位负责人(车间主任)': { roleCode: 'workshop_director', orgCode: detail.applicationUnit, users: workshop_director2.records },
    '作业单位安全部门(安全科长)': { roleCode: 'safety_chief', orgCode: detail.applicationUnit, users: safety_chief2.records },
    '生产单位安全部门(安全科长)': { roleCode: 'safety_chief', orgCode: detail.applicationUnit, users: safety_chief.records },
    机动科: '',
    '生产单位主管部长(主管安全副部长)': {
      roleCode: 'deputy_minister_security',
      orgCode: detail.applicationUnit,
      users: deputy_minister_security.records,
    },
    主管设备部长: '',
    一把手: { roleCode: 'number_one', orgCode: detail.applicationUnit, users: number_one.records },
    '安全交底(作业负责人)': '',
    接受交底: '',
    '开始作业(作业负责人)': '',
    '完结验收(作业负责人)': '',
  };
  steps.forEach(async (item: any, idx) => {
    const obj: any = {
      nodeName: item,
      nodeNumber: idx,
      type: '1',
      options: [],
      add: true,
      hint: '',
      station: {
        need: true,
        value: '',
      },
      change: () => {},
      disabled: false,
      typeName: '单岗单批',
      workExamineInfoList: [{ nodeOperator: '', title: '' }],
      roleCode: '',
      orgCode: '',
      show: false, // 是否显示启用开关
      needNode: true, // 是否打开启用开关
    };
    // if (nodes.includes(item) && detail.workType == '2') {
    //   obj.show = false;
    // }

    if (nodes.includes(item) && ['1', '4', '3'].includes(detail.workType)) {
      obj.show = true;
      obj.needNode = false;
    }
    if (item == '一把手' && detail.workType == '3' && detail.workGrade == '特级') {
      obj.show = false;
      obj.needNode = true;
    }
    
    if(detail.workType == '9' && detail.highWorkLevel == '三级' && idx > 5 && idx < 12) {
      obj.show = true;
      obj.needNode = false;
    }
    if(detail.workType == '9' && ['一级', '二级'].includes(detail.highWorkLevel) && [8, 10, 11].includes(idx)) {
      obj.show = true;
      obj.needNode = false;
    }

    if (roleList[item] && roleList[item].users && roleList[item].users.length) {
      let users = roleList[item].users;
      if (users && users.length) {
        let ids = '';
        let names = '';
        users.forEach((user) => {
          ids += user.id + ',';
          if (user.org3Name) {
            names += `${user.realname}-${user.workNo}-${user.org3Name}` + ',';
          } else {
            names += `${user.realname}-${user.workNo}` + ',';
          }
        });
        ids = ids.substring(0, ids.length - 1);
        names = names.substring(0, names.length - 1);

        obj.workExamineInfoList[0].nodeOperator = ids;
        obj.workExamineInfoList[0].nodeOperatorName = names;
      }
    }

    if (item === '作业申请') {
      obj.disabled = true;
      obj.workExamineInfoList[0].nodeOperator = detail.applicant;
      obj.workExamineInfoList[0].nodeOperatorName = detail.applicantName;
    }
    if (item.includes('安全措施确认人')) {
      let users = [...new Set(detail.securityMeasuresUser.split(","))].join(",");
      obj.disabled = true;
      obj.workExamineInfoList[0].nodeOperator = users;
      obj.workExamineInfoList[0].nodeOperatorName = detail.securityMeasuresUserName;
    }
    if (item.includes('安全措施确认人') && detail.workType == '8') {
      let users = [...new Set(detail.workUnitGuardian.split(","))].join(",");
      obj.disabled = true;
      // obj.nodeName = '安全措施确认(监护人)';
      obj.workExamineInfoList[0].nodeOperator = users;
      obj.workExamineInfoList[0].nodeOperatorName = detail.workUnitGuardianName;
    }
    if (item.includes('监护人')) {
      let users = [...new Set(detail.workUnitGuardian.split(","))].join(",");
      obj.disabled = true;
      obj.workExamineInfoList[0].nodeOperator = users;
      obj.workExamineInfoList[0].nodeOperatorName = detail.workUnitGuardianName;
    }

    if (item.includes('作业负责人')) {
      let users = [...new Set(detail.sceneHead.split(","))].join(",");
      obj.disabled = true;
      obj.workExamineInfoList[0].nodeOperator = users;
      obj.workExamineInfoList[0].nodeOperatorName = detail.sceneHeadName;
    }

    if (item.includes('岗位工')) {
      let users = [...new Set(detail.postWorker.split(","))].join(",");
      obj.disabled = true;
      obj.workExamineInfoList[0].nodeOperator = users;
      obj.workExamineInfoList[0].nodeOperatorName = detail.postWorkerName;
    }

    if (item == '接受交底') {
      obj.disabled = true;
      if (operatorUsers) {
        [...new Set(operatorUsers.split(','))].forEach((val: any, i: number) => {
          obj.workExamineInfoList[i] = {
            nodeOperator: val,
            nodeOperatorName: operatorNames.split(',')[i],
          };
        });
      }
      obj.station.need = true;
      obj.add = false;
      obj.disabled = true;
      obj.type = '2';
      obj.typeName = '多岗多批';
    }
    result.push(obj);
  });
  if (detail.workType == '8' && detail.cardFlag == 2) {
    result = result.filter((item) => item.nodeName != '安全措施确认(维修事业部班长)');
  }
  if(detail.workType == '9'){
    result.splice(2, 2)
  }
  console.log(result);
  
  // 如果申请单位和作业点位相同 删除作业单位负责人和作业单位安全部门节点
  if (detail.applicationUnit == detail.workUnit && ['1', '2', '3', '4', '9'].includes(detail.workType)) {
    result = result.filter((item) => item.nodeName != '作业单位负责人(车间主任)');
    result = result.filter((item) => item.nodeName != '作业单位安全部门(安全科长)');
  }
  return result;
};
