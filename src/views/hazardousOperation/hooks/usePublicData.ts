export const useData = () => {
  const setTypeTit = (index) => {
    return index == 0
      ? '通用要求'
      : index == 6
      ? '砂轮金属切割'
      : index == 9
      ? '墙壁屋顶动火'
      : index == 12
      ? '高处动火（距地面≧2m）'
      : index == 15
      ? '管道设备动火'
      : index == 18
      ? '气切割电焊'
      : '';
  };

  const WorkSecurity = (data) => {
    let maps = [
      { title: '通用要求', checked: null, children: [] },
      { title: '砂轮金属切割', checked: null, children: [] },
      { title: '墙壁屋顶动火', checked: null, children: [] },
      { title: '高处动火（距地面≧2m）', checked: null, children: [] },
      { title: '管道设备动火', checked: null, children: [] },
      { title: '气切割电焊', checked: null, children: [] },
    ];
    data.forEach((val, idx) => {
      if (idx < 6) {
        maps[0].children.push(val);
      }
      if (idx > 5 && idx < 9) {
        maps[1].children.push(val);
      }
      if (idx > 8 && idx < 12) {
        maps[2].children.push(val);
      }
      if (idx > 11 && idx < 15) {
        maps[3].children.push(val);
      }
      if (idx > 14 && idx < 18) {
        maps[4].children.push(val);
      }
      if (idx > 17) {
        maps[5].children.push(val);
      }
    });

    return maps;
  };

  // 动火作业 安全措施
  const fireSafeMathed = (data) => {
    let result = {
      dhConfirm: '',
      securityMeasuresIds: '',
    };
    data.forEach((item, idx) => {
      if (item.checked) {
        result.dhConfirm += item.title + '-' + item.checked + ',';
      } else {
        result.dhConfirm += item.title + '-,';
      }
      item.children.forEach((item) => {
        if (item.checked) {
          result.securityMeasuresIds += item.id + '-' + item.checked + ',';
        } else {
          result.securityMeasuresIds += item.id + '-,';
        }
      });
    });
    result.securityMeasuresIds = result.securityMeasuresIds ? result.securityMeasuresIds.slice(0, -1) : '';
    result.dhConfirm = result.dhConfirm ? result.dhConfirm.slice(0, -1) : '';
    return result;
  };

  const curColumns = [
    {
      title: '所属单位',
      dataIndex: 'org3Name',
      key: 'org3Name',
    },
    {
      title: '人员姓名',
      dataIndex: 'realname',
      key: 'realname',
    },
    {
      title: '工号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '证书',
      dataIndex: 'certificationsName',
      key: 'certificationsName',
    },
  ];

  return {
    setTypeTit,
    fireSafeMathed,
    WorkSecurity,
    curColumns,
  };
};
