<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="1000" @ok="onSubmit" :title="modalTitle" @cancel="handleCancel">
      <BasicForm @register="registerForm">
        <template #checkGroups>
          <div v-for="(group, index) in checkGroups" :key="index" style="width: 100%; margin-bottom: 12px">
            <a-row>
              <a-col style="width: 113px; text-align: right; font-size: 13px; font-weight: bold; margin-top: 5px">检查分组{{ index + 1 }}</a-col>
              <a-col :span="17">
                <a-button v-if="modalTitle !== '查看' && index === checkGroups.length - 1" type="link" @click="addGroup">添加分组</a-button>
                <a-button v-if="modalTitle !== '查看' && index > 0" type="link" @click="removeGroup(index)">删除分组</a-button>
              </a-col>
            </a-row>
            <a-row style="margin-top: 6px">
              <a-col style="width: 120px; font-size: 13px; text-align: right; margin-top: 5px"><span class="red-require">*</span>检查范围：</a-col>
              <a-col :span="17">
                <a-select
                  v-model:value="group.orgCodeRange"
                  style="width: 420px"
                  :options="availableOrgOptions(index)"
                  mode="multiple"
                  :disabled="modalTitle === '查看'"
                  placeholder="请选择"
                  :max-tag-count="3"
                />
              </a-col>
            </a-row>
            <a-row style="margin-top: 6px">
              <a-col style="width: 120px; font-size: 13px; text-align: right; margin-top: 5px"><span class="red-require">*</span>检查人：</a-col>
              <a-col :span="17">
                <div style="width: 420px">
                  <JSelectUser v-model:value="group.checkPerson" />
                </div>
              </a-col>
            </a-row>
          </div>
        </template>
        <template v-if="modalTitle !== '查看' && checkType !== '8'" #add>
          <a-button style="margin-left: 80px" type="primary" @click="addCheckItem">+ 添加检查项目</a-button>
        </template>
        <template
          v-if="modalTitle !== '查看' && (checkType == '3' || checkType == '4' || checkType == '5' || checkType == '6' || checkType == '7')"
          #addReady
        >
          <a-button style="margin-left: 32px" type="primary" @click="showCheckLibraryModal">+ 从检查表库添加</a-button>
        </template>
        <template v-if="modalTitle !== '查看' && checkType == '8'" #addReady1>
          <a-button style="margin-left: 80px" type="primary" @click="showRiskLibraryModal">+ 自动添加</a-button>
        </template>
        <template #table1 v-if="checkType != '7' && checkType != '8'">
          <a-table
            style="width: 120%; margin-left: 40px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="modalTitle !== '查看' ? columns : columns1"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'contentStandard'"> <span class="red-require">*</span>检查内容及标准</template>
              <template v-if="column.key === 'score'"> <span class="red-require">*</span>分数</template>
            </template>
            <template v-if="modalTitle !== '查看'" #action="{ record, index }">
              <div>
                <a-button type="link" :disabled="index == dataSource.length - 1" @click="downItem(record, index)"><arrow-down-outlined /></a-button>
                <a-button type="link" :disabled="index == 0" @click="upItem(record, index)"><arrow-up-outlined /></a-button>
                <a-button type="link" @click="deleteItem(index)">删除</a-button>
              </div>
            </template>
            <template #contentStandard="{ record }">
              <a-textarea
                placeholder="请输入5000字以内"
                v-model:value="record.contentStandard"
                :rows="3"
                :maxlength="5000"
                :disabled="modalTitle === '查看'"
                @change="changecontentStandard(record)"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
              <div v-if="record.errorFlag1" style="color: red">请输入检查内容及标准</div>
            </template>
            <template #score="{ record }">
              <a-input-number
                :disabled="modalTitle === '查看'"
                :min="1"
                :max="100"
                placeholder="请输入"
                :precision="0"
                v-model:value="record.score"
                @change="changescore(record)"
              />
              <div v-if="record.errorFlag2" style="color: red">请输入分数</div>
            </template>
          </a-table>
        </template>
        <template #table2 v-if="checkType == '7'">
          <a-table
            style="width: 120%; margin-left: 40px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="modalTitle !== '查看' ? columns2 : columns3"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'contentStandard'"> <span class="red-require">*</span>违法行为描述</template>
              <template v-if="column.key === 'judgeSituation'"> <span class="red-require">*</span>判定情形</template>
              <template v-if="column.key === 'score'"> <span class="red-require">*</span>分数</template>
            </template>
            <template v-if="modalTitle !== '查看'" #action="{ record, index }">
              <div>
                <a-button type="link" :disabled="index == dataSource.length - 1" @click="downItem(record, index)"><arrow-down-outlined /></a-button>
                <a-button type="link" :disabled="index == 0" @click="upItem(record, index)"><arrow-up-outlined /></a-button>
                <a-button type="link" @click="deleteItem(index)">删除</a-button>
              </div>
            </template>
            <template #contentStandard="{ record }">
              <a-textarea
                placeholder="请输入5000字以内"
                v-model:value="record.contentStandard"
                :rows="3"
                :maxlength="5000"
                :disabled="modalTitle === '查看'"
                @change="changecontentStandard(record)"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
              <div v-if="record.errorFlag1" style="color: red">请输入违法行为描述</div>
            </template>
            <template #judgeSituation="{ record }">
              <a-textarea
                placeholder="请输入5000字以内"
                v-model:value="record.judgeSituation"
                :rows="3"
                :maxlength="5000"
                :disabled="modalTitle === '查看'"
                @change="changejudgeSituation(record)"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
              <div v-if="record.errorFlag3" style="color: red">请输入判定情形</div>
            </template>
            <template #score="{ record }">
              <a-input-number
                :disabled="modalTitle === '查看'"
                :min="1"
                :max="100"
                placeholder="请输入"
                :precision="0"
                v-model:value="record.score"
                @change="changescore(record)"
              />
              <div v-if="record.errorFlag2" style="color: red">请输入分数</div>
            </template>
          </a-table>
        </template>
        <template #table3 v-if="checkType == '8'">
          <a-table
            style="width: 120%; margin-left: 40px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="modalTitle !== '查看' ? columns4 : columns5"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template v-if="modalTitle !== '查看'" #action="{ record, index }">
              <div>
                <a-button type="link" :disabled="index == dataSource.length - 1" @click="downItem(record, index)"><arrow-down-outlined /></a-button>
                <a-button type="link" :disabled="index == 0" @click="upItem(record, index)"><arrow-up-outlined /></a-button>
                <a-button type="link" @click="deleteItem(index)">删除</a-button>
              </div>
            </template>
            <template #score="{ record }">
              <a-input-number
                style="width: 85%"
                :disabled="modalTitle === '查看'"
                :min="1"
                :max="100"
                placeholder="请输入"
                :precision="0"
                v-model:value="record.score"
                @change="changescore(record)"
              />
              <div v-if="record.errorFlag2" style="color: red">请输入分数</div>
            </template>
          </a-table>
        </template>
        <template #reviewCase v-if="modalTitle == '查看'">
          <div class="info-content">
            <div class="item">
              <div class="item-title">审批结果：</div>
              <div class="item-content">
                <span v-if="detailsData.planStatus == '1'">审批通过</span>
                <span v-if="detailsData.planStatus == '0'">待审批</span>
                <span v-if="detailsData.planStatus == '2'">审批退回</span>
              </div>
            </div>
            <div class="item">
              <div class="item-title">审批人：</div>
              <div class="item-content">
                {{ detailsData.approvePeopleName }}
              </div>
            </div>
            <div class="item">
              <div class="item-title">审批时间：</div>
              <div class="item-content">
                {{ detailsData.approveTime }}
              </div>
            </div>
          </div>
        </template>
      </BasicForm>
    </BasicModal>
    <CheckLibraryModal @register="registerCheckLibraryModal" @select="selectCheckLibraryOk" />
    <RiskLibraryModal @register="registerRiskLibraryModal" @select="selectRiskLibraryOk" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, unref, watch } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { JSelectUser } from '/@/components/Form';
  import { saveOrUpdate, getSpecialCheckItemList, getRiskLibraryListByIds } from './task.api';
  import { defHttp } from '/@/utils/http/axios';
  import { useUserStore } from '/@/store/modules/user';
  import CheckLibraryModal from './CheckLibraryModal.vue';
  import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { initDictOptions } from '/@/utils/dict';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import RiskModalInfo from '/@/views/risk/component/riskModalInfo.vue';
  import dayjs from 'dayjs';
  import RiskLibraryModal from './RiskLibraryModal.vue';
  const { createConfirm } = useMessage();
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref<Boolean>(true);
  const showFooter = ref<Boolean>(true);
  const modalTitle = ref('查看');
  const orgOptions: any = ref([]);
  const checkGroups: any = ref([{ orgCodeRange: [], checkPerson: [] }]);
  const dataSource: any = ref([]);
  const detailsData: any = ref({});
  const checkTypeOptions: any = ref([]);
  const personOptions: any = ref([]);
  const rgLcList = ref([]);
  const checkType = ref('');
  const startDate = ref('');
  const endDate = ref('');
  const checkedAll = ref(false);
  const columns: any = [
    {
      title: '序号',
      align: 'center',
      dataIndex: 'idx',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '检查内容及标准',
      align: 'center',
      key: 'contentStandard',
      dataIndex: 'contentStandard',
      slots: { customRender: 'contentStandard' },
    },

    {
      title: '分数',
      align: 'center',
      dataIndex: 'score',
      key: 'score',
      slots: { customRender: 'score' },
    },
    {
      title: '操作',
      width: 180,
      align: 'center',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  ];
  const columns1: any = [
    {
      title: '序号',
      dataIndex: 'idx',
      align: 'center',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '检查内容及标准',
      align: 'center',
      key: 'contentStandard',
      dataIndex: 'contentStandard',
      slots: { customRender: 'contentStandard' },
    },
    {
      title: '分数',
      align: 'center',
      dataIndex: 'score',
      key: 'score',
      slots: { customRender: 'score' },
    },
  ];
  const columns2: any = [
    {
      title: '序号',
      align: 'center',
      dataIndex: 'idx',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '违法行为描述',
      align: 'center',
      key: 'contentStandard',
      dataIndex: 'contentStandard',
      slots: { customRender: 'contentStandard' },
    },
    {
      title: '判定情形',
      align: 'center',
      key: 'judgeSituation',
      dataIndex: 'judgeSituation',
      slots: { customRender: 'judgeSituation' },
    },
    {
      title: '分数',
      align: 'center',
      key: 'score',
      dataIndex: 'score',
      slots: { customRender: 'score' },
    },
    {
      title: '操作',
      width: 180,
      align: 'center',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  ];
  const columns3: any = [
    {
      title: '序号',
      align: 'center',
      width: 80,
      dataIndex: 'idx',
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '违法行为描述',
      align: 'center',
      key: 'contentStandard',
      dataIndex: 'contentStandard',
      slots: { customRender: 'contentStandard' },
    },
    {
      title: '判定情形',
      align: 'center',
      key: 'judgeSituation',
      dataIndex: 'judgeSituation',
      slots: { customRender: 'judgeSituation' },
    },
    {
      title: '分数',
      align: 'center',
      key: 'score',
      dataIndex: 'score',
      slots: { customRender: 'score' },
    },
  ];
  const columns4: any = [
    {
      title: '所属单位',
      ellipsis: true,
      dataIndex: 'orgName',
      width: '100px',
      align: 'center',
    },
    {
      title: '所属车间',
      ellipsis: true,
      dataIndex: 'departName',
      width: '100px',
      align: 'center',
    },
    {
      title: '辨识单元',
      dataIndex: 'recogUnit',
      width: '90px',
      align: 'center',
    },
    {
      title: '风险部位',
      dataIndex: 'pointName',
      width: '100px',
      align: 'center',
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: '80px',
      align: 'center',
      customRender: ({ record }) => {
        // 1重大风险 2较大风险 3一般风险 4低风险
        if (record.riskLevel == '1') {
          return '重大风险';
        } else if (record.riskLevel == '2') {
          return '较大风险';
        } else if (record.riskLevel == '3') {
          return '一般风险';
        } else if (record.riskLevel == '4') {
          return '低风险';
        }
        return '';
      },
    },
    {
      title: '风险失控表现',
      dataIndex: 'riskFactor',
      width: '120px',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '分数',
      align: 'center',
      key: 'score',
      width: '80px',
      dataIndex: 'score',
      slots: { customRender: 'score' },
    },
    {
      title: '操作',
      width: 170,
      fixed: 'right',
      align: 'center',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  ];
  const columns5: any = [
    {
      title: '所属单位',
      ellipsis: true,
      dataIndex: 'orgName',
      width: '100px',
      align: 'center',
    },
    {
      title: '所属车间',
      ellipsis: true,
      dataIndex: 'departName',
      width: '100px',
      align: 'center',
    },
    {
      title: '辨识单元',
      dataIndex: 'recogUnit',
      width: '90px',
      align: 'center',
    },
    {
      title: '风险部位',
      dataIndex: 'pointName',
      width: '100px',
      align: 'center',
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: '80px',
      align: 'center',
      customRender: ({ record }) => {
        // 1重大风险 2较大风险 3一般风险 4低风险
        if (record.riskLevel == '1') {
          return '重大风险';
        } else if (record.riskLevel == '2') {
          return '较大风险';
        } else if (record.riskLevel == '3') {
          return '一般风险';
        } else if (record.riskLevel == '4') {
          return '低风险';
        }
        return '';
      },
    },
    {
      title: '风险失控表现',
      dataIndex: 'riskFactor',
      width: '120px',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '分数',
      align: 'center',
      key: 'score',
      width: '80px',
      dataIndex: 'score',
      slots: { customRender: 'score' },
    },
  ];
  const editType = ref('');
  async function getOrgList() {
    await getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
    console.log('options', orgOptions.value);
  }
  getOrgList();
  initDictConfig();
  // 初始化字典
  async function initDictConfig() {
    checkTypeOptions.value = await initDictOptions('special_check_type');
  }

  // 注册表单
  const [registerForm, { validate, setFieldsValue, resetFields, setProps, getFieldsValue }] = useForm({
    schemas: [
      {
        label: 'id',
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
        label: '检查类型',
        field: 'checkType',
        component: 'Select',
        required: true,
        componentProps: () => {
          return {
            options: checkTypeOptions.value,
            onChange: (e: any) => {
              if (e) {
                checkType.value = e;
                dataSource.value = [];
              }
            },
          };
        },
        colProps: {
          span: 20,
        },
      },
      {
        field: 'taskName',
        label: '任务名称',
        component: 'Input',
        rules: [{ required: true, message: '任务名称不可为空！' }],
        componentProps: {
          maxlength: 50,
        },
        colProps: {
          span: 20,
        },
      },
      {
        label: '',
        field: 'checkGroups',
        component: 'Input',
        slot: 'checkGroups',
        colProps: {
          span: 22,
        },
      },
      {
        label: '任务时间',
        field: 'taskTime',
        required: true,
        component: 'RangePicker',
        componentProps: {
          valueFormat: 'YYYY-MM-DD',
          // 开始时间大于等于今天
          disabledDate: (current: any) => {
            return current && current < dayjs().startOf('day');
          },
          onChange: (e: any) => {
            startDate.value = e[0];
            endDate.value = e[1];
          },
          style: {
            width: '50%',
          },
        },
        colProps: {
          span: 20,
        },
      },

      {
        field: 'remark',
        label: ' 备注',
        component: 'Input',
        componentProps: {
          maxlength: 150,
        },
        colProps: {
          span: 20,
        },
      },
      {
        field: 'divider-basic1',
        component: 'Divider',
        label: '检查项目',
      },
      {
        field: 'add1',
        component: 'Input',
        label: '',
        colProps: {
          span: 5,
        },
        slot: 'add',
        ifShow: ({ values }) => {
          if (values.checkType != '8') {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        field: 'addReady',
        component: 'Input',
        label: '',
        colProps: {
          span: 5,
        },
        slot: 'addReady',
        ifShow: ({ values }) => {
          if (values.checkType != '8') {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        field: 'addReady1',
        component: 'Input',
        label: '',
        colProps: {
          span: 5,
        },
        slot: 'addReady1',
        ifShow: ({ values }) => {
          if (values.checkType == '8') {
            return true;
          } else {
            return false;
          }
        },
      },

      {
        field: 'table1',
        component: 'Input',
        label: '',
        slot: 'table1',
        ifShow: ({ values }) => {
          if (values.checkType != '7' && values.checkType != '8') {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        field: 'table2',
        component: 'Input',
        label: '',
        slot: 'table2',
        ifShow: ({ values }) => {
          if (values.checkType == '7') {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        field: 'table3',
        component: 'Input',
        label: '',
        slot: 'table3',
        ifShow: ({ values }) => {
          if (values.checkType == '8') {
            return true;
          } else {
            return false;
          }
        },
      },
    ],
    showActionButtonGroup: false,
    // labelCol: {
    //   xs: { span: 24 },
    //   sm: { span: 6 },
    // },
    // wrapperCol: {
    //   xs: { span: 24 },
    //   sm: { span: 18 },
    // },
    labelWidth: 120,
  });

  /**
   * 提交任务表单
   * 合并所有分组数据，并校验检查范围与检查人必填
   */
  /**
   * 提交任务表单
   * 合并所有分组数据，并校验每个分组“检查范围/检查人”必填
   */
  async function onSubmit(e: MouseEvent) {
    e?.stopPropagation();
    e?.preventDefault();
    const values = await validate();
    // const allOrgCodes: string[] = Array.from(new Set(checkGroups.value.flatMap((g: any) => g.orgCodeRange || [])));
    // const allPersons: string[] = checkGroups.value.flatMap((g: any) => {
    //   const p = g.checkPerson;
    //   if (Array.isArray(p)) return p;
    //   return p ? [p] : [];
    // });
    // 分组级必填校验
    for (let i = 0; i < checkGroups.value.length; i++) {
      const g = checkGroups.value[i];
      const persons = Array.isArray(g.checkPerson) ? g.checkPerson : g.checkPerson ? [g.checkPerson] : [];
      if (!g.orgCodeRange || g.orgCodeRange.length === 0) {
        createMessage.error(`请完善检查分组${i + 1}的检查范围`);
        return false;
      }
      if (persons.length === 0) {
        createMessage.error(`请完善检查分组${i + 1}的检查人`);
        return false;
      }
    }
    // if (allOrgCodes.length === 0) {
    //   createMessage.error('请至少选择一个检查范围');
    //   return false;
    // }
    // if (allPersons.length === 0) {
    //   createMessage.error('请至少选择一个检查人');
    //   return false;
    // }
    // values.orgCodeRange = allOrgCodes;
    // values.checkPerson = allPersons.join(',');

    //checkGroups.value中每个对象中的orgCodeRange参数变成逗号拼接的字符串
    let checkGroupsData = JSON.parse(JSON.stringify(checkGroups.value));
    checkGroupsData.map((g: any, index) => {
      g.orgCodeRange = g.orgCodeRange.join(',');
      g.idx = index + 1;
    });

    values.checkGroups = checkGroupsData;
    // 检查项不可为空
    if (dataSource.value.length == 0) {
      createMessage.error('检查项不可为空');
      return false;
    } else {
      // 检查项的id是否在dataSource.value中 有id属性 则删除id属性
      dataSource.value.map((item, index) => {
        item.idx = index + 1;
        if (item.id) {
          delete item.id;
        }
      });
    }
    if (checkType.value == '8') {
      for (let item of dataSource.value) {
        if (!item.score) {
          item.errorFlag2 = true;
        }
        if (item.errorFlag2) {
          return false;
        }
      }
    } else {
      for (let item of dataSource.value) {
        if (!item.contentStandard && checkType.value != '7') {
          item.errorFlag1 = true;
        }
        if (!item.score) {
          item.errorFlag2 = true;
        }
        if (!item.violationDescribe && checkType.value == '7') {
          item.errorFlag5 = true;
        }
        if (!item.judgeSituation && checkType.value == '7') {
          item.errorFlag3 = true;
        }
        if (item.errorFlag1 || item.errorFlag2 || item.errorFlag3 || item.errorFlag5) {
          return false;
        }
      }
    }
    console.log('dataSource.value', dataSource.value);
    values.itemList = dataSource.value;
    console.log('values', values);
    values.taskTimeStart = startDate.value;
    values.taskTimeEnd = endDate.value;
    setModalProps({ confirmLoading: true });
    if (unref(isUpdate)) {
      saveOrUpdate(values, isUpdate.value)
        .then(() => {
          closeModal();
          emit('success');
        })
        .finally(() =>
          setTimeout(() => {
            setModalProps({ confirmLoading: false });
          }, 100)
        );
    } else {
      saveOrUpdate(values, false)
        .then(() => {
          closeModal();
          emit('success');
        })
        .finally(() => {
          setTimeout(() => {
            setModalProps({ confirmLoading: false });
          }, 100);
        });
    }
  }
  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('useModalInner data', data);
    // 下次点击弹窗的时候清空表单
    await resetFields();
    dataSource.value = [];
    checkGroups.value = [{ orgCodeRange: [], checkPerson: [] }];
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    showFooter.value = !!data?.showFooter;
    editType.value = data.editType;
    modalTitle.value = data.title;
    if (unref(isUpdate)) {
      // 根据id获取详情
      await defHttp.get({ url: '/yh/skYhSpecialTask/queryById', params: { id: data.record.id } }).then(async (res) => {
        dataSource.value = res.itemList;
        detailsData.value = res;
        checkType.value = res.checkType;
      });

      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      detailsData.value.checkGroups.map((g: any) => {
        g.orgCodeRange = g.orgCodeRange.split(',');
      });
      checkGroups.value = detailsData.value.checkGroups;
      startDate.value = detailsData.value.taskTimeStart;
      endDate.value = detailsData.value.taskTimeEnd;
      // 任务时间
      setFieldsValue({
        taskTime: [dayjs(detailsData.value.taskTimeStart, 'YYYY-MM-DD'), dayjs(detailsData.value.taskTimeEnd, 'YYYY-MM-DD')],
      });
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });

  const [registerCheckLibraryModal, { openModal: openCheckLibraryModal }] = useModal();
  function selectCheckLibraryOk({ data, selectedRowKeys }) {
    console.log('selectedRowKeys', selectedRowKeys); // 是个数组，里面是id
    // 通过id获取数据
    getSpecialCheckItemList({ ids: selectedRowKeys.join(',') }).then((res) => {
      console.log('getSpecialCheckItemList res', res);
      dataSource.value = res;
    });
    // dataSource.value = data;
  }
  function showCheckLibraryModal() {
    if (!checkType.value) {
      createMessage.error('请先选择检查类型');
      return;
    }
    openCheckLibraryModal(true, {
      isUpdate: isUpdate.value,
      data: dataSource.value.length > 0 ? dataSource.value : [],
      checkType: checkType.value,
    });
  }
  const [registerRiskLibraryModal, { openModal: openRiskLibraryModal }] = useModal();
  /**
   * 打开风险库弹窗（按分组范围并集）
   */
  function showRiskLibraryModal() {
    const orgCodeRange: string[] = Array.from(new Set(checkGroups.value.flatMap((g: any) => g.orgCodeRange || [])));
    if (!orgCodeRange || orgCodeRange.length === 0) {
      createMessage.error('请先选择检查范围');
      return;
    }
    let selectedRowKeys: any[] = [];
    if (dataSource.value.length > 0) {
      dataSource.value.map((item) => {
        selectedRowKeys.push(item.id);
      });
    }
    console.log('selectedRowKeys', selectedRowKeys);
    openRiskLibraryModal(true, {
      isUpdate: isUpdate.value,
      // data: dataSource.value.length > 0 ? dataSource.value : [],
      orgCodeRange: orgCodeRange,
      selectedRowKeys: selectedRowKeys,
    });
  }
  function selectRiskLibraryOk({ selectedRowKeys }) {
    console.log('selectedRowKeys', selectedRowKeys); // 是个数组，里面是id
    // 通过id获取数据
    getRiskLibraryListByIds({ selections: selectedRowKeys.join(','), pageNo: 1, pageSize: 9999 }).then((res) => {
      console.log('getRiskLibraryListByIds res', res);
      dataSource.value = res.records;
    });
  }
  function deleteItem(index) {
    dataSource.value.splice(index, 1);
  }
  function addCheckItem() {
    dataSource.value.push({
      contentStandard: '',
      score: '',
      judgeSituation: '',
      errorFlag5: false,
      errorFlag1: false,
      errorFlag2: false,
      errorFlag3: false,
    });
  }
  function upItem(record, index) {
    let temp = dataSource.value[index - 1];
    dataSource.value[index - 1] = record;
    dataSource.value[index] = temp;
  }
  function downItem(record, index) {
    let temp = dataSource.value[index + 1];
    dataSource.value[index + 1] = record;
    dataSource.value[index] = temp;
  }
  function changejudgeSituation(record) {
    if (record.judgeSituation) {
      record.errorFlag3 = false;
    } else {
      record.errorFlag3 = true;
    }
  }
  function changecontentStandard(record) {
    if (record.contentStandard) {
      record.errorFlag1 = false;
    } else {
      record.errorFlag1 = true;
    }
  }
  function changescore(record) {
    if (record.score) {
      record.errorFlag2 = false;
    } else {
      record.errorFlag2 = true;
    }
  }
  function handleCancel() {
    closeModal();
    emit('success');
  }
  /**
   * 切换“全部”范围选择
   */
  function changeCheckedAll(e) {
    console.log('changeCheckedAll', e);
    if (e.target.checked) {
      checkGroups.value[0].orgCodeRange = orgOptions.value.map((item: any) => item.value);
      // 清空其他分组范围以避免重复
      if (checkGroups.value.length > 1) {
        for (let i = 1; i < checkGroups.value.length; i++) {
          checkGroups.value[i].orgCodeRange = [];
        }
      }
    } else {
      checkGroups.value[0].orgCodeRange = [];
    }
  }

  /**
   * 添加检查分组
   */
  function addGroup() {
    checkGroups.value.push({ orgCodeRange: [], checkPerson: [] });
  }

  /**
   * 删除检查分组（保留至少一个）
   */
  function removeGroup(index: number) {
    if (index === 0) return;
    checkGroups.value.splice(index, 1);
  }

  /**
   * 计算当前分组可选范围（全分组互斥，当前分组不禁用已选）
   */
  function availableOrgOptions(currentIndex: number) {
    const allSelected = new Set<string>();
    checkGroups.value.forEach((g: any) => {
      (g.orgCodeRange || []).forEach((c: string) => allSelected.add(c));
    });
    const currentSelected = new Set<string>(checkGroups.value[currentIndex]?.orgCodeRange || []);
    return orgOptions.value.map((opt: any) => ({
      ...opt,
      disabled: allSelected.has(opt.value) && !currentSelected.has(opt.value),
    }));
  }

  function arraysEqual(a: string[] = [], b: string[] = []) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * 规范化分组范围，移除重复项（优先保留前面的分组）
   */
  function normalizeGroupsOrgRanges() {
    const used = new Set<string>();
    checkGroups.value.forEach((g: any, idx: number) => {
      const list = Array.isArray(g.orgCodeRange) ? g.orgCodeRange : [];
      const filtered: string[] = [];
      list.forEach((c: string) => {
        if (!used.has(c)) {
          filtered.push(c);
          used.add(c);
        }
      });
      if (!arraysEqual(list, filtered)) {
        g.orgCodeRange = filtered;
      }
    });
  }

  watch(
    () => checkGroups.value.map((g: any) => g.orgCodeRange),
    () => {
      normalizeGroupsOrgRanges();
    },
    { deep: true, flush: 'post' }
  );
</script>

<style lang="less" scoped>
  .red-require {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
  .info-content {
    display: flex;
    margin-top: 20px;
    margin-left: 20px;
    .item {
      // width: 50%;
      display: flex;
      margin-bottom: 15px;
      margin-right: 20px;
      .item-title {
        width: 120px;
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.68);
        text-align: right;
      }
      .item-content {
        width: calc(100% - 120px);
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 1);
      }
    }
  }
</style>
