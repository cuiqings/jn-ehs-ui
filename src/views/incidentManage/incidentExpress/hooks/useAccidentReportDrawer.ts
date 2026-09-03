import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { FormSchema } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { render, downloadFile } from '/@/utils/common/renderUtils';
import { getLoginBackInfo } from '/@/utils/auth';
import { downloadFileAll } from '/@/api/common/api';
import { reactive, ref, createVNode, nextTick, onMounted } from 'vue';
import {
  getOrganizationNew,
  saveOrUpdate,
  queryByEventId,
  affirmLog,
  rectifySaveOrUpdate,
  latestReport,
  queryVoByEventId,
  newsImplement,
  queryById,
  submitCheck,
} from '../url/index';
import { buttonAdd } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
// import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
export const useAccidentReportDrawer = (emit: any) => {
  const { createConfirm, createMessage } = useMessage();
  const loginInfo: any = getLoginBackInfo();
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '发生单位',
      field: 'orgCode',
      component: 'Select',
      required: true,
      componentProps: {
        options: [],
      },
    },
    {
      label: '事件结果',
      field: 'result',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'event_result',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '事件类型',
      field: 'type',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'event_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '事件描述',
      field: 'description',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        maxlength: 500,
        rows: 5,
      },
    },
    {
      label: '发生时间',
      field: 'eventTime',
      component: 'DatePicker',
      required: true,
      defaultValue: new Date(),
      componentProps: {
        showTime: { format: 'HH:mm' },
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DD HH:mm',
        placeholder: '请选择',
        style: { width: '100%' },
      },
    },
    {
      label: '事件地点',
      field: 'address',
      required: true,
      component: 'Input',
      componentProps: {
        maxlength: 100,
      },
    },
    {
      label: '临时处置措施',
      field: 'interimMeasures',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        maxlength: 500,
        rows: 5,
      },
    },
    {
      label: '现场照片',
      field: 'photo',
      component: 'JImageUpload',
      required: true,
      componentProps: {
        fileMax: 10,
        text: '',
        isWatermark: true,
      },
    },
  ];
  const formSchemaEdit: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '发生单位',
      field: 'orgCode',
      component: 'ApiSelect',
      required: true,
      componentProps: {
        api: getOrganizationNew,
        disabled: true,
        labelField: 'departName',
        valueField: 'orgCode',
      },
    },
    {
      label: '事件结果',
      field: 'result',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'event_result',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '事件类型',
      field: 'type',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'event_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '事件描述',
      field: 'description',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        maxlength: 500,
        rows: 5,
      },
    },
    {
      label: '发生时间',
      field: 'eventTime',
      component: 'DatePicker',
      required: true,
      defaultValue: new Date(),
      componentProps: {
        showTime: { format: 'HH:mm' },
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DD HH:mm',
        placeholder: '请选择',
        style: { width: '100%' },
      },
    },
    {
      label: '事件地点',
      field: 'address',
      required: true,
      component: 'Input',
      componentProps: {
        maxlength: 100,
      },
    },
    {
      label: '临时处置措施',
      field: 'interimMeasures',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        maxlength: 500,
        rows: 5,
      },
    },
    {
      label: '现场照片',
      field: 'photo',
      component: 'JImageUpload',
      required: true,
      componentProps: {
        fileMax: 10,
        text: '',
        isWatermark: true,
      },
    },
  ];
  const formSchemaView: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '发生单位',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        api: getOrganizationNew,
        labelField: 'departName',
        valueField: 'orgCode',
      },
    },
    {
      label: '事件结果',
      field: 'result',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'event_result',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '事件类型',
      field: 'type',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'event_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '事件描述',
      field: 'description',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 500,
        rows: 5,
      },
    },
    {
      label: '发生时间',
      field: 'eventTime',
      component: 'DatePicker',
      defaultValue: new Date(),
      componentProps: {
        showTime: { format: 'HH:mm' },
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DD HH:mm',
        placeholder: '请选择',
        style: { width: '100%' },
      },
    },
    {
      label: '事件地点',
      field: 'address',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: '临时处置措施',
      field: 'interimMeasures',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 500,
        rows: 5,
      },
    },
    {
      label: '现场照片',
      field: 'photo',
      component: 'JImageUpload',
      componentProps: {
        fileMax: 10,
        text: '',
      },
    },
  ];
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const drawerType = ref('');
  const current = ref<any>(0);
  const currentStatus = ref<any>(undefined);
  const radioValue = ref('1');
  // 调查报告
  let jnEventReport: any = reactive({});
  // 调查资料
  const surveyInformation = reactive({
    id: '',
    eventId: '',
    surveyFile: '',
    economicLossesFile: '',
    technologyFile: '',
    evidenceFile: '',
    medicineFile: '',
    craftFile: '',
    meetingFile: '',
    reportFile: '',
    trainingFile: '',
    otherFile: '',
  });
  // 调查报告集合
  const jnEventReportArr = ref<any[]>([]);
  let record: any = reactive({
    id: '',
    reporterName: '',
    updateTime: '',
  });
  // 事故快报
  const accidentReportInfo = reactive({
    reporterName: '',
    createTime: '',
  });
  // 事故确认
  const accidentConfirm = reactive({
    affirmerName: '',
    createTime: '',
    result: '',
    closeInfo: '',
    repeatEventName: '',
  });
  // 调查确认
  const investigationConfirm = reactive({
    affirmerName: '',
    createTime: '',
  });
  // 调查报告
  const investigationReportForm = reactive({
    affirmerName: '',
    updateTime: '',
  });
  // 整改落实集合
  const rectifyInfoArr = ref<any[]>([]);
  // 整改落实
  const rectifyInfo = reactive({
    eventId: '',
    name: '',
    filePath: '',
  });
  // 最新整改落实
  const newsImplementInfo = reactive({
    affirmerName: '',
    updateTime: '',
  });
  // 结案归档
  const closedFilingInfo = reactive({
    affirmerName: '',
    createTime: '',
  });
  const reviewer = ref('');
  const isDetails = ref(false);
  const investigationLoading = ref(false);
  const accidentLoading = ref(false);
  const reviewLoading = ref(false);
  const rectifyConfirmReviewLoading = ref(false);
  const orgOptions = ref<any[]>([]);
  const onClear = () => {
    const keys = Object.keys(accidentReportInfo);
    keys.forEach((item) => {
      accidentReportInfo[item] = '';
    });
    const keys1 = Object.keys(accidentConfirm);
    keys1.forEach((item) => {
      accidentConfirm[item] = '';
    });
    const keys2 = Object.keys(investigationConfirm);
    keys2.forEach((item) => {
      investigationConfirm[item] = '';
    });
    const keys3 = Object.keys(investigationReportForm);
    keys3.forEach((item) => {
      investigationReportForm[item] = '';
    });
    const keys4 = Object.keys(newsImplementInfo);
    keys4.forEach((item) => {
      newsImplementInfo[item] = '';
    });
    const keys5 = Object.keys(closedFilingInfo);
    keys5.forEach((item) => {
      closedFilingInfo[item] = '';
    });
  };
  onMounted(() => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  });
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, updateSchema, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    currentStatus.value = data.status || data.status === 0 ? data.status : undefined;
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    drawerType.value = data.type;
    isDetails.value = false;
    if (data.type === 'add') {
      updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          placeholder: '请选择',
        },
      });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          eventTime: timeDate(new Date().getTime(), true),
          orgCode: orgOptions.value[0].value,
        });
      } else {
        setFieldsValue({
          eventTime: timeDate(new Date().getTime(), true),
        });
      }
    }
    const keys = Object.keys(surveyInformation);
    keys.forEach((item) => {
      surveyInformation[item] = '';
    });
    rectifyInfo.eventId = '';
    rectifyInfo.name = '';
    rectifyInfo.filePath = '';
    jnEventReportArr.value = [];
    rectifyInfoArr.value = [];
    onClear();
    if (data.status === 6) {
      latestReport({ eventId: data.record.id }).then((data) => {
        reviewer.value = data.affirmerName;
      });
    }
    currentStep(currentStatus.value, data.record ? data.record.id : '');
    if (data.type !== 'add') {
      record = Object.assign(record, data.record);
      nextTick(() => {
        setFieldsValue({ ...record });
        if (data.type === 'edit') setProps({ schemas: formSchemaEdit });
        // 更新表单
        if (data.type !== 'edit') setProps({ disabled: !data.showOkBtn, schemas: formSchemaView });
      });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });
  // 注册重复上报
  const [registerModal, { openModal }] = useModal();
  // 注册非事故上报
  const [nonAccidentCloseModal, nonAccidentCloseData] = useModal();
  // 注册调查报告审核
  const [reviewerCloseModal, reviewerCloseModalData] = useModal();
  // 注册调查报告审核不通过
  const [reportReviewModal, reportReviewModalData] = useModal();
  // 当前步骤
  const currentStep = async (status: number | undefined, id: string) => {
    currentStatus.value = status;
    switch (status) {
      case 2:
        current.value = 1;
        break;
      case 3:
        current.value = 1;
        break;
      case 4:
        current.value = 3;
        break;
      case 5:
        current.value = 2;
        break;
      case 6:
        current.value = 2;
        break;
      case 7:
        current.value = 2;
        break;
      case 8:
        current.value = 3;
        break;
      case 9:
        current.value = 3;
        break;
      case 10:
        current.value = 3;
        break;
      case 11:
        current.value = 5;
        break;
      default:
        current.value = status;
    }
    // 事故快报
    if ((status && status >= 0) || status === 0) {
      queryById({ id }).then((data) => {
        Object.assign(accidentReportInfo, data);
      });
    }
    if (status && status >= 1) {
      affirmLog({ eventId: id, operateOrder: 2 }).then((data) => {
        Object.assign(accidentConfirm, data);
      });
    }
    if ((status && status > 3) || drawerType.value === 'view') {
      affirmLog({ eventId: id, operateOrder: 3 }).then((data) => {
        Object.assign(investigationConfirm, data);
      });
    }
    if (status && status >= 6) {
      queryByEventId({ eventId: id }).then((data) => {
        jnEventReportArr.value = [];
        if ((drawerType.value === 'view' || isDetails.value) && status !== 11) {
          jnEventReportArr.value = data.reverse();
        } else if (status === 11) {
          jnEventReportArr.value = data;
        } else {
          jnEventReportArr.value = [data[data.length - 1]];
          if (data[data.length - 1].jnEventSurveyFile) Object.assign(surveyInformation, data[data.length - 1].jnEventSurveyFile);
        }
      });
    }
    if (status && status >= 8) {
      latestReport({ eventId: id }).then((data) => {
        investigationReportForm.affirmerName = data.affirmerName;
        investigationReportForm.updateTime = data.updateTime;
      });
    }
    if (status && status >= 9) {
      queryVoByEventId({ eventId: id }).then((data) => {
        rectifyInfoArr.value = [];
        if ((drawerType.value === 'view' || isDetails.value) && status !== 11) {
          rectifyInfoArr.value = data.reverse();
        } else if (status === 11) {
          rectifyInfoArr.value = data;
        } else {
          if (data[data.length - 1].jnEventRectify) Object.assign(rectifyInfo, data[data.length - 1].jnEventRectify);
          rectifyInfoArr.value = [data[data.length - 1]];
        }
      });
    }
    if (status && status === 11) {
      try {
        nextTick(() => {
          setFieldsValue({ ...record });
          // 更新表单
          setProps({ disabled: true, schemas: formSchemaView });
        });
        const data = await newsImplement({ eventId: id });
        const data1 = await affirmLog({ eventId: id, operateOrder: 5 });
        newsImplementInfo.affirmerName = data.affirmerName;
        newsImplementInfo.updateTime = data.updateTime;
        Object.assign(closedFilingInfo, data1);
      } catch (e) {}
    }
  };
  const handleSubmit = async () => {
    try {
      const values = await validate();
      setDrawerProps({ confirmLoading: true });
      //提交表单
      values.name = await integrateName(values.eventTime, values.orgCode, values.type);
      await saveOrUpdate(values).then((res) => {
        if (res.success) {
          createMessage.success('保存成功！');
          //刷新列表
          emit('success');
          //关闭弹窗
          closeDrawer();
        } else {
          createMessage.error(res.message);
        }
      });
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };
  // 整合name
  const integrateName = async (eventTime: string, orgCode: string, type: string) => {
    let str = '';
    const b = await orgCodeFilter(orgCode);
    str = timeDate(eventTime) + b + render.renderDict(type, 'event_type').children + '事件';
    return str;
  };
  // 查找当前发生单位
  const orgCodeFilter = async (orgCode: string) => {
    let orgText = '';
    try {
      const res = await getOrganizationNew();
      orgText = res.filter((item: any) => item.orgCode === orgCode)[0].departName;
    } catch (e) {}
    return orgText;
  };
  // 年月日/年月日时分
  const timeDate = (eventTime: string | number, is = false) => {
    const date = new Date(eventTime);
    let str = '';
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    if (!is) str = Y + M + D;
    else str = Y + M + D + h + m;
    return str;
  };
  // 重复上报
  const onRepeat = () => {
    openModal(true, record);
  };
  // 非事故关闭
  const nonAccidentClose = () => {
    nonAccidentCloseData.openModal(true, record);
  };
  // 确认事故并上报
  const confirmAccident = () => {
    accidentLoading.value = true;
    buttonAdd({
      eventId: record.id,
      type: 3,
    })
      .then((res) => {
        if (res.success) {
          onSuccess(3);
          createMessage.success('上报成功！');
        } else {
          createMessage.error(res.message);
        }
      })
      .finally(() => {
        accidentLoading.value = false;
      });
  };
  // 重复上报跳转
  const goDetails = (id) => {
    if (id && id !== '') {
      queryById({ id }).then((res) => {
        setFieldsValue({ ...res });
        setProps({ disabled: true, schemas: formSchemaView });
        currentStep(res.status, res.id);
      });
    }
  };
  // 确认并结案
  const confirmAndCtc = () => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '确认并结案',
      okText: '确认结案',
      content: '<div><div>是否确认当前事件上报内容，并结案？</div><div></div>说明：结案后不再上传调查报告</div>',
      onOk: () => {
        buttonAdd({ eventId: record.id, type: 4 }).then((res) => {
          if (res.success) {
            onSuccess(4);
            createMessage.success('结案成功！');
          } else {
            createMessage.error(res.message);
          }
        });
      },
    });
  };
  // 确认并调查
  const confirmAndInvestigation = () => {
    investigationLoading.value = true;
    buttonAdd({
      eventId: record.id,
      type: 5,
    })
      .then((res) => {
        if (res.success) {
          onSuccess(5);
          createMessage.success('确认并调查成功！');
        } else {
          createMessage.error(res.message);
        }
      })
      .finally(() => {
        investigationLoading.value = false;
      });
  };
  // 调查报告数据获取
  const dataObj = (reviewInfo, value) => {
    jnEventReport = reviewInfo;
    radioValue.value = value;
  };
  // 调查报告保存
  const onSave = () => {};
  // 下载调查报告
  const downloadInveRe = async (index: number) => {
    if (radioValue.value === '1') {
      const element = document.getElementById(`investigationReport${index}`);
      if (element) {
        let width = element.offsetWidth / 4;
        let height = element.offsetHeight / 4;
        const limit = 14400;
        if (height > limit) {
          const contentScale = limit / height;
          height = limit;
          width *= contentScale;
        }
        await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          // ignoreElements: (element: { id: string }) => {
          //   if (element.id === 'ignoreBtnElement') return true;
          //   return false;
          // },
        }).then((canvas) => {
          const context: any = canvas.getContext('2d');
          let orientation;
          if (context) {
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
          }
          const pageData = canvas.toDataURL('image/jpg', 1.0);
          const img = new Image();
          img.src = pageData;
          img.onload = function () {
            img.width /= 2;
            img.height /= 2;
            img.style.transform = 'scale(0.5)';
            let pdf;
            orientation = width > height ? 'l' : 'p';
            // eslint-disable-next-line
            pdf = new jsPDF(orientation, 'mm', [width, height]);
            pdf.addImage(pageData, 'jpeg', 0, 0, width, height);
            pdf.save('调查报告.pdf');
          };
        });
      }
      // const options = {
      //   margin: 0.4,
      //   filename: '调查报告.pdf',
      //   image: { type: 'jpeg', quality: 0.98 },
      //   html2canvas: { scale: 2, useCORS: true, allowTaint: false },
      //   jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      //   pagebreak: { mode: 'avoid-all' },
      // };
      // await html2pdf().from(element).set(options).save();
    } else {
      downloadFile(jnEventReport.reportFile, trimFileName(jnEventReport.reportFile));
    }
  };
  const trimFileName = (fileName: string) => {
    const index = fileName.lastIndexOf('_');
    if (index !== -1) {
      return fileName.substring(0, index) + fileName.substring(fileName.lastIndexOf('.'));
    }
    return fileName;
  };
  // 调查报告审核
  const confirmReview = () => {
    if (radioValue.value === '2' && jnEventReport.reportFile === '') {
      return createMessage.warning('请上传调查报告！');
    }
    if (radioValue.value === '1') {
      jnEventReport.reportFile = '';
      if (jnEventReport.name === '') {
        return createMessage.warning('请输入报告名称！');
      }
      if (!jnEventReport.orgCode || jnEventReport.orgCode === '') {
        return createMessage.warning('请选择事故发生单位！');
      }
      if (jnEventReport.address === '') {
        return createMessage.warning('请输入事故发生地点！');
      }
      if (!jnEventReport.eventTime || jnEventReport.eventTime === '') {
        return createMessage.warning('请选择事故发生时间！');
      }
      if (!jnEventReport.type || jnEventReport.type === '') {
        return createMessage.warning('请选择事件类型！');
      }
      if (jnEventReport.reason === '') {
        return createMessage.warning('请输入事件原因！');
      }
      if (jnEventReport.injurySeverity === '') {
        return createMessage.warning('请输入事故伤害程度！');
      }
      const peopleInfo = jnEventReport.peopleInfo;
      for (let i = 0; i < peopleInfo.length; i++) {
        if (peopleInfo[i].name === '') {
          return createMessage.warning(`请输入第${i + 1}行伤亡人员姓名！`);
        }
        if (!peopleInfo[i].sex || peopleInfo[i].sex === '') {
          return createMessage.warning(`请输入第${i + 1}行伤亡人员性别！`);
        }
      }
      if (jnEventReport.detailedPassage === '') {
        return createMessage.warning('请输入事故详细经过！');
      }
      if (jnEventReport.directReason === '') {
        return createMessage.warning('请输入直接原因！');
      }
      if (jnEventReport.indirectReason === '') {
        return createMessage.warning('请输入间接原因！');
      }
      const riskJudge = jnEventReport.riskJudge;
      for (let i = 0; i < riskJudge.length; i++) {
        if (riskJudge[i].riskType === '') {
          return createMessage.warning(`请输入第${i + 1}行风险类型！`);
        }
        if (riskJudge[i].area === '') {
          return createMessage.warning(`请选择第${i + 1}行工段/作业区域！`);
        }
        if (riskJudge[i].activity === '') {
          return createMessage.warning(`请输入第${i + 1}行设备设施/作业活动！`);
        }
        if (riskJudge[i].step === '') {
          return createMessage.warning(`请输入第${i + 1}行检查项目/作业步骤！`);
        }
        if (riskJudge[i].dangerousEvent === '') {
          return createMessage.warning(`请输入第${i + 1}行危险或潜在事件！`);
        }
      }
      const dutyDispose = jnEventReport.dutyDispose;
      for (let i = 0; i < dutyDispose.length; i++) {
        if (dutyDispose[i].accidentRespPeople === '') {
          return createMessage.warning(`请输入第${i + 1}行事故责任人姓名！`);
        }
        if (!dutyDispose[i].resp || dutyDispose[i].resp === '') {
          return createMessage.warning(`请选择第${i + 1}行事故责任类型！`);
        }
        if (dutyDispose[i].disposalOpinions === '') {
          return createMessage.warning(`请输入第${i + 1}行事故处置意见！`);
        }
      }
      if (jnEventReport.precaution === '') {
        return createMessage.warning('请输入预防事故重复发生的措施！');
      }
    }
    if (orgOptions.value.length > 1) {
      reviewerCloseModalData.openModal(true, { record, investigationReport: jnEventReport, surveyInformation });
    } else {
      jnEventReport.eventId = record.id;
      surveyInformation.eventId = record.id;
      reviewLoading.value = true;
      submitCheck({ checkerId: '', jnEventReport, jnEventSurveyFile: surveyInformation })
        .then((res) => {
          if (res.success) {
            createMessage.success('上报成功！');
            onSuccess(6);
          } else {
            createMessage.error(res.message);
          }
        })
        .finally(() => {
          reviewLoading.value = false;
        });
    }
  };
  const onSuccess = (type: number) => {
    isDetails.value = true;
    currentStep(type, record.id);
    nextTick(() => {
      setFieldsValue({ ...record });
      // 更新表单
      setProps({ disabled: true, schemas: formSchemaView });
    });
    //刷新列表
    emit('success');
  };
  // 取消
  const onClose = () => {
    closeDrawer();
  };
  // 审核通过
  const reviewPass = async () => {
    if (record.checkerId && loginInfo.userInfo.id !== record.checkerId && currentStatus.value !== 9) {
      return createMessage.warning(`当前审核人应为${reviewer.value}，您没有权限审核！`);
    }
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '审核通过',
      okText: '确认',
      content: '<div>是否确认通过？</div>',
      onOk: () => {
        buttonAdd({
          eventId: record.id,
          type: currentStatus.value === 9 ? 11 : 8,
        }).then((res) => {
          if (res.success) {
            onSuccess(currentStatus.value === 9 ? 11 : 8);
            createMessage.success('审核完成！');
          } else {
            createMessage.error(res.message);
          }
        });
      },
    });
  };
  // 审核不通过
  const reviewFail = () => {
    if (record.checkerId && loginInfo.userInfo.id !== record.checkerId && currentStatus.value !== 9) {
      return createMessage.warning(`当前审核人应为${reviewer.value}，您没有权限审核！`);
    }
    reportReviewModalData.openModal(true, record);
  };
  // 整改落实取消
  const rectifyClose = () => {
    rectifyInfo.eventId = '';
    rectifyInfo.name = '';
    rectifyInfo.filePath = '';
    closeDrawer();
  };
  // 整改落实审核
  const rectifyConfirmReview = () => {
    if (rectifyInfo.name === '') {
      return createMessage.warning('请输入整改说明');
    }
    rectifyConfirmReviewLoading.value = true;
    rectifySaveOrUpdate({ ...rectifyInfo, eventId: record.id })
      .then((res) => {
        if (res.success) {
          rectifyInfo.eventId = '';
          rectifyInfo.name = '';
          rectifyInfo.filePath = '';
          onSuccess(9);
          createMessage.success('提交成功！');
        } else {
          createMessage.error(res.message);
        }
      })
      .finally(() => {
        rectifyConfirmReviewLoading.value = false;
      });
  };
  const onDownloadAll = async (index: number) => {
    await downloadFileAll(`/eventmanage/jnEventSurveyFile/downloadAll?eventId=${record.id}`, '调查资料.zip');
    await downloadInveRe(index);
  };
  return {
    BasicDrawer,
    registerDrawer,
    BasicForm,
    registerForm,
    handleSubmit,
    showFooter,
    showOkBtn,
    drawerType,
    current,
    registerModal,
    onRepeat,
    onSuccess,
    nonAccidentClose,
    nonAccidentCloseModal,
    currentStatus,
    confirmAccident,
    confirmAndInvestigation,
    confirmAndCtc,
    onSave,
    confirmReview,
    reviewerCloseModal,
    dataObj,
    onClose,
    reviewPass,
    reviewFail,
    downloadInveRe,
    surveyInformation,
    jnEventReport,
    accidentConfirm,
    investigationConfirm,
    investigationReportForm,
    jnEventReportArr,
    reportReviewModal,
    rectifyClose,
    rectifyConfirmReview,
    rectifyInfo,
    rectifyInfoArr,
    newsImplementInfo,
    closedFilingInfo,
    accidentReportInfo,
    isDetails,
    record,
    onDownloadAll,
    goDetails,
    investigationLoading,
    accidentLoading,
    reviewLoading,
    rectifyConfirmReviewLoading,
  };
};
export default useAccidentReportDrawer;
