<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="1600" @ok="onSubmit" :title="modalTitle" @cancel="handleCancel">
      <BasicForm @register="registerForm">
        <template v-if="modalTitle !== '查看' && planType !== '1'" #add>
          <a-button style="margin-left: 82px" type="primary" @click="addCheckItem">+ 添加检查项目</a-button>
        </template>
        <template #table1 v-if="planType != '1'">
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
              <template v-if="column.key === 'rgLcId'"> <span class="red-require">*</span>区域位置（单元） </template>
              <template v-if="column.key === 'checkContent'"> <span class="red-require">*</span>检查内容 </template>
              <template v-if="column.key === 'checkMethod'"> <span class="red-require">*</span>排查方法 </template>
              <template v-if="column.key === 'pictureFlag'"> <span class="red-require">*</span>检查照片 </template>
            </template>
            <template v-if="modalTitle !== '查看'" #action="{ record, index }">
              <div>
                <a-button type="link" :disabled="index == dataSource.length - 1" @click="downItem(record, index)"><arrow-down-outlined /></a-button>
                <a-button type="link" :disabled="index == 0" @click="upItem(record, index)"><arrow-up-outlined /></a-button>
                <a-button type="link" @click="deleteItem(index)">删除</a-button>
              </div>
            </template>
            <template #rgLcId="{ record }">
              <a-select
                :disabled="modalTitle === '查看' || record.itemId"
                v-model:value="record.rgLcId"
                style="width: 120px"
                @change="changeItemType(record)"
                placeholder="请选择"
                @select="onSelect"
              >
                <a-select-option :value="item.value" :key="index" v-for="(item, index) in rgLcList">{{ item.label }}</a-select-option>
              </a-select>
              <div v-if="record.errorFlag1" style="color: red"> 区域位置（单元）</div>
            </template>

            <template #checkContent="{ record }">
              <a-textarea
                placeholder="请输入100字以内"
                v-model:value="record.checkContent"
                :rows="2"
                :maxlength="100"
                :disabled="modalTitle === '查看' || record.itemId"
                @change="changeCheckContent(record)"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
              <div v-if="record.errorFlag2" style="color: red">请输入检查内容</div>
            </template>
            <template #checkRequire="{ record }">
              <a-textarea
                :disabled="modalTitle === '查看' || record.itemId"
                placeholder="请输入100字以内"
                v-model:value="record.checkRequire"
                :rows="2"
                :maxlength="100"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillRecordPath }}</span> -->
            </template>
            <template #checkMethod="{ record }">
              <a-select
                :disabled="modalTitle === '查看' || record.itemId"
                v-model:value="record.checkMethod"
                style="width: 120px"
                placeholder="请选择"
                @change="changeCheckType(record)"
              >
                <a-select-option :value="item.value" :key="index" v-for="(item, index) in checkTypeOptions">{{ item.title }}</a-select-option>
              </a-select>
              <div v-if="record.errorFlag4" style="color: red">请选择排查方法</div>
            </template>
            <template #pictureFlag="{ record }">
              <a-select
                :disabled="modalTitle === '查看'"
                v-model:value="record.pictureFlag"
                style="width: 120px"
                placeholder="请选择"
                @change="changeCheckPicture(record)"
              >
                <a-select-option value="0">非必填</a-select-option>
                <a-select-option value="1">必填</a-select-option>
              </a-select>
              <div v-if="record.errorFlag3" style="color: red">请选择检查照片</div>
            </template>
          </a-table>
        </template>
        <template #table2 v-if="planType == '1'">
          <a-table
            style="width: 100%; margin-left: 40px"
            ref="table2"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns2"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'checkMethod'"> <span class="red-require">*</span>排查方法 </template>
              <template v-if="column.key === 'pictureFlag'"> <span class="red-require">*</span>检查照片 </template>
            </template>
            <template #checkMethod="{ record }">
              <a-select :disabled="modalTitle === '查看'" v-model:value="record.checkMethod" style="width: 100px" @change="changeCheckType(record)">
                <a-select-option :value="item.value" :key="index" v-for="(item, index) in checkTypeOptions">{{ item.title }}</a-select-option>
              </a-select>
              <div v-if="record.errorFlag4" style="color: red">请选择排查方法</div>
            </template>
            <template #pictureFlag="{ record }">
              <a-select
                :disabled="modalTitle === '查看'"
                v-model:value="record.pictureFlag"
                style="width: 100px"
                @change="changeCheckPicture(record)"
              >
                <a-select-option value="0">非必填</a-select-option>
                <a-select-option value="1">必填</a-select-option>
              </a-select>
              <div v-if="record.errorFlag3" style="color: red">请选择检查照片</div>
            </template>
            <template #riskId="{ record }">
              <span style="cursor: pointer; color: #1890ff" @click="handleRiskId(record)">{{ record.riskId }}</span>
            </template>
          </a-table>
        </template>
        <template #noticeType>
          <div style="">
            <a-checkbox :disabled="true" v-model:checked="remindMessage">短信</a-checkbox>
          </div>
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
    <RiskModalInfo @register="registerRiskInfoModal" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdate, getUserList, getRgLcList } from './manage.api';
import { defHttp } from '/@/utils/http/axios';
import { useUserStore } from '/@/store/modules/user';
import CheckLibraryModal from './CheckLibraryModal.vue';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { initDictOptions } from '/@/utils/dict';
import { weekOptions, monthOptions } from '/@/views/task/publish/time.data';
import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
import { getRiskInfoById } from '../../checklist/check.api';
import RiskModalInfo from '/@/views/risk/component/riskModalInfo.vue';
const [registerRiskInfoModal, RiskInfoProps] = useModal();
const { createConfirm } = useMessage();
const { createMessage } = useMessage();
const userStore = useUserStore();
const userinfo: any = computed(() => userStore.getUserInfo);
const emit = defineEmits(['success', 'register']);
const isUpdate = ref<Boolean>(true);
const showFooter = ref<Boolean>(true);
const modalTitle = ref('查看');
const orgOptions: any = ref([]);
const departOptions: any = ref([]);
const dataSource: any = ref([]);
const itemTypeOptions: any = ref([]);
const remindMessage = ref(true);
const checkedPhone = ref(false);
const detailsData: any = ref({});
const checkTypeOptions: any = ref([]);
const planType = ref('');
const personOptions: any = ref([]);
const rgLcList = ref([]);
const columns: any = [
  {
    title: '序号',
    align: 'center',
    width: 80,
    customRender: ({ index }) => {
      return index + 1;
    },
  },
  { title: '区域位置（单元', align: 'center', key: 'rgLcId', dataIndex: 'rgLcId', slots: { customRender: 'rgLcId' } },
  {
    title: '检查内容',
    align: 'center',
    key: 'checkContent',
    dataIndex: 'checkContent',
    slots: { customRender: 'checkContent' },
  },
  { title: '检查要求', align: 'center', dataIndex: 'checkRequire', slots: { customRender: 'checkRequire' } },
  { title: '排查方法', align: 'center', key: 'checkMethod', dataIndex: 'checkMethod', slots: { customRender: 'checkMethod' } },
  {
    title: '检查照片',
    width: 150,
    align: 'center',
    key: 'pictureFlag',
    dataIndex: 'pictureFlag',
    slots: { customRender: 'pictureFlag' },
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
    align: 'center',
    width: 80,
    customRender: ({ index }) => {
      return index + 1;
    },
  },
  { title: '区域位置（单元', align: 'center', key: 'rgLcId', dataIndex: 'rgLcId', slots: { customRender: 'rgLcId' } },
  {
    title: '检查内容',
    align: 'center',
    key: 'checkContent',
    dataIndex: 'checkContent',
    slots: { customRender: 'checkContent' },
  },
  { title: '检查要求', align: 'center', dataIndex: 'checkRequire', slots: { customRender: 'checkRequire' } },
  { title: '排查方法', align: 'center', key: 'checkMethod', dataIndex: 'checkMethod', slots: { customRender: 'checkMethod' } },
  {
    title: '检查照片',
    width: 150,
    align: 'center',
    key: 'pictureFlag',
    dataIndex: 'pictureFlag',
    slots: { customRender: 'pictureFlag' },
  },
];
const columns2: any = [
  {
    title: '风险ID',
    width: 120,
    dataIndex: 'riskId',
    ellipsis: true,
    slots: { customRender: 'riskId' },
  },
  {
    title: '区域位置（单元）',
    width: 130,
    dataIndex: 'rgLcName',
    ellipsis: true,
  },
  {
    title: '风险名称',
    width: 120,
    dataIndex: 'riskName',
    ellipsis: true,
  },
  {
    title: '排查内容',
    dataIndex: 'checkContent',
    width: 120,
    ellipsis: true,
  },
  {
    title: '现有安全控制措施',
    children: [
      {
        title: '工程技术措施',
        dataIndex: 'enTechMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '管理措施',
        dataIndex: 'manageMsr',
        width: 100,
        ellipsis: true,
      },
      {
        title: '培训教育措施',
        dataIndex: 'trainMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '个体防护措施',
        dataIndex: 'selfDfeMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '应急处置措施',
        dataIndex: 'emgDpsMsr',
        width: 120,
        ellipsis: true,
      },
    ],
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 100,
    ellipsis: true,
  },
  { title: '排查方法', width: 120, align: 'center', key: 'checkMethod', dataIndex: 'checkMethod', slots: { customRender: 'checkMethod' } },
  {
    title: '检查照片',
    width: 130,
    align: 'center',
    key: 'pictureFlag',
    dataIndex: 'pictureFlag',
    slots: { customRender: 'pictureFlag' },
  },
];
const editType = ref('');
async function getOrgList() {
  await getOrgCodeList().then((res) => {
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
function initOrgCode() {
  let queryParam: any = {};
  if (userinfo.value.orgCode.length > 6) {
    queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
  } else if (userinfo.value.orgCode.length == 6) {
    queryParam.orgCode = userinfo.value.orgCode;
    queryParam.departCode = undefined;
  } else {
    queryParam.orgCode = undefined;
    queryParam.departCode = undefined;
  }
  if (queryParam.orgCode) {
    let params: any = {};
    params.orgCode = queryParam.orgCode;
    params.pageSize = 9999;
    params.pageNo = 1;
    getDepartmentList(params).then((res) => {
      if (res && res.length > 0) {
        departOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
      } else {
        departOptions.value = [];
      }
    });
  }
  return queryParam.orgCode;
}
// function initDeptCode() {
//   let queryParam = {};
//   if (userinfo.value.orgCode.length > 6) {
//     queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
//     queryParam.departCode = userinfo.value.orgCode;
//   } else if (userinfo.value.orgCode == 6) {
//     queryParam.orgCode = userinfo.value.orgCode;
//     queryParam.departCode = undefined;
//   } else {
//     queryParam.orgCode = undefined;
//     queryParam.departCode = undefined;
//   }
//   return queryParam.departCode;
// }
initDictConfig();
// 初始化字典
async function initDictConfig() {
  itemTypeOptions.value = await initDictOptions('check_sort');
  checkTypeOptions.value = await initDictOptions('ht_check_type'); //排查方法
}
const roleList: any = ref([]);

// 注册表单
const [registerForm, { validate, setFieldsValue, resetFields, setProps, updateSchema }] = useForm({
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
      label: '所属单位',
      field: 'org',
      component: 'Select',
      dynamicDisabled: ({ values }) => {
        if (values.planType == '1' || !showFooter.value) {
          return true;
        } else {
          return false;
        }
      },
      required: true,
      componentProps: ({ formModel, formActionType }) => {
        return {
          options: orgOptions,
          placeholder: '请选择',
          onChange: (e: any) => {
            departOptions.value = [];
            personOptions.value = [];
            formModel.depart = undefined;
            formModel.checkDutyPerson = undefined;
            formModel.executePerson = undefined;
            rgLcList.value = [];
            if (dataSource.value.length > 0) {
              dataSource.value.map((item: any) => {
                return (item.rgLcId = undefined);
              });
            }
            const { updateSchema } = formActionType;
            if (e) {
              let params: any = {};
              params.orgCode = e;
              params.pageSize = 9999;
              params.pageNo = 1;
              getDepartmentList(params).then((res) => {
                if (res && res.length > 0) {
                  departOptions.value = res.map((item) => {
                    return {
                      label: item.departName,
                      value: item.orgCode,
                    };
                  });
                  updateSchema({
                    field: 'depart',
                    componentProps: ({ formModel, formActionType }) => {
                      return {
                        options: departOptions,
                        placeholder: '请选择',
                        onChange: (e: any) => {
                          personOptions.value = [];
                          formModel.checkDutyPerson = undefined; //  reset city value
                          formModel.executePerson = undefined; //  reset city value
                          if (dataSource.value.length > 0) {
                            dataSource.value.map((item: any) => {
                              return (item.rgLcId = undefined);
                            });
                          }
                          let params: any = {};
                          let params1: any = {};
                          params.pageSize = 9999;
                          params.pageNo = 1;
                          if (e && formModel.planType !== '1') {
                            params.orgCode = e;
                          } else {
                            params.orgCode = formModel.org;
                          }
                          if (e) {
                            params1.orgCode = e;
                          } else {
                            params1.orgCode = formModel.org;
                          }
                          getUserList(params).then((res) => {
                            if (res) {
                              personOptions.value = res.map((item: any) => {
                                return {
                                  label: item.realname,
                                  value: item.id,
                                };
                              });
                              updateSchema({
                                field: 'checkDutyPerson',
                                componentProps: {
                                  options: personOptions.value,
                                  onChange: (e: any) => {
                                    console.log('checkDutyPerson multiple', e);
                                    // 最多不超过五个
                                    if (e && e.split(',').length > 5) {
                                      createMessage.error('最多选择五个责任人');
                                      e = e.split(',').slice(0, 5).join(',');
                                      setFieldsValue({ checkDutyPerson: e });
                                    }
                                  },
                                },
                              });
                              updateSchema({
                                field: 'executePerson',
                                componentProps: {
                                  options: personOptions.value,
                                  onChange: (e: any) => {
                                    console.log('executePerson multiple', e);
                                    // 最多不超过五个
                                    if (e && e.split(',').length > 5) {
                                      createMessage.error('最多选择五个执行人');
                                      e = e.split(',').slice(0, 5).join(',');
                                      setFieldsValue({ executePerson: e });
                                    }
                                  },
                                },
                              });
                            } else {
                              updateSchema({
                                field: 'checkDutyPerson',
                                componentProps: {
                                  options: [],
                                },
                              });
                              updateSchema({
                                field: 'executePerson',
                                componentProps: {
                                  options: [],
                                },
                              });
                            }
                          });

                          getRgLcList(params1).then((res) => {
                            if (res) {
                              rgLcList.value = res.map((item: any) => {
                                return {
                                  label: item.regionalLocation,
                                  value: item.id,
                                };
                              });
                            }
                          });
                        },
                      };
                    },
                  });
                } else {
                  updateSchema({
                    field: 'depart',
                    componentProps: ({ formModel, formActionType }) => {
                      return {
                        options: [],
                        placeholder: '请选择',
                        onChange: (e: any) => {
                          personOptions.value = [];
                          formModel.checkDutyPerson = undefined; //  reset city value
                          formModel.executePerson = undefined; //  reset city value
                          if (dataSource.value.length > 0) {
                            dataSource.value.map((item: any) => {
                              return (item.rgLcId = undefined);
                            });
                          }
                          let params: any = {};
                          let params1: any = {};
                          params.pageSize = 9999;
                          params.pageNo = 1;
                          if (e && formModel.planType !== '1') {
                            params.orgCode = e;
                          } else {
                            params.orgCode = formModel.org;
                          }
                          if (e) {
                            params1.orgCode = e;
                          } else {
                            params1.orgCode = formModel.org;
                          }
                          getUserList(params).then((res) => {
                            if (res) {
                              personOptions.value = res.map((item: any) => {
                                return {
                                  label: item.realname,
                                  value: item.id,
                                };
                              });
                              updateSchema({
                                field: 'checkDutyPerson',
                                componentProps: {
                                  options: personOptions.value,
                                  onChange: (e: any) => {
                                    console.log('checkDutyPerson multiple', e);
                                    // 最多不超过五个
                                    if (e && e.split(',').length > 5) {
                                      createMessage.error('最多选择五个责任人');
                                      e = e.split(',').slice(0, 5).join(',');
                                      setFieldsValue({ checkDutyPerson: e });
                                    }
                                  },
                                },
                              });
                              updateSchema({
                                field: 'executePerson',
                                componentProps: {
                                  options: personOptions.value,
                                  onChange: (e: any) => {
                                    console.log('executePerson multiple', e);
                                    // 最多不超过五个
                                    if (e && e.split(',').length > 5) {
                                      createMessage.error('最多选择五个执行人');
                                      e = e.split(',').slice(0, 5).join(',');
                                      setFieldsValue({ executePerson: e });
                                    }
                                  },
                                },
                              });
                            } else {
                              updateSchema({
                                field: 'checkDutyPerson',
                                componentProps: {
                                  options: [],
                                },
                              });
                              updateSchema({
                                field: 'executePerson',
                                componentProps: {
                                  options: [],
                                },
                              });
                            }
                          });

                          getRgLcList(params1).then((res) => {
                            if (res) {
                              rgLcList.value = res.map((item: any) => {
                                return {
                                  label: item.regionalLocation,
                                  value: item.id,
                                };
                              });
                            }
                          });
                        },
                      };
                    },
                  });
                }
              });
              // 请求责任人

              getUserList(params).then((res) => {
                if (res) {
                  personOptions.value = res.map((item: any) => {
                    return {
                      label: item.realname,
                      value: item.id,
                    };
                  });
                  updateSchema({
                    field: 'checkDutyPerson',
                    componentProps: {
                      options: personOptions.value,
                      onChange: (e: any) => {
                        console.log('checkDutyPerson multiple', e);
                        // 最多不超过五个
                        if (e && e.split(',').length > 5) {
                          createMessage.error('最多选择五个责任人');
                          e = e.split(',').slice(0, 5).join(',');
                          setFieldsValue({ checkDutyPerson: e });
                        }
                      },
                    },
                  });
                  updateSchema({
                    field: 'executePerson',
                    componentProps: {
                      options: personOptions.value,
                      onChange: (e: any) => {
                        console.log('executePerson multiple', e);
                        // 最多不超过五个
                        if (e && e.split(',').length > 5) {
                          createMessage.error('最多选择五个执行人');
                          e = e.split(',').slice(0, 5).join(',');
                          setFieldsValue({ executePerson: e });
                        }
                      },
                    },
                  });
                } else {
                  updateSchema({
                    field: 'checkDutyPerson',
                    componentProps: {
                      options: [],
                    },
                  });
                  updateSchema({
                    field: 'executePerson',
                    componentProps: {
                      options: [],
                    },
                  });
                }
              });
              let params1: any = {};
              params1.orgCode = e;
              getRgLcList(params1).then((res) => {
                if (res) {
                  rgLcList.value = res.map((item: any) => {
                    return {
                      label: item.regionalLocation,
                      value: item.id,
                    };
                  });
                }
              });
            } else {
              updateSchema({
                field: 'depart',
                componentProps: ({ formModel, formActionType }) => {
                  return {
                    options: departOptions,
                    placeholder: '请选择',
                    onChange: (e: any) => {
                      personOptions.value = [];
                      formModel.checkDutyPerson = undefined; //  reset city value
                      formModel.executePerson = undefined; //  reset city value
                      if (dataSource.value.length > 0) {
                        dataSource.value.map((item: any) => {
                          return (item.rgLcId = undefined);
                        });
                      }
                      let params: any = {};
                      let params1: any = {};
                      params.pageSize = 9999;
                      params.pageNo = 1;
                      if (e && formModel.planType !== '1') {
                        params.orgCode = e;
                      } else {
                        params.orgCode = formModel.org;
                      }
                      if (e) {
                        params1.orgCode = e;
                      } else {
                        params1.orgCode = formModel.org;
                      }
                      getUserList(params).then((res) => {
                        if (res) {
                          personOptions.value = res.map((item: any) => {
                            return {
                              label: item.realname,
                              value: item.id,
                            };
                          });
                          updateSchema({
                            field: 'checkDutyPerson',
                            componentProps: {
                              options: personOptions.value,
                              onChange: (e: any) => {
                                console.log('checkDutyPerson multiple', e);
                                // 最多不超过五个
                                if (e && e.split(',').length > 5) {
                                  createMessage.error('最多选择五个责任人');
                                  e = e.split(',').slice(0, 5).join(',');
                                  setFieldsValue({ checkDutyPerson: e });
                                }
                              },
                            },
                          });
                          updateSchema({
                            field: 'executePerson',
                            componentProps: {
                              options: personOptions.value,
                              onChange: (e: any) => {
                                console.log('executePerson multiple', e);
                                // 最多不超过五个
                                if (e && e.split(',').length > 5) {
                                  createMessage.error('最多选择五个执行人');
                                  e = e.split(',').slice(0, 5).join(',');
                                  setFieldsValue({ executePerson: e });
                                }
                              },
                            },
                          });
                        } else {
                          updateSchema({
                            field: 'checkDutyPerson',
                            componentProps: {
                              options: [],
                            },
                          });
                          updateSchema({
                            field: 'executePerson',
                            componentProps: {
                              options: [],
                            },
                          });
                        }
                      });

                      getRgLcList(params1).then((res) => {
                        if (res) {
                          rgLcList.value = res.map((item: any) => {
                            return {
                              label: item.regionalLocation,
                              value: item.id,
                            };
                          });
                        }
                      });
                    },
                  };
                },
              });
            }
          },
        };
      },
      colProps: {
        span: 8,
      },
    },
    {
      label: '所属车间',
      field: 'depart',
      component: 'Select',
      required: true,
      dynamicDisabled: ({ values }) => {
        if (values.planType == '1' || !showFooter.value) {
          return true;
        } else {
          return false;
        }
      },
      componentProps: ({ formModel, formActionType }) => {
        return {
          options: departOptions,
          placeholder: '请选择',
          onChange: (e: any) => {
            console.log('depart onChange', e, dataSource.value);
            personOptions.value = [];
            formModel.checkDutyPerson = undefined; //  reset city value
            formModel.executePerson = undefined; //  reset city value
            if (dataSource.value.length > 0) {
              dataSource.value.map((item: any) => {
                return (item.rgLcId = undefined);
              });
            }
            let params: any = {};
            let params1: any = {};
            params.pageSize = 9999;
            params.pageNo = 1;
            if (e && formModel.planType !== '1') {
              params.orgCode = e;
            } else {
              params.orgCode = formModel.org;
            }
            if (e) {
              params1.orgCode = e;
            } else {
              params1.orgCode = formModel.org;
            }
            getUserList(params).then((res) => {
              if (res) {
                personOptions.value = res.map((item: any) => {
                  return {
                    label: item.realname,
                    value: item.id,
                  };
                });
                updateSchema({
                  field: 'checkDutyPerson',
                  componentProps: {
                    options: personOptions.value,
                    onChange: (e: any) => {
                      console.log('checkDutyPerson multiple', e);
                      // 最多不超过五个
                      if (e && e.split(',').length > 5) {
                        createMessage.error('最多选择五个责任人');
                        e = e.split(',').slice(0, 5).join(',');
                        setFieldsValue({ checkDutyPerson: e });
                      }
                    },
                  },
                });
                updateSchema({
                  field: 'executePerson',
                  componentProps: {
                    options: personOptions.value,
                    onChange: (e: any) => {
                      console.log('executePerson multiple', e);
                      // 最多不超过五个
                      if (e && e.split(',').length > 5) {
                        createMessage.error('最多选择五个执行人');
                        e = e.split(',').slice(0, 5).join(',');
                        setFieldsValue({ executePerson: e });
                      }
                    },
                  },
                });
              } else {
                updateSchema({
                  field: 'checkDutyPerson',
                  componentProps: {
                    options: [],
                  },
                });
                updateSchema({
                  field: 'executePerson',
                  componentProps: {
                    options: [],
                  },
                });
              }
            });

            getRgLcList(params1).then((res) => {
              rgLcList.value = res.map((item: any) => {
                return {
                  label: item.regionalLocation,
                  value: item.id,
                };
              });
            });
          },
        };
      },
      colProps: {
        span: 8,
      },
    },
    {
      field: 'planName',
      label: '计划名称',
      component: 'Input',
      rules: [{ required: true, message: '计划名称不可为空！' }],
      componentProps: {
        maxlength: 50,
      },
      colProps: {
        span: 7,
      },
    },
    {
      label: '计划类型',
      field: 'planType',
      component: 'JDictSelectTag',
      show: false,
      componentProps: () => {
        return {
          dictCode: 'ht_plan_type',
          type: 'radio',
          placeholder: '请选择',
        };
      },
      colProps: {
        span: 8,
      },
    },
    {
      label: '巡检周期',
      field: 'checkCycle',
      required: true,
      component: 'JDictSelectTag',
      dynamicDisabled: ({ values }) => {
        if (values.planType == '1' || !showFooter.value) {
          return true;
        } else {
          return false;
        }
      },
      componentProps: {
        dictCode: 'sk_check_cycle',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: {
        span: 8,
      },
    },
    {
      label: '责任人',
      field: 'checkDutyPerson',
      component: 'JSelectMultiple',
      required: true,
      dynamicDisabled: ({ values }) => {
        if (values.planType == '1' || !showFooter.value) {
          return true;
        } else {
          return false;
        }
      },
      componentProps: () => {
        return {
          options: personOptions.value,
          placeholder: '请选择',
          mode: 'multiple',
          onChange: (e: any) => {
            console.log('checkDutyPerson multiple', e);
            // 最多不超过五个
            if (e && e.split(',').length > 5) {
              createMessage.error('最多选择五个责任人');
              e = e.split(',').slice(0, 5).join(',');
              setFieldsValue({ checkDutyPerson: e });
            }
          },
        };
      },
      colProps: {
        span: 8,
      },
    },
    {
      label: '执行人',
      field: 'executePersonName',
      component: 'Input',
      required: true,
      ifShow: ({ values }) => {
        return values.planType == '1'&& detailsData.value.riskLevel=='1';
      },
      dynamicDisabled: true,
      colProps: {
        span: 7,
      },
    },
    {
      label: '执行人',
      field: 'executePerson',
      component: 'JSelectMultiple',
      required: true,
      componentProps: () => {
        return {
          options: personOptions.value,
          placeholder: '请选择',
          mode: 'multiple',
          onChange: (e: any) => {
            console.log('executePerson multiple', e);
            // 最多不超过五个
            if (e && e.split(',').length > 5) {
              createMessage.error('最多选择五个执行人');
              e = e.split(',').slice(0, 5).join(',');
              setFieldsValue({ executePerson: e });
            }
          },
        };
      },
      colProps: {
        span: 7,
      },
    },
    // {
    //   label: '排查方法',
    //   field: 'checkType',
    //   required: true,
    //   component: 'JDictSelectTag',
    //   componentProps: {
    //     dictCode: 'ht_check_type',
    //     placeholder: '请选择',
    //     stringToNumber: false,
    //     showChooseOption: false,
    //   },
    //   colProps: {
    //     span: 8,
    //   },
    // },
    {
      label: '计划状态',
      field: 'useFlag',
      required: true,
      component: 'Switch',
      defaultValue: '1',
      componentProps: {
        checkedValue: '1',
        unCheckedValue: '0',
        checkedChildren: '启用',
        unCheckedChildren: '停用',
      },
      colProps: {
        span: 8,
        style: 'margin-right: 30px',
      },
    },
    {
      label: '未执行提醒',
      field: 'remindNoExecute',
      defaultValue: '0',
      labelWidth: 95,
      component: 'JDictSelectTag',
      required: true,
      componentProps: () => {
        return {
          dictCode: 'ht_remind_executed',
          type: 'radio',
          placeholder: '请选择',
          onChange: (e: any) => {
            console.log(e, 'eeeee====');
          },
        };
      },
      colProps: {
        span: 6,
      },
    },
    {
      field: 'noticeType',
      component: 'Input',
      label: '',
      labelWidth: 0,
      ifShow: ({ values }) => {
        return values.remindNoExecute == '1';
      },
      slot: 'noticeType',
      colProps: {
        span: 2,
        style: 'margin-left: -63px',
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
        if (values.planType != '1') {
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
      //   colProps: {
      //     span: 5,
      //   },
      slot: 'table1',
    },
    {
      field: 'table2',
      component: 'Input',
      label: '',
      //   colProps: {
      //     span: 5,
      //   },
      slot: 'table2',
    },
  ],
  showActionButtonGroup: false,
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
});
async function onSubmit(e: MouseEvent) {
  e?.stopPropagation();
  e?.preventDefault();
  const values = await validate();
  for (let item of dataSource.value) {
    if (item.rgLcId == '' || item.rgLcId == undefined) {
      item.errorFlag1 = true;
      // return false;
    }
    if (!item.checkContent) {
      item.errorFlag2 = true;
      // return false;
    }
    if (item.checkMethod == '' || item.checkMethod == undefined) {
      item.errorFlag4 = true;
      // return false;
    }
    if (item.pictureFlag == '' || item.pictureFlag == undefined) {
      item.errorFlag3 = true;
      // return false;
    }
    if (item.errorFlag1 || item.errorFlag2 || item.errorFlag3 || item.errorFlag4) {
      return false;
    }
  }
  if (values.remindNoExecute == '1') {
    values.remindMessage = '1';
  }
  // 检查项不可为空
  if (dataSource.value.length == 0) {
    createMessage.error('检查项不可为空');
    return false;
  }
  // 转译org成中文
  // orgOptions.value.forEach((item: any) => {
  //   if (item.value == values.org) {
  //     values.orgName = item.label;
  //   }
  // });
  // departOptions.value.forEach((item) => {
  //   if (item.value == values.depart) {
  //     values.departName = item.label;
  //   }
  // });

  values.planItemList = dataSource.value;
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
  checkedPhone.value = false;
  dataSource.value = [];
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });

  isUpdate.value = !!data?.isUpdate;
  showFooter.value = !!data?.showFooter;
  editType.value = data.editType;
  modalTitle.value = data.title;
  if (modalTitle.value == '新增') {
    planType.value = '2';
  }
  if (unref(isUpdate)) {
    // 计划清单-编辑
    planType.value = data.record.planType;
    if (data.record.org) {
      departOptions.value = [];
      let params: any = {};
      params.orgCode = data.record.org;
      params.pageSize = 9999;
      params.pageNo = 1;
      await getDepartmentList(params).then((res) => {
        departOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
        updateSchema({
          field: 'depart',
          componentProps: ({ formModel, formActionType }) => {
            return {
              options: departOptions,
              placeholder: '请选择',
              onChange: (e: any) => {
                personOptions.value = [];
                formModel.checkDutyPerson = undefined; //  reset city value
                formModel.executePerson = undefined; //  reset city value
                if (dataSource.value.length > 0) {
                  dataSource.value.map((item: any) => {
                    return (item.rgLcId = undefined);
                  });
                }
                let params: any = {};
                let params1: any = {};
                params.pageSize = 9999;
                params.pageNo = 1;
                if (e && data.record.planType == '2') {
                  params.orgCode = e;
                } else {
                  params.orgCode = formModel.org;
                }
                if (e) {
                  params1.orgCode = e;
                } else {
                  params1.orgCode = formModel.org;
                }
                getUserList(params).then((res) => {
                  if (res) {
                    personOptions.value = res.map((item: any) => {
                      return {
                        label: item.realname,
                        value: item.id,
                      };
                    });
                    updateSchema({
                      field: 'checkDutyPerson',
                      componentProps: {
                        options: personOptions.value,
                        onChange: (e: any) => {
                          console.log('checkDutyPerson multiple', e);
                          // 最多不超过五个
                          if (e && e.split(',').length > 5) {
                            createMessage.error('最多选择五个责任人');
                            e = e.split(',').slice(0, 5).join(',');
                            setFieldsValue({ checkDutyPerson: e });
                          }
                        },
                      },
                    });
                    updateSchema({
                      field: 'executePerson',
                      componentProps: {
                        options: personOptions.value,
                        onChange: (e: any) => {
                          console.log('executePerson multiple', e);
                          // 最多不超过五个
                          if (e && e.split(',').length > 5) {
                            createMessage.error('最多选择五个执行人');
                            e = e.split(',').slice(0, 5).join(',');
                            setFieldsValue({ executePerson: e });
                          }
                        },
                      },
                    });
                  } else {
                    updateSchema({
                      field: 'checkDutyPerson',
                      componentProps: {
                        options: [],
                      },
                    });
                    updateSchema({
                      field: 'executePerson',
                      componentProps: {
                        options: [],
                      },
                    });
                  }
                });

                getRgLcList(params1).then((res) => {
                  if (res) {
                    rgLcList.value = res.map((item: any) => {
                      return {
                        label: item.regionalLocation,
                        value: item.id,
                      };
                    });
                  } else {
                    rgLcList.value = [];
                  }
                });
              },
            };
          },
        });
      });
    }
    // 根据id获取详情
    await defHttp.get({ url: '/yh/skYhPlan/queryById', params: { id: data.record.id } }).then(async (res) => {
      if (res.remindMessage && res.remindMessage == '1') {
        remindMessage.value = true;
      } else {
        remindMessage.value = false;
      }

      dataSource.value = res.planItemList;
      detailsData.value = res;
    });
    data.record.depart = data.record.depart ? data.record.depart : undefined;
    let params: any = {};
    let params1: any = {};

    if (data.record.depart && data.record.planType == '2') {
      params.orgCode = data.record.depart;
      params.pageSize = 9999;
      params.pageNo = 1;
    } else {
      params.orgCode = data.record.org;
      params.pageSize = 9999;
      params.pageNo = 1;
    }
    if (data.record.depart) {
      params1.orgCode = data.record.depart;
    } else {
      params1.orgCode = data.record.org;
    }
    await getUserList(params).then((res) => {
      if (res) {
        personOptions.value = res.map((item: any) => {
          return {
            label: item.realname,
            value: item.id,
          };
        });
        updateSchema({
          field: 'checkDutyPerson',
          componentProps: {
            options: personOptions.value,
            onChange: (e: any) => {
              console.log('checkDutyPerson multiple', e);
              // 最多不超过五个
              if (e && e.split(',').length > 5) {
                createMessage.error('最多选择五个责任人');
                e = e.split(',').slice(0, 5).join(',');
                setFieldsValue({ checkDutyPerson: e });
              }
            },
          },
        });
        updateSchema({
          field: 'executePerson',
          componentProps: {
            options: personOptions.value,
            onChange: (e: any) => {
              console.log('executePerson multiple', e);
              // 最多不超过五个
              if (e && e.split(',').length > 5) {
                createMessage.error('最多选择五个执行人');
                e = e.split(',').slice(0, 5).join(',');
                setFieldsValue({ executePerson: e });
              }
            },
          },
        });
      } else {
        updateSchema({
          field: 'checkDutyPerson',
          componentProps: {
            options: [],
          },
        });
        updateSchema({
          field: 'executePerson',
          componentProps: {
            options: [],
          },
        });
      }
    });

    await getRgLcList(params1).then((res) => {
      if (res) {
        rgLcList.value = res.map((item: any) => {
          return {
            label: item.regionalLocation,
            value: item.id,
          };
        });
      } else {
        rgLcList.value = [];
      }
    });

    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
  }
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter });
});

const [registerCheckLibraryModal, { openModal: openCheckLibraryModal }] = useModal();
function selectCheckLibraryOk({ data, selectedRowKeys }) {
  // // 过滤掉dataSource.value中不存在itemId数组中的数据，不包含不存在itemId的
  const dat1 = dataSource.value.filter((item) => (item.itemId && selectedRowKeys.includes(item.itemId)) || !item.itemId);
  dataSource.value = dat1.concat(data);
}
function showCheckLibraryModal() {
  openCheckLibraryModal(true, {
    isUpdate: isUpdate.value,
    data: dataSource.value.length > 0 ? dataSource.value : [],
  });
}
function deleteItem(index) {
  dataSource.value.splice(index, 1);
}
function addCheckItem() {
  dataSource.value.push({
    itemType: undefined,
    itemName: '',
    drillCheckinPath: '',
    drillRecordPath: '',
    drillEvaluatePath: '1',
    errorFlag1: false,
    errorFlag2: false,
    errorFlag3: false,
    errorFlag4: false,
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
function changeItemType(record) {
  if (record.rgLcId != '' && record.rgLcId != undefined) {
    record.errorFlag1 = false;
  } else {
    record.errorFlag1 = true;
  }
}
function changeCheckType(record) {
  if (record.checkMethod) {
    record.errorFlag4 = false;
  } else {
    record.errorFlag4 = true;
  }
}
function changeCheckContent(record) {
  if (record.checkContent) {
    record.errorFlag2 = false;
  } else {
    record.errorFlag2 = true;
  }
}
function changeCheckPicture(record) {
  if (record.pictureFlag != '' && record.pictureFlag != undefined) {
    record.errorFlag3 = false;
  } else {
    record.errorFlag3 = true;
  }
}
function handleCancel() {
  closeModal();
  emit('success');
}
function onSelect(e) {
  console.log('onSelect', e);
}
const handleRiskId = (record) => {
  // 根据风险ID获取风险信息
  getRiskInfoById({ uniqueCode: record.riskId }).then((res) => {
    console.log('res', res);
    if (res.records.length > 0) {
      RiskInfoProps.openModal(true, { activeKey: res.records[0].dataType, data: res.records[0] });
    } else {
      createConfirm({
        title: '提示',
        content: '未查询到风险信息',
      });
    }
  });
};
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
