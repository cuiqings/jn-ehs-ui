<template>
  <a-form
    ref="formRef"
    v-loading="loading"
    :model="formData"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
    :rules="formRules"
    labelWrap
    style="position: relative"
  >
    <a-button class="delete-btn" v-if="!readonly && workIndex > 0" type="primary" @click="handleDelete" danger>
      <template #icon>
        <DeleteOutlined />
      </template>
      删除
    </a-button>
    <a-row :gutter="12">
      <a-col :span="12" v-if="workIndex == 0">
        <a-form-item label="是否可见" :colon="false" name="checkAdmin">
          <a-switch v-model:checked="formData.checkAdmin" checkedValue="1" checked-children="是" unCheckedValue="0" un-checked-children="否" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="workIndex == 0">
        <a-form-item label="作业内容" :colon="false" name="workContent">
          <my-input :type="readonly ? 'readonly' : 'input'" placeholder="请输入" :max-length="1000" v-model="formData.workContent" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="workIndex == 0 && !unhazardousWork">
        <a-form-item label="高危作业等级" :colon="false" name="highWorkLevel">
          <a-select
            :disabled="readonly"
            v-model:value="formData.highWorkLevel"
            :options="levelList"
            :field-names="{ label: 'label', value: 'value' }"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="作业类型" :colon="false" name="workType">
          <a-select
            :disabled="readonly"
            v-model:value="formData.workType"
            :options="formData.workTypeList"
            :field-names="{ label: 'label', value: 'value' }"
            @change="workTypeChange"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="布控球" name="ballCameraCode">
          <a-select
            :disabled="readonly || !formData.applicationUnit || !formData.workUnit"
            v-model:value="formData.ballCameraCode"
            :options="controlTheBallList"
            placeholder="请选择"
            @change="changeBallCamera"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="申请单位" :colon="false" name="applicationUnit">
          <a-tree-select
            disabled
            v-model:value="formData.applicationUnit"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
            @change="handleApplicationUnit"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="申请人" :colon="false" name="applicant">
          <a-input v-model:value="formData.applicantName" disabled />
          <a-input type="hidden" v-model:value="formData.applicant" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="unhazardousWork">
        <a-form-item label="生产单位" :colon="false" name="workOrgCode">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formData.workOrgCode"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '1'">
        <a-form-item label="作业高度(m)" :colon="false" name="workHeight">
          <a-input-number
            style="width: 100%"
            placeholder="请输入"
            type="number"
            @change="workHeightChange"
            :max="99"
            :maxLength="4"
            v-model:value="formData.workHeight"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '4'">
        <a-form-item label=" 起吊物重量(t)" :colon="false" name="hoistingWeight">
          <a-input-number
            placeholder="请输入"
            :max="7000"
            style="width: 100%"
            type="number"
            @change="hoistingWeightChange"
            v-model:value="formData.hoistingWeight"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="['1', '3', '4'].includes(formData.workType as string)">
        <a-form-item label="作业等级" :colon="false" name="workGrade">
          <a-select
            :disabled="readonly || ['1', '4'].includes(formData.workType as string)"
            v-model:value="formData.workGrade"
            :options="workGradeList[formData.workType]"
            :field-names="{ label: 'label', value: 'value' }"
            placeholder="请选择"
            @change="changeWorkGrade"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '2'">
        <a-form-item label="所属单位" :colon="false" name="affiliation">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formData.affiliation"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            @change="affiliationChange"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="作业单位" :colon="false" name="workUnit">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formData.workUnit"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            @change="workUnitChange"
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="生产单位" :colon="false" name="workOrgCode">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formData.workOrgCode"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业地点" :colon="false" name="workLocation">
          <a-input type="input" :max-length="100" v-model:value="formData.workLocation" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <template v-if="unhazardousWork">
        <a-col :span="12">
          <a-form-item label="是否管修分离" :colon="false" name="cardFlag">
            <a-radio-group :disabled="readonly" v-model:value="formData.cardFlag">
              <a-radio value="1">是</a-radio>
              <a-radio value="2">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="formData.cardFlag == '1'">
          <a-form-item label="维修事业部作业负责人" :colon="false" name="compiler">
            <JUserModal type="checkbox" v-model:value="formData.compiler" placeholder="请选择" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="岗位工" name="postWorker">
            <JUserModal type="checkbox" v-model:value="formData.postWorker" placeholder="请选择" />
          </a-form-item>
        </a-col>
      </template>
      <template v-if="formData.workType == '5'">
        <a-col :span="12">
          <a-form-item label="电源接入点" name="powerPoint">
            <a-input :type="readonly ? 'readonly' : 'input'" :max-length="100" v-model:value="formData.powerPoint" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="工作电压" name="operatingVoltage">
            <a-input :type="readonly ? 'readonly' : 'input'" :max-length="100" v-model:value="formData.operatingVoltage" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用电设备功率" name="consumerInfo">
            <a-input :type="readonly ? 'readonly' : 'input'" :max-length="100" v-model:value="formData.consumerInfo" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </template>
      <a-col :span="12" v-if="formData.workType == '2'">
        <a-form-item label="有限空间名称" name="limitSpaceCode">
          <a-select
            placeholder="请选择"
            :show-arrow="false"
            v-model:value="formData.limitSpaceCode"
            showSearch
            @change="limitSpaceChange"
            :options="limitSpaceName"
            :filterOption="(input, option) => option.name.includes(input) || option.code.includes(input)"
            :field-names="{ label: 'label', value: 'code', options: 'children' }"
            :disabled="readonly"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '2'">
        <a-form-item label="原有介质" name="limitSpaceOriginalMedium">
          <a-input :type="readonly ? 'readonly' : 'input'" :maxLength="100" v-model:value="formData.limitSpaceOriginalMedium" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业负责人" name="sceneHead">
          <JUserModal type="checkbox" v-model:value="formData.sceneHead" @beforeChange="changeSceneHead" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '2'">
        <a-form-item label="救援人员" name="rescuers">
          <JUserModal type="checkbox" v-model:value="formData.rescuers" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业人员" :colon="false" name="operatorName">
          <JUserModal
            type="checkbox"
            url="/workApply/getIdCode"
            :curColumns="curColumns"
            :params="{ workType: formData.workType }"
            v-model:value="formData.operator"
            @confirm="personSuccess"
            placeholder="请选择"
          />
        </a-form-item>
        <a-form-item v-show="false" label="作业人员" :colon="false" name="operator">
          <a-input placeholder="请选择" v-model:value="formData.operator" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '3'">
        <a-form-item label="作业证号" :colon="false" name="workIdNo">
          <a-input :disabled="readonly" readonly placeholder="请选择" v-model:value="formData.workIdNo" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="监护人" :colon="false" name="workUnitGuardian">
          <JUserModal
            v-if="formData.workType != '2'"
            type="checkbox"
            v-model:value="formData.workUnitGuardian"
            @beforeChange="beforeChange"
            @confirm="workUnitGuardianChange"
            placeholder="请选择"
          />
          <JUserModal
            v-else
            type="checkbox"
            url="/workApply/getLimitSpaceGuard"
            v-model:value="formData.workUnitGuardian"
            @beforeChange="beforeChange"
            @confirm="workUnitGuardianChange"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="安全措施确认人" :colon="false" name="securityMeasuresUser">
          <JUserModal
            @click-useralready="(cb) => changeUser(cb, formData.workUnitGuardian)"
            type="checkbox"
            v-model:value="formData.securityMeasuresUser"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item :label="['6', '7'].includes(formData.workTpe) ? '计划停煤气工作时间' : '作业时间'" :colon="false" name="start">
          <a-range-picker
            v-model:value="formData['start']"
            :placeholder="['年 月 日 时 分', '年 月 日 时 分']"
            show-time
            :disabledDate="disabledDate"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled="readonly"
          >
            <template #separator>至</template>
            <template #suffixIcon></template>
          </a-range-picker>
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '2'">
        <a-form-item label="四合一气体检测仪" :colon="false" name="gasDetectors">
          <a-select
            v-model:value="formData.gasDetectors"
            :options="siheyiDeviceList"
            :field-names="{ label: 'deviceName', value: 'deviceCode' }"
            placeholder="请选择"
            @change="gasDetectorsChange"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '3'">
        <a-form-item label="是否需要分析" :colon="false" name="cardFlag">
          <a-radio-group :disabled="readonly" v-model:value="formData.cardFlag">
            <a-radio value="1">是</a-radio>
            <a-radio value="2">否</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formData.workType == '4'">
        <a-form-item label="吊车车牌号" :colon="false" name="hoistingCode">
          <a-input type="input" :maxLength="50" v-model:value="formData.hoistingCode" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <template v-if="formData.workType == '4'">
        <a-col :span="12">
          <a-form-item label="特殊工种作业证号" :colon="false" name="hoistingIdNumber">
            <a-input :disabled="readonly" placeholder="请输入" v-model:value="formData.hoistingIdNumber" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="司索指挥人" :colon="false" name="commanderPriest">
            <JUserModal type="checkbox" v-model:value="formData.commanderPriest" placeholder="请选择" />
          </a-form-item>
        </a-col>
      </template>
      <a-col :span="12" v-if="formData.workType == '5'">
        <a-form-item label="电工证号" :colon="false" name="hoistingIdNumber">
          <a-input :disabled="readonly" placeholder="请输入" v-model:value="formData.hoistingIdNumber" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="高危作业施工方案" :colon="false" name="annexUrl">
          <JUpload ref="uploadRef" :maxCount="5" v-model:value="formData.annexUrl" text="上传附件" />
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="风险辨识" :labelCol="{ span: 3 }" :wrapper-col="{ span: 20 }" :colon="false" name="possibleDanger">
          <a-checkbox-group @change="possibleChange" v-model:value="formData.possibleDanger" :disabled="readonly" :options="possibleDangerList2" />
          <a-form-item
            v-if="formData.possibleDanger && formData.possibleDanger.includes('其他伤害')"
            name="possibleDangerInput"
            style="margin-top: 15px"
            :rules="{
              required: formData.possibleDanger.includes('其他伤害'),
              message: '请输入',
            }"
          >
            <a-input
              :disabled="!formData.possibleDanger.includes('其他伤害')"
              :type="readonly ? 'readonly' : 'input'"
              v-model:value="formData.possibleDangerInput"
              :max-length="50"
              placeholder="请输入"
            />
          </a-form-item>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="安全措施" :labelCol="{ span: 4 }" :wrapper-col="{ flex: 1, offset: 3 }" :colon="false" name="securityMeasuresIds">
          <a-table
            :columns="colum0"
            :dataSource="formData.securityMeasuresIdList"
            :pagination="false"
            rowKey="sort"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formData.securityMeasuresIds,
              fixed: false,
              onChange: checkChange,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index }">
              <template v-if="column.dataIndex === 'id'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item
          label="其他安全措施"
          :labelCol="{ span: 4, offset: 1 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          name="otherSecurityMeasures"
        >
          <my-input :type="readonly ? 'readonly' : 'input'" :max-length="200" v-model="formData.otherSecurityMeasures" placeholder="其它补充措施" />
        </a-form-item>
      </a-col>
      <!-- <a-col :span="24" style="text-align: center">
        <a-button @click="handleDelete" type="primary" danger>删除</a-button>
      </a-col> -->
      <a-col :span="24" v-if="['6', '7'].includes(formData.workType as string)">
        <a-form-item
          label="现场防护设施准备情况"
          :labelCol="{ span: 4 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          name="protectiveEquipmentIds"
        >
          <a-table
            :columns="colum2"
            :dataSource="dataSauce2"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formData.protectiveEquipmentIds,
              fixed: false,
              onChange: protectiveEquipmentcheckChange,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
              <template v-if="column.dataIndex === 'number'">
                <a-input v-model:value="record.number" />
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
      <a-col :span="24" v-if="['6', '7'].includes(formData.workType as string)">
        <a-form-item label="操作步骤" :labelCol="{ span: 4 }" :wrapper-col="{ flex: 1, offset: 3 }" :colon="false" name="procedureIds">
          <a-table
            v-if="formData.workType == '6'"
            :columns="colum3"
            :dataSource="dataSauce3"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formData.procedureIds,
              fixed: false,
              onChange: procedureCheckChange,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
          <a-table
            v-if="formData.workType == '7'"
            :columns="colum3"
            :dataSource="dataSauce4"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formData.procedureIds,
              fixed: false,
              onChange: procedureCheckChange,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
    </a-row>
    <markModal @register="registerModal" @callback-value="markSuccess" />
    <gridModal @register="registerGridModal" @callback-value="markSuccess" />
    <PersonModal @register="registerPersonModal" @submit="personSuccess" />
  </a-form>
</template>

<script setup lang="ts" name="JobMessage">
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { getLimitSpace, getWorkSecurityMeasuresByType, siheyiDeviceConfig, queryIsHaveWork } from '../api';
  import { limitedSpaceFormValidation } from './hazardIdentification';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  import type { JobApplyForFrom, selectOption } from '../type';
  import PersonModal from '../components/personModal.vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { usePublicData } from './hooks/usePublicData';
  import { useUserStore } from '/@/store/modules/user';
  import markModal from '../components/markModal.vue';
  import gridModal from '../components/gridModal.vue';
  import { useModal } from '/@/components/Modal';
  import { JUserModal } from '/@/components/Form';
  import { useContent } from './hooks/useContent';
  import MyInput from '../components/MyInput.vue';
  import { computed, ref, watch, nextTick, onMounted } from 'vue';
  import { Modal } from 'ant-design-vue';
  import { useRoute } from 'vue-router';
  import dayjs, { Dayjs } from 'dayjs';
  import { useData } from '../hooks/usePublicData';
  import { getList } from '../api/index';

  const { curColumns } = useData();
  const route = useRoute();

  const unhazardousWork = computed(() => route.name === 'UnhazardousWork-WorkRequisition');

  const [registerModal, { openModal }] = useModal();
  const [registerGridModal] = useModal();
  const [registerPersonModal, { openModal: openPersonModal }] = useModal();
  const workStore = useWorkStore();
  const prop = withDefaults(
    defineProps<{
      readonly: boolean;
      // formData?: JobApplyForFrom;
      workIndex?: number;
      initType?: string;
    }>(),
    {
      readonly: false,
      // formData: () => {
      //   return {};
      // },
      workIndex: 0,
      initType: 'apply',
    }
  );
  const loading = ref(false);
  const userStore: any = useUserStore();

  const emit = defineEmits(['update:value', 'close', 'refresh', 'typeChange', 'flowPath', 'delete']);
  const formRef = ref();
  // 施工所在车间
  let limitSpaceName = ref<selectOption[]>([]);
  // let workUnitGuardian = ref([]);
  let formState = ref<any>({
    workType: '',
    cardFlag: '1',
    workGrade: '1',
    operatorList: [],
    possibleDanger: [],
    securityMeasuresIdList: [],
  });
  // 布控球列表
  const controlTheBallList = ref([]);
  const ruleMy = {
    operatorName: [
      { required: true, message: '请选择作业人！', trigger: 'change' },
      {
        validator: async (_rule, val: string) => {
          if (formData.value.workUnitGuardian) {
            // 判断两个数组是否有交集
            if (hasIntersection(formData.value.operator.split(','), formData.value.workUnitGuardian.split(','))) {
              return Promise.reject('作业人员不能是监护人！');
            }
          }
        },
      },
    ],
    workUnitGuardian: [
      { required: true, message: '请选择现场监护人！', trigger: 'change' },
      {
        validator: async (_rule, val: string) => {
          if (formData.value.operator) {
            // 判断两个数组是否有交集
            if (hasIntersection(formData.value.operator.split(','), formData.value.workUnitGuardian.split(','))) {
              return Promise.reject('作业人员不能是监护人！');
            }
          }
        },
      },
    ],
  };
  function hasIntersection(arr1, arr2) {
    return arr1.some((item) => arr2.includes(item));
  }
  let formRules = ref<any>({ ...limitedSpaceFormValidation(), ...ruleMy });
  let otherRules = {
    securityMeasuresIds: [{ required: true, message: '请选择涉及安全措施！' }],
    possibleDanger: [{ required: true, message: '请选择' }],
    operatorName: [{ required: true, message: '请选择作业人！' }],
    operator: [{ required: true, message: '请选择作业人！' }],
  };
  // 布控球list
  const initGetList = (orgCode) => {
    getList({
      orgCode,
    }).then((res) => {
      controlTheBallList.value = res.map((item) => {
        return {
          label: item.deviceName,
          value: item.deviceCode,
        };
      });
    });
  };
  // 申请单位change
  const handleApplicationUnit = (value) => {
    if (formData.value.workUnit) {
      const orgCode = `${value},${formData.value.workUnit.substring(0, 9)}`;
      initGetList(orgCode);
    }
  };
  const changeBallCamera = (value, ext) => {
    if (value) {
      formData.value.ballCameraName = ext.label;
    }
  };
  // 安全措施
  function getSecurityByType(review?: boolean) {
    let securityMeasuresSelection: string | Array<string> = [];
    formState.value.securityMeasuresIds = [];
    getWorkSecurityMeasuresByType({ workType: formData.value.workType }).then((res) => {
      formData.value.securityMeasuresIdList = res;
      if (formState.value.workSecurityMeasuresList && formState.value.workSecurityMeasuresList.length > 0 && review) {
        formState.value.workSecurityMeasuresList.forEach((item) => {
          if (item.selected === '0') {
            securityMeasuresSelection.push(item.sort);
          }
        });
        formState.value.securityMeasuresIds = securityMeasuresSelection;
      }
    });
  }

  const formData = ref<any>({});
  
  watch(
    () => formData.value,
    (val) => {
      if(!prop.readonly){
        workStore.syncUpdateWorkList(prop.workIndex);
      }
    },
    { deep: true }
  );
  
  // 初始化
  const { levelList, workGradeList, colum0, colum2, dataSauce2, colum3, dataSauce3, dataSauce4, possibleDangerList2, workTimeValidation } =
    usePublicData();
  const applicationUnitList = ref<selectOption[]>([]);
  const pageInit = async () => {
    const { applicationUnitList: list } = await useContent();
    applicationUnitList.value = list.value;
    loading.value = true;
    formData.value = workStore.getWorkList[prop.workIndex];
    formRules.value = { ...limitedSpaceFormValidation(), ...ruleMy };

    // 非高危作业默认type 8
    if (route.name === 'UnhazardousWork-WorkRequisition') {
      formData.value.workType = '8';
    }
    if (formData.value.workType) {
      workTypeChange(formData.value.workType);
    }
    loading.value = false;
    if (formData.value.id) {
      getSecurityByType();
    }
    if (formData.value.workType == '2') {
      getLimitSpaceFn(formData.value.affiliation);
    }
    if (formData.value.workType == '4' && formData.value.hoistingWeight) {
      hoistingWeightChange(formData.value.hoistingWeight);
    }
    if (formData.value.workType == '1' && formData.value.workHeight) {
      workHeightChange(formData.value.workHeight);
    }
    if (prop.initType == 'copy') {
      formData.value.applicant = userStore.getUserInfo.id;
      formData.value.applicantName = userStore.getUserInfo.realname;
      formData.value.applicationUnit = userStore.getUserInfo.orgCode;
    }
    if (['6', '7'].includes(formData.value.workType)) {
      if (formData.value.procedure && formData.value.procedure.length > 0) {
        procedureCheckChange(
          formData.value.procedure.map((val) => val.index),
          formData.value.procedure
        );
      }
      if (formData.value.protectiveEquipment && formData.value.protectiveEquipment.length > 0) {
        protectiveEquipmentcheckChange(
          formData.value.protectiveEquipment.map((val) => val.index),
          formData.value.protectiveEquipment
        );
        dataSauce2.value.forEach((item) => {
          formData.value.protectiveEquipment.map((val) => {
            if (item.index == val.index) {
              item.selected = val.selected;
              item.number = val.number;
            }
          });
        });
      }
    }
    if (formData.value.workUnit && formData.value.applicationUnit) {
      let orgCode = `${formData.value.applicationUnit},${formData.value.workUnit.substring(0, 9)}`;
      if (formData.value.workUnit !== formData.value.applicationUnit) orgCode = formData.value.applicationUnit.substring(0, 9) + ',' + orgCode;
      initGetList(orgCode);
    }
  };

  pageInit();

  function workTypeChange(value) {
    emit('typeChange', value);
    getSecurityByType();
    formRef.value.clearValidate();
    if (!formData.value.id && !formData.value.pid) {
      formData.value.workGrade = '';
      formData.value.possibleDanger = [];
      formData.value.possibleDangerInput = '';
      formData.value.operatorName = '';
      formData.value.operator = '';
    }
    if (formData.value.workType == '2' && formData.value.affiliation) {
      getLimitSpaceFn(formData.value.affiliation);
    }
    formRules.value.start = [workTimeValidation(formData.value.workType as string, formData.value.workGrade as string)];
  }
  function changeWorkGrade(value) {
    formRules.value.start = [workTimeValidation(formData.value.workType as string, value)];
  }
  function affiliationChange() {
    if (formData.value.workType == '2' && formData.value.affiliation) {
      getLimitSpaceFn(formData.value.affiliation);
    }
  }

  // 作业单位变化
  const siheyiDeviceList = ref<any[]>([]);
  function workUnitChange(value) {
    let orgCode = value.substring(0, 9);
    if (value !== formData.value.applicationUnit) orgCode = value.substring(0, 9) + ',' + formData.value.applicationUnit.substring(0, 9);
    siheyiDeviceConfig({ orgCode }).then((res) => {
      siheyiDeviceList.value = res;
    });
    if (formData.value.applicationUnit) {
      const org = `${orgCode},${formData.value.applicationUnit}`;
      initGetList(org);
    }
  }
  // 四合一变化
  function gasDetectorsChange(value, obj) {
    formData.value.gasDetectorsName = obj.deviceName;
  }
  // 作业高度变化
  const workHeightChange = (val) => {
    if (val > 30) {
      formData.value.workGrade = '四级';
    } else if (val > 15 && val <= 30) {
      formData.value.workGrade = '三级';
    } else if (val > 5 && val <= 15) {
      formData.value.workGrade = '二级';
    } else if (val <= 5) {
      formData.value.workGrade = '一级';
    }
  };
  // 重量变化
  const hoistingWeightChange = (val) => {
    if (val > 100) {
      formData.value.workGrade = '一级';
    } else if (val >= 40 && val <= 100) {
      formData.value.workGrade = '二级';
    } else if (val < 40) {
      formData.value.workGrade = '三级';
    }
  };

  const limitSpaceChange = (val, obj) => {
    formData.value.limitSpaceName = obj.name;
    formData.value.limitSpaceUnit = obj.orgCode;
    formData.value.limitSpaceCode = obj.code;
  };

  // 标记点位
  const markSuccess = (data) => {
    formState.value.locationMarker = data;
  };

  const getLimitSpaceFn = async (orgCode: string) => {
    if (!orgCode) return;
    if (orgCode.length > 10) orgCode = orgCode.substring(0, 9);
    const res = await getLimitSpace({ orgCode: orgCode });
    limitSpaceName.value = res.map((v) => {
      return { label: `${v.name} (${v.code})`, value: v.code, ...v };
    });
  };

  const showSelectPerson = () => {
    let params: any = {
      workType: formData.value.workType,
      operator: formData.value.operator,
    };
    openPersonModal(true, params);
  };
  const personSuccess = (realNames, selectedNames, orgCode, data) => {
    let ids = '';
    let names = '';
    let workCardNum = '';
    formData.value.operatorList = data as [];

    formData.value.operatorList.map((val) => {
      ids += val.id + ',';
      names += `${val.realname}-${val.username},`;
      workCardNum += val.realname + '-' + val.certificationsId + ',';
    });

    formData.value.operator = ids.substring(0, ids.length - 1);
    formData.value.operatorName = names.substring(0, names.length - 1);
    if (formData.value.workType == '3') {
      formData.value.workIdNo = workCardNum.substring(0, workCardNum.length - 1);
    }
    if (formData.value.workType == '5') {
      formData.value.hoistingIdNumber = workCardNum.substring(0, workCardNum.length - 1);
    }
  };

  //风险辨识
  const otherTxtvalidator = async (_rule: Rule, value: string) => {
    if (!value && formState.value.possibleDanger.includes('其他伤害')) {
      return Promise.reject('请输入其他伤害');
    } else {
      return Promise.resolve();
    }
  };
  const possibleChange = (value: any) => {
    if (!value.includes('其他伤害')) {
      formData.value.possibleDangerInput = '';
    }
  };

  //安全措施
  const checkChange = (selectedRowKeys: any, val) => {
    formData.value.securityMeasuresIds = selectedRowKeys;
    val.forEach((item) => {
      item.selected = 0;
    });
  };

  // 现场防护设施准备情况
  const protectiveEquipmentcheckChange = (selectedRowKeys: any, val) => {
    formData.value.protectiveEquipmentIds = selectedRowKeys;
    val.forEach((item) => {
      item.selected = 1;
    });
    formData.value.protectiveEquipment = val;
  };

  // 操作步骤
  const procedureCheckChange = (selectedRowKeys: any, val) => {
    formData.value.procedureIds = selectedRowKeys;
    val.forEach((item) => {
      item.selected = 1;
    });
    formData.value.procedure = val;
  };

  //表单重置
  const reset = () => {
    formState.value.securityMeasuresIds = [];
    formState.value.workUnitGuardian = undefined;
    formRef.value.resetFields();
    formData.value.securityMeasuresIdList = [];
    formRules.value = { ...limitedSpaceFormValidation(), ...otherRules };
  };

  //下一步 校验表单
  const nextStep = () => {
    return new Promise((resolve, reject) => {
      nextTick(() => {
        formRef.value
          .validate()
          .then(() => {
            resolve(true);
          })
          .catch((error) => {
            console.log(error);
            reject(false);
          });
      });
    });
  };

  const getFormData = () => {
    let params = JSON.parse(JSON.stringify(formState.value));
    if (params.securityMeasuresIds?.length > 0) {
      params.securityMeasuresIds = params.securityMeasuresIds.toString();
    } else {
      params.securityMeasuresIds = '';
    }

    if (params.workUnitGuardian) {
      params.workUnitGuardian = params.workUnitGuardian.toString();
    } else {
      params.workUnitGuardian = null;
    }
    // all1 all2 转换为all
    if (params.workTeam.includes('all')) params.workTeam = 'all';
    return params;
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const handleDelete = () => {
    emit('delete');
    nextTick(() => {
      pageInit();
    });
  };

  // 防止删除已选的监护人
  const changeUser = (cb, item) => {
    cb(item ? item.split(',') : []);
  };

  // 监护人变化
  const beforeChange = (ids) => {
    if (unhazardousWork.value) return;
    if (!formData.value.workUnitGuardian && !formData.value.securityMeasuresUser) return;
    let securityMeasuresUser = formData.value.securityMeasuresUser ? formData.value.securityMeasuresUser.split(',') : [];
    const add = formData.value.workUnitGuardian
      ? ids.split(',').filter((item) => !formData.value.workUnitGuardian.split(',').includes(item))
      : ids.split(',');
    const del = formData.value.workUnitGuardian ? formData.value.workUnitGuardian.split(',').filter((item) => !ids.split(',').includes(item)) : [];
    if (add.length > 0) {
      securityMeasuresUser.push(...add);
    }
    if (del.length > 0) {
      securityMeasuresUser = securityMeasuresUser.filter((item) => !del.includes(item));
    }
    formData.value.securityMeasuresUser = securityMeasuresUser.join(',');
  };
  // 作业负责人change
  const changeSceneHead = (value) => {
    queryIsHaveWork({ userId: value }).then((res) => {
      if (res) {
        Modal.info({
          title: '提示',
          content: res,
          okText: '确定',
          onOk() {
            console.log('OK');
          },
        });
        formData.value.sceneHead = '';
      }
    });
  };
  const workUnitGuardianChange = () => {
    // if (unhazardousWork.value) return;
    if (!formData.value.securityMeasuresUser) {
      formData.value.securityMeasuresUser = formData.value.workUnitGuardian;
    }
  };

  //暴露方法
  defineExpose({
    //重置表单
    reset,
    pageInit,
    nextStep,
    getFormData,
  });
</script>

<style scoped lang="less">
  .delete-btn {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1000;
  }
</style>
