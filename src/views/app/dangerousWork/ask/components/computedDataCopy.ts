import useApiData from '../../../../hazardousOperation/hooks/useApiData';
import { useUserStore } from '/@/store/modules/user';
import { queryToDhUser, getIdCode, querySafetyUser } from '../../../../hazardousOperation/api';

export const computedData = async (steps: any[], detail: any) => {
  const { unit, workUnit, person, rootUser, getUserByorg, lookFireList } = await useApiData();
  const queryToDhUserList = await queryToDhUser();
  const safeUserList = await querySafetyUser();
  let operatorList = [];

  if (detail.constructionUnit) {
    operatorList = await getIdCode({ orgCode: detail.constructionUnit, workType: detail.workType });
    operatorList.map((item: any) => {
      item.text = item.name + '-' + item.title;
      item.id = item.code;
      item.value = item.code;
      return item;
    });
  }
  let sceneHeadList = getUserByorg(detail.constructionUnit);
  sceneHeadList.forEach((val) => {
    val['text'] = val.realname;
    val['value'] = val.code;
  });
  safeUserList.forEach((val) => {
    val['text'] = val.username;
    val['value'] = val.id;
  });
  queryToDhUserList.forEach((val) => {
    val['text'] = val.username;
    val['value'] = val.id;
  });
  //   if (detail.constructionUnit.includes('A04B12')) {
  //     sceneHeadList = getUserByorg(detail.constructionUnit); // 相关方全量人员
  //   }
  const userStore = useUserStore();
  const currentUserInfo = userStore.getUserInfo;
  const headOfUnit = person.value.filter((val) => {
    val['value'] = val.id;
    return currentUserInfo.orgCode?.includes(val.orgCode && val.orgCode.substring(0, 6));
  });
  let result: Array<any> = [];
  console.log(steps);
  
  steps.forEach(async (item: any, idx) => {
    const currentNodeOperator = currentUserInfo.id; //@ts-ignore
    const nodeOperatorName = unit.value[0].departName + '-' + currentUserInfo.realname;
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
      workExamineInfoList: [{ nodeOperator: '', nodeOperatorName: '', title: '' }],
    };
    if (detail.workGrade == 'A级') {
      if ([1, 3, 4, 5, 10, 11, 13].includes(idx)) {
        obj.disabled = true;
      }
      if ([12, 14].includes(idx)) {
        obj.hint = '备注：由现场监查科岗位人员指定，不需要配置';
        obj.workExamineInfoList = [];
      }
      if ([1, 3, 4, 5, 11, 12, 13, 14].includes(idx)) {
        obj.station.need = false;
      }

      if ([8, 9, 10].includes(idx)) {
        obj.options = workUnit.value
          .filter((item) => {
            return item.departName.includes('EHS');
          })
          .map((item) => {
            return {
              text: item.departName,
              value: item.orgCode,
              id: item.id,
              loading: false,
              children: lookFireList,
            };
          }) as never;
      }
      if ([8].includes(idx)) {
        obj.change = (e, workExamine, idx, i) => {
          let targetIdx = 0;
          if (idx == 8) {
            targetIdx = 10;
          }
          workExamine[targetIdx].workExamineInfoList[i].nodeOperator = e;
          console.log(idx, targetIdx, e, workExamine[targetIdx].workExamineInfoList[i]);
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
          workExamine[11].workExamineInfoList[i].nodeOperator = e;
        };
      }

      if (idx == 10) {
        obj.workExamineInfoList[0].nodeOperator = detail.territoryFireWatch; //@ts-ignore
        obj.options = workUnit.value
          .filter((item) => detail.constructionUnit.includes(item.orgCode))
          .map((val) => {
            return {
              text: val.departName,
              value: val.orgCode,
              id: val.id,
              loading: false,
              children: headOfUnit,
            };
          });
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
        obj.workExamineInfoList[0].nodeOperator = currentUserInfo.id;
        obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName;
      }

      if ([8, 11].includes(idx)) {
        obj.workExamineInfoList[0].nodeOperator = currentUserInfo.id;
        obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName;
      }
    }
    if (idx == 0) {
      //@ts-ignore
      obj.workExamineInfoList[0].nodeOperator = currentNodeOperator; //@ts-ignore
      obj.workExamineInfoList[0].nodeOperatorName = nodeOperatorName; //@ts-ignore
      obj.workExamineInfoList[0].operatorContent = operatorContent;
    }

    if (idx == 1) {
      obj.options = workUnit.value
        .filter((item) => currentUserInfo.orgCode.includes(item.orgCode))
        .map((val) => {
          return {
            text: val.departName,
            value: val.orgCode,
            id: val.id,
            loading: false,
            children: queryToDhUserList,
          };
        });
      let o = queryToDhUserList.find((val) => val.id == detail.entrustedProjectLeader);
      obj.workExamineInfoList[0].nodeOperator = detail.entrustedProjectLeader; //@ts-ignore
      obj.workExamineInfoList[0].nodeOperatorName = obj.options[0].text + '-' + o.text; //@ts-ignore
    }

    if (['属地安全科长', '开始作业(安全科科长)', '完结验收(安全科科长)'].includes(item)) {
      obj.options = workUnit.value
        .filter((item) => currentUserInfo.orgCode.includes(item.orgCode))
        .map((val) => {
          return {
            text: val.departName,
            value: val.orgCode,
            id: val.id,
            loading: false,
            children: safeUserList,
          };
        });
    }

    if (item == '作业人员') {
      obj.options = workUnit.value
        .filter((item) => detail.constructionUnit.includes(item.orgCode))
        .map((val) => {
          return {
            text: val.departName,
            value: val.orgCode,
            id: val.id,
            loading: false,
            children: operatorList,
          };
        });
        if(detail.operator && detail.operator.split(',').length > 1){
          obj.type = '2';
        }
      obj.workExamineInfoList = detail.operator.split(',').map((citem: any) => {
        let o: any = operatorList.find((val: any) => val.id == citem);
        return { nodeOperator: citem, nodeOperatorName: o && o.text ? o.text : '' };
      });
    }

    if (
      ['工序现场(属地)负责人', '模块(属地)领导', '属地安全员', '完结验收(属地安全员)', '工序现场(属地)领导', '开始作业(属地安全员)'].includes(item)
    ) {
      // obj.options = getUserByorg(currentUserInfo.orgCode, true);
      obj.options = workUnit.value
        .filter((item) => currentUserInfo.orgCode.includes(item.orgCode))
        .map((val) => {
          return {
            text: val.departName,
            value: val.orgCode,
            id: val.id,
            loading: false,
            children: getUserByorg(currentUserInfo.orgCode, true),
          };
        });
    }

    if (['施工单位现场负责人', '发起验收(作业负责人)'].includes(item)) {
      obj.options = workUnit.value
        .filter((item) => detail.constructionUnit.includes(item.orgCode))
        .map((val) => {
          return {
            text: val.departName,
            value: val.orgCode,
            id: val.id,
            loading: false,
            children: getUserByorg(detail.constructionUnit, true),
          };
        });
      let o = getUserByorg(detail.constructionUnit, true).find((val) => val.id == detail.sceneHead);
      obj.workExamineInfoList[0].nodeOperator = detail.sceneHead;
      obj.workExamineInfoList[0].nodeOperatorName = obj.options[0].text + '-' + o.text; //@ts-ignore
    }

    if (item == '看火人员') {
      obj.add = false;
      obj.station = {
        need: true,
        value: '属地看火人',
      };
      obj.type = '1';
      obj.workExamineInfoList[0].title = '属地看火人'; //@ts-ignore
      obj.options = workUnit.value
        .filter((item) => currentUserInfo.orgCode.includes(item.orgCode))
        .map((val) => {
          return {
            text: val.departName,
            value: val.orgCode,
            id: val.id,
            loading: false,
            children: headOfUnit,
          };
        });
      let o = headOfUnit.find((val) => val.id == detail.territoryFireWatch);
      obj.workExamineInfoList[0].nodeOperator = detail.territoryFireWatch; //@ts-ignore
      obj.workExamineInfoList[0].nodeOperatorName = obj.options[0].text + '-' + o.text; //@ts-ignore
      if (detail.constructionUnit.includes('A04B12')) {
        obj.type = '2';
        obj.workExamineInfoList.push({
          nodeOperator: [],
          options: workUnit.value
            .filter((item) => item.orgCode.includes('A04B12'))
            .map((val) => {
              return {
                text: val.departName,
                value: val.orgCode,
                id: val.id,
                loading: false,
                children: sceneHeadList,
              };
            }),
          disabled: false,
          title: '施工单位看火人',
        }); //@ts-ignore
      }
    }
    if (['预验收(属地看火人)', '验收巡视(属地看火人)'].includes(item)) {
      obj.options = workUnit.value
        .filter((item) => currentUserInfo.orgCode.includes(item.orgCode))
        .map((val) => {
          return {
            text: val.departName,
            value: val.orgCode,
            id: val.id,
            loading: false,
            children: headOfUnit,
          };
        });
      let o = headOfUnit.find((val) => val.id == detail.territoryFireWatch);
      obj.workExamineInfoList[0].nodeOperator = detail.territoryFireWatch; //@ts-ignore
      obj.workExamineInfoList[0].nodeOperatorName = obj.options[0].text + '-' + o.text;
    }

    result.push(obj);
  });

  return result;
};
