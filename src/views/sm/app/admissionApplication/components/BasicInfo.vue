<template>
  <div>
    <a-form v-if="applicationType === '入场申请'" :model="info" ref="infoFormRef" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
      <a-form-item
        v-if="type !== 'view' && type !== 'approval'"
        label="承包单位"
        name="contractCode"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择承包单位!' }]"
      >
        <a-select
          v-model:value="info.contractCode"
          :options="contractCodeOptions"
          placeholder="请选择"
          style="width: 100%"
          allow-clear
          :disabled="type === 'view' || type === 'approval' || contractCodeDisabled"
          @change="changeContractCode"
        />
      </a-form-item>
      <a-form-item v-if="type === 'view' || type === 'approval'" label="承包单位" name="contractName">
        <a-input v-model:value="info.contractName" disabled />
      </a-form-item>
      <a-form-item label="相关方类别" name="xgfType" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择相关方类别!' }]">
        <a-select
          v-model:value="info.xgfType"
          :options="[
            {
              label: '施工类',
              value: '1',
            },
            {
              label: '生产服务类',
              value: '2',
            },
            {
              label: '搬倒类',
              value: '3',
            },
          ]"
          placeholder="请选择"
          style="width: 100%"
          :allow-clear="false"
          :disabled="type === 'view' || type === 'approval'"
          @change="changeXgfType"
        />
      </a-form-item>
      <a-form-item label="项目期限" name="projectTerm" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择项目期限!' }]">
        <a-select
          v-model:value="info.projectTerm"
          :options="[
            {
              label: '长期',
              value: '1',
            },
            {
              label: '短期',
              value: '2',
            },
          ]"
          placeholder="请选择"
          style="width: 100%"
          :allow-clear="false"
          :disabled="type === 'view' || type === 'approval'"
        />
      </a-form-item>
      <a-form-item label="项目名称" name="projectName" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请输入项目名称!' }]">
        <a-input
          v-model:value="info.projectName"
          placeholder="请输入"
          :maxlength="100"
          style="width: 100%"
          :disabled="type === 'view' || type === 'approval'"
        />
      </a-form-item>
      <a-form-item
        v-if="type !== 'view' && type !== 'approval'"
        label="承包单位负责人"
        name="contractManagerId"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择承包单位负责人!' }]"
      >
        <a-select
          v-model:value="info.contractManagerId"
          :options="contractManagerOptions"
          placeholder="请选择"
          style="width: 100%"
          :disabled="type === 'view' || type === 'approval'"
          allow-clear
          showSearch
          :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
          @change="changeContractManagerId"
        />
      </a-form-item>
      <a-form-item
        label="承包单位负责人电话"
        name="contractManagerPhone"
        :rules="[{ pattern: /^1[3456789]\d{9}$/, required: type !== 'view' && type !== 'approval', message: '请输入正确的承包单位负责人电话!' }]"
      >
        <a-input
          v-model:value="info.contractManagerPhone"
          placeholder="请输入"
          style="width: 100%"
          :disabled="type === 'view' || type === 'approval'"
        />
      </a-form-item>
      <a-form-item label="经营范围" name="businessScope" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请输入经营范围!' }]">
        <a-input
          v-model:value="info.businessScope"
          placeholder="请输入"
          :maxlength="200"
          style="width: 100%"
          :disabled="type === 'view' || type === 'approval'"
        />
      </a-form-item>
      <a-form-item label="发包单位" name="publishCode" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择发包单位!' }]">
        <a-select
          v-model:value="info.publishCode"
          :options="publishCodeOptions"
          placeholder="请选择"
          style="width: 100%"
          allow-clear
          :disabled="type === 'view' || type === 'approval'"
          @change="changePublishCode"
        />
      </a-form-item>
      <a-form-item
        label="发包车间"
        name="publishWorkshopCode"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择发包车间!' }]"
      >
        <a-select
          v-model:value="info.publishWorkshopCode"
          :options="publishWorkshopCodeOptions"
          placeholder="请选择"
          style="width: 100%"
          :disabled="type === 'view' || type === 'approval'"
          allow-clear
          showSearch
          :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
        />
      </a-form-item>
      <a-form-item
        label="发包单位负责人"
        name="publishManagerId"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择发包单位负责人!' }]"
      >
        <JUserModal
          v-model:value="info.publishManagerId"
          :orgCode="publishCode"
          :disabled="type === 'view' || type === 'approval'"
          @confirm="confirm"
        />
      </a-form-item>
      <a-form-item label="作业人数" name="workerNumber">
        <a-input v-model:value="info.workerNumber" style="width: 100%" disabled />
      </a-form-item>
      <a-form-item label="特种作业人数" name="specialWorkerNumber">
        <a-input v-model:value="info.specialWorkerNumber" style="width: 100%" disabled />
      </a-form-item>
      <a-form-item label="施工时间" :required="!disabled">
        <a-form-item
          label=""
          name="workDateStart"
          :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择施工开始时间!' }]"
          style="display: inline-block; width: 50%"
        >
          <a-date-picker
            v-model:value="info.workDateStart"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabledDate="disabledStartDate"
            :disabled="type === 'view' || type === 'approval'"
          />
        </a-form-item>
        <a-form-item
          label=""
          name="workDateEnd"
          :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择施工结束时间!' }]"
          style="display: inline-block; width: 50%"
        >
          <a-date-picker
            v-model:value="info.workDateEnd"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabledDate="disabledEndDate"
            :disabled="type === 'view' || type === 'approval'"
          />
        </a-form-item>
      </a-form-item>
      <a-form-item
        label="项目危险有害因素辨识及风险评估"
        name="projectDangerEvaluate"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请输入项目危险有害因素辨识及风险评估!' }]"
      >
        <a-input
          v-model:value="info.projectDangerEvaluate"
          placeholder="请输入"
          :maxlength="300"
          style="width: 100%"
          :disabled="type === 'view' || type === 'approval'"
        />
      </a-form-item>
      <a-form-item label="评估时间" name="evaluateDate" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择评估时间!' }]">
        <a-date-picker
          v-model:value="info.evaluateDate"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled="type === 'view' || type === 'approval'"
          :disabledDate="(current) => current && dayjs(current).isAfter(dayjs(new Date()).endOf('day'))"
        />
      </a-form-item>
      <a-form-item label="评估人" name="evaluatePersonId" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择评估人!' }]">
        <JUserModal
          v-model:value="info.evaluatePersonId"
          :orgCode="publishCode"
          :disabled="type === 'view' || type === 'approval'"
          @confirm="confirm"
        />
      </a-form-item>
      <a-form-item
        label="风险控制措施制定"
        name="riskMeasure"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请输入风险控制措施制定!' }]"
      >
        <a-input
          v-model:value="info.riskMeasure"
          placeholder="请输入"
          :maxlength="300"
          style="width: 100%"
          :disabled="type === 'view' || type === 'approval'"
        />
      </a-form-item>
    </a-form>
    <a-form v-else :model="info" ref="infoFormRef" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
      <a-form-item label="项目名称" name="enterId" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择项目名称!' }]">
        <a-select
          v-if="type === 'add' || type === 'edit'"
          v-model:value="info.enterId"
          :options="enterOptions"
          placeholder="请选择"
          style="width: 100%"
          allow-clear
          @change="changeEnter"
        />
        <a-input v-else v-model:value="info.projectName" disabled />
      </a-form-item>
      <a-form-item label="承包单位" name="contractName" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择承包单位!' }]">
        <a-input v-model:value="info.contractName" disabled />
      </a-form-item>
      <a-form-item label="发包单位" name="publishName" :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择发包单位!' }]">
        <a-input v-model:value="info.publishName" disabled />
      </a-form-item>
      <a-form-item
        label="发包单位负责人"
        name="publishManagerName"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择发包单位负责人!' }]"
      >
        <a-input v-model:value="info.publishManagerName" disabled />
      </a-form-item>
      <a-form-item
        label="承包单位负责人"
        name="contractManagerName"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请选择承包单位负责人!' }]"
      >
        <a-input v-model:value="info.contractManagerName" disabled />
      </a-form-item>
      <a-form-item
        label="承包单位负责人电话"
        name="contractManagerPhone"
        :rules="[{ required: type !== 'view' && type !== 'approval', message: '请输入正确的承包单位负责人电话!' }]"
      >
        <a-input v-model:value="info.contractManagerPhone" disabled />
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" name="basicInfo" setup>
  import { onMounted, ref } from 'vue';
  import { getDetailList, get3List, getUser, getListByCurrent, getDepart3List, queryById } from '../../../admissionApplication/url/index';
  import dayjs from 'dayjs';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const emits = defineEmits(['change-service-type', 'change-contract-code', 'change-xgf-type', 'change-publish-code']);
  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
    applicationType: {
      type: String,
    },
  });
  const infoFormRef = ref();
  // 承包单位
  const contractCodeOptions: any = ref([]);
  //承包单位负责人
  const contractManagerOptions: any = ref([]);
  // 发包单位
  const publishCodeOptions: any = ref([]);
  // 发包车间
  const publishWorkshopCodeOptions: any = ref([]);
  // 项目名称
  const enterOptions = ref([]);
  const info = ref({
    id: '',
    xgfType: '1',
    projectTerm: '1',
    contractCode: undefined,
    contractName: undefined,
    projectName: undefined,
    contractManagerId: undefined,
    contractManagerName: undefined,
    contractManagerPhone: undefined,
    businessScope: undefined,
    publishCode: undefined,
    publishName: undefined,
    publishWorkshopCode: undefined,
    publishManagerId: '',
    publishManagerName: undefined,
    workerNumber: 0,
    specialWorkerNumber: 0,
    workDateStart: undefined,
    workDateEnd: undefined,
    projectDangerEvaluate: undefined,
    evaluateDate: undefined,
    evaluatePersonId: '',
    riskMeasure: undefined,
    enterId: undefined,
  });
  const publishCode = ref('');
  const contractCodeDisabled = ref(false);
  onMounted(async () => {
    // 承包单位
    getDetailList().then((res) => {
      contractCodeOptions.value = res.map((item) => {
        return {
          label: item.companyName,
          value: item.orgCode,
          orgId: item.orgId,
          businessScope: item.businessScope,
        };
      });
      if (userStore.userInfo.orgCode.includes('A04B12') && props.applicationType !== '新增人员') {
        const extra = contractCodeOptions.value.filter((item) => userStore.userInfo.orgCode.includes(item.value))[0];
        info.value.contractCode = extra.value;
        info.value.contractName = extra.label;
        info.value.businessScope = extra.businessScope;
        userSchema(extra.orgId);
        emits('change-contract-code', extra.value);
        contractCodeDisabled.value = true;
      } else {
        contractCodeDisabled.value = false;
      }
    });
    await get3List().then(async (res) => {
      const orgOptions = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      publishCodeOptions.value = orgOptions;
    });
  });
  const changePublishCode = (value) => {
    info.value.publishManagerId = '';
    info.value.evaluatePersonId = '';
    info.value.publishWorkshopCode = undefined;
    publishWorkshopCodeOptions.value = [];
    publishCode.value = '';
    if (value) {
      departSchema(value);
      publishCode.value = value;
      infoFormRef.value.clearValidate(['publishManagerId', 'evaluatePersonId', 'publishWorkshopCode']);
    }
    emits('change-publish-code', value);
  };
  // 3级机构
  const departSchema = async (orgCode) => {
    await getDepart3List({ orgCode }).then((res) => {
      if (res) {
        publishWorkshopCodeOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
      }
    });
  };
  const initEnter = async () => {
    if (props.applicationType === '新增人员') {
      await getListByCurrent().then((res) => {
        enterOptions.value = res.map((item) => {
          return {
            label: item.projectName,
            value: item.id,
            data: item,
          };
        });
      });
    }
  };
  // 回显承包单位负责人
  const initContractManager = async (contractCode, code) => {
    await userSchema(contractCodeOptions.value.filter((ite) => ite.value === contractCode)[0]?.orgId);
    await departSchema(code);
    if (code) {
      publishCode.value = code;
    }
  };
  // 承包单位change
  const changeContractCode = (value, extra) => {
    userSchema();
    info.value.contractName = undefined;
    info.value.contractManagerId = undefined;
    info.value.contractManagerName = undefined;
    info.value.contractManagerPhone = undefined;
    info.value.businessScope = undefined;
    if (value) {
      info.value.contractName = extra.label;
      info.value.businessScope = extra.businessScope;
      userSchema(extra.orgId);
    }
    emits('change-contract-code', value);
  };
  const changeXgfType = (value) => {
    emits('change-xgf-type', value);
  };
  // 根据相关方单位获取人员
  const userSchema = async (id?) => {
    if (id) {
      await getUser({ departIds: id }).then((res) => {
        contractManagerOptions.value = res.records.map((item) => {
          return {
            label: item.realname,
            value: item.id,
            phone: item.phone,
          };
        });
      });
    } else contractManagerOptions.value = [];
  };
  const changeContractManagerId = (value, extra) => {
    info.value.contractManagerPhone = undefined;
    info.value.contractManagerName = undefined;
    if (value) {
      info.value.contractManagerName = extra.label;
      info.value.contractManagerPhone = extra.phone;
    }
  };
  const disabledStartDate = (current) => {
    // 如果选择了结束日期，则禁用当前日期之前的日期
    if (info.value.workDateEnd && info.value.workDateEnd !== '') {
      return (current && dayjs(current).isAfter(dayjs(info.value.workDateEnd))) || current < dayjs().startOf('day');
    }
    return current < dayjs().startOf('day');
  };
  const disabledEndDate = (current) => {
    // 如果选择了开始日期，则禁用当前日期之后的日期
    if (info.value.workDateStart && info.value.workDateStart !== '') {
      return current && dayjs(current).isBefore(dayjs(info.value.workDateStart));
    }
    return current < dayjs().startOf('day');
  };
  // 项目名称
  const changeEnter = (value, extra) => {
    info.value.contractCode = undefined;
    info.value.contractName = undefined;
    info.value.publishCode = undefined;
    info.value.publishName = undefined;
    info.value.publishManagerId = '';
    info.value.publishManagerName = undefined;
    info.value.contractManagerId = undefined;
    info.value.contractManagerName = undefined;
    info.value.contractManagerPhone = undefined;
    emits('change-contract-code', null);
    if (value) {
      info.value.contractCode = extra.data.contractCode;
      info.value.contractName = extra.data.contractName;
      info.value.publishCode = extra.data.publishCode;
      info.value.publishName = extra.data.publishName;
      info.value.publishManagerId = extra.data.publishManagerId;
      info.value.publishManagerName = extra.data.publishManagerName;
      info.value.contractManagerId = extra.data.contractManagerId;
      info.value.contractManagerName = extra.data.contractManagerName;
      info.value.contractManagerPhone = extra.data.contractManagerPhone;
      queryById({ id: value }).then((res) => {
        if (res) {
          emits('change-contract-code', extra.data.contractCode, res.personList, extra.data.publishCode);
        }
      });
    }
  };
  const confirm = () => {
    infoFormRef.value.clearValidate(['publishManagerId', 'evaluatePersonId']);
  };
  defineExpose({
    info,
    infoFormRef,
    userSchema,
    initContractManager,
    initEnter,
  });
</script>
<style lang="less" scoped>
  /deep/.ant-form-item {
    margin-bottom: 10px;
  }
</style>
