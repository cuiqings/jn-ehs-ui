<template>
  <BasicDrawer
    forceRender
    v-bind="$attrs"
    @register="register"
    :title="title"
    width="65%"
    @close="close"
    destroyOnClose
  >
    <div style="width: 100%;padding-bottom: 60px;" v-loading="submitIng">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input disabled v-model:value="formState.name" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="工号" name="workNo">
              <a-input disabled v-model:value="formState.workNo" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属单位" name="orgName">
              <a-input disabled v-model:value="formState.orgName" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属车间" name="workshopName">
              <a-input disabled v-model:value="formState.workshopName" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="岗位" name="post">
              <a-input disabled v-model:value="formState.post" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="24"> 职业健康检查结果： </a-col>
        </a-row>
        <a-row :gutter="12" v-if="['上传'].includes(title)">
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="检查日期"
              name="checkDate"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-date-picker :disabledDate="disabledDate" valueFormat="YYYY-MM-DD" style="width: 100%" v-model:value="formState.checkDate" />
              <!-- <a-date-picker valueFormat="YYYY-MM-DD" style="width: 100%" v-model:value="formState.checkDate" /> -->
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="体检种类"
              name="type"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-select v-model:value="formState.type" placeholder="请选择">
                <a-select-option value="1">岗前</a-select-option>
                <a-select-option value="2">在岗</a-select-option>
                <a-select-option value="3">离职</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
             :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="本次体检危害因素"
              name="hazardFactors"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select mode="multiple" v-model:value="formState.hazardFactors" placeholder="请选择">
                <a-select-option v-for="item in categoryOptions" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="检查结果"
              name="checkResult"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select v-model:value="formState.checkResult" :options="checkResultList" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="检查机构"
              name="inspectionAgency"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input v-model:value="formState.inspectionAgency" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="岗位"
              name="post"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input v-model:value="formState.post" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="人员处理情况"
              name="personnelHandling"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select v-model:value="formState.personnelHandling" placeholder="请选择">
                <a-select-option value="1">无</a-select-option>
                <a-select-option value="2">调离</a-select-option>
                <a-select-option value="3">暂时脱离工作岗位</a-select-option>
                <a-select-option value="4">复查</a-select-option>
                <a-select-option value="5">医学观察</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="现场处理情况"
              name="processingSituation"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select v-model:value="formState.processingSituation" placeholder="请选择">
                <a-select-option value="1">无</a-select-option>
                <a-select-option value="2">整改完成</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="体检报告"
              name="reportFile"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <JUpload ref="uploadRef" :maxCount="5" v-model:value="formState.reportFile" text="上传附件" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12" v-if="['详情', '编辑'].includes(title)" v-for="(item, idx) in formState.infoList">
          <a-col :span="1"><a-button @click="deleteItem(item.id, idx)" type="primary" danger ghost v-if="title != '详情'">删除</a-button></a-col>
          <a-col :span="11">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="检查日期"
              :name="['infoList', idx, 'checkDate']"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-date-picker :disabledDate="disabledDate" :disabled="title == '详情'" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" v-model:value="item.checkDate" />
            </a-form-item>
          </a-col>
          <a-col :span="11">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="体检种类"
              :name="['infoList', idx, 'type']"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-select :disabled="title == '详情'" v-model:value="item.type" placeholder="请选择">
                <a-select-option value="1">岗前</a-select-option>
                <a-select-option value="2">在岗</a-select-option>
                <a-select-option value="3">离职</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :offset="1" :span="11">
            <a-form-item
               :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="本次体检危害因素"
              :name="['infoList', idx, 'hazardFactors']"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select :disabled="title == '详情'" mode="multiple" v-model:value="item.hazardFactors" placeholder="请选择">
                <a-select-option v-for="item in categoryOptions" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="11">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="检查结果"
              :name="['infoList', idx, 'checkResult']"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select v-model:value="item.checkResult" :disabled="title == '详情'" :options="checkResultList" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :offset="1" :span="11">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="检查机构"
              :name="['infoList', idx, 'inspectionAgency']"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input :disabled="title == '详情'" v-model:value="item.inspectionAgency" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="11">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="岗位"
              :name="['infoList', idx, 'post']"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input :disabled="title == '详情'" v-model:value="item.post" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :offset="1" :span="11">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="人员处理情况"
              :name="['infoList', idx, 'personnelHandling']"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select :disabled="title == '详情'" v-model:value="item.personnelHandling" placeholder="请选择">
                <a-select-option value="1">无</a-select-option>
                <a-select-option value="2">调离</a-select-option>
                <a-select-option value="3">暂时脱离工作岗位</a-select-option>
                <a-select-option value="4">复查</a-select-option>
                <a-select-option value="5">医学观察</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="11">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="现场处理情况"
              :name="['infoList', idx, 'processingSituation']"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select :disabled="title == '详情'" v-model:value="item.processingSituation" placeholder="请选择">
                <a-select-option value="1">无</a-select-option>
                <a-select-option value="2">整改完成</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :offset="1" :span="11">
            <a-form-item
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              label="体检报告"
              :name="['infoList', idx, 'reportFile']"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <JUpload ref="uploadRef" :maxCount="5" :disabled="title == '详情'" v-model:value="item.reportFile" text="上传附件" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <template #footer>
      <div v-if="title !== '详情'" style="padding-top: 12px;">
        <a-space :size="20">
          <a-button type="primary" ghost @click="handleSave" v-if="title == '上传'">保存</a-button>
          <a-button @click="close">取消</a-button>
          <a-button type="primary" @click="handleSubmit">提交</a-button>
        </a-space>
      </div>
    </template>
    <SignModal @register="registerSignModal" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { physicalExaminationEdit, physicalExaminationUpd, physicalExaminationInfo, physicalExaminationSave, physicalExaminationDetail, deleteReport, hazardFactors } from '../api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import SignModal from '../commponents/signModal.vue';
  import { Modal } from 'ant-design-vue';
  import { ref, reactive } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import type { FormInstance } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import dayjs from 'dayjs';

  const userStore = useUserStore();

  const categoryOptions = ref<any[]>([]);
  const [registerSignModal, { openModal: openSignModal }] = useModal();
  const formRef = ref<FormInstance | null>(null);
  const title = ref('上传');
  const checkResultList = ref([
    { label: '未见异常', value: '1' },
    { label: '疑似职业病', value: '2' },
    { label: '禁忌证', value: '3' },
    { label: '其他疾患', value: '4' },
    { label: '复查', value: '5' },
  ]);
  const formState = reactive<any>({
    id: '',
    orgCode: undefined,
    workshop: undefined,
    location: '',
    type: '',
    model: '',
    number: '',
    dutyUser: '',
    checkDate: '',
    expirationDate: '',
    checkResult: ''
  });

  const emits = defineEmits(['submitSuccess']);
  const disabledDate = (current) => {
    return current && current > dayjs().endOf('day');
  };

  const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
    title.value = data.title;
    categoryOptions.value = await hazardFactors();
    if (title.value === '详情') {
      physicalExaminationDetail({ id: data.record.id }).then((res) => {
        if(res && res.infoList && res.infoList.length > 0){
          res.infoList.forEach(item => {
            if(item.hazardFactors) {
              item.hazardFactors = item.hazardFactors.split(',').map(item => item*1);
            } else {
              item.hazardFactors = [];
            }
          })
        }
        Object.assign(formState, res);
      });
    }
    if (title.value === '编辑') {
      physicalExaminationDetail({ id: data.record.id }).then((res) => {
        if(res && res.infoList && res.infoList.length > 0){
          res.infoList.forEach(item => {
            if(item.hazardFactors) {
              item.hazardFactors = item.hazardFactors.split(',').map(item => item*1);
            } else {
              item.hazardFactors = [];
            }
          })
        }
        Object.assign(formState, res);
      });
    }
    if (title.value === '上传') {
      Object.assign(formState, data.record, {physicalId: data.record.id});
      delete formState.hazardFactors;
      delete formState.type;
      physicalExaminationInfo({ id: data.record.id }).then((res) => {
        if(res.infoList && res.infoList.length > 0) {
          res.infoList.forEach(item => {
            if(item.hazardFactors) {
              item.hazardFactors = item.hazardFactors.split(',').map(item => item*1);
            } else {
              item.hazardFactors = [];
            }
          })
          Object.assign(formState, res.infoList[0], {physicalId: data.record.id});
          console.log(formState);
          
        } else {
          delete formState.id;
        }
      });
    }
  });

  const submitIng = ref(false);
  const deleteItem = (id, idx) => {
     Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        submitIng.value = true;
        deleteReport({ id: id }).then(() => {
              formState.infoList.splice(idx, 1);
        }).finally(() => {
          submitIng.value = false;
        })
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }

  const handleSave = () => {
    changeOkLoading(true);
    const params = JSON.parse(JSON.stringify(formState));
    if(params.hazardFactors) params.hazardFactors = params.hazardFactors.join(',');
    if(params.infoList && params.infoList.length > 0){
      params.infoList.forEach((item) => {
        if(item.hazardFactors) item.hazardFactors = item.hazardFactors.join(',');
      });
    }
    physicalExaminationSave(params)
    .then((res) => {
      closeDrawer();
      formRef.value?.resetFields();
    }).finally(() => {
      changeOkLoading(false);
    });
  }

  const handleSubmit = () => {
    formRef.value
      ?.validate()
      .then(() => {
        const params = JSON.parse(JSON.stringify(formState));
        if(params.hazardFactors) params.hazardFactors = params.hazardFactors.join(',');
        changeOkLoading(true);
        if(title.value === '上传') {
          openSignModal(true, {
            callback: (sign) => {
              physicalExaminationEdit({ ...params, ...sign })
                .then((res) => {
                  changeOkLoading(false);
                  emits('submitSuccess', res);
                  closeDrawer();
                  formRef.value?.resetFields();
                })
                .catch((err) => {
                  changeOkLoading(false);
                });
            }
          });
        } else {
          params.infoList.forEach((item) => {
           if(item.hazardFactors) item.hazardFactors = item.hazardFactors.join(',');
          });
          physicalExaminationUpd(params)
            .then((res) => {
              changeOkLoading(false);
              emits('submitSuccess', res);
              closeDrawer();
              formRef.value?.resetFields();
            })
            .catch((err) => {
              changeOkLoading(false);
            });
        }
      })
      .catch(() => {
        changeOkLoading(false);
      });
  };
  const close = () => {
    closeDrawer();
    formRef.value?.resetFields();
  }; 
</script>
