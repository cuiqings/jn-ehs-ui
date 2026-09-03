import useApiData from '../../../../hazardousOperation/hooks/useApiData';
import { useUserStore } from '/@/store/modules/user';
import { queryToDhUser, getIdCode, querySafetyUser } from '../../../../hazardousOperation/api';
export const computedData = async (steps: any[], detail: any) => {
  const { unit, workUnit, person, rootUser, getUserByorg, lookFireList } = await useApiData();
  const queryToDhUserList = await queryToDhUser();
  const safeUserList = await querySafetyUser();
  queryToDhUserList.forEach((item) => {
    item.text = item.username;
  });
  safeUserList.forEach((item) => {
    item.text = item.username;
  });
  
  let operatorList = [];

  if (detail.constructionUnit) {
    operatorList = await getIdCode({ orgCode: detail.constructionUnit, workType: detail.workType });
    operatorList.map((item: any) => {
      item.realname = item.name + '-' + item.title;
      item.id = item.code;
      return item;
    });
  }
  let sceneHeadList = getUserByorg(detail.constructionUnit).map((val) => {
    val['text'] = val.username;
    return val;
  });
  //   if (detail.constructionUnit.includes('A04B12')) {
  //     sceneHeadList = getUserByorg(detail.constructionUnit); // 相关方全量人员
  //   }
  const userStore = useUserStore();
  const currentUserInfo = userStore.getUserInfo;
  const headOfUnit = getUserByorg(currentUserInfo.orgCode, true);
  let result: Array<any> = [];
  console.log(steps);

  steps.forEach(async (item: any, idx) => {
    const currentNodeOperator = [currentUserInfo.id as string]; //@ts-ignore
    let nodeOperatorName = unit.value[0].departName + '-' + currentUserInfo.realname;
    const operatorContent = '填写票据，预填写危险辨识';
    let obj = {
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
      workExamineInfoList: [{ nodeOperator: [], title: '' }],
    };
    if (detail.workGrade == 'A级') {
      if ([1, 3, 4, 5, 10, 11, 13].includes(idx)) {
        obj.disabled = true;
      }
      if ([12, 14].includes(idx)) {
        obj.hint = '备注：由现场监查科岗位人员指定，不需要配置';
      }
      if ([1, 3, 4, 5, 11, 12, 13, 14].includes(idx)) {
        obj.station.need = false;
      }

      if (idx == 3) {
        obj.options = queryToDhUserList;
      }

      if ([8, 9, 10].includes(idx)) {
        obj.options = lookFireList as never;
      }
      if ([8].includes(idx)) {
        obj.change = (e, workExamine, idx, i) => {
          let targetIdx = 0;
          if (idx == 8) {
            targetIdx = 10;
          }
          workExamine[targetIdx].workExamineInfoList[i].nodeOperator = e;
        };
      }
    }
    if (detail.workGrade == 'B级') {
      if ([1, 3, 4, 5, 8, 9, 10, 11].includes(idx)) {
        obj.disabled = true;
      }
      if ([1, 3, 4, 5, 9, 10, 11].includes(idx)) {
        obj.station.need = false;
      }
      if (idx == 2) {
        obj.change = (e, workExamine, idx, i) => {
          let targetIdx = 0;
          if (idx == 2) {
            targetIdx = 8;
          }
          workExamine[targetIdx].workExamineInfoList[i].nodeOperator = e;
          workExamine[targetIdx].workExamineInfoList[i].nodeOperatorName = e;
          workExamine[11].workExamineInfoList[i].nodeOperator = e;
          workExamine[11].workExamineInfoList[i].nodeOperatorName = e;
        };
      }

      if (idx == 10) {
        obj.workExamineInfoList[0].options = headOfUnit;
        obj.workExamineInfoList[0].nodeOperator = [detail.territoryFireWatch]; //@ts-ignore
      }
    }

    if (detail.workGrade == 'C级') {
      if ([1, 3, 4, 5, 8, 9, 10, 11].includes(idx)) {
        obj.disabled = true;
      }
      if ([1, 2, 3, 4, 9, 10, 11].includes(idx)) {
        obj.station.need = false;
      }

      if (item == '属地安全员') {
        getUserByorg(currentUserInfo.orgCode, true).forEach((item: any) => {
          if (item.id == currentUserInfo.id) {
            nodeOperatorName = item.realname;
          }
        });
        obj.workExamineInfoList[0].nodeOperator = [currentUserInfo.id];
        obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName;
      }
      if ([8, 11].includes(idx)) {
        obj.workExamineInfoList[0].nodeOperator = [currentUserInfo.id];
      }

      if (idx == 2) {
        obj.change = (e, workExamine, idx, i) => {
          let targetIdx = 0;
          if (idx == 2) {
            targetIdx = 8;
          }
          workExamine[targetIdx].workExamineInfoList[i].nodeOperator = e;
          workExamine[11].workExamineInfoList[i].nodeOperator = e;
        };
      }

      if (idx == 10) {
        obj.workExamineInfoList[0].nodeOperator = [detail.territoryFireWatch]; //@ts-ignore
        obj.workExamineInfoList[0].options = headOfUnit;
      }
    }
    if (idx == 0) {
      //@ts-ignore
      obj.workExamineInfoList[0].nodeOperator = currentNodeOperator; //@ts-ignore
      obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName; //@ts-ignore
      obj.workExamineInfoList[0].operatorContent = operatorContent;
    }

    if (idx == 1) {
      obj.options = queryToDhUserList;
      queryToDhUserList.forEach((item: any) => {
        if (item.id == detail.entrustedProjectLeader) {
          nodeOperatorName = item.username;
        }
      });
      obj.workExamineInfoList[0].nodeOperator = [detail.entrustedProjectLeader]; //@ts-ignore
      obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName; //@ts-ignore
    }

    if (['属地安全科长', '开始作业(安全科科长)', '完结验收(安全科科长)'].includes(item)) {
      obj.options = safeUserList;
    }

    if (item == '作业人员') {
      obj.workExamineInfoList = detail.operator.split(',').map((citem: any) => {
        operatorList.forEach((val) => {
          nodeOperatorName = val.realname;
        });
        return { nodeOperator: [citem], nodeOperatorName, options: operatorList };
      });
    }

    if (
      ['工序现场(属地)负责人', '模块(属地)领导', '属地安全员', '完结验收(属地安全员)', '工序现场(属地)领导', '开始作业(属地安全员)'].includes(item)
    ) {
      obj.options = getUserByorg(currentUserInfo.orgCode, true);
      obj.options.forEach((item: any) => {
        item['text'] = item.title;
      });
    }

    if (['施工单位现场负责人', '发起验收(作业负责人)'].includes(item)) {
      obj.options = sceneHeadList;
      sceneHeadList.forEach((item: any) => {
        if (item.id == detail.sceneHead) {
          nodeOperatorName = item.username;
        }
      });
      obj.workExamineInfoList[0].nodeOperator = [detail.sceneHead];
      obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName;
    }

    if (item == '看火人员') {
      obj.station = {
        need: true,
        value: '属地看火人',
      };
      obj.type = '2';
      headOfUnit.forEach((item: any) => {
        if (item.id == detail.territoryFireWatch) {
          nodeOperatorName = item.realname;
        }
      });
      obj.workExamineInfoList[0].nodeOperator = [detail.territoryFireWatch]; //@ts-ignore
      obj.workExamineInfoList[0].title = '属地看火人'; //@ts-ignore
      obj.workExamineInfoList[0].options = headOfUnit;
      obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName; //@ts-ignore
      obj.workExamineInfoList.push({
        nodeOperator: [],
        options: sceneHeadList,
        disabled: false,
        title: '施工单位看火人',
      }); //@ts-ignore
    }
    if (idx == 13) {
      obj.workExamineInfoList[0].options = headOfUnit;
      headOfUnit.forEach((item: any) => {
        if (item.id == detail.territoryFireWatch) {
          nodeOperatorName = item.realname;
        }
      });
      obj.workExamineInfoList[0].nodeOperator = [detail.territoryFireWatch]; //@ts-ignore
      obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName; //@ts-ignore
    }

    result.push(obj);
  });

  return result;
};
