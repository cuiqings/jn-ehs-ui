import { ref } from 'vue';
import { add, edit, queryById } from '../url/index';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
 import { defHttp } from '/@/utils/http/axios';

export const useDrawer = (emit, infoForm) => {
  const [registerModal, { openModal }] = useModal();
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('问题录入');
  const type = ref('add');
  const info = ref<any>({
    deviceType: '',
    jnRiskSpecialLifteAddVo:
    {
      deviceModel: '',
      deviceName: '',
      deviceNumber: '',
      equipmentState: '',
      factoryDate: '',
      factoryNumber: '',
      highly: null,
      hoistSpeed: '',
      id: '',
      installDate: '',
      installPermit: '',
      installPlace: '',
      manuLicense: '',
      manuUnit: '',
      remark: '',
      size: '',
      span: null,
      useCertificateNumber: '',
      useDepartmentCode: null,
      verificationDate: '',
      weight: null,
      workLevel: '',
      x: null,
      y: null,
    },
    jnRiskSpecialForkliftAddVo:
    {
      certificateNumber: '',
      deviceModel: '',
      deviceName: '',
      deviceNumber: '',
      engineNumber: '',
      equipmentState: '',
      factoryDate: '',
      factoryNumber: '',
      fitting: '',
      frameNumber: '',
      id: '',
      manuDate: '',
      manuUnit: '',
      protectNumber: '',
      registrationNumber: '',
      remark: '',
      size: '',
      useDepartmentCode: null,
      verificationDate: '',
      weight: null,
      x: null,
      y: null,
    },
    jnRiskSpecialPressureVesselAddVo:
    {
      containerType: '',
      containerWeight: null,
      designPressure: null,
      designTemperature: null,
      designYear: '',
      deviceName: '',
      deviceNumber: '',
      equipmentState: '',
      factoryDate: '',
      factoryNumber: '',
      id: '',
      bores: '',
      manuDate: '',
      manuUnit: '',
      media: '',
      registrationNumber: '',
      reliefDate: '',
      reliefNextDate: '',
      reliefValve: '',
      remark: '',
      settingPressure: null,
      size: '',
      useDate: '',
      useDepartmentCode: null,
      verificationDate: '',
      volume: null,
      wallThickness: null,
      withstandPressure: null,
      x: null,
      y: null,
    },
    jnRiskSpecialBoilerAddVo:
    {
      boilerUse: '',
      certificateNumber: '',
      combusMode: '',
      deviceModel: '',
      deviceName: '',
      equipmentState: '',
      factoryDate: '',
      factoryNumber: '',
      id: '',
      manuDate: '',
      manuLicense: '',
      manuUnit: '',
      maxPressure: null,
      preTemperature: null,
      rateCapacity: '',
      rateSteam: null,
      registrationNumber: '',
      remark: '',
      size: '',
      useDate: '',
      useDepartmentCode: null,
      useFuel: '',
      verificationDate: '',
      waterForm: '',
      waterPressure: null,
      waterTemperature: null,
      x: null,
      y: null,
    },
  });
  const activeKey = ref(1);
  const treeValue = ref({label: '请选择', value: null});
  const orgInfo = ref();
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    activeKey.value = 1;
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    info.value.deviceType = '';
    info.value.x = 0;
    info.value.y = 0;
    treeValue.value = {label: '请选择', value: null}
    if(data.type == 'add'){
      info.value.deviceType = '1'
    }
    if (['view', 'edit'].includes(data.type)) {
      let res = await queryById({ id: data.data.id }).catch(() => { return {} });
      orgInfo.value = await defHttp.get({ url: '/jn/common/getDepartTreeBy23' }, { isTransformResponse: false });

      if (res.deviceType == 1) {
        // 把deviceType == 1的对象替换给jnRiskSpecialLifteAddVo,其他类型类似
        info.value.jnRiskSpecialLifteAddVo = res.jnRiskSpecialLifteAddVo;
        info.value.deviceType = res.deviceType;
        info.value.x = res.jnRiskSpecialLifteAddVo.x;
        info.value.y = res.jnRiskSpecialLifteAddVo.y;
        initOrgCode(res.jnRiskSpecialLifteAddVo.useDepartmentCode);
      } else if (res.deviceType == 2) {
        info.value.jnRiskSpecialForkliftAddVo = res.jnRiskSpecialForkliftAddVo;
        info.value.deviceType = res.deviceType;
        info.value.x = res.jnRiskSpecialForkliftAddVo.x;
        info.value.y = res.jnRiskSpecialForkliftAddVo.y;
        initOrgCode(res.jnRiskSpecialForkliftAddVo.useDepartmentCode);
      } else if (res.deviceType == 3) {
        info.value.jnRiskSpecialPressureVesselAddVo = res.jnRiskSpecialPressureVesselAddVo;
        info.value.deviceType = res.deviceType;
        info.value.x = res.jnRiskSpecialPressureVesselAddVo.x;
        info.value.y = res.jnRiskSpecialPressureVesselAddVo.y;
        info.value.size = res.jnRiskSpecialPressureVesselAddVo.size;
        initOrgCode(res.jnRiskSpecialPressureVesselAddVo.useDepartmentCode);
      } else if (res.deviceType == 4) {
        info.value.jnRiskSpecialBoilerAddVo = res.jnRiskSpecialBoilerAddVo;
        info.value.deviceType = res.deviceType;
        info.value.x = res.jnRiskSpecialBoilerAddVo.x;
        info.value.y = res.jnRiskSpecialBoilerAddVo.y;
        initOrgCode(res.jnRiskSpecialBoilerAddVo.useDepartmentCode);
      }

      info.value.workPermitValidityPeriod = info.value.workPermitValidityPeriodStart
        ? info.value.workPermitValidityPeriodStart + '至' + info.value.workPermitValidityPeriodEnd
        : '';
    }
    
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });

  function initOrgCode(org) {
    if(org){
      treeValue.value = {
        value: org,
        label: getSelectedItem(org, orgInfo.value.result),
      }
    }
  }
  const getSelectedItem = (value, data) => {
    let str = '';
    data.some((d) => {
      if (value.length > 6) {
        return d.children?.some((c) => {
          if (c.orgCode === value) {
            str = d.departName + '>' + c.departName;
            return true;
          }
        });
      } else {
        if (d.orgCode === value) {
          str = d.departName;
          return true;
        }
      }
    });
    return str;
  };

  //清空其他类别数据
  const clear = (obj?) => {
    // treeValue.value = {label: '请选择', value: null};
    if (obj) {
      // 遍历对象并根据值的类型设置默认值
      Object.keys(obj).forEach((key) => {
        // if (typeof obj[key] === 'string') {
        //   obj[key] = '';
        // } else if (typeof obj[key] === 'number') {
        //   obj[key] = '';
        // } else if (typeof obj[key] === 'object') {
        //   console.log(key);
          
          obj[key] = null;
        // }
      });
    } else {
      clear(info.value.jnRiskSpecialPressureVesselAddVo);
      clear(info.value.jnRiskSpecialForkliftAddVo);
      clear(info.value.jnRiskSpecialBoilerAddVo);
      clear(info.value.jnRiskSpecialLifteAddVo);
    }
    // info.value.x = '';
    // info.value.y = '';
    // info.value.deviceType = '';
  };

  const handleSubmit = async () => {
    //在验证前清空其余数据并给标记位置赋值
    if (info.value.deviceType == '1') {
      clear(info.value.jnRiskSpecialPressureVesselAddVo);
      clear(info.value.jnRiskSpecialForkliftAddVo);
      clear(info.value.jnRiskSpecialBoilerAddVo);
      info.value.jnRiskSpecialLifteAddVo.x = info.value.x;
      info.value.jnRiskSpecialLifteAddVo.y = info.value.y;
      info.value.jnRiskSpecialLifteAddVo.size = info.value.size;
    } else if (info.value.deviceType == '2') {
      clear(info.value.jnRiskSpecialPressureVesselAddVo);
      clear(info.value.jnRiskSpecialLifteAddVo);
      clear(info.value.jnRiskSpecialBoilerAddVo);
      info.value.jnRiskSpecialForkliftAddVo.x = info.value.x;
      info.value.jnRiskSpecialForkliftAddVo.y = info.value.y;
      info.value.jnRiskSpecialForkliftAddVo.size = info.value.size;
    } else if (info.value.deviceType == '3') {
      clear(info.value.jnRiskSpecialLifteAddVo);
      clear(info.value.jnRiskSpecialForkliftAddVo);
      clear(info.value.jnRiskSpecialBoilerAddVo);
      info.value.jnRiskSpecialPressureVesselAddVo.x = info.value.x;
      info.value.jnRiskSpecialPressureVesselAddVo.y = info.value.y;
      info.value.jnRiskSpecialPressureVesselAddVo.size = info.value.size;
    } else if (info.value.deviceType == '4') {
      clear(info.value.jnRiskSpecialLifteAddVo);
      clear(info.value.jnRiskSpecialForkliftAddVo);
      clear(info.value.jnRiskSpecialPressureVesselAddVo);
      info.value.jnRiskSpecialBoilerAddVo.x = info.value.x;
      info.value.jnRiskSpecialBoilerAddVo.y = info.value.y;
      info.value.jnRiskSpecialBoilerAddVo.size = info.value.size;
    }
    // delete info.value.x
    // delete info.value.y
    // delete info.value.size
    infoForm.value
      .validate()
      .then(() => {
        //执行添加
        try {
          setDrawerProps({ confirmLoading: true });
          if (type.value === 'add') {
            add(info.value).then(() => {
              emit('success');
              close();
            });
          } else {
            edit(info.value).then(() => {
              emit('success');
              close();
            });
          }
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }).catch(err => console.log(err))
  };

  const close = () => {
    //刷新列表
    emit('success');
    //关闭弹窗
    closeDrawer();
    clear();
  };

  return {
    showFooter,
    showOkBtn,
    title,
    registerDrawer,
    BasicDrawer,
    handleSubmit,
    type,
    info,
    clear,
    activeKey,
    registerModal,
    openModal,
    treeValue
  };
};
export default useDrawer;
