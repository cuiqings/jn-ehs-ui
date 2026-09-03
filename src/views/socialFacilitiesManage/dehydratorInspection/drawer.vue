<template>
  <BasicDrawer :title="title" :width="1000" destroyOnClose show-footer v-bind="$attrs" @close="closeDrawer" @register="registerDrawer">
    <a-form ref="infoForm" :label-col="{ span: 6 }" :model="info" :wrapper-col="{ span: 18 }">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item :rules="[{ required: showOkBtn, message: '请选择所属单位!' }]" label="所属单位" name="org">
            <a-select
              v-model:value="info.org"
              :disabled="!showOkBtn || type === 'edit' || mergeFlag"
              :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
              :options="orgOptions"
              placeholder="请选择"
              show-search
              @change="changeOrgCode"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :rules="[{ required: showOkBtn, message: '请选择所属车间!' }]" label="所属车间" name="depart">
            <a-select
              v-model:value="info.depart"
              :disabled="!showOkBtn || type === 'edit' || mergeFlag"
              :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
              :options="departOptions"
              placeholder="请选择"
              show-search
              @change="changeDepartCode"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item :rules="[{ required: showOkBtn, message: '请输入脱水器编号!' }]" label="脱水器编号" name="code">
            <InputTextArea v-if="mergeFlag" v-model:value="info.code" auto-size disabled placeholder="请输入" />
            <a-input v-else v-model:value="info.code" :disabled="!showOkBtn || type === 'edit'" :maxlength="100" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :rules="[{ required: showOkBtn, message: '请输入脱水器名称!' }]" label="脱水器名称" name="name">
            <a-input v-model:value="info.name" :disabled="!showOkBtn" :maxlength="50" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12" v-if="type !== 'view' && info.org && info.org !== ''">
          <a-form-item :rules="[{ required: showOkBtn, message: '请选择巡检责任人!' }]" label="巡检责任人" name="checkDutyPersonId">
            <JUserModal v-model:value="info.checkDutyPersonId" :org-code="info.org" type="checkbox" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-else>
          <a-form-item label="巡检责任人" name="checkDutyPersonName">
            <InputTextArea v-model:value="info.checkDutyPersonName" auto-size disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :rules="[{ required: showOkBtn, message: '请选择检查频次!' }]" label="检查频次" name="checkFrequency">
            <a-select
              v-model:value="info.checkFrequency"
              :disabled="!showOkBtn"
              :options="frequencyOptions"
              placeholder="请选择"
              @change="changeFrequency"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="检查时间">
            <InputTextArea v-model:value="checkTime" auto-size disabled />
          </a-form-item>
        </a-col>
        <a-col v-if="mergeFlag" :span="12">
          <a-form-item :rules="[{ required: showOkBtn, message: '请输入随机比例!' }]" label="随机比例">
            <a-input-number
              v-model:value="info.randomProportion"
              :controls="false"
              :disabled="!showOkBtn"
              :max="100"
              :min="0"
              addon-after="%"
              auto-size
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <div class="approval">
        <div class="approval-title">检查项目列表：</div>
        <a-table :columns="checkProjectColumns" :data-source="checkProjectList" :pagination="false" bordered>
          <template #content="{ record }">
            <InputTextArea v-model:value="record.content" :disabled="!showOkBtn || type === 'edit'" auto-size placeholder="请输入" />
          </template>
          <template #way="{ record }">
            <InputTextArea v-model:value="record.way" :disabled="!showOkBtn || type === 'edit'" auto-size placeholder="请输入" />
          </template>
          <template #pictureFlag="{ record }">
            <a-select
              v-model:value="record.pictureFlag"
              :disabled="!showOkBtn"
              :options="[{ label: '是', value: '1' }]"
              placeholder="请选择"
              style="width: 100%"
            />
          </template>
          <template #operation="{ index }">
            <span
              style="cursor: pointer; display: inline-block; width: 35px; height: 35px; background-color: #1890ff; border-radius: 50%"
              @click="handleAdd(index)"
              ><PlusOutlined style="font-size: 20px; line-height: 32px; color: #fff"
            /></span>
            <span
              v-if="checkProjectList.length > 1"
              style="cursor: pointer; display: inline-block; margin-left: 10px; width: 35px; height: 35px; background-color: red; border-radius: 50%"
              @click="handleDelete(index)"
              ><MinusOutlined style="font-size: 20px; line-height: 32px; color: #fff"
            /></span>
          </template>
        </a-table>
      </div>
    </a-form>
    <template #footer>
      <div style="height: 60px; line-height: 60px">
        <a-button style="margin-left: 15px" @click="closeDrawer">取消</a-button>
        <a-button v-if="showOkBtn" :loading="loading" style="margin-left: 15px" type="primary" @click="handleSave"> 确定 </a-button>
        <a-button v-if="showOkBtn" :loading="loading" style="margin-left: 15px" type="primary" @click="handleSave(false)">发布 </a-button>
      </div>
    </template>
  </BasicDrawer>
  <!-- 人员选择 -->
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import { ref, onMounted } from 'vue';
  import { Input } from 'ant-design-vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { JUserModal } from '/@/components/Form';
  import { add, edit, detail, merge } from './api';

  const { createMessage } = useMessage();
  const InputTextArea = Input.TextArea;
  const emit = defineEmits(['success']);
  const infoForm = ref();
  const info = ref({
    id: '',
    org: undefined,
    depart: undefined,
    code: '',
    name: '',
    checkDutyPersonId: undefined,
    checkDutyPersonName: '',
    checkFrequency: undefined,
    randomProportion: '10',
  });
  const showOkBtn = ref(true);
  const loading = ref(false);
  const title = ref('');
  const type = ref('');
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const frequencyOptions = ref([
    {
      label: '每2小时',
      value: '1',
    },
    {
      label: '每3小时',
      value: '2',
    },
    {
      label: '每4小时',
      value: '3',
    },
    {
      label: '每6小时',
      value: '4',
    },
  ]);
  const checkTime = ref('');
  const checkProjectColumns = ref([
    {
      title: '检查内容',
      dataIndex: 'content',
      width: 400,
      slots: { customRender: 'content' },
    },
    {
      title: '检查方式',
      dataIndex: 'way',
      slots: { customRender: 'way' },
    },
    {
      title: '检查照片是否必填',
      dataIndex: 'pictureFlag',
      width: 150,
      slots: { customRender: 'pictureFlag' },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 120,
      align: 'center',
      slots: { customRender: 'operation' },
    },
  ]);
  const checkProjectList: any = ref([
    {
      content: '检查脱水器筒体、闸阀、法兰接口、竖水管、检查管等部位是否有漏水、漏气现象；基础牢靠，无锈蚀现象。',
      way: '煤气报警器检测、目测',
      pictureFlag: '1',
    },
    {
      content: '冷凝水排放量是否正常，污水是否得到及时回收；筒体液位在正常范围内。',
      way: '目测',
      pictureFlag: '1',
    },
    {
      content: '煤气报警器正常通电。',
      way: '目测',
      pictureFlag: '1',
    },
  ]);
  const mergeFlag: any = ref(false);
  const mergeIds = ref('');
  const [registerDrawer, { closeDrawer }] = useDrawerInner(async (data) => {
    await infoForm.value.resetFields();
    Object.assign(info.value, {
      id: '',
      org: undefined,
      depart: undefined,
      code: '',
      name: '',
      checkDutyPersonId: undefined,
      checkDutyPersonName: '',
      checkFrequency: undefined,
      checkTime: undefined,
      randomProportion: '10',
    });
    if (data.mergeFlag) {
      if (data.mergeFlag !== '1') {
        mergeIds.value = data.mergeIds;
        info.value.code = data.data.codes;
        info.value.org = data.data.org;
        info.value.depart = data.data.depart;
        info.value.name = data.data.departName + '脱水器点检';
        getDepartList(info.value.org);
      }
      mergeFlag.value = data.mergeFlag === '1' ? true : data.mergeFlag;
    } else {
      mergeFlag.value = false;
      mergeIds.value = '';
    }
    checkProjectList.value = [
      {
        content: '检查脱水器筒体、闸阀、法兰接口、竖水管、检查管等部位是否有漏水、漏气现象；基础牢靠，无锈蚀现象。',
        way: '煤气报警器检测、目测',
        pictureFlag: '1',
      },
      {
        content: '冷凝水排放量是否正常，污水是否得到及时回收；筒体液位在正常范围内。',
        way: '目测',
        pictureFlag: '1',
      },
      {
        content: '煤气报警器正常通电。',
        way: '目测',
        pictureFlag: '1',
      },
    ];
    showOkBtn.value = data.showOkBtn;
    title.value = data.title;
    type.value = data.type;
    checkTime.value = '';
    departOptions.value = [];
    if (data.type !== 'add' && data.type !== 'mergerPlan') {
      detail({
        id: data.record.id,
      }).then((res) => {
        Object.keys(info.value).forEach((key) => {
          if (res[key]) {
            info.value[key] = res[key];
          }
        });
        checkProjectList.value = res.itemList || [];
        if (res.org) {
          getDepartList(res.org);
        }
        changeFrequency(res.checkFrequency);
      });
      checkProjectColumns.value = checkProjectColumns.value.filter((item) => item.dataIndex !== 'operation');
    } else {
      checkProjectColumns.value = [
        {
          title: '检查内容',
          dataIndex: 'content',
          width: 400,
          slots: { customRender: 'content' },
        },
        {
          title: '检查方式',
          dataIndex: 'way',
          slots: { customRender: 'way' },
        },
        {
          title: '检查照片是否必填',
          dataIndex: 'pictureFlag',
          width: 150,
          slots: { customRender: 'pictureFlag' },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 120,
          align: 'center',
          slots: { customRender: 'operation' },
        },
      ];
      if (orgOptions.value.length === 1) {
        info.value.org = orgOptions.value[0].value;
        getDepartList(info.value.org);
      }
    }
  });
  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
    });
  });
  const getDepartList = (orgCode) => {
    selectDeptNew({ orgCode }).then((res) => {
      departOptions.value = res.map((item: any) => ({
        label: item.departName,
        value: item.orgCode,
      }));
    });
  };
  const changeOrgCode = (value) => {
    departOptions.value = [];
    info.value.depart = undefined;
    if (value) {
      getDepartList(value);
    }
  };
  const changeDepartCode = (value, data) => {
    if (value) {
      info.value.name = data.label + '脱水器点检';
    } else {
      info.value.name = '';
    }
  };
  const handleAdd = (index) => {
    checkProjectList.value.splice(index + 1, 0, {
      content: '',
      way: '',
      pictureFlag: undefined,
    });
  };
  const handleDelete = (index) => {
    checkProjectList.value.splice(index, 1);
  };
  const handleSave = async (is = true) => {
    await infoForm.value.validate();
    for (let i = 0; i < checkProjectList.value.length; i++) {
      if (checkProjectList.value[i].content === '') {
        createMessage.info(`第${i + 1}项检查内容不能为空!`);
        return;
      }
      if (checkProjectList.value[i].way === '') {
        createMessage.info(`第${i + 1}项检查方式不能为空!`);
        return;
      }
      if (checkProjectList.value[i].pictureFlag === '' || !checkProjectList.value[i].pictureFlag) {
        createMessage.info(`第${i + 1}项检查照片是否必填不能为空!`);
        return;
      }
    }
    loading.value = true;
    if (type.value === 'mergerPlan') {
      await merge({
        ...info.value,
        itemList: checkProjectList.value,
        mergeIds: mergeIds.value,
        planStatus: is ? '0' : '1',
      })
        .then(() => {
          emit('success');
          closeDrawer();
        })
        .finally(() => {
          loading.value = false;
        });
    } else if (type.value === 'add') {
      await add({ ...info.value, itemList: checkProjectList.value, planStatus: is ? '0' : '1' })
        .then(() => {
          emit('success');
          closeDrawer();
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      await edit({ ...info.value, itemList: checkProjectList.value, planStatus: is ? '0' : '1' })
        .then(() => {
          emit('success');
          closeDrawer();
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };
  const changeFrequency = (value) => {
    if (value === '1') {
      checkTime.value = '00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00';
    } else if (value === '2') {
      checkTime.value = '00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00';
    } else if (value === '3') {
      checkTime.value = '00:00, 04:00, 08:00, 12:00, 16:00, 20:00';
    } else if (value === '4') {
      checkTime.value = '00:00, 06:00, 12:00, 18:00';
    }
  };
</script>
<style lang="less" scoped>
  .approval {
    padding: 0 0 20px 40px;

    .approval-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
    }
  }
</style>
