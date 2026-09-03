<template>
  <div>
    <BasicDrawer v-bind="$attrs" @close="close" @register="registerModal" :width="'50%'"
      :bodyStyle="{ padding: '0 0 60px 0' }" :title="title" destroyOnClose :maskClosable="false">
      <BasicForm @register="registerForm">
        <template #examPaperId="{ model }">
          <a-button type="primary" @click="openExamConfig">选择试卷</a-button>
          <span style="padding-left: 16px">{{ model.examPaperName }}</span>
        </template>
        <template #trainObject="{ model }">
          <!-- <a-button type="primary" @click="openPersonConfig">选择培训对象</a-button>
          <span style="padding-left: 16px" v-if="model.trainObject">{{ model.trainObjectPerson }}</span> -->
          <div style="margin-bottom: 10px">
            <a-button type="primary" @click="downloadTemplate" style="margin-right: 10px">下载模版</a-button>
            <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls"> 上传培训对象
            </j-upload-button>
          </div>
          <InputTextArea v-model:value="model.trainObjectPerson" readonly placeholder="请选择" auto-size="auto"
            @click="openPersonConfig" />
        </template>
        <template #examPaperName="{ model, field }">
          <a-button type="primary" @click="openExamConfig">选择试卷</a-button>
          <span style="padding-left: 16px">{{ model[field] }}</span>
        </template>
        <template #orgCode="{ model, field }">
          <a-tree-select v-model:value="model[field]" placeholder="请选择" :tree-data="applicationUnitList" showSearch
            tree-node-filter-prop="label" :field-names="{ label: 'title', value: 'key', children: 'children' }" />
        </template>
        <template #certIssue="{ model, field }">
          <a-radio-group v-model:value="model[field]">
            <a-radio value="1">无发证</a-radio>
            <a-radio value="2">及格发证</a-radio>
          </a-radio-group>
          <!-- <a-button type="primary" v-if="model[field] == '2'" @click="openCertConfig" style="margin-left: 16px">选择证书</a-button>
            <span>{{ certName }}</span> -->
        </template>
        <template #certId="{ model }">
          <a-button type="primary" v-if="model['certIssue'] == '2'" @click="openCertConfig">选择证书</a-button>
          <span style="margin-left: 16px">{{ certName }}</span>
        </template>
        <template #time="{ model, field }">
          <a-range-picker :disabledDate="disabledDate" format="YYYY-MM-DD HH:mm:ss" valueFormat="YYYY-MM-DD HH:mm:ss"
            v-model:value="model[field]" show-time style="width: 100%" />
        </template>
      </BasicForm>
      <div class="examconfig">
        <div class="title">考试设置</div>
        <a-form :model="examConfig" name="basic" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" autocomplete="off"
          ref="examConfigRef">
          <a-form-item label="试题顺序" name="questionsSort" :rules="[{ required: true, message: '请选择' }]">
            <a-radio-group v-model:value="examConfig.questionsSort">
              <a-radio value="1">固定排序</a-radio>
              <a-radio value="2">打乱排序</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="选项顺序" name="optionsSort" :rules="[{ required: true, message: '请选择' }]">
            <a-radio-group v-model:value="examConfig.optionsSort">
              <a-radio value="1">固定排序</a-radio>
              <a-radio value="2">打乱排序</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="可考次数" name="examNum" :rules="[{ required: true, message: '请选择' }]">
            <a-radio-group v-model:value="examConfig.examNum">
              <a-radio value="1">1次</a-radio>
              <a-radio value="2">2次</a-radio>
              <a-radio value="3">不限</a-radio>
              <a-radio value="4">及格为止</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="考试时间" name="examTime" :rules="[
            { required: true, message: '请输入' },
            { validator: timevalidator, trigger: 'change' },
          ]">
            <a-input-number :min="0" v-model:value="examConfig.examTime" /> 分钟
          </a-form-item>
          <a-form-item label="及格分" name="passScore" :rules="[
            { required: true, message: '请输入' },
            { validator: scorevalidator, trigger: 'change' },
          ]">
            <a-input-number :min="0" v-model:value="examConfig.passScore" /><span>（总分：{{ examConfig.score }}）</span>
          </a-form-item>
          <a-form-item v-if="false" name="score" :rules="[{ required: true, message: '请输入' }]">
            <a-input-number v-model:value="examConfig.score" /><span>（总分：{{ examConfig.score }}）</span>
          </a-form-item>
          <a-form-item label="是否短信验证" name="smsFlag" :rules="[{ required: true, message: '请选择' }]">
            <a-radio-group v-model:value="examConfig.smsFlag">
              <a-radio value="0">发送</a-radio>
              <a-radio value="1">不发送</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="防切屏" name="smsFlag" :rules="[{ required: true, message: '请选择' }]">
            <a-switch v-model:checked="examConfig.cutScreen" />
          </a-form-item>
        </a-form>
      </div>
      <template #footer>
        <div style="text-align: center; padding-top: 13px">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" :loading="loading" @click="confirmClose">提交</a-button>
        </div>
      </template>
    </BasicDrawer>
    <!-- 培训对象 -->
    <UserModal @register="registerUserModal" @success="UserModalSuccess" />
    <!-- 试卷 -->
    <PaperModal @register="registerPaperModal" @success="PaperModalSuccess" />
    <!-- 证书 -->
    <CertificateModal @register="registerCertificateModal" @success="certificateModalSuccess" />
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
import { ref, onMounted } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { FormSchema } from '/@/components/Table';
import { getDeptNew, add, edit } from './url/index';
import { getEduOrgList } from '/@/api/common/api';
import UserModal from '../../../studyTraining/trainingTasks/userModal.vue';
import PaperModal from './paperModal.vue';
import CertificateModal from './certificate.vue';
import { useModal } from '/@/components/Modal';
import { getInfo, getExamConfig } from './url/index';
import type { FormInstance } from 'ant-design-vue';
import { useUserStore } from '/@/store/modules/user';
import { useMethods } from '/@/hooks/system/useMethods';
import { Input } from 'ant-design-vue';
import dayjs from 'dayjs';
const { createConfirm, createMessage } = useMessage();
const { handleImportXls, handleExportXlsx } = useMethods();
const InputTextArea = Input.TextArea;
// 选择考试对象
const [registerUserModal, { openModal: openUserModal, closeModal: closeUserModal }] = useModal();
// 选择试卷
const [registerPaperModal, { openModal: openPaperModal, closeModal: closePaperModal }] = useModal();
// 选择证书
const [registerCertificateModal, { openModal: openCertigicateModal, closeModal: closeCertificateModal }] = useModal();
const userStore: any = useUserStore();
const emit = defineEmits(['success']);
const title = ref('新增');
const showOkBtn = ref(true);
const orgOptions: any = ref([]);
const departOptions: any = ref([]);
const loading = ref(false);
const disabledDate = (current) => {
  // 禁止选择当前日期之前的日期
  return current && current < dayjs().startOf('day');
};
const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '所属单位',
    field: 'orgCode',
    component: 'TreeSelect',
    required: true,
    slot: 'orgCode',
  },
  {
    label: '任务名称',
    field: 'examTaskName',
    component: 'Input',
    required: true,
    componentProps: {
      autoSize: true,
      maxlength: 50,
    },
  },
  // {
  //   label: '考试频率',
  //   field: 'frequency',
  //   component: 'Select',
  //   required: true,
  //   defaultValue: '1',
  //   componentProps: {
  //     placeholder: '请选择',
  //     options: [
  //       { label: '单次', value: '1' },
  //       { label: '每日', value: '2' },
  //       { label: '每周', value: '3' },
  //       { label: '每月', value: '4' },
  //     ],
  //   },
  // },
  {
    label: '考试时间',
    field: 'time',
    required: true,
    component: 'RangePicker',
    slot: 'time',
  },
  {
    label: '培训对象',
    // required: true,
    field: 'trainObject',
    component: 'InputTextArea',
    slot: 'trainObject',
  },
  {
    label: '培训对象-名称',
    field: 'trainObjectPerson',
    component: 'InputTextArea',
    show: false,
  },
  {
    label: '考试试卷',
    required: true,
    field: 'examPaperName',
    component: 'InputTextArea',
    slot: 'examPaperName',
    show: false,
  },
  {
    label: '考试试卷',
    required: true,
    field: 'examPaperId',
    component: 'InputTextArea',
    slot: 'examPaperId',
  },
  {
    label: '证书发放',
    field: 'certIssue',
    required: true,
    component: 'ApiRadioGroup',
    defaultValue: '1',
    slot: 'certIssue',
  },
  {
    label: '证书',
    required: () => getFieldsValue().certIssue === '2',
    field: 'certId',
    component: 'Input',
    show: () => getFieldsValue().certIssue === '2',
    slot: 'certId',
  },
  {
    label: '证书名称',
    field: 'certName',
    component: 'Input',
    show: false,
  },
  {
    label: '是否关联绩效考核',
    field: 'correlationPerformance',
    required: true,
    component: 'Switch',
    defaultValue: 0,
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
];
const detailInfo = ref({});

//表单配置
const [registerForm, { setProps, resetFields, setFieldsValue, getFieldsValue, updateSchema, validate, clearValidate }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: false,
  labelCol: {
    xs: { span: 24 },
    sm: { span: 3 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 21 },
  },
});
const applicationUnitList = ref<any[]>([]);
onMounted(() => {
  getEduOrgList({ level: 5 }).then((res) => {
    applicationUnitList.value = setOrgOptions(res, res[0].title);
  });
});
function setOrgOptions(list, str) {
  list.forEach((item) => {
    item.label = item.title;
    item.value = item.id;
    if (item.key.length > 9) {
      item.title = str + ' - ' + item.title;
    }
    if (item.children) {
      item.children = setOrgOptions(item.children, item.title);
    }
  });
  return list;
}
// 选择证书
const openCertConfig = () => {
  openCertigicateModal(true, {});
};

// 选择证书
const certName = ref('');
const certificateModalSuccess = (map) => {
  setFieldsValue({
    certId: map.id,
    certName: map.name,
  });
  certName.value = map.name;
  closeCertificateModal();
};

const UserModalSuccess = (map, orgArr, userArr) => {
  setFieldsValue({
    trainObjectPerson: map.trainObjectOrgName ? map.trainObjectOrgName + ',' + map.trainObjectPersonName : map.trainObjectPersonName,
    trainObject: map,
  });
  orgList.value = orgArr;
  userArrList.value = userArr;
  closeUserModal();
};

const PaperModalSuccess = (map) => {
  setFieldsValue({
    examPaperName: map.paperName,
    examPaperId: map.id,
  });
  examConfig.value.score = map.score;
  closePaperModal();
};
// 车间
const getDepartList = (orgCode) => {
  getDeptNew({ orgCode }).then(async (res) => {
    departOptions.value = res.map((item: any) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
    updateSchema({
      field: 'departCode',
      componentProps: () => {
        return {
          options: departOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
    });
  });
};
// 考试配置
const examConfig = ref<any>({
  smsFlag: '1',
  questionsSort: '2',
  optionsSort: '2',
  examNum: '1',
  score: '0',
  examTime: '',
  passScore: '',
  cutScreen: false,
});
const examConfigRef = ref<FormInstance | null>(null);
const [registerModal, { closeDrawer }] = useDrawerInner(async (data) => {
  title.value = data.title;
  showOkBtn.value = data.showOkBtn;
  detailInfo.value = {};
  await resetFields();
  updateSchema({
    field: 'orgCode',
    componentProps: {
      options: orgOptions.value,
      fieldNames: { label: 'title', value: 'key', key: 'id', options: 'children' },
      showSearch: true,
      filterOption: (input: string, option: any) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
      onChange: (value) => {
        updateSchema({
          field: 'departCode',
          componentProps: () => {
            return {
              options: [],
              showSearch: true,
              filterOption: (input: string, option: any) => {
                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              },
            };
          },
        });
        if (value) {
          getDepartList(value);
        }
      },
    },
  });
  setFieldsValue({
    orgCode: userStore.userInfo.orgCode,
  });
  if (data.type === 'add') {
    orgList.value = [];
    userArrList.value = [];
    if (orgOptions.value?.length === 1) {
      setFieldsValue({
        orgCode: orgOptions.value[0]?.value,
      });
      getDepartList(orgOptions.value[0]?.value);
    }
  }
  if (data.type !== 'add') {
    const detail = await getInfo(data.data.id);
    const configData = await getExamConfig(data.data.id);
    detailInfo.value = detail;
    Object.assign(examConfig.value, configData);
    orgList.value =
      detail.orgList?.map((item) => ({
        title: item.departName,
        key: item.orgCode,
      })) || [];
    userArrList.value =
      detail.userList?.map((item) => ({
        ...item,
        userNameWorkNo: `${item.realname}（${item.username}）`,
      })) || [];
    certName.value = detail.certName;
    //表单赋值
    await setFieldsValue({
      ...detail,
    });
    let names = '';
    let trainObject = {
      trainObjectOrg: '',
      trainObjectOrgName: '',
      trainObjectPerson: '',
      trainObjectPersonName: '',
    };
    if (detail.orgList && detail.orgList.length > 0) {
      detail.orgList.map((item) => {
        names += item.departName + ',';
        trainObject['trainObjectOrg'] += item.orgCode + ',';
        trainObject['trainObjectOrgName'] += item.departName + ',';
      });
      trainObject.trainObjectOrg = trainObject.trainObjectOrg.substring(0, trainObject.trainObjectOrg.length - 1);
      trainObject.trainObjectOrgName = trainObject.trainObjectOrgName.substring(0, trainObject.trainObjectOrgName.length - 1);
    }
    if (detail.userList && detail.userList.length > 0) {
      detail.userList.map((item) => {
        names += item.realname + ',';
        trainObject['trainObjectPerson'] += item.id + ',';
        trainObject['trainObjectPersonName'] += item.realname + ',';
      });
      trainObject.trainObjectPerson = trainObject.trainObjectPerson.substring(0, trainObject.trainObjectPerson.length - 1);
      trainObject.trainObjectPersonName = trainObject.trainObjectPersonName.substring(0, trainObject.trainObjectPersonName.length - 1);
    }
    names = names.substring(0, names.length - 1);
    console.log(trainObject);

    setFieldsValue({
      trainObjectPerson: names,
    });
    setFieldsValue({
      trainObject: trainObject,
    });

    setFieldsValue({
      time: [new Date(detail.examStrTime), new Date(detail.examEndTime)],
    });
    if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
  }
});
const close = () => {
  closeDrawer();
  resetFields();
  examConfigRef.value?.resetFields();
  examConfig.value = {
    smsFlag: '1',
    questionsSort: '2',
    optionsSort: '2',
    examNum: '1',
    score: '0',
  };
  certName.value = '';
};
const confirmClose = async () => {
  const values = await validate();
  await examConfigRef.value?.validate();

  const formData = getFieldsValue();
  formData.examStrTime = formData.time.split(',')[0];
  formData.examEndTime = formData.time.split(',')[1];
  loading.value = true;
  if (title.value === '新增') {
    add({ ...formData, ...values.trainObject, examConfig: examConfig.value })
      .then((res) => {
        if (res) {
          //关闭弹窗
          closeDrawer();
          //刷新列表
          emit('success');
        }
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    edit({ ...formData, ...values.trainObject, examConfig: examConfig.value })
      .then((res) => {
        if (res) {
          //关闭弹窗
          closeDrawer();
          //刷新列表
          emit('success');
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }
};
// 选择试卷
const openExamConfig = () => {
  openPaperModal(true, { value: detailInfo.value });
};
// 部门
const orgList: any = ref([]);
// 人员
const userArrList: any = ref([]);
// 选择培训对象
const openPersonConfig = () => {
  if (title.value === '新增') {
    openUserModal(true, {
      data: {
        orgList: orgList.value,
        userList: userArrList.value,
      },
    });
  } else {
    openUserModal(true, {
      data: {
        orgList: orgList.value,
        userList: userArrList.value,
      },
      type: 'edit',
    });
  }
};
const timevalidator = (_, value) => {
  if (value <= 0) return Promise.reject('考试时间应大于0分钟');
  if (value > 180) return Promise.reject('考试时间应小于180分钟');
  return Promise.resolve(true);
};
const scorevalidator = (_, value) => {
  if (!examConfig.value.score || examConfig.value.score == 0) return Promise.reject('请先选择试卷');
  if (value <= 0) return Promise.reject('及格分应大于0');
  if (value > examConfig.value.score) return Promise.reject('及格分应小于等于总分');
  return Promise.resolve(true);
};

// 下载模版
const downloadTemplate = () => {
  handleExportXlsx('培训对象模版下载', '/edu/examTask/downloadTemplate', {});
};
const spinning = ref(false);
// 培训人员导入
const onImportXls = (file) => {
  spinning.value = true;
  handleImportXls(file, '/edu/examTask/import', ({ code, result }) => {
    if (code == 200) {
      // 过滤重复的用户
      const formData = getFieldsValue();
      if(!formData.trainObject) {
        formData.trainObjectPerson = '';
        formData.trainObject = {trainObjectPerson: '', trainObjectPersonName: ''}
      };
      const trainObject = JSON.parse(JSON.stringify(formData.trainObject));
      const existingPersonIds = formData.trainObject.trainObjectPerson ? formData.trainObject.trainObjectPerson.split(',') : [];
      // 过滤掉已存在的用户
      const filteredResult = result.filter((item) => {
        const personId = item.id;
        return !existingPersonIds.includes(personId);
      });
      if (filteredResult.length === 0) {
        spinning.value = false;
        clearValidate(['trainObjectPerson']);
        createMessage.warning('导入的用户已存在，未添加重复用户');
        return;
      }
      // 添加过滤后的用户
      const newPersonIds = filteredResult.map((item) => item.id).join(',');
      const newPersonNames = filteredResult.map((item) => item.realname + '（' + item.username + '）').join(',');
      // 更新现有数据，避免重复的逗号
      trainObject.trainObjectPerson = existingPersonIds.length > 0 ? trainObject.trainObjectPerson + ',' + newPersonIds : newPersonIds;
      trainObject.trainObjectPersonName =
        trainObject.trainObjectPersonName !== ''
          ? [...new Set([...trainObject.trainObjectPersonName.split(','), ...newPersonNames.split(',')])].join(',')
          : newPersonNames;
      formData.trainObjectPerson = formData.trainObjectPerson !== ''
          ? [...new Set([...formData.trainObjectPerson.split(','), ...newPersonNames.split(',')])].join(',')
          : newPersonNames;
      setFieldsValue({
        trainObjectPerson: formData.trainObjectPerson,
        trainObject: trainObject,
      });
      const newUserArr = filteredResult.map((item) => {
        item.custmorType = 'user';
        item.userNameWorkNo = item.realname + '（' + item.username + '）';
        return item;
      });
      userArrList.value = [...userArrList.value, ...newUserArr];
    }
    spinning.value = false;
  });
};
</script>
<style lang="less" scoped>
.examconfig {
  .title {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
