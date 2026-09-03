<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="1200" @ok="onSubmit" :title="modalTitle" @cancel="handleCancel">
      <BasicForm @register="registerForm">
        <template v-if="modalTitle !== '查看'" #addReady>
          <a-button style="margin-left: 80px" type="primary" @click="showCheckLibraryModal">+ 从检查表库添加</a-button>
        </template>
        <template v-if="modalTitle !== '查看'" #add>
          <a-button style="" type="primary" @click="addCheckItem">+ 添加检查项</a-button>
        </template>
        <template #table>
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
              <template v-if="column.key === 'itemType'"> <span class="red-require">*</span>检查项分类 </template>
              <template v-if="column.key === 'checkContent'"> <span class="red-require">*</span>检查内容/方法 </template>
              <template v-if="column.key === 'pictureFlag'"> <span class="red-require">*</span>检查照片 </template>
            </template>
            <template v-if="modalTitle !== '查看'" #action="{ record, index }">
              <div>
                <a-button type="link" :disabled="index == dataSource.length - 1" @click="downItem(record, index)"><arrow-down-outlined /></a-button>
                <a-button type="link" :disabled="index == 0" @click="upItem(record, index)"><arrow-up-outlined /></a-button>
                <a-button type="link" @click="deleteItem(index)">删除</a-button>
              </div>
            </template>
            <template #itemType="{ record }">
              <a-select
                :disabled="modalTitle === '查看' || record.itemId"
                v-model:value="record.itemType"
                style="width: 120px"
                @change="changeCheckType(record)"
              >
                <a-select-option :value="item.value" :key="index" v-for="(item, index) in itemTypeOptions">{{ item.title }}</a-select-option>
              </a-select>
              <div v-if="record.errorFlag1" style="color: red">请选择检查项分类</div>
            </template>
            <template #itemName="{ record }">
              <a-textarea
                :disabled="modalTitle === '查看' || record.itemId"
                placeholder="请输入50字以内"
                v-model:value="record.itemName"
                :rows="2"
                :maxlength="50"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.orgCodeText }}</span> -->
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
              <div v-if="record.errorFlag2" style="color: red">请输入检查内容/方法</div>
            </template>
            <template #checkStandard="{ record }">
              <a-textarea
                :disabled="modalTitle === '查看' || record.itemId"
                placeholder="请输入100字以内"
                v-model:value="record.checkStandard"
                :rows="2"
                :maxlength="100"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillRecordPath }}</span> -->
            </template>
            <template #pictureFlag="{ record }">
              <a-select
                :disabled="modalTitle === '查看'"
                v-model:value="record.pictureFlag"
                style="width: 120px"
                @change="changeCheckPicture(record)"
              >
                <a-select-option value="0">非必填</a-select-option>
                <a-select-option value="1">必填</a-select-option>
              </a-select>
              <div v-if="record.errorFlag3" style="color: red">请选择检查照片</div>
            </template>
          </a-table>
        </template>
        <template #noticeType>
          <div style="">
            <a-checkbox :disabled="modalTitle === '查看'" v-model:checked="checkedMessage">短信提醒</a-checkbox>
            <a-checkbox :disabled="modalTitle === '查看'" v-model:checked="checkedPhone">电话提醒</a-checkbox>
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
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdate } from './manage.api';
  import { defHttp } from '/@/utils/http/axios';
  import { useUserStore } from '/@/store/modules/user';
  import CheckLibraryModal from './CheckLibraryModal.vue';
  import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { initDictOptions } from '/@/utils/dict';
  import { weekOptions, monthOptions } from '/@/views/task/publish/time.data';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';

  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref<Boolean>(true);
  const showFooter = ref<Boolean>(true);
  const modalTitle = ref('查看');
  const roleId = ref('');
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const dataSource: any = ref([]);
  const itemTypeOptions: any = ref([]);
  const checkedMessage = ref(false);
  const checkedPhone = ref(false);
  const detailsData: any = ref({});
  const checkTypeOptions: any = ref([]);
  const columns: any = [
    {
      title: '序号',
      align: 'center',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    { title: '检查项分类', align: 'center', key: 'itemType', dataIndex: 'itemType', slots: { customRender: 'itemType' } },
    { title: '检查项', align: 'center', dataIndex: 'itemName', slots: { customRender: 'itemName' } },
    {
      title: '检查内容/方法',
      align: 'center',
      key: 'checkContent',
      dataIndex: 'checkContent',
      slots: { customRender: 'checkContent' },
    },
    { title: '检查标准', align: 'center', dataIndex: 'checkStandard', slots: { customRender: 'checkStandard' } },
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
    { title: '检查项分类', align: 'center', key: 'itemType', dataIndex: 'itemType', slots: { customRender: 'itemType' } },
    { title: '检查项', align: 'center', dataIndex: 'itemName', slots: { customRender: 'itemName' } },
    {
      title: '检查内容/方法',
      align: 'center',
      key: 'checkContent',
      dataIndex: 'checkContent',
      slots: { customRender: 'checkContent' },
    },
    { title: '检查标准', align: 'center', dataIndex: 'checkStandard', slots: { customRender: 'checkStandard' } },
    {
      title: '检查照片',
      width: 150,
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
    checkTypeOptions.value = await initDictOptions('yh_plan_check_type');
  }
  const roleList: any = ref([]);

  // 获取角色列表
  async function getRoleList(val?: string) {
    const params = {
      roleName: val,
    };
    await defHttp.get({ url: '/jn/common/getRole', params }).then((res) => {
      roleList.value = res.records.map((item: any) => {
        return {
          label: item.roleName,
          value: item.roleCode,
          orgCode: item.orgCode,
        };
      });
    });
  }
  getRoleList();
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
        label: '所属机构',
        field: 'org',
        component: 'Select',
        defaultValue: initOrgCode(),
        //   dynamicDisabled: ({ values }) => {
        //     let orgCode = initOrgCode();
        //     console.log('orgCode', orgCode);
        //     if ((orgCode && orgCode.length > 3 && isSecuritySector != 1 && orgCode.slice('0', '6') != 'A04B01') || !showFooter.value) {
        //       return true;
        //     } else {
        //       return false;
        //     }
        //   },
        required: true,
        componentProps: ({ formModel, formActionType }) => {
          return {
            options: orgOptions,
            placeholder: '请选择',
            onChange: (e: any) => {
              departOptions.value = [];
              formModel.depart = undefined; //  reset city value
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
                      componentProps: {
                        options: departOptions.value,
                      },
                    });
                  } else {
                    updateSchema({
                      field: 'depart',
                      componentProps: {
                        options: [],
                      },
                    });
                  }
                });
              } else {
                updateSchema({
                  field: 'depart',
                  componentProps: {
                    options: [],
                  },
                });
              }
            },
          };
        },
      },
      {
        label: '所属部门',
        field: 'depart',
        component: 'Select',
        // defaultValue: initDeptCode(),
        componentProps: {
          options: departOptions.value, // defalut []
          placeholder: '请选择',
        },
      },
      {
        label: '计划类型',
        field: 'planType',
        defaultValue: '1',
        component: 'JDictSelectTag',
        required: true,
        componentProps: () => {
          return {
            dictCode: 'yh_plan_type',
            type: 'radio',
            placeholder: '请选择',
          };
        },
      },
      {
        label: '巡检周期',
        field: 'checkCycle',
        required: true,
        component: 'JDictSelectTag',
        ifShow: ({ values }) => {
          if (values.planType == '1') {
            return true;
          } else {
            return false;
          }
        },
        componentProps: {
          dictCode: 'yh_inspection_cycle',
          placeholder: '请选择',
          stringToNumber: false,
          showChooseOption: false,
          onChange: (e: any) => {
            console.log(e, 'eeeee====');
            // 重置executeDate1
            if (e == '3' || e == '4') {
              setFieldsValue({ executeDate1: undefined });
            }
          },
        },
      },
      {
        label: '执行日',
        field: 'executeDate',
        required: true,
        component: 'DatePicker',
        defaultValue: new Date(),
        ifShow: ({ values }) => {
          if (values.planType == '2') {
            return true;
          } else {
            return false;
          }
        },
        componentProps: {
          showTime: false,
          valueFormat: 'YYYY-MM-DD',
          style: {
            width: '100%',
          },
          disabledDate: (current) => {
            const today = new Date();
            // 将当前日期转换为时间戳
            const todayTimestamp = today.getTime();
            // 将当前日期之前的日期转换为时间戳
            const currentTimestamp = current.valueOf();
            // 判断当前日期是否在当前日期之前
            return currentTimestamp < todayTimestamp;
          },
        },
      },
      {
        field: 'executeDate1',
        component: 'Select',
        label: '执行日',
        required: true,
        ifShow: ({ values }) => {
          return values.checkCycle == '3' || values.checkCycle == '4';
        },
        componentProps: ({ formModel }) => {
          switch (formModel.checkCycle) {
            case '3':
              return {
                options: weekOptions,
                placeholder: '请选择',
              };
            case '4':
              return {
                options: monthOptions,
                placeholder: '请选择',
              };
            default:
              return {
                options: weekOptions,
                placeholder: '请选择',
              };
          }
        },
      },
      {
        label: '检查类型',
        field: 'checkType',
        required: true,
        component: 'RadioGroup',
        componentProps: {
          options: [
            { label: '专项检查', value: '1' },
            { label: '节前检查', value: '2' },
            { label: '日常巡检', value: '3' },
            { label: '制度落实', value: '4' },
            { label: '监管部门', value: '5' },
          ],
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
      },

      {
        label: '计划审批角色',
        field: 'approveRole',
        component: 'JSelectMultiple',
        required: true,
        componentProps: () => {
          return {
            options: roleList.value,
            placeholder: '请选择',
            mode: 'multiple',
          };
        },
      },
      {
        label: '执行角色',
        field: 'executeRole',
        component: 'JSelectMultiple',
        required: true,
        componentProps: () => {
          return {
            options: roleList.value,
            placeholder: '请选择',
            mode: 'multiple',
          };
        },
      },
      {
        label: '监督人',
        field: 'superviseRole',
        component: 'JSelectMultiple',
        required: true,
        componentProps: () => {
          return {
            options: roleList.value,
            placeholder: '请选择',
            mode: 'multiple',
          };
        },
      },
      {
        label: '未执行提醒',
        field: 'remindNoExecute',
        defaultValue: '0',
        component: 'JDictSelectTag',
        required: true,
        componentProps: () => {
          return {
            dictCode: 'yh_remind_executed',
            type: 'radio',
            placeholder: '请选择',
            onChange: (e: any) => {
              console.log(e, 'eeeee====');
            },
          };
        },
      },
      {
        field: 'noticeType',
        component: 'Input',
        label: '提醒方式',
        ifShow: ({ values }) => {
          return values.remindNoExecute == '1';
        },
        slot: 'noticeType',
      },
      {
        field: 'divider-basic1',
        component: 'Divider',
        label: '检查项',
      },
      {
        field: 'addReady',
        component: 'Input',
        label: '',
        colProps: {
          span: 5,
        },
        slot: 'addReady',
      },
      {
        field: 'add1',
        component: 'Input',
        label: '',
        colProps: {
          span: 5,
        },
        slot: 'add',
      },
      {
        field: 'table1',
        component: 'Input',
        label: '',
        //   colProps: {
        //     span: 5,
        //   },
        slot: 'table',
      },
      {
        field: 'divider-basic4',
        component: 'Divider',
        label: '审批记录',
        ifShow: () => {
          return modalTitle.value == '查看';
        },
      },
      {
        field: 'reviewCase',
        component: 'Input',
        label: '',
        slot: 'reviewCase',
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
      if (item.itemType == '' || item.itemType == undefined) {
        item.errorFlag1 = true;
        // return false;
      }
      if (!item.checkContent) {
        item.errorFlag2 = true;
        // return false;
      }
      if (item.pictureFlag == '' || item.pictureFlag == undefined) {
        item.errorFlag3 = true;
        // return false;
      }
      if (item.errorFlag1 || item.errorFlag2 || item.errorFlag3) {
        return false;
      }
    }
    // 检查项不可为空
    if (dataSource.value.length == 0) {
      createMessage.error('检查项不可为空');
      return false;
    }
    // 未执行提醒
    if (values.remindNoExecute == '1') {
      if (!checkedMessage.value && !checkedPhone.value) {
        createMessage.error('请选择提醒方式');
        return false;
      }
      if (checkedMessage.value) {
        values.remindMessage = '1';
      } else {
        values.remindMessage = '0';
      }
      if (checkedPhone.value) {
        values.remindPhone = '1';
      } else {
        values.remindPhone = '0';
      }
    }
    // 执行时间处理
    if (values.checkCycle == '3' || values.checkCycle == '4') {
      values.executeDate = values.executeDate1;
      delete values.executeDate1;
    }
    // 转译org成中文
    orgOptions.value.forEach((item: any) => {
      if (item.value == values.org) {
        values.orgName = item.label;
      }
    });
    departOptions.value.forEach((item) => {
      if (item.value == values.depart) {
        values.departName = item.label;
      }
    });
    // 转译superviseRole
    let superviseRole: any = [];
    roleList.value.forEach((item) => {
      values.superviseRole.split(',').forEach((item1) => {
        if (item1 == item.value) {
          superviseRole.push(item.label);
        }
      });
    });
    values.superviseRoleName = superviseRole.join(',');
    // 转译executeRole
    let executeRole: any = [];
    roleList.value.forEach((item) => {
      values.executeRole.split(',').forEach((item1) => {
        if (item1 == item.value) {
          executeRole.push(item.label);
        }
      });
    });
    values.executeRoleName = executeRole.join(',');
    // 转译approveRole
    let approveRole: any = [];
    roleList.value.forEach((item) => {
      values.approveRole.split(',').forEach((item1) => {
        if (item1 == item.value) {
          approveRole.push(item.label);
        }
      });
    });
    values.approveRoleName = approveRole.join(',');
    values.itemList = dataSource.value;
    // 去掉values中itemList中每一条的id属性
    values.itemList = values.itemList.map((item) => {
      delete item.id;
      return item;
    });
    setModalProps({ confirmLoading: true });
    if (unref(isUpdate) && editType.value !== '1') {
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
      values.useFlag = '0';
      // 复用删除id
      if (editType.value === '1') {
        delete values.id;
        // 遍历删除itemList的id
        values.itemList.map((item) => {
          delete item.id;
        });
      }
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
    checkedMessage.value = false;
    checkedPhone.value = false;
    dataSource.value = [];
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    showFooter.value = !!data?.showFooter;
    editType.value = data.editType;
    modalTitle.value = data.title;
    if (data.editType) {
      modalTitle.value = unref(isUpdate) && data.editType === '1' ? '复用' : '编辑';
    }
    // title.value = data.title;
    if (unref(isUpdate)) {
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
        });
      }
      updateSchema({
        field: 'depart',
        componentProps: {
          options: departOptions.value,
          placeholder: '请选择',
        },
      });
      // 根据id获取详情
      await defHttp.get({ url: '/hiddenDangerChecks/jnYhPlan/detail', params: { id: data.record.id } }).then((res) => {
        if (res.remindMessage && res.remindMessage == '1') {
          checkedMessage.value = true;
        } else {
          checkedMessage.value = false;
        }
        if (res.remindPhone && res.remindPhone == '1') {
          checkedPhone.value = true;
        } else {
          checkedPhone.value = false;
        }
        dataSource.value = res.itemList;
        roleId.value = res.id;
        detailsData.value = res;
      });
      // 执行日处理
      if (data.record.checkCycle == '3' || data.record.checkCycle == '4') {
        data.record.executeDate1 = data.record.executeDate;
        delete data.record.executeDate;
      }
      data.record.depart = data.record.depart ? data.record.depart : undefined;
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      roleId.value = data.record.id;
    } else {
      updateSchema({
        field: 'depart',
        componentProps: {
          options: departOptions.value,
          placeholder: '请选择',
        },
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
  function changeCheckType(record) {
    if (record.departText != '') {
      record.errorFlag1 = false;
    }
  }
  function changeCheckContent(record) {
    if (record.checkContent) {
      record.errorFlag2 = false;
    }
  }
  function changeCheckPicture(record) {
    if (record.drillEvaluatePath != '') {
      record.errorFlag3 = false;
    }
  }
  function handleCancel() {
    closeModal();
    emit('success');
  }
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
