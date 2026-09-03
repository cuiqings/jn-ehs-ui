<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" width="1000px" :showOkBtn="false">
      <BasicForm @register="registerForm">
        <template #table>
          <a-table
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :scroll="{ x: 880, y: 300 }"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #photo="{ record }">
              <img v-if="record.qlqzpName" :src="fmtImg(record,'qlqzpName')" style="cursor: pointer;display: inline-block;width:40px;height:40px;" @click="openImg(record,'qlqzpName')" />
              <span v-if="!record.qlqzpName">无</span>
            </template>
            <template #photo2="{ record }">
              <img v-if="record.qlhzpName" :src="fmtImg(record,'qlhzpName')" style="cursor: pointer;display: inline-block;width:40px;height:40px;" @click="openImg(record,'qlhzpName')" />
              <span v-if="!record.qlhzpName">无</span>
            </template>
            <template #photo3="{ record }">
              <img v-if="record.wbzpName" :src="fmtImg(record,'wbzpName')" style="cursor: pointer;display: inline-block;width:40px;height:40px;" @click="openImg(record,'wbzpName')" />
              <span v-if="!record.wbzpName">无</span>
            </template>
          </a-table>
        </template>
      </BasicForm>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { defHttp } from '/@/utils/http/axios';
  import { render } from '/@/utils/common/renderUtils'
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  // const [registerUserModal, { openModal }] = useModal();
  const isUpdate = ref<Boolean>(true);
  const getTitle = ref('查看');
  const roleId = ref('');
  // const selectRoleUser: any = ref({});
  const entryOptions: any = ref([]);
  const columns: any = ref([])
  const qlColumns: any = [
    { title: '序号', align: 'center', width: 50,
      customRender: ({ index }) => {
        return index+1
      }
    },
    { title: '清理部位', align: 'center', dataIndex: 'clearPosition', width: 130 },
    { title: '清理方法', align: 'center', dataIndex: 'clearMethod',  width: 90,
      customRender: ({ text }) => {
        return render.renderDict(text, `ql_method`)
      }
    }
  ]
  const wbColumns: any = [
    { title: '序号', align: 'center',  width: 50,
      customRender: ({ index }) => {
        return index+1
      }
    },
    { title: '维保内容', align: 'center', dataIndex: 'clearPosition', width: 150 },
    { title: '维保方式', align: 'center', dataIndex: 'clearMethod', width: 90,
      customRender: ({ text }) => {
        return render.renderDict(text, `wb_method`)
      }
    }
  ]
  const dataSource: any = ref([]);

  async function getEntryOptions() {
    let params: any = {};
    params.pageSize = 9999;
    params.pageNo = 1;
    await defHttp.get({ url: '/jnClearEntry/list', params }).then((res) => {
      res.records.map((item: any) => {
        entryOptions.value.push({
          label: item.entryName,
          value: item.id,
          clearType: item.clearType,
          method: item.method,
        });
      });
    });
  }

  getEntryOptions();

  const orgOptions: any = ref([]);

  function getOrgList() {
    defHttp.get({ url: '/jn/common/getOrganization' }).then((res) => {
      res.map((item: any) => {
        orgOptions.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
    });
  }

  getOrgList();

  // 注册表单
  const [registerForm, { setFieldsValue, resetFields, setProps }] = useForm({
    schemas: [
      {
        field: 'divider-basic',
        component: 'Divider',
        label: '基本信息',
      },
      {
        label: '类型',
        field: 'type',
        component: 'JDictSelectTag',
        componentProps: () => {
          return {
            dictCode: 'clean_plan_type ',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false
          };
        },
      },
      {
        label: '所属机构',
        field: 'organizationCode',
        component: 'Select',
        componentProps: () => {
          return {
            options: orgOptions.value,
            placeholder: '请选择',
            onChange: (e: any) => {
              console.log('e', e);
            },
          };
        },
      },
      {
        label: '工序',
        field: 'productionProcessse',
        component: 'Input',
        componentProps: {
          maxLength: 20,
        },
      },
      {
        label: '设备/区域',
        field: 'deviceRegion',
        component: 'Input',
        componentProps: {
          maxLength: 50,
        },
      },
      {
        label: '项目',
        field: 'clearEntryId',
        component: 'Select',
        // required: true,
        componentProps: () => {
          return {
            options: entryOptions.value,
            placeholder: '请选择',
            onChange: (e: any) => {
              console.log('e-----', e);
            },
          };
        },
      },
      {
        label: '周期',
        field: 'cycle',
        component: 'JDictSelectTag',
        componentProps: {
          dictCode: 'cycle',
          type: 'radio',
          placeholder: '请选择',
        },
      },
      {
        label: '周期天数',
        field: 'dayNum',
        component: 'InputNumber',
        ifShow: ({ values }) => {
          return values.cycle === '5'
        }
      },
      {
        label: '执行人',
        field: 'executorName',
        component: 'Input',
        componentProps: () => {
          return {
            placeholder: '请选择',
            readOnly: true,
            onClick: (e: any) => {
              console.log('click--', e);
              // openModal(true, {
              //   field: 'executorName',
              // });
            },
          };
        },
      },
      {
        label: '监督人',
        field: 'supervisorName',
        component: 'Input',
        componentProps: () => {
          return {
            placeholder: '请选择',
            readOnly: true,
            onClick: () => {
              // openModal(true, {
              //   field: 'supervisor',
              // });
            },
          };
        },
      },
      {
        field: 'divider-basic2',
        component: 'Divider',
        label: '清理维护信息',
      },
      {
        field: 'table',
        label: ' ',
        labelWidth: '0px',
        component: 'Input',
        slot: 'table'
      },
      {
        field: 'divider-basic3',
        component: 'Divider',
        label: '执行信息',
      },
      {
        label: '本次维护时间',
        field: 'thisMaintenanceTime',
        component: 'DatePicker',
        componentProps: {
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss',
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
            return currentTimestamp > todayTimestamp;
          },
        },
      },
      {
        label: '执行人',
        field: 'executor',
        component: 'Input',
        componentProps: () => {
          return {
            placeholder: '请选择',
            readOnly: true,
            onClick: (e: any) => {
              console.log('click--', e);
              // openModal(true, {
              //   field: 'executor',
              // });
            },
          };
        },
      },
      {
        label: '下次维护时间',
        field: 'nextMaintenanceTime',
        component: 'DatePicker',
        componentProps: {
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
            return currentTimestamp > todayTimestamp;
          },
        },
      },
    ],
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  });


  function fmtImg(record:any, val:string){
    // console.log(record,'000---------')
    const firstImg = record[val].split(',')[0]
    return getFileAccessHttpUrl(firstImg)
  }
  function openImg(record:any,val:string) {
    // const onImgLoad = ({ index, url, dom }) => {
    //   console.log(`第${index + 1}张图片已加载，URL为：${url}`, dom);
    // };
    let imageList = record[val].split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({ 
      imageList: imageList, 
      defaultWidth: 600, 
      rememberState: true, 
      scaleStep: 10
      // onImgLoad 
    });
  }
  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    console.log('useModalInner data', data);
    // console.log('useModalInner data', data.type);
    getTitle.value = '查看';
    // 下次点击弹窗的时候清空表单
    // selectRoleUser.value.vlaue = {};
    await resetFields();
    setModalProps({
      confirmLoading: false,
      showCancelBtn: !!data?.showFooter,
      showOkBtn: !!data?.showFooter,
    });
    isUpdate.value = !!data?.isUpdate;
    columns.value = []
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      // console.log('data.record', data.record);
      dataSource.value = data.record.jnClearRecordSubs || []
      roleId.value = data.record.id;
      if(data.record.type === '1'){
        columns.value = [...wbColumns]
        if(data.record.hcghsl !== '2'){
          columns.value.push({ 
            title: '耗材更换数量', 
            align: 'center', 
            width: 120,
            dataIndex: 'hcghslName'
          })
        }
        if(data.record.csfpzl !== '2'){
          columns.value.push({ 
            title: '产生废品重量', 
            align: 'center', 
            dataIndex: 'csfpzlName',
            width: 120,
            customRender: ({ text }) => {
              return text ? text+'kg' : '--'
            }  
          })
        }
        if(data.record.csfpqx !== '2'){
          columns.value.push({ 
            title: '产生废品去向', 
            align: 'center', 
            dataIndex: 'csfpqxName',
            width: 120
          })
        }
        if(data.record.wbzp === '2'){
          columns.value.push({ 
            title: '维保照片', 
            align: 'center', 
            dataIndex: 'wbzpName',
            width: 90,
            slots: { customRender: 'photo3' }
          })
        }
      } else {
        columns.value = [...qlColumns]
        // console.log(columns.value,'11111----')
        if(data.record.csfpzl !== '2'){
          columns.value.push({ 
            title: '产生废品重量', align: 'center', dataIndex: 'csfpzlName', width: 120,
            customRender: ({ text }) => {
              return text ? text+'kg' : '--'
            } 
          })
        }
        if(data.record.csfpqx !== '2'){
          columns.value.push({ 
            title: '产生废品去向', 
            align: 'center', 
            dataIndex: 'csfpqxName',
            width: 120,
          })
        }
        if(data.record.qlqzp !== '2'){
          columns.value.push({ 
            title: '清理前照片', 
            align: 'center', 
            dataIndex: 'qlqzpName',
            width: 110,
            slots: { customRender: 'photo' }
          })
        }
        if(data.record.qlhzp !== '2'){
          columns.value.push({ 
            title: '清理后照片', 
            align: 'center', 
            dataIndex: 'qlhzpName',
            width: 110,
            slots: { customRender: 'photo2' }
          })
        }
        if(data.record.qlsm !== '2'){
          columns.value.push({ 
            title: '清理说明', 
            align: 'center', 
            dataIndex: 'qlsmName',
            width: 150,
          })
        }
      }
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });
</script>

<style lang="less" scoped>
  /deep/ .ant-input-suffix {
    color: #999;
  }
  :deep(label[for=form_item_table]) {
    color: #fff;
  }
</style>
