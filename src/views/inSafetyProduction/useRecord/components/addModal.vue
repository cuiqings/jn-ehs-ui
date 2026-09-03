<template>
  <BasicDrawer showFooter @register="register" v-bind="$attrs" :title="title" width="70%" @close="handleClose" @ok="handleSubmit">
    <a-form v-loading="loading" ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="使用年度" name="year" :rules="[{ required: true, message: '请选择' }]">
            <a-date-picker
              @change="handleYearChange"
              v-model:value="formState.year"
              picker="year"
              format="YYYY"
              placeholder="请选择年度"
              style="width: 100%"
              valueFormat="YYYY"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="使用单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
            <a-select v-model:value="formState.orgCode" placeholder="请选择单位" @change="handleOrgChange">
              <a-select-option v-for="item in unitList" :key="item.orgCode" :value="item.orgCode">
                {{ item.departName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="登记日期" name="checkInTime" :rules="[{ required: true, message: '请选择' }]">
            <a-date-picker style="width: 100%" placeholder="请选择"  format="YYYY-MM-DD" v-model:value="formState.checkInTime" valueFormat="YYYY-MM-DD" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="项目负责人" name="projectLeader" :rules="[{ required: true, message: '请输入' }]">
            <JUserModal
              @confirm="handleProjectLeaderChange"
              :orgCode="formState.orgCode"
              v-model:value="formState.projectLeader"
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item
            label="项目名称"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 21 }"
            name="projectName"
            :rules="[{ required: true, message: '请输入' }]"
          >
            <div style="display: flex; align-items: center">
              <a-select
                v-model:value="formState.projectName"
                :options="projectList"
                :field-names="{ label: 'name', value: 'id' }"
                placeholder="请选择"
                style="width: 60%"
                @change="changeProjectName"
              />
              <span style="margin-left: 12px; color: #f5222d; font-size: 13px">预算剩余金额：¥ {{ formState.remainingAmount }}</span>
            </div>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item
            label="费用类别"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 21 }"
            name="feeCategory"
            :rules="[{ required: true, message: '请选择' }]"
          >
            <a-select
              v-model:value="formState.feeCategory"
              :options="feeCategoryList"
              :field-names="{ label: 'text', value: 'value' }"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item
            label="项目内容"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 21 }"
            name="projectContent"
            :rules="[{ required: true, message: '请输入' }]"
          >
            <a-textarea maxlength="200" v-model:value="formState.projectContent" placeholder="请详细描述项目内容和安全投入的具体用途" :rows="4" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="专用科室" name="workshop" :rules="[{ required: true, message: '请选择' }]">
            <a-select v-model:value="formState.workshop" placeholder="请选择车间科室">
              <a-select-option v-for="item in deptList" :key="item.orgCode" :value="item.orgCode">
                {{ item.departName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="投入金额 (元)" name="amount" :rules="[{ required: true, message: '请输入' }]">
            <a-input-number v-model:value="formState.amount" placeholder="请输入实际投入的金额" :precision="2" :min="0" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="投入费用时间" name="amountTime" :rules="[{ required: true, message: '请选择' }]">
            <a-date-picker style="width: 100%" placeholder="请选择" format="YYYY-MM-DD" v-model:value="formState.amountTime" valueFormat="YYYY-MM-DD" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="记录人" name="recorder" :rules="[{ required: true, message: '请输入' }]">
            <a-input v-model:value="formState.recorder" disabled />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 上传凭证 -->
      <a-form-item :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }" label="添加发票" name="invoiceUrl">
        <AUploadDragger
          :file-list="formState.attachmentList"
          :before-upload="beforeUpload"
          :customRequest="dummyRequest"
          :multiple="true"
          :accept="'.jpg,.jpeg,.png,.pdf'"
          @remove="handleRemove"
          @change="handleUploadChange"
          style="width: 100%"
          @preview="handlePreview"
        >
          <p class="ant-upload-drag-icon">
            <inbox-outlined style="font-size: 32px; color: #1890ff" />
          </p>
          <p class="ant-upload-text">点击或拖拽上传附件/图片</p>
          <p class="ant-upload-hint">支持扩展名：jpg, png, pdf, doc, xls，单个文件不超过5MB</p>
        </AUploadDragger>
      </a-form-item>

      <!-- 备注 -->
      <a-form-item label="备注" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }" name="remark">
        <a-textarea maxlength="200" v-model:value="formState.remark" placeholder="请输入备注（选填）" :rows="2" />
      </a-form-item>
    </a-form>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { useLedgerAdd, useLedgerEdit, useLedgerGetProject, getRemainingAmount, useLedgerDetail } from '../api';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { previewFile } from '/@/api/common/api';
  import { InboxOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '/@/store/modules/user';
  import type { FormInstance } from 'ant-design-vue';
  import { JUserModal } from '/@/components/Form';
  import { uploadFile } from '/@/api/common/api';
  import { Upload } from 'ant-design-vue';
  import { ref, onMounted } from 'vue';
  const userStore: any = useUserStore();
  const AUploadDragger = Upload.Dragger;
  const feeCategoryList = ref<string[]>([]);
  feeCategoryList.value = userStore?.getAllDictItems?.fee_type;
  interface UnitItem {
    orgCode: string;
    departName: string;
  }
  interface DeptItem {
    orgCode: string;
    departName: string;
  }

  const title = ref('新增');
  const formRef = ref<FormInstance | null>(null);
  const unitList = ref<UnitItem[]>([]);
  const deptList = ref<DeptItem[]>([]);
  const formState = ref<any>({
    year: '',
    orgCode: undefined,
    checkInTime: '',
    projectLeader: '',
    projectName: undefined,
    feeCategory: undefined,
    projectContent: '',
    workshop: undefined,
    amount: null,
    amountTime: '',
    recorder: `${userStore.getUserInfo.realname}(${userStore.getUserInfo.workNo})`,
    attachmentList: [],
    remark: '',
    remainingAmount: '0',
  });
  const loading = ref(false);
  onMounted(async () => {
    await loadUnitList();
  });

  const loadUnitList = async () => {
    try {
      const res = await getDepart3ListWithSecurity();
      unitList.value = res;
      if (res.length == 1) {
        formState.value.orgCode = res[0].orgCode;
        await loadDeptList(res[0].orgCode);
      }
    } catch (error) {
      console.error('加载单位列表失败:', error);
    }
  };

  const loadDeptList = async (orgCode: string) => {
    try {
      const res = await selectDeptNew({ orgCode });
      deptList.value = res;
      console.log(deptList.value, 'deptList');
    } catch (error) {
      console.error('加载车间列表失败:', error);
    }
  };

  const handleOrgChange = async (value: string) => {
    formState.value.workshop = '';
    formState.value.projectLeader = '';
    formState.value.projectName = undefined;
    deptList.value = [];
    if (value) {
      await loadDeptList(value);
    }
    getProjectList();
  };

  const handleYearChange = async () => {
    formState.value.projectName = undefined;
    getProjectList();
  };
  const projectList = ref<any[]>([]);
  const getProjectList = async () => {
    if (!formState.value.year || !formState.value.orgCode) return;
    useLedgerGetProject({ year: formState.value.year, orgCode: formState.value.orgCode }).then((res) => {
      projectList.value = res;
    });
  };

  const changeProjectName = (val) => {
    getRemainingAmount({ project: val, year: formState.value.year, orgCode: formState.value.orgCode }).then((res) => {
      if (res) {
        Object.assign(formState.value, res);
      }
    });
  };

  const handleProjectLeaderChange = (val, displayStr) => {
    formState.value.projectLeaderName = displayStr;
  };

  const [register, { closeDrawer, changeOkLoading }] = useDrawerInner((data) => {
    title.value = data.title;
    if (title.value === '编辑') {
      loading.value = true;
      useLedgerDetail({ id: data.record.id })
        .then((res) => {
          Object.assign(formState.value, res);
          getProjectList();
          changeProjectName(res.projectName);
          if (formState.value.invoiceUrl) {
            formState.value.invoiceUrl.split(',').forEach((item, idx) => {
              formState.value.attachmentList.push({
                uid: item,
                name: item,
                status: 'done',
                response: {
                  message: item,
                },
                url: getFileAccessHttpUrl(item),
              });
            });
          }
          console.log(formState.value.attachmentList, 'formState.value.attachmentList');
          
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      // 重置表单
      formRef.value?.resetFields?.();
    }
  });

  const handlePreview = (file) => {
    previewFile(file?.response?.message).then((res) => {
      window.open(res, '_blank');
    });
  };

  // 上传相关
  const beforeUpload = (file: File) => {
    const isAllowed = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      // 'application/msword',
      // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // 'application/vnd.ms-excel',
      // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ].includes(file.type);
    if (!isAllowed) {
      window['$message']?.error('仅支持图片、PDF');
      return false;
    }
    if (file.size / 1024 / 1024 > 5) {
      window['$message']?.error('单个文件不能超过5MB');
      return false;
    }
    return true;
  };
  const dummyRequest = (options: any) => {
    uploadFile(
      {
        file: options.file,
        data: { biz: 'inSafetyProduction' },
      },
      (res) => {
        console.log(res, 'res');
        options.onSuccess(res);
      }
    );
  };

const handleUploadChange = ({ fileList }: { fileList: any[] }) => {
    if(fileList.length === 0){
        return;
    }
    formState.value.attachmentList = fileList;
    formState.value.invoiceUrl = '';
    fileList.map((item) => {
      if (item.response) {
        formState.value.invoiceUrl += item.response.message+',';
      }
    });
    if (formState.value.invoiceUrl) {
      formState.value.invoiceUrl = formState.value.invoiceUrl.slice(0, -1);
    }
};
const handleRemove = (file) => {
    console.log(formState.value.attachmentList, 'file');
    formState.value.invoiceUrl = formState.value.invoiceUrl.replace(file.response.message, '');
  };
  const emits = defineEmits(['success']);
  const handleSubmit = async () => {
    await formRef.value?.validate?.();
    let data = JSON.parse(JSON.stringify(formState.value));
    changeOkLoading(true);
    if (title.value === '编辑') {
      useLedgerEdit(data)
        .then((res) => {
          console.log(res, 'res');
          closeDrawer();
          formRef.value?.resetFields?.();
          emits('success');
          formState.value.attachmentList = [];
        })
        .finally(() => {
          changeOkLoading(false);
        });
    } else {
      useLedgerAdd(data)
        .then((res) => {
          console.log(res, 'res');
          closeDrawer();
          formRef.value?.resetFields?.();
          emits('success');
          formState.value.attachmentList = [];
        })
        .finally(() => {
          changeOkLoading(false);
        });
    }
  };

  const handleClose = () => {
    formRef.value?.resetFields?.();
    formState.value.attachmentList = [];
    closeDrawer();
  };
</script>

<style scoped>
  .ant-upload-drag-icon {
    text-align: center;
    margin-bottom: 8px;
  }
  .ant-upload-text {
    font-size: 14px;
    color: #333;
    text-align: center;
  }
  .ant-upload-hint {
    font-size: 12px;
    color: #888;
    text-align: center;
  }
</style>
