<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    destroyOnClose
    @cancel="handleClose"
    @close="handleClose"
    :title="getTitle"
    @ok="onSubmit"
    width="1300px"
  >
    <BasicForm autoFocusFirstItem :labelWidth="200" :actionColOptions="{ span: 24 }" :labelCol="{ span: 8 }" @register="registerForm">
      <template #qlid="{ field }">
        <span style="padding-left: 10px">{{ field.slice(2) }}、</span>
      </template>
      <template #add="{ field, model }">
        <a-button :disabled="getTitle === '查看'" type="button" v-if="Number(field.slice(1)) === 1" @click="add(field, model)" style="cursor: pointer"
          >+</a-button
        >
        <a-button :disabled="getTitle === '查看'" type="button" v-if="field.slice(1) > 1" @click="del(field.slice(1))" style="cursor: pointer"
          >-</a-button
        >
      </template>
      <template #blank>
        <span style="padding-right: 35px" v-if="false"></span>
      </template>
      <template #rulesBox>
        <a-table
          style="width: 107%; margin-left: 11%"
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="getTitle !== '查看' ? columns : columns1"
          :dataSource="dataSource"
          :pagination="false"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key === 'pointName'"> <span class="red-require">*</span>属性名称 </template>
            <template v-if="column.key === 'compareRule'"> <span class="red-require">*</span>比较规则 </template>
            <template v-if="column.key === 'compareType'"> <span class="red-require">*</span>比较类型</template>
            <template v-if="column.key === 'compareValue'"> <span class="red-require">*</span>比较属性 </template>
          </template>
          <template v-if="getTitle !== '查看'" #action="{ record, index }">
            <div>
              <a-button v-if="index !== 0" type="link" @click="deleteItem(index)"><minus-circle-outlined /></a-button>
            </div>
          </template>
          <template #pointName="{ record, index }">
            <a-input
              :disabled="getTitle === '查看'"
              placeholder="请选择"
              v-model:value="record.pointName"
              :rows="2"
              :maxlength="50"
              @click="selectPoint(record, index, 'pointName')"
            />
            <div v-if="record.errorFlag1" style="color: red">请选择属性名称</div>
          </template>
          <template #compareRule="{ record }">
            <JDictSelectTag
              :disabled="getTitle === '查看'"
              width="130px"
              v-model:value="record.compareRule"
              :show-choose-option="false"
              placeholder="请选择"
              dictCode="warn_compare_rule"
              @change="changeCompareRule(record)"
            />
            <div v-if="record.errorFlag2" style="color: red">请选择比较规则</div>
          </template>
          <template #compareType="{ record }">
            <JDictSelectTag
              :disabled="getTitle === '查看'"
              v-model:value="record.compareType"
              type="radio"
              small
              :show-choose-option="false"
              placeholder="请选择"
              dictCode="warn_compare_type"
              @change="changeCompareType(record)"
            />
            <div v-if="record.errorFlag3" style="color: red">请选择比较类型</div>
          </template>
          <template #compareValue="{ record, index }">
            <a-input
              v-if="record.compareType == '0'"
              :disabled="getTitle === '查看'"
              placeholder="请选择"
              v-model:value="record.compareValue"
              @change="selectCompareValue(record)"
            />
            <a-input
              v-if="record.compareType == '1'"
              :disabled="getTitle === '查看'"
              placeholder="请选择"
              v-model:value="record.compareValueName"
              :rows="2"
              :maxlength="50"
              @click="selectPoint(record, index, 'compareValue')"
            />
            <div v-if="record.compareType == '0' && record.errorFlag4" style="color: red">请输入比较属性</div>
            <div v-if="record.compareType == '1' && record.errorFlag4" style="color: red">请选择比较属性</div>
          </template>
        </a-table>
        <a-button
          v-if="getTitle !== '查看'"
          type="dashed"
          style="color: #1890ff; border-color: #40a9ff; margin: 5px 0 10px 198px"
          @click="ruleShowAdd"
        >
          <PlusOutlined />添加
        </a-button>
      </template>
      <template #messageNoticeBox>
        <a-table
          style="width: 107%; margin-left: 11%"
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="getTitle !== '查看' ? columnsNotice : columnsNotice1"
          :dataSource="dataSourceNotice"
          :pagination="false"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key === 'noticeRoleId'"> <span class="red-require">*</span>通知人员/角色 </template>
            <template v-if="column.key === 'warnNotice'"> <span class="red-require">*</span>通知渠道 </template>
          </template>
          <template v-if="getTitle !== '查看'" #action="{ record, index }">
            <div>
              <a-button v-if="index !== 0" type="link" @click="deleteItemNotice(index)"><minus-circle-outlined /></a-button>
            </div>
          </template>
          <template #noticeRoleId="{ record }">
            <div style="width: 200px">
              <a-select
                :disabled="getTitle === '查看'"
                v-model:value="record.noticeRoleId"
                mode="multiple"
                style="width: 100%"
                placeholder="请选择"
                :options="roleOptions"
                :filter-option="filterOption"
                @change="noticeRoleChange(record)"
              ></a-select>
              <div v-if="record.errorFlagNotice1" style="color: red">请选择通知角色</div>
            </div>
          </template>
          <template #noticeUserId="{ record }">
            <div style="width: 200px">
              <a-select
                :disabled="getTitle === '查看'"
                v-model:value="record.noticeUserId"
                mode="multiple"
                style="width: 100%"
                placeholder="请选择"
                :options="userOptions"
                :filter-option="filterOption"
                @change="noticePersonChange(record)"
              ></a-select>
              <!-- <JSelectMultiple
                v-model:value="record.noticeUserId"
                :disabled="getTitle === '查看'"
                mode="multiple"
                class="select-multiple"
                placeholder="请选择"
                :max-tag-count="maxTagCount"
                :max-tag-text-length="maxTagTextLength"
                :options="userOptions"
                @change="noticePersonChange(record)"
              /> -->
              <div v-if="record.errorFlagNotice1" style="color: red">请选择通知人员</div>
            </div>
          </template>
          <template #warnNotice="{ record }">
            <JCheckbox v-model:value="record.warnNotice" :disabled="getTitle === '查看'" dictCode="warn_notice" @change="noticeTypeChange(record)" />

            <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
            <div v-if="record.errorFlagNotice2" style="color: red">请选择通知渠道</div>
          </template>
        </a-table>
        <a-button
          v-if="getTitle !== '查看' && dataSourceNotice.length < 5"
          type="dashed"
          style="color: #1890ff; border-color: #40a9ff; margin: 5px 0 10px 198px"
          @click="noticeShowAdd"
        >
          <PlusOutlined />添加
        </a-button>
      </template>
      <template #warnUpgradeBox>
        <a-table
          style="width: 107%; margin-left: 11%"
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="getTitle !== '查看' ? columnsUpgrade : columnsUpgrade1"
          :dataSource="dataSourceUpgrade"
          :pagination="false"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key === 'duration'"> <span class="red-require">*</span>持续时长</template>
            <template v-if="column.key === 'noticeUserId'"> <span class="red-require">*</span>通知人员/角色</template>
            <template v-if="column.key === 'warnNotice'"> <span class="red-require">*</span>通知渠道</template>
          </template>
          <template v-if="getTitle !== '查看'" #action="{ record, index }">
            <div>
              <a-button v-if="index !== 0" type="link" @click="deleteItemUpGrade(index)"><minus-circle-outlined /></a-button>
            </div>
          </template>
          <template #duration="{ record }">
            <a-input
              :disabled="getTitle === '查看'"
              style="width: 70px"
              v-model:value="record.duration"
              placeholder="请输入"
              @change="durationUpgradeChange(record)"
            />
            分
            <div v-if="record.errorFlagUpgrade1" style="color: red">请输入持续时长</div>
          </template>
          <template #noticeRoleId="{ record }">
            <div style="width: 195px">
              <a-select
                :disabled="getTitle === '查看'"
                v-model:value="record.noticeRoleId"
                mode="multiple"
                style="width: 100%"
                placeholder="请选择"
                :options="roleOptions"
                :filter-option="filterOption"
                @change="noticeRoleUpgradeChange(record)"
              ></a-select>
              <!-- <JSelectMultiple
                v-model:value="record.noticeRoleId"
                :disabled="getTitle === '查看'"
                mode="multiple"
                placeholder="请选择"
                :max-tag-count="maxTagCount"
                :max-tag-text-length="maxTagTextLength"
                :options="roleOptions"
                @change="noticeRoleUpgradeChange(record)"
              /> -->
              <div v-if="record.errorFlagUpgrade2" style="color: red">请选择通知角色</div>
            </div>
          </template>
          <template #noticeUserId="{ record }">
            <div style="width: 195px">
              <a-select
                :disabled="getTitle === '查看'"
                v-model:value="record.noticeUserId"
                mode="multiple"
                style="width: 100%"
                placeholder="请选择"
                :options="userOptions"
                :filter-option="filterOption"
                @change="noticePersonUpgradeChange(record)"
              ></a-select>
              <!-- <JSelectMultiple
                v-model:value="record.noticeUserId"
                :disabled="getTitle === '查看'"
                mode="multiple"
                placeholder="请选择"
                :max-tag-count="maxTagCount"
                :max-tag-text-length="maxTagTextLength"
                :options="userOptions"
                @change="noticePersonUpgradeChange(record)"
              /> -->
              <div v-if="record.errorFlagUpgrade2" style="color: red">请选择通知人员</div>
            </div>
          </template>
          <template #warnNotice="{ record }">
            <JCheckbox
              v-model:value="record.warnNotice"
              :disabled="getTitle === '查看'"
              dictCode="warn_notice"
              @change="noticeTypeUpgradeChange(record)"
            />

            <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
            <div v-if="record.errorFlagUpgrade3" style="color: red">请选择通知渠道</div>
          </template>
        </a-table>
        <a-button
          v-if="getTitle !== '查看'"
          type="dashed"
          style="color: #1890ff; border-color: #40a9ff; margin: 5px 0 10px 198px"
          @click="upgradeShowAdd()"
        >
          <PlusOutlined />添加
        </a-button>
      </template>
      <template #triggerRule="{ field, model }">
        <a-radio-group v-model:value="model[field]" name="radioGroup" @change="handleTriggerRuleChange">
          <a-radio value="0">
            时间触发
            <a-input-number
              :disabled="getTitle === '查看'"
              style="width: 75px"
              placeholder="至少5s"
              v-model:value="timeTriggerValue"
              :min="5"
              :max="3600"
            />
            秒
          </a-radio>
          <a-radio value="1">
            次数触发
            <a-input-number
              :disabled="getTitle === '查看'"
              style="width: 70px"
              v-model:value="countTriggerValue"
              placeholder="请输入"
              :min="1"
              :max="720"
            />
            次
          </a-radio>
        </a-radio-group>
      </template>
      <template #fadeRule="{ field, model }">
        每
        <a-input-number
          :min="1"
          :max="999"
          style="width: 70px"
          v-model:value="convergenceCycle"
          :disabled="getTitle === '查看'"
          placeholder="请输入"
        />
        <span style="display: inline-block; margin-right: 20px"> 分钟</span> 最多报
        <a-input-number
          :min="1"
          :max="999"
          style="width: 70px"
          v-model:value="convergenceFrequency"
          :disabled="getTitle === '查看'"
          placeholder="请输入"
        />
        次数
      </template>
      <template #compareValue2="{ field, model }">
        <a-input-number :step="1" :precision="1" v-model:value="compareValue2" placeholder="请输入" :disabled="getTitle === '查看'" />
        ~
        <a-input-number
          :step="1"
          :precision="1"
          v-model:value="compareValue3"
          placeholder="请输入"
          @change="compareValue3Change"
          :disabled="getTitle === '查看'"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
  <IndicatorModal @register="registerIndicatorModal" @select="selectregisterIndicatorOk" />
  <AttributeModal @register="registerAttributeModal" @select="selectAttributeOk" />
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import {
    saveAdd,
    saveEdit,
    getDetail,
    getSoundList,
    getDeviceList,
    getMessageTemplate,
    getRoleList,
    userList,
    getDevicePointList,
  } from './config.api';
  import { message, Upload, FormInstance } from 'ant-design-vue';
  import { formatToDate, formatToDateTime } from '/@/utils/dateUtil';
  import { duplicateCheck } from '/@/views/system/user/user.api';
  import { previewFile } from '/@/api/common/api';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import IndicatorModal from './IndicatorModal.vue';
  import AttributeModal from './AttributeModal.vue';
  import { getDepartTreeBy23 } from '/@/api/common/api';
  import { rules } from '/@/utils/helper/validator';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import JCheckbox from '/@/components/Form/src/jeecg/components/JCheckbox.vue';
  import JSelectMultiple from '/@/components/Form/src/jeecg/components/JSelectMultiple.vue';
  import { v } from 'vxe-table';

  // import { useMessage } from '/@/hooks/web/useMessage';
  // const { createMessage } = useMessage();
  const emit = defineEmits(['success', 'register']);
  const [registerIndicatorModal, { openModal: openIndicatorModal }] = useModal();
  const [registerAttributeModal, { openModal: openAttributeModal }] = useModal();
  const isUpdate = ref<Boolean>(true);
  // const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  const getTitle = ref('查看');
  const curRecord: any = ref({});
  const deviceOptions = ref([]);
  const relatedPointId = ref('');
  const dataSource = ref([
    {
      pointName: '',
      pointTag: '',
      compareRule: undefined,
      compareType: '',
      compareValue: '',
      errorFlag1: false,
      errorFlag2: false,
      errorFlag3: false,
      errorFlag4: false,
    },
  ]);
  const dataSourceNotice = ref([
    {
      noticeRoleId: undefined,
      noticeUserId: undefined,
      noticeType: undefined,
      errorFlagNotice1: false,
      errorFlagNotice2: false,
    },
  ]);
  const dataSourceUpgrade = ref([
    {
      duration: '',
      noticeRoleId: undefined,
      noticeUserId: undefined,
      warnNotice: undefined,
      errorFlagUpgrade1: false,
      errorFlagUpgrade2: false,
      errorFlagUpgrade3: false,
    },
  ]);
  const isPoint = ref(true);
  const warnId = ref(undefined);
  const soundOptions = ref([]);
  const orgOptions = ref([]);
  const indicatorIdsEdit = ref([]);
  const timeTriggerValue = ref(null);
  const countTriggerValue = ref(null);
  const convergenceCycle = ref(null);
  const convergenceFrequency = ref(null);
  const roleOptions = ref([]);
  const maxTagTextLength = ref(6);
  const maxTagCount = ref(1);
  const userOptions = ref([]);
  const compareValue3 = ref('');
  const compareValue2 = ref('');
  const attributeId = ref('');
  const pointOptions1 = ref([]);
  const pointOptions2 = ref([]);
  const pointOptions3 = ref([]);
  const pointOptions4 = ref([]);
  const dANDaStr = '^&';
  const columns: any = [
    { title: '属性名称', width: 130, align: 'center', key: 'pointName', dataIndex: 'pointName', slots: { customRender: 'pointName' } },
    { title: '比较规则', width: 120, align: 'center', key: 'compareRule', dataIndex: 'compareRule', slots: { customRender: 'compareRule' } },
    {
      title: '比较类型',
      align: 'center',
      key: 'compareType',
      dataIndex: 'compareType',
      width: 200,
      slots: { customRender: 'compareType' },
    },
    { title: '比较属性', width: 150, align: 'center', key: 'compareValue', dataIndex: 'compareValue', slots: { customRender: 'compareValue' } },
    {
      title: '操作',
      width: 100,
      align: 'center',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  ];
  const columns1: any = [
    { title: '属性名称', width: 150, align: 'center', key: 'pointName', dataIndex: 'pointName', slots: { customRender: 'pointName' } },
    { title: '比较规则', width: 120, align: 'center', key: 'compareRule', dataIndex: 'compareRule', slots: { customRender: 'compareRule' } },
    {
      title: '比较类型',
      align: 'center',
      key: 'compareType',
      dataIndex: 'compareType',
      width: 220,
      slots: { customRender: 'compareType' },
    },
    { title: '比较属性', width: 150, align: 'center', key: 'compareValue', dataIndex: 'compareValue', slots: { customRender: 'compareValue' } },
  ];
  const sharedOnCell = (_, index) => {
    if (index === 4) {
      return { colSpan: 0 };
    }
  };
  const columnsNotice: any = [
    {
      title: '通知人员/角色',
      colSpan: 2,
      dataIndex: 'noticeRoleId',
      key: 'noticeRoleId',
      slots: { customRender: 'noticeRoleId' },
    },
    {
      title: 'noticeUserId',
      colSpan: 0,
      dataIndex: 'noticeUserId',
      key: 'noticeUserId',
      slots: { customRender: 'noticeUserId' },
    },
    {
      title: '通知渠道',
      dataIndex: 'warnNotice',
      key: 'warnNotice',
      align: 'center',
      width: 400,
      slots: { customRender: 'warnNotice' },
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  ];
  const columnsNotice1: any = [
    {
      title: '通知人员/角色',
      colSpan: 2,
      dataIndex: 'noticeRoleId',
      key: 'noticeRoleId',
      slots: { customRender: 'noticeRoleId' },
    },
    {
      title: 'noticeUserId',
      colSpan: 0,
      dataIndex: 'noticeUserId',
      key: 'noticeUserId',
      slots: { customRender: 'noticeUserId' },
    },
    {
      title: '通知渠道',
      dataIndex: 'warnNotice',
      key: 'warnNotice',
      align: 'center',
      width: 400,
      slots: { customRender: 'warnNotice' },
    },
  ];
  const columnsUpgrade: any = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      align: 'center',
      width: 80,
      customRender: ({ text, record, index }) => `第${index + 1}级`,
    },
    {
      title: '持续时长',
      dataIndex: 'duration',
      key: 'duration',
      align: 'center',
      width: 140,
      slots: { customRender: 'duration' },
    },
    {
      title: '通知人员/角色',
      colSpan: 2,
      dataIndex: 'noticeRoleId',
      key: 'noticeRoleId',
      slots: { customRender: 'noticeRoleId' },
    },
    {
      title: 'noticeUserId',
      colSpan: 0,
      dataIndex: 'noticeUserId',
      key: 'noticeUserId',
      slots: { customRender: 'noticeUserId' },
    },
    {
      title: '通知渠道',
      dataIndex: 'warnNotice',
      key: 'warnNotice',
      align: 'center',
      width: 350,
      slots: { customRender: 'warnNotice' },
    },
    {
      title: '操作',
      width: 70,
      align: 'center',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  ];
  const columnsUpgrade1: any = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      align: 'center',
      width: 80,
      customRender: ({ text, record, index }) => `第${index + 1}级`,
    },
    {
      title: '持续时长',
      dataIndex: 'duration',
      key: 'duration',
      align: 'center',
      width: 120,
      slots: { customRender: 'duration' },
    },
    {
      title: '通知人员/角色',
      colSpan: 2,
      dataIndex: 'noticeRoleId',
      key: 'noticeRoleId',
      slots: { customRender: 'noticeRoleId' },
    },
    {
      title: 'noticeUserId',
      colSpan: 0,
      dataIndex: 'noticeUserId',
      key: 'noticeUserId',
      slots: { customRender: 'noticeUserId' },
    },
    {
      title: '通知渠道',
      dataIndex: 'warnNotice',
      key: 'warnNotice',
      align: 'center',
      width: 350,
      slots: { customRender: 'warnNotice' },
    },
  ];
  async function getOrgList() {
    await getDepartTreeBy23().then((res) => {
      orgOptions.value = res;
    });
  }

  const value = ref([]);
  const handleChange = (value: string[]) => {
    console.log(`selected ${value}`);
  };

  getOrgList();
  getRoleOptions();
  // 获取角色列表
  async function getRoleOptions(val?: string) {
    const params = {
      roleName: val,
    };
    await getRoleList(params).then((res) => {
      console.log('getRoleOptions', res);
      roleOptions.value = res.records.map((item) => {
        return {
          label: item.roleName,
          value: item.id,
        };
      });
    });
  }
  // 获取人员
  function getUserList(val?: string) {
    userList({ departIds: val }).then((res) => {
      userOptions.value = res.records.map((item: any) => {
        return {
          label: item.realname,
          value: item.id,
        };
      });
    });
  }
  // 声光报警器
  function getSoundOptions() {
    getSoundList({ pageNo: 1, pageSize: 9999 }).then((res) => {
      console.log('getSoundOptions', res);
      const soundOptionsArr = res.records || [];
      soundOptions.value = soundOptionsArr.map((v) => {
        return {
          label: v.name,
          value: v.id,
        };
      });
      console.log('soundOptions', soundOptions.value);
    });
  }
  const schemas: any = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'divider-basic',
      component: 'Divider',
      label: '基本信息',
    },
    {
      label: '报警等级',
      field: 'warnLevel',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        type: 'radio',
        dictCode: 'warn_level',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '报警类别',
      field: 'warnCategory',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        type: 'radio',
        dictCode: 'warn_category',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: {
        span: 11,
      },
    },
    {
      label: '报警名称',
      field: 'warnName',
      required: true,
      component: 'Input',
      dynamicRules: ({ model }) => {
        console.log('model', model);
        return [
          { required: true, message: '报警名称不能为空！' },
          { min: 0, max: 50, message: '请输入50字内的名称！', trigger: 'blur' },
          {
            validator: (_, value) => {
              if (value) {
                value = value.trim();
              }
              return new Promise((resolve, reject) => {
                let params = {
                  tableName: 'daq_point',
                  fieldName: 'point_tag',
                  fieldVal: value,
                  dataId: warnId.value,
                };
                duplicateCheck(params)
                  .then((res) => {
                    res.success ? resolve() : reject(res.message || '校验失败');
                  })
                  .catch((err) => {
                    reject(err.message || '验证失败');
                  });
              });
            },
          },
        ];
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '报警类型',
      field: 'warnConfigType',
      component: 'JDictSelectTag',
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          dictCode: 'warn_config_type',
          stringToNumber: false,
          showChooseOption: false,
          onChange: (val) => {
            if (val == '6') {
              // 6为报警类型为小时报警器
              formModel.warnDisType = '0';
            }
          },
        };
      },
      colProps: {
        span: 11,
      },
    },
    {
      label: '声光报警器',
      field: 'warnAlertorIds',
      component: 'JSelectMultiple',
      componentProps: () => {
        return {
          options: soundOptions.value,
          mode: 'multiple',
        };
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '销警方式',
      field: 'warnDisType',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        type: 'radio',
        dictCode: 'warn_dis_type',
        stringToNumber: false,
        showChooseOption: false,
      },
      dynamicDisabled: ({ values }) => {
        return values.warnConfigType == '6';
      },
      colProps: {
        span: 11,
      },
    },
    {
      label: '报警描述',
      field: 'descc',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '启/停用',
      field: 'warnStartStop',
      component: 'Switch',
      defaultValue: '0',
      componentProps: {
        // checked: true,
        checkedValue: '0',
        unCheckedValue: '1',
        checkedChildren: '启用',
        unCheckedChildren: '停用',
        onChange: (checked, event) => {},
      },
      dynamicDisabled: ({ values }) => {
        return getTitle.value === '查看';
      },
      colProps: {
        span: 11,
      },
    },
    {
      field: 'divider-basic2',
      component: 'Divider',
      label: '报警规则',
    },
    {
      label: '所属机构',
      field: 'sysOrgCode',
      required: true,
      component: 'JTreeSelect1',
      componentProps: ({ formActionType, formModel }) => {
        console.log(' formActionType formModel', formActionType, formModel);
        return {
          url: '/jn/common/getDepartTreeBy23',
          fieldNames: {
            label: 'departName',
            value: 'orgCode',
            options: 'children',
          },
          isLeaf: false,
          load: false,
          treeNodeFilterProp: 'departName',
          onChange: (options, values) => {
            // console.log('options', options, values);
            let orgcodeBak = options;
            // 清空相关指标
            formModel.indicatorName = '';
            relatedPointId.value = '';
            deviceOptions.value = [];
            formModel.deviceId = undefined;
            formModel.stopDeviceId1 = undefined;
            formModel.stopPointId1 = undefined;
            if (options) {
              let params = {};
              // 截取6位
              params.orgCode = orgcodeBak.substring(0, 6);
              params.pageSize = 9999;
              params.pageNo = 1;
              getDeviceList(params).then((res) => {
                console.log('res', res);
                if (res.records && res.records.length > 0) {
                  res.records.map((item) => {
                    deviceOptions.value.push({
                      label: item.name,
                      value: item.id + '',
                    });
                  });
                }
              });
              // 递归遍历orgOptions获取departId
              console.log('orgOptions', orgOptions.value, options);
              orgOptions.value.forEach((item) => {
                if (options.length == 6) {
                  if (item.orgCode == options) {
                    getUserList(item.id);
                  }
                } else {
                  if (item.children && item.children.length > 0) {
                    item.children.forEach((item1) => {
                      if (item1.orgCode == options) {
                        getUserList(item1.id);
                      }
                    });
                  } else {
                    if (item.orgCode == options) {
                      getUserList(item.id);
                    }
                  }
                }
              });
              const { updateSchema } = formActionType;
              updateSchema({
                field: 'deviceId',
                componentProps: () => {
                  return {
                    options: deviceOptions.value,
                    mode: 'multiple',
                  };
                },
              });
              updateSchema({
                field: 'stopDeviceId1',
                label: '停机设备1',
                labelWidth: 120,
                component: 'Select',
                componentProps: ({ formActionType, formModel }) => {
                  return {
                    options: deviceOptions.value,
                    placeholder: '请选择',
                    onChange: (e: any) => {
                      console.log('stopDeviceId1 e-----', e);
                      formModel.stopPointId1 = undefined;
                      if (e) {
                        // 根据停机设备id获取停机属性
                        let params = {};
                        params.deviceIds = e;
                        params.pageSize = 9999;
                        params.pageNo = 1;
                        getDevicePointList(params).then((res) => {
                          console.log('getDevicePointList', res);
                          pointOptions1.value = [];
                          if (res.records && res.records.length > 0) {
                            pointOptions1.value = res.records.map((item) => {
                              return {
                                label: item.pointName,
                                value: item.pointId,
                              };
                            });
                            const { updateSchema } = formActionType;
                            updateSchema({
                              field: 'stopPointId1',
                              componentProps: () => {
                                return {
                                  options: pointOptions1.value,
                                };
                              },
                            });
                          }
                        });
                      }
                    },
                  };
                },
                colProps: {
                  span: 9,
                },
              });
              updateSchema({
                field: 'stopDeviceId2',
                label: '停机设备2',
                component: 'Select',
                componentProps: ({ formActionType, formModel }) => {
                  return {
                    options: deviceOptions.value,
                    placeholder: '请选择',
                    onChange: (e: any) => {
                      console.log('stopDeviceId2 e-----', e);
                      formModel.stopPointId2 = undefined;
                      if (e) {
                        // 根据停机设备id获取停机属性
                        let params = {};
                        params.deviceIds = e;
                        params.pageSize = 9999;
                        params.pageNo = 1;
                        getDevicePointList(params).then((res) => {
                          console.log('getDevicePointList', res);
                          pointOptions2.value = [];
                          if (res.records && res.records.length > 0) {
                            pointOptions2.value = res.records.map((item) => {
                              return {
                                label: item.pointName,
                                value: item.pointId,
                              };
                            });
                            const { updateSchema } = formActionType;
                            updateSchema({
                              field: 'stopPointId2',
                              componentProps: () => {
                                return {
                                  options: pointOptions2.value,
                                };
                              },
                            });
                          }
                        });
                      }
                    },
                  };
                },
                colProps: {
                  span: 9,
                },
              });
              updateSchema({
                field: 'stopDeviceId3',
                label: '停机设备3',
                component: 'Select',
                componentProps: ({ formActionType, formModel }) => {
                  return {
                    options: deviceOptions.value,
                    placeholder: '请选择',
                    onChange: (e: any) => {
                      console.log('stopDeviceId3 e-----', e);
                      formModel.stopPointId3 = undefined;
                      if (e) {
                        // 根据停机设备id获取停机属性
                        let params = {};
                        params.deviceIds = e;
                        params.pageSize = 9999;
                        params.pageNo = 1;
                        getDevicePointList(params).then((res) => {
                          console.log('getDevicePointList', res);
                          pointOptions3.value = [];
                          if (res.records && res.records.length > 0) {
                            pointOptions3.value = res.records.map((item) => {
                              return {
                                label: item.pointName,
                                value: item.pointId,
                              };
                            });
                            const { updateSchema } = formActionType;
                            updateSchema({
                              field: 'stopPointId3',
                              componentProps: () => {
                                return {
                                  options: pointOptions3.value,
                                };
                              },
                            });
                          }
                        });
                      }
                    },
                  };
                },
                colProps: {
                  span: 9,
                },
              });
              updateSchema({
                field: 'stopDeviceId4',
                label: '停机设备4',
                component: 'Select',
                componentProps: ({ formActionType, formModel }) => {
                  return {
                    options: deviceOptions.value,
                    placeholder: '请选择',
                    onChange: (e: any) => {
                      console.log('stopDeviceId4 e-----', e);
                      formModel.stopPointId4 = undefined;
                      if (e) {
                        // 根据停机设备id获取停机属性
                        let params = {};
                        params.deviceIds = e;
                        params.pageSize = 9999;
                        params.pageNo = 1;
                        getDevicePointList(params).then((res) => {
                          console.log('getDevicePointList', res);
                          pointOptions4.value = [];
                          if (res.records && res.records.length > 0) {
                            pointOptions4.value = res.records.map((item) => {
                              return {
                                label: item.pointName,
                                value: item.pointId,
                              };
                            });
                            const { updateSchema } = formActionType;
                            updateSchema({
                              field: 'stopPointId4',
                              componentProps: () => {
                                return {
                                  options: pointOptions4.value,
                                };
                              },
                            });
                          }
                        });
                      }
                    },
                  };
                },
                colProps: {
                  span: 9,
                },
              });
              //重置比较规则
              dataSource.value = [
                {
                  pointName: '',
                  pointTag: '',
                  compareRule: undefined,
                  compareType: '',
                  compareValue: '',
                  errorFlag1: false,
                  errorFlag2: false,
                  errorFlag3: false,
                  errorFlag4: false,
                },
              ];
              // 重置角色人员
              dataSourceNotice.value = [
                {
                  noticeRoleId: undefined,
                  noticeUserId: undefined,
                  warnNotice: undefined,
                  errorFlagNotice1: false,
                  errorFlagNotice2: false,
                },
              ];
              dataSourceUpgrade.value = [
                {
                  duration: '',
                  noticeRoleId: undefined,
                  noticeUserId: undefined,
                  warnNotice: undefined,
                  errorFlagUpgrade1: false,
                  errorFlagUpgrade2: false,
                  errorFlagUpgrade3: false,
                },
              ];
            }
          },
        };
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '设备名称',
      field: 'deviceId',
      component: 'JSelectMultiple',
      required: true,
      componentProps: () => {
        return {
          style: {
            width: '100%',
          },
          options: [],
          mode: 'multiple',
        };
      },
      colProps: {
        span: 11,
      },
    },
    {
      field: 'rulesBox',
      label: '',
      component: 'Input',
      slot: 'rulesBox',
      ifShow: ({ values }) => {
        if (values.warnConfigType == '1' || values.warnConfigType == '2') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'triggerRule',
      label: '触发规则',
      required: true,
      component: 'Input',
      defaultValue: '0',
      slot: 'triggerRule',
      colProps: {
        span: 11,
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '1' || values.warnConfigType == '2') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      label: '属性名称',
      field: 'attributeName',
      component: 'Input',
      required: true,
      componentProps: () => {
        return {
          placeholder: '请选择',
          readOnly: true,
          onClick: (e: any) => {
            console.log('click--', e);
            openAttributeModal(true, { deviceId: getFieldsValue().deviceId, orgCode: getFieldsValue().sysOrgCode, fieldName: 'attributeName' });
          },
        };
      },
      colProps: {
        span: 12,
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '3' || values.warnConfigType == '4' || values.warnConfigType == '5' || values.warnConfigType == '6') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'compareValue6',
      label: '检查频率',
      component: 'InputNumber',
      required: true,
      defaultValue: 10,
      componentProps: {
        disabled: true,
        style: {
          width: '100%',
        },
        addonAfter: '分钟',
      },
      colProps: {
        span: 11,
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '6') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'compareValue1',
      label: '持续时长',
      component: 'InputNumber',
      required: true,
      componentProps: {
        style: {
          width: '100%',
        },
        min: 1,
        step: 0,
        addonAfter: '秒',
      },
      colProps: {
        span: 11,
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '3') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      label: '聚合时间',
      field: 'meanFrequency',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'warn_together_time',
        stringToNumber: false,
        showChooseOption: false,
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '4') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 11,
      },
    },
    {
      field: 'vocDuration',
      label: '余量时长',
      component: 'InputNumber',
      required: true,
      componentProps: {
        style: {
          width: '100%',
        },
        min: 0,
        precision: 0,
        addonAfter: '分钟',
      },
      colProps: {
        span: 11,
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'vocConcentration',
      label: '惯性浓度',
      component: 'InputNumber',
      required: true,
      componentProps: {
        style: {
          width: '100%',
        },
        min: 1,
        precision: 2,
        addonAfter: 'mg/m³',
      },
      colProps: {
        span: 12,
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'compareValue2',
      label: '报警阈值',
      component: 'Input',
      slot: 'compareValue2',
      defaultValue: '0',
      required: true,
      ifShow: ({ values }) => {
        if (values.warnConfigType == '4' || values.warnConfigType == '6') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 12,
      },
    },
    {
      field: 'vocEmissionCaps',
      label: '小时排放上限',
      component: 'InputNumber',
      required: true,
      componentProps: {
        style: {
          width: '100%',
        },
        min: 0.01,
        precision: 2,
        addonAfter: 'mg/m³',
      },
      colProps: {
        span: 11,
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5' || values.warnConfigType == '6') {
          return true;
        } else {
          return false;
        }
      },
    },
    // {
    //   field: 'fadeRule',
    //   label: '收敛规则',
    //   component: 'Input',
    //   slot: 'fadeRule',
    //   colProps: {
    //     span: 11,
    //   },
    //   ifShow: ({ values }) => {
    //     if (values.warnConfigType !== '5') {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    // },
    // {
    //   label: '相关指标',
    //   field: 'relatedPointName',
    //   component: 'InputTextArea',
    //   componentProps: () => {
    //     return {
    //       rows: 1,
    //       placeholder: '请选择',
    //       readOnly: true,
    //       onClick: (e: any) => {
    //         console.log('click--', e);
    //         openIndicatorModal(true, {
    //           indicatorIds: relatedPointId.value ? relatedPointId.value.split(',') : [],
    //           orgCode: getFieldsValue().sysOrgCode,
    //         });
    //       },
    //     };
    //   },
    //   ifShow: ({ values }) => {
    //     if (values.warnConfigType !== '5') {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    // },
    {
      label: '属性提醒通知',
      field: 'vocConcentrationRemind',
      component: 'Switch',
      defaultValue: '1',
      helpMessage:
        '开启后每小时第30分钟时，发送短信到报警通知所选择的通知人员/角色，内容为前30分钟该属性的平均值，以及剩余30分钟该属性的允许最大平均值',
      componentProps: {
        // checked: true,
        checkedValue: '1',
        unCheckedValue: '0',
        checkedChildren: '开启',
        unCheckedChildren: '关闭',
        onChange: (checked, event) => {},
      },
      dynamicDisabled: ({ values }) => {
        return getTitle.value === '查看';
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '6') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 12,
      },
    },
    {
      field: 'divider-basic3',
      component: 'Divider',
      label: '停机策略',
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'stopDeviceId1',
      label: '停机设备1',
      labelWidth: 120,
      component: 'Select',
      componentProps: ({ formActionType }) => {
        return {
          options: [],
          placeholder: '请选择',
        };
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 9,
      },
    },
    {
      field: 'stopPointId1',
      label: '停机属性1',
      component: 'Select',
      labelWidth: 120,
      componentProps: () => {
        return {
          options: [],
        };
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 9,
      },
    },
    {
      field: 'stopDelayTime1',
      label: '停机延时1',
      component: 'InputNumber',
      labelWidth: 120,
      componentProps: {
        style: {
          width: '100%',
        },
        min: 0,
        precision: 0,
        addonAfter: '秒',
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 5,
      },
    },
    {
      field: 'stopDeviceId2',
      label: '停机设备2',
      labelWidth: 120,
      component: 'Select',
      componentProps: ({ formActionType }) => {
        return {
          options: [],
          placeholder: '请选择',
        };
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 9,
      },
    },
    {
      field: 'stopPointId2',
      label: '停机属性2',
      component: 'Select',
      labelWidth: 120,
      componentProps: () => {
        return {
          options: [],
        };
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 9,
      },
    },
    {
      field: 'stopDelayTime2',
      label: '停机延时2',
      labelWidth: 120,
      component: 'InputNumber',
      componentProps: {
        style: {
          width: '100%',
        },
        min: 0,
        precision: 0,
        addonAfter: '秒',
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 5,
      },
    },
    {
      field: 'stopDeviceId3',
      label: '停机设备3',
      labelWidth: 120,
      component: 'Select',
      componentProps: ({ formActionType }) => {
        return {
          options: [],
          placeholder: '请选择',
        };
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 9,
      },
    },
    {
      field: 'stopPointId3',
      label: '停机属性3',
      labelWidth: 120,
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
        };
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 9,
      },
    },
    {
      field: 'stopDelayTime3',
      label: '停机延时3',
      labelWidth: 120,
      component: 'InputNumber',
      componentProps: {
        style: {
          width: '100%',
        },
        min: 0,
        precision: 0,
        addonAfter: '秒',
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 5,
      },
    },
    {
      field: 'stopDeviceId4',
      label: '停机设备4',
      labelWidth: 120,
      component: 'Select',
      componentProps: ({ formActionType }) => {
        return {
          options: [],
          placeholder: '请选择',
        };
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 9,
      },
    },
    {
      field: 'stopPointId4',
      label: '停机属性4',
      labelWidth: 120,
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
        };
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 9,
      },
    },
    {
      field: 'stopDelayTime4',
      label: '停机延时4',
      labelWidth: 120,
      component: 'InputNumber',
      componentProps: {
        style: {
          width: '100%',
        },
        min: 0,
        precision: 0,
        addonAfter: '秒',
      },
      ifShow: ({ values }) => {
        if (values.warnConfigType == '5') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 5,
      },
    },
    {
      field: 'divider-basic4',
      component: 'Divider',
      label: '报警通知',
    },

    {
      label: '消息模板',
      field: 'sysSmsTemplateId',
      component: 'ApiSelect',
      dynamicRules: () => [{ required: true, message: '请选择消息模板！' }],
      componentProps: {
        api: () => {
          return getMessageTemplate({ pageNo: 1, pageSize: 9999 });
        },
        resultField: 'records',
        labelField: 'templateName',
        valueField: 'id',
      },
    },
    {
      field: 'messageNoticeBox',
      label: '',
      component: 'Input',
      slot: 'messageNoticeBox',
    },
    {
      label: '报警升级',
      field: 'warnUpgradeEnableFlag',
      component: 'Switch',
      required: true,
      componentProps: {
        // checked: false,
        checkedValue: '0',
        unCheckedValue: '1',
        checkedChildren: '开启',
        unCheckedChildren: '关闭',
        onChange: (checked, event) => {},
      },
      dynamicDisabled: ({ values }) => {
        return getTitle.value === '查看';
      },
      defaultValue: '1',
      colProps: {
        span: 11,
      },
    },
    {
      field: 'warnUpgradeBox',
      label: '',
      component: 'Input',
      slot: 'warnUpgradeBox',
      ifShow: ({ values }) => {
        if (values.warnUpgradeEnableFlag == '0') {
          return true;
        } else {
          return false;
        }
      },
    },
    // {
    //   field: 'divider-basic5',
    //   component: 'Divider',
    //   label: '报警任务',
    // },
    // {
    //   label: '报警任务',
    //   field: 'warnTaskEnableFlag',
    //   component: 'Switch',
    //   required: true,
    //   componentProps: {
    //     // checked: false,
    //     checkedValue: '0',
    //     unCheckedValue: '1',
    //     checkedChildren: '开启',
    //     unCheckedChildren: '关闭',
    //     onChange: (checked, event) => {},
    //   },
    //   dynamicDisabled: ({ values }) => {
    //     return getTitle.value === '查看';
    //   },
    //   defaultValue: '1',
    //   colProps: {
    //     span: 8,
    //   },
    // },
    {
      label: '任务处理人',
      field: 'warnTaskHandleRoleIds',
      component: 'JSelectMultiple',
      required: true,
      componentProps: () => {
        return {
          options: roleOptions.value,
          placeholder: '请选择',
          mode: 'multiple',
        };
      },
      ifShow: ({ values }) => {
        if (values.warnTaskEnableFlag == '0') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      label: '任务验收人',
      field: 'warnTaskCheckRoleIds',
      component: 'JSelectMultiple',
      componentProps: () => {
        return {
          options: roleOptions.value,
          placeholder: '请选择',
          mode: 'multiple',
        };
      },
      ifShow: ({ values }) => {
        if (values.warnTaskEnableFlag == '0') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      label: '销警后通知人',
      field: 'warnTaskNoticeRoleIds',
      component: 'JSelectMultiple',
      componentProps: () => {
        return {
          options: roleOptions.value,
          placeholder: '请选择',
          mode: 'multiple',
        };
      },
      ifShow: ({ values }) => {
        if (values.warnTaskEnableFlag == '0') {
          return true;
        } else {
          return false;
        }
      },
    },
  ];

  //关闭方法
  function handleClose() {
    console.log('=======handleClose=========');
    deviceOptions.value = [];
    timeTriggerValue.value = null;
    countTriggerValue.value = null;
    convergenceCycle.value = null;
    convergenceFrequency.value = null;
    relatedPointId.value = '';
    compareValue2.value = '';
    compareValue3.value = '';
    attributeId.value = '';
    dataSource.value = [
      {
        pointName: '',
        pointTag: '',
        compareRule: undefined,
        compareType: '',
        compareValue: '',
        errorFlag1: false,
        errorFlag2: false,
        errorFlag3: false,
        errorFlag4: false,
      },
    ];
    dataSourceNotice.value = [
      {
        noticeRoleId: undefined,
        noticeUserId: undefined,
        noticeType: undefined,
        errorFlagNotice1: false,
        errorFlagNotice2: false,
      },
    ];
    dataSourceUpgrade.value = [
      {
        duration: '',
        noticeRoleId: undefined,
        noticeUserId: undefined,
        warnNotice: undefined,
        errorFlagUpgrade1: false,
        errorFlagUpgrade2: false,
        errorFlagUpgrade3: false,
      },
    ];
    // resetFields();
    closeDrawer();
  }
  // 注册表单
  const [
    registerForm,
    { validate, setFieldsValue, getFieldsValue, resetFields, setProps, appendSchemaByField, removeSchemaByFiled, updateSchema, resetSchema },
  ] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 17 },
    },
  });
  function deleteItem(index) {
    dataSource.value.splice(index, 1);
  }
  // 整个提交
  async function onSubmit(e: MouseEvent) {
    e?.stopPropagation();
    e?.preventDefault();
    const values = await validate();
    console.log('validate value', values);
    console.log('validate success');
    let params = Object.assign({}, values);
    // voc
    if (params.warnConfigType == '5') {
      let downtimePolicyList = [];
      if (params.stopDeviceId1) {
        downtimePolicyList.push({
          sort: 1,
          deviceId: params.stopDeviceId1,
          attributeId: params.stopPointId1,
          delayTime: params.stopDelayTime1,
        });
      }
      if (params.stopDeviceId2) {
        downtimePolicyList.push({
          sort: 2,
          deviceId: params.stopDeviceId2,
          attributeId: params.stopPointId2,
          delayTime: params.stopDelayTime2,
        });
      }
      if (params.stopDeviceId3) {
        downtimePolicyList.push({
          sort: 3,
          deviceId: params.stopDeviceId3,
          attributeId: params.stopPointId3,
          delayTime: params.stopDelayTime3,
        });
      }
      if (params.stopDeviceId4) {
        downtimePolicyList.push({
          sort: 4,
          deviceId: params.stopDeviceId4,
          attributeId: params.stopPointId4,
          delayTime: params.stopDelayTime4,
        });
      }
      params.downtimePolicyList = downtimePolicyList;
      delete params.stopDeviceId1;
      delete params.stopPointId1;
      delete params.stopDelayTime1;
      delete params.stopDeviceId2;
      delete params.stopPointId2;
      delete params.stopDelayTime2;
      delete params.stopDeviceId3;
      delete params.stopPointId3;
      delete params.stopDelayTime3;
      delete params.stopDeviceId4;
      delete params.stopPointId4;
      delete params.stopDelayTime4;
    }
    if (params.warnConfigType == '1' || params.warnConfigType == '2') {
      if (values.triggerRule == '0') {
        if (timeTriggerValue.value === null) {
          message.warn('时间触发不能为空!');
          return;
        }
      }
      if (values.triggerRule == '1') {
        if (countTriggerValue.value === null) {
          message.warn('次数触发不能为空!');
          return;
        }
      }
    }
    if (params.warnConfigType == '1' || params.warnConfigType == '2') {
      for (let item of dataSource.value) {
        if (item.pointName == '' || item.pointName == undefined) {
          item.errorFlag1 = true;
          // return false;
        }
        if (!item.compareRule) {
          item.errorFlag2 = true;
          // return false;
        }
        if (item.compareType == '' || item.compareType == undefined) {
          item.errorFlag3 = true;
          // return false;
        }
        if (item.compareValue == '' || item.compareValue == undefined) {
          item.errorFlag4 = true;
          // return false;
        }
        if (item.errorFlag1 || item.errorFlag2 || item.errorFlag3 || item.errorFlag4) {
          return false;
        }
      }
    }

    for (let item of dataSourceNotice.value) {
      if (!item.noticeRoleId && !item.noticeUserId) {
        item.errorFlagNotice1 = true;
        // return false;
      }
      if (!item.warnNotice) {
        item.errorFlagNotice2 = true;
        // return false;
      }
      if (item.errorFlagNotice1 || item.errorFlagNotice2) {
        return false;
      }
    }
    dataSourceNotice.value.forEach((item) => {
      console.log('dataSourceNotice item', item);
      item.noticeRoleId = item.noticeRoleId ? item.noticeRoleId.join(',') : null;
      item.noticeUserId = item.noticeUserId ? item.noticeUserId.join(',') : null;
      delete item.errorFlagNotice1;
      delete item.errorFlagNotice2;
    });
    params.warnNoticeList = dataSourceNotice.value;
    // 报警升级-开启
    if (params.warnUpgradeEnableFlag == '0') {
      for (let item of dataSourceUpgrade.value) {
        console.log('dataSourceUpgrade item', item);
        if (!item.duration) {
          item.errorFlagUpgrade1 = true;
          // return false;
        }
        if (!item.noticeRoleId && !item.noticeUserId) {
          item.errorFlagUpgrade2 = true;
          // return false;
        }
        if (!item.warnNotice) {
          item.errorFlagUpgrade3 = true;
          // return false;
        }
        if (item.errorFlagUpgrade1 || item.errorFlagUpgrade2 || item.errorFlagUpgrade3) {
          return false;
        }
      }
      dataSourceUpgrade.value.forEach((item) => {
        item.noticeRoleId = item.noticeRoleId ? item.noticeRoleId.join(',') : null;
        item.noticeUserId = item.noticeUserId ? item.noticeUserId.join(',') : null;
        delete item.errorFlagUpgrade1;
        delete item.errorFlagUpgrade2;
        delete item.errorFlagUpgrade3;
      });
      params.warnUpgradeList = dataSourceUpgrade.value;
    }
    // 触发规则
    if (params.triggerRule == '0') {
      params.triggerValue = timeTriggerValue.value;
    }
    if (params.triggerRule == '1') {
      params.triggerValue = countTriggerValue.value;
    }
    params.convergenceCycle = convergenceCycle.value;
    params.convergenceFrequency = convergenceFrequency.value;
    //相关指标
    params.relatedPointId = relatedPointId.value;
    if (warnId.value) {
      params.id = warnId.value;
    }
    // 如果是均值报警-4
    if (params.warnConfigType == '4') {
      if (!compareValue2.value && !compareValue3.value) {
        message.warn('报警阈值高于、低于两个数至少一个不为空!');
        return;
      }
    }
    params.compareValue2 = compareValue2.value;
    params.compareValue3 = compareValue3.value;

    // params.daqPointParamSaveDTOList = dataSource.value;
    params.isPoint = isPoint.value ? '1' : '0';
    params.relatedPointId = relatedPointId.value;
    // 报警规则
    if (params.warnConfigType == '1' || params.warnConfigType == '2') {
      params.warnConfigRuleList = dataSource.value;
    }
    // 报警规则
    if (params.warnConfigType == '3' || params.warnConfigType == '4') {
      params.attributeId = attributeId.value;
    }
    delete params.table;
    console.log('params', params);
    setDrawerProps({ confirmLoading: true });
    if (params.id) {
      await saveEdit(params);
    } else {
      await saveAdd(params);
    }
    // closeDrawer();
    handleClose();
    emit('success');
  }
  // 这个方法执行需要openModal传入第二个参数
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    console.log('useModalInner data', data);
    await resetFields();
    warnId.value = undefined;
    setDrawerProps({ confirmLoading: false, showFooter: data?.showFooter });
    if (!data?.showFooter) {
      getTitle.value = '查看';
    } else if (data?.isUpdate) {
      getTitle.value = '编辑';
    } else {
      getTitle.value = '新增';
    }

    await resetSchema(schemas);
    await resetFields();
    isUpdate.value = !!data?.isUpdate;
    getSoundOptions();

    if (unref(isUpdate)) {
      // 获取详情
      getDetail({ id: data.record.id }).then((res) => {
        console.log('getDetail', res);
        if (res.compareValue2) {
          res.compareValue2 = Number(res.compareValue2);
        }
        if (res.compareValue3) {
          res.compareValue3 = Number(res.compareValue3);
        }
        if (res.vocConcentrationRemind) {
          res.vocConcentrationRemind = JSON.stringify(res.vocConcentrationRemind);
        }
        // 相关指标
        if (res.relatedPointId) {
          relatedPointId.value = res.relatedPointId;
        } else {
          relatedPointId.value = '';
        }
        // 根据所属机构获取设备列表
        let orgcodeBak = res.sysOrgCode;
        let params = {};
        params.orgCode = orgcodeBak.substring(0, 6);
        params.pageSize = 9999;
        params.pageNo = 1;
        getDeviceList(params).then((res) => {
          console.log('res', res);
          deviceOptions.value = [];
          if (res.records && res.records.length > 0) {
            res.records.map((item) => {
              deviceOptions.value.push({
                label: item.name,
                value: item.id + '',
              });
            });
          }

          updateSchema({
            field: 'deviceId',
            componentProps: () => {
              return {
                options: deviceOptions.value,
                mode: 'multiple',
                maxTagCount: 2,
                maxTagTextLength: 4,
              };
            },
          });
          updateSchema({
            field: 'stopDeviceId1',
            label: '停机设备1',
            labelWidth: 120,
            component: 'Select',
            componentProps: ({ formActionType, formModel }) => {
              return {
                options: deviceOptions.value,
                placeholder: '请选择',
                onChange: (e: any) => {
                  console.log('stopDeviceId1 e-----', e);
                  formModel.stopPointId1 = undefined;
                  if (e) {
                    // 根据停机设备id获取停机属性
                    let params = {};
                    params.deviceIds = e;
                    params.pageSize = 9999;
                    params.pageNo = 1;
                    getDevicePointList(params).then((res) => {
                      console.log('getDevicePointList', res);
                      pointOptions1.value = [];
                      if (res.records && res.records.length > 0) {
                        pointOptions1.value = res.records.map((item) => {
                          return {
                            label: item.pointName,
                            value: item.pointId,
                          };
                        });
                        const { updateSchema } = formActionType;
                        updateSchema({
                          field: 'stopPointId1',
                          componentProps: () => {
                            return {
                              options: pointOptions1.value,
                            };
                          },
                        });
                      }
                    });
                  }
                },
              };
            },
            colProps: {
              span: 9,
            },
          });
          updateSchema({
            field: 'stopDeviceId2',
            label: '停机设备2',
            labelWidth: 120,
            component: 'Select',
            componentProps: ({ formActionType, formModel }) => {
              return {
                options: deviceOptions.value,
                placeholder: '请选择',
                onChange: (e: any) => {
                  console.log('stopDeviceId2 e-----', e);
                  formModel.stopPointId2 = undefined;
                  if (e) {
                    // 根据停机设备id获取停机属性
                    let params = {};
                    params.deviceIds = e;
                    params.pageSize = 9999;
                    params.pageNo = 1;
                    getDevicePointList(params).then((res) => {
                      console.log('getDevicePointList', res);
                      pointOptions2.value = [];
                      if (res.records && res.records.length > 0) {
                        pointOptions2.value = res.records.map((item) => {
                          return {
                            label: item.pointName,
                            value: item.pointId,
                          };
                        });
                        const { updateSchema } = formActionType;
                        updateSchema({
                          field: 'stopPointId2',
                          componentProps: () => {
                            return {
                              options: pointOptions2.value,
                            };
                          },
                        });
                      }
                    });
                  }
                },
              };
            },
            colProps: {
              span: 9,
            },
          });
          updateSchema({
            field: 'stopDeviceId3',
            label: '停机设备3',
            labelWidth: 120,
            component: 'Select',
            componentProps: ({ formActionType, formModel }) => {
              return {
                options: deviceOptions.value,
                placeholder: '请选择',
                onChange: (e: any) => {
                  console.log('stopDeviceId3 e-----', e);
                  formModel.stopPointId3 = undefined;
                  if (e) {
                    // 根据停机设备id获取停机属性
                    let params = {};
                    params.deviceIds = e;
                    params.pageSize = 9999;
                    params.pageNo = 1;
                    getDevicePointList(params).then((res) => {
                      console.log('getDevicePointList', res);
                      pointOptions3.value = [];
                      if (res.records && res.records.length > 0) {
                        pointOptions3.value = res.records.map((item) => {
                          return {
                            label: item.pointName,
                            value: item.pointId,
                          };
                        });
                        const { updateSchema } = formActionType;
                        updateSchema({
                          field: 'stopPointId3',
                          componentProps: () => {
                            return {
                              options: pointOptions3.value,
                            };
                          },
                        });
                      }
                    });
                  }
                },
              };
            },
            colProps: {
              span: 9,
            },
          });
          updateSchema({
            field: 'stopDeviceId4',
            label: '停机设备4',
            labelWidth: 120,
            component: 'Select',
            componentProps: ({ formActionType, formModel }) => {
              return {
                options: deviceOptions.value,
                placeholder: '请选择',
                onChange: (e: any) => {
                  console.log('stopDeviceId4 e-----', e);
                  formModel.stopPointId4 = undefined;
                  if (e) {
                    // 根据停机设备id获取停机属性
                    let params = {};
                    params.deviceIds = e;
                    params.pageSize = 9999;
                    params.pageNo = 1;
                    getDevicePointList(params).then((res) => {
                      console.log('getDevicePointList', res);
                      pointOptions4.value = [];
                      if (res.records && res.records.length > 0) {
                        pointOptions4.value = res.records.map((item) => {
                          return {
                            label: item.pointName,
                            value: item.pointId,
                          };
                        });
                        const { updateSchema } = formActionType;
                        updateSchema({
                          field: 'stopPointId4',
                          componentProps: () => {
                            return {
                              options: pointOptions4.value,
                            };
                          },
                        });
                      }
                    });
                  }
                },
              };
            },
            colProps: {
              span: 9,
            },
          });
        });
        orgOptions.value.forEach((item) => {
          if (res.sysOrgCode.length == 6) {
            if (item.orgCode == res.sysOrgCode) {
              getUserList(item.id);
            }
          } else {
            if (item.children && item.children.length > 0) {
              item.children.forEach((item1) => {
                if (item1.orgCode == res.sysOrgCode) {
                  getUserList(item1.id);
                }
              });
            } else {
              if (item.orgCode == res.sysOrgCode) {
                getUserList(item.id);
              }
            }
          }
        });
        // voc报警
        if (res.warnConfigType == '5') {
          if (res.downtimePolicyList && res.downtimePolicyList.length > 0) {
            res.downtimePolicyList.forEach((item) => {
              if (item.sort == 1) {
                // 根据停机设备id获取停机属性
                let params = {};
                params.deviceIds = item.deviceId;
                params.pageSize = 9999;
                params.pageNo = 1;
                getDevicePointList(params).then((res) => {
                  console.log('getDevicePointList', res);
                  pointOptions1.value = [];
                  if (res.records && res.records.length > 0) {
                    pointOptions1.value = res.records.map((item) => {
                      return {
                        label: item.pointName,
                        value: item.pointId,
                      };
                    });
                    updateSchema({
                      field: 'stopPointId1',
                      componentProps: () => {
                        return {
                          options: pointOptions1.value,
                        };
                      },
                    });
                  }
                });
                setFieldsValue({
                  stopDeviceId1: item.deviceId,
                  stopPointId1: Number(item.attributeId),
                  stopDelayTime1: Number(item.delayTime),
                });
              }
              if (item.sort == 2) {
                // 获取对应设备的点位列表
                let params = {};
                params.deviceIds = item.deviceId;
                params.pageSize = 9999;
                params.pageNo = 1;
                getDevicePointList(params).then((res) => {
                  console.log('getDevicePointList', res);
                  pointOptions2.value = [];
                  if (res.records && res.records.length > 0) {
                    pointOptions2.value = res.records.map((item) => {
                      return {
                        label: item.pointName,
                        value: item.pointId,
                      };
                    });
                    updateSchema({
                      field: 'stopPointId2',
                      componentProps: () => {
                        return {
                          options: pointOptions2.value,
                        };
                      },
                    });
                  }
                });
                setFieldsValue({
                  stopDeviceId2: item.deviceId,
                  stopPointId2: Number(item.attributeId),
                  stopDelayTime2: Number(item.delayTime),
                });
              }
              if (item.sort == 3) {
                // 获取对应设备的点位列表
                let params = {};
                params.deviceIds = item.deviceId;
                params.pageSize = 9999;
                params.pageNo = 1;
                getDevicePointList(params).then((res) => {
                  console.log('getDevicePointList', res);
                  pointOptions3.value = [];
                  if (res.records && res.records.length > 0) {
                    pointOptions3.value = res.records.map((item) => {
                      return {
                        label: item.pointName,
                        value: item.pointId,
                      };
                    });
                    updateSchema({
                      field: 'stopPointId3',
                      componentProps: () => {
                        return {
                          options: pointOptions3.value,
                        };
                      },
                    });
                  }
                });
                setFieldsValue({
                  stopDeviceId3: item.deviceId,
                  stopPointId3: Number(item.attributeId),
                  stopDelayTime3: Number(item.delayTime),
                });
              }
              if (item.sort == 4) {
                // 获取对应设备的点位列表
                let params = {};
                params.deviceIds = item.deviceId;
                params.pageSize = 9999;
                params.pageNo = 1;
                getDevicePointList(params).then((res) => {
                  console.log('getDevicePointList', res);
                  pointOptions4.value = [];
                  if (res.records && res.records.length > 0) {
                    pointOptions4.value = res.records.map((item) => {
                      return {
                        label: item.pointName,
                        value: item.pointId,
                      };
                    });
                    updateSchema({
                      field: 'stopPointId4',
                      componentProps: () => {
                        return {
                          options: pointOptions4.value,
                        };
                      },
                    });
                  }
                });
                setFieldsValue({
                  stopDeviceId4: item.deviceId,
                  stopPointId4: Number(item.attributeId),
                  stopDelayTime4: Number(item.delayTime),
                });
              }
            });
          }
        }
        if (res.warnNoticeList && res.warnNoticeList.length > 0) {
          dataSourceNotice.value = res.warnNoticeList;
          dataSourceNotice.value.forEach((item) => {
            item.noticeRoleId = item.noticeRoleId ? item.noticeRoleId.split(',') : [];
            item.noticeUserId = item.noticeUserId ? item.noticeUserId.split(',') : [];
          });
        }
        if (res.warnUpgradeList && res.warnUpgradeList.length > 0) {
          dataSourceUpgrade.value = res.warnUpgradeList;
          dataSourceUpgrade.value.forEach((item) => {
            item.noticeRoleId = item.noticeRoleId ? item.noticeRoleId.split(',') : [];
            item.noticeUserId = item.noticeUserId ? item.noticeUserId.split(',') : [];
          });
        }
        if (res.warnConfigRuleList && res.warnConfigRuleList.length > 0) {
          dataSource.value = res.warnConfigRuleList;
        }

        // 触发规则
        if (res.triggerValue) {
          if (res.triggerRule == '0') {
            timeTriggerValue.value = res.triggerValue;
            countTriggerValue.value = null;
          }
          if (res.triggerRule == '1') {
            countTriggerValue.value = res.triggerValue;
            timeTriggerValue.value = null;
          }
        }
        convergenceCycle.value = res.convergenceCycle;
        convergenceFrequency.value = res.convergenceFrequency;
        if (res.warnConfigType == '4' || res.warnConfigType == '6') {
          compareValue2.value = res.compareValue2;
          compareValue3.value = res.compareValue3;
        }
        // 报警规则
        if (res.warnConfigType == '3' || res.warnConfigType == '4') {
          attributeId.value = res.attributeId;
        }
        warnId.value = data.record.id;
        curRecord.value = res;
        res.enableFlag = res.enableFlag + '';
        res.isPoint = res.isPoint + '';
        // 表单赋值
        setFieldsValue({
          ...res,
        });
      });
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });
  // 选择多个指标
  function selectregisterIndicatorOk(data) {
    console.log('selectregisterIndicatorOk', data);
    setFieldsValue({
      relatedPointName: '',
    });
    relatedPointId.value = '';
    if (data.length == 0) {
      return;
    }
    if (data.length > 0) {
      let indicatorName = '';
      indicatorName = data.map((item) => item.pointName).join(',');
      setFieldsValue({
        relatedPointName: indicatorName,
      });
      relatedPointId.value = data.map((item) => item.pointId).join(',');
    }
  }
  function selectAttributeOk(data, currentIndex, fieldName) {
    console.log('selectAttributeOk', data, currentIndex, fieldName);
    if (fieldName == 'pointName') {
      if (currentIndex || currentIndex == '0') {
        if (data[0].pointName) {
          dataSource.value[currentIndex].pointName = data[0].pointName;
          dataSource.value[currentIndex].pointTag = data[0].pointTag;
          dataSource.value[currentIndex].errorFlag1 = false;
        } else {
          dataSource.value[currentIndex].errorFlag1 = true;
        }
      }
    }
    if (fieldName == 'compareValue') {
      if (currentIndex || currentIndex == '0') {
        if (data[0].pointName) {
          console.log('compareValue data[0]', data[0]);
          dataSource.value[currentIndex].compareValue = data[0].deviceId + dANDaStr + data[0].pointTag;
          dataSource.value[currentIndex].compareValueName = data[0].pointName;
          dataSource.value[currentIndex].errorFlag4 = false;
        } else {
          dataSource.value[currentIndex].errorFlag4 = true;
        }
      }
    }
    if (fieldName == 'attributeName') {
      if (data[0].pointName) {
        setFieldsValue({
          attributeName: data[0].pointName,
        });
        // 属性名称对应的属性id
        attributeId.value = data[0].pointTag;
      }
    }
  }
  function selectCompareValueOk(data, currentIndex) {
    console.log('selectCompareValueOk', data, currentIndex);
    if (currentIndex || currentIndex == '0') {
      if (data[0].pointName) {
        dataSource.value[currentIndex].compareValue = data[0].pointName;
        dataSource.value[currentIndex].errorFlag4 = false;
      } else {
        dataSource.value[currentIndex].errorFlag4 = true;
      }
    }
  }
  // 选择属性
  function selectPoint(record, index, fieldName) {
    openAttributeModal(true, {
      deviceId: getFieldsValue().deviceId,
      orgCode: getFieldsValue().sysOrgCode,
      currentIndex: index,
      fieldName: fieldName,
    });
  }
  // 选择比较属性-数值 0
  function selectCompareValue(record) {
    if (record.compareValue) {
      record.errorFlag4 = false;
    } else {
      record.errorFlag4 = true;
    }
  }
  // 添加
  function ruleShowAdd() {
    dataSource.value.push({
      compareRule: undefined,
      pointName: '',
      compareType: '',
      compareValue: '',
      errorFlag1: false,
      errorFlag2: false,
      errorFlag3: false,
    });
  }
  function noticeShowAdd() {
    dataSourceNotice.value.push({
      noticeRoleId: undefined,
      noticeUserId: undefined,
      noticeType: undefined,
      errorFlagNotice1: false,
      errorFlagNotice2: false,
    });
  }
  function deleteItemNotice(index) {
    dataSourceNotice.value.splice(index, 1);
  }
  function upgradeShowAdd() {
    // level是根据index动态生成的
    let level = dataSourceUpgrade.value.length + 1;
    dataSourceUpgrade.value.push({
      level: `第${level}级`,
      duration: '',
      noticeRoleId: undefined,
      noticeUserId: undefined,
      noticeType: undefined,
    });
  }
  function deleteItemUpGrade(index) {
    dataSourceUpgrade.value.splice(index, 1);
  }
  function compareValue3Change(e) {
    console.log('compareValue3Change', e);
  }
  function changeCompareRule(record) {
    console.log('changeCompareRule');
    if (record.compareRule !== undefined) {
      record.errorFlag2 = false;
    }
  }
  function changeCompareType(record) {
    console.log('changeCompareType');
    record.compareValue = '';
    record.errorFlag4 = false;
    if (record.compareType !== '') {
      record.errorFlag3 = false;
    } else {
      record.errorFlag3 = true;
    }
  }
  function noticeTypeChange(record) {
    console.log('noticeTypeChange', record);
    if (record.warnNotice) {
      record.errorFlagNotice2 = false;
    } else {
      record.errorFlagNotice2 = true;
    }
  }
  function noticeRoleChange(record) {
    // dataSourceNotice.value[index].errorFlagNotice1 = false;
    if ((record.noticeRoleId && record.noticeRoleId.length > 0) || (record.noticeUserId && record.noticeUserId.length > 0)) {
      record.errorFlagNotice1 = false;
    } else {
      record.errorFlagNotice1 = true;
    }
  }
  function noticePersonChange(record) {
    console.log('noticePersonChange', record);
    if ((record.noticeRoleId && record.noticeRoleId.length > 0) || (record.noticeUserId && record.noticeUserId.length > 0)) {
      record.errorFlagNotice1 = false;
    } else {
      record.errorFlagNotice1 = true;
    }
  }
  function handleTriggerRuleChange(e) {
    console.log('handleTriggerRuleChange', e);
    if (e.target.value == '1') {
      timeTriggerValue.value = '';
    } else {
      countTriggerValue.value = '';
    }
  }
  function durationUpgradeChange(record) {
    console.log('durationUpgradeChange', record);
    if (record.duration) {
      record.errorFlagUpgrade1 = false;
    } else {
      record.errorFlagUpgrade1 = true;
    }
  }
  function noticeRoleUpgradeChange(record) {
    console.log('noticeRoleUpgradeChange', record);
    if ((record.noticeRoleId && record.noticeRoleId.length > 0) || (record.noticeUserId && record.noticeUserId.length > 0)) {
      record.errorFlagUpgrade2 = false;
    } else {
      record.errorFlagUpgrade2 = true;
    }
  }
  function noticePersonUpgradeChange(record) {
    console.log('noticePersonUpgradeChange', record);
    if ((record.noticeRoleId && record.noticeRoleId.length > 0) || (record.noticeUserId && record.noticeUserId.length > 0)) {
      record.errorFlagUpgrade2 = false;
    } else {
      record.errorFlagUpgrade2 = true;
    }
  }
  function noticeTypeUpgradeChange(record) {
    console.log('noticeTypeUpgradeChange', record);
    if (record.warnNotice) {
      record.errorFlagUpgrade3 = false;
    } else {
      record.errorFlagUpgrade3 = true;
    }
  }
  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
</script>

<style lang="less" scoped>
  :deep(.ant-input-suffix) {
    color: #999;
  }
  .attachment-btn {
    color: #1890ff;
    cursor: pointer;
  }
  .params-info {
    padding-left: 114px;
    //   padding-right: 96px;
    margin-left: 40px;
    table {
      width: 140%;
      border-top: 1px solid #e8e8e8;
      border-left: 1px solid #e8e8e8;
      th,
      td {
        border-bottom: 1px solid #e8e8e8;
        border-right: 1px solid #e8e8e8;
        padding: 8px 16px;
      }
      th {
        background-color: #ebeff4;
      }
    }
  }
  .red-require {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
  // :deep(.ant-radio-wrapper) {
  //   font-size: 12px;
  // }
  // :deep(.ant-radio-inner) {
  //   width: 12px;
  //   height: 12px;
  // }
  .select-multiple {
    width: 200px;
  }
</style>
