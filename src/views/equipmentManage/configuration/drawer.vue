<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    :width="800"
    @ok="handleSubmit"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
    <a-form :model="info" ref="infoForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <div class="nav" v-if="info.supplyList?.length > 0">劳保物料配置</div>
      <div class="configuration-list">
        <div class="configuration-item" v-for="(item, index) in info.supplyList" :key="index">
          <div class="item-header">
            <span class="item-number">配置项 {{ index + 1 }}</span>
          </div>
          <div class="item-content">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="物料名称" :name="['supplyList', index, 'supply']" :rules="[{ required: showOkBtn, message: '请选物料名称!' }]">
                  <a-input v-model:value="item.supply" style="width: 100%" placeholder="请选择物料名称" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="规格型号" :name="['supplyList', index, 'model']" :rules="[{ required: showOkBtn, message: '请选择规格型号!' }]">
                  <a-select
                    v-model:value="item.model"
                    style="width: 100%"
                    placeholder="请选择规格型号"
                    :disabled="!showOkBtn || item.modelList.length == 1"
                    :options="item.modelList"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item
                  label="上次发放日期"
                  :name="['supplyList', index, 'lastDistributeTime']"
                  :rules="[{ required: !item.firstFlag && showOkBtn, message: '请选择规格型号!' }]"
                >
                  <a-date-picker
                    v-model:value="item.lastDistributeTime"
                    style="width: 100%"
                    valueFormat="YYYY-MM-DD"
                    placeholder="请选择"
                    :disabled="!showOkBtn || item.firstFlag"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="" :name="['supplyList', index, 'firstFlag']">
                  <div class="checkbox-wrapper">
                    <a-checkbox
                      v-model:checked="item.firstFlag"
                      :disabled="!showOkBtn || item.lastDistributeTime"
                      @change="handleFirstChange($event, item)"
                    >
                      <span class="checkbox-label">第一次发放</span>
                    </a-checkbox>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </a-form>
  </BasicDrawer>
</template>
<script lang="ts" name="equipmentManage-ledger-drawer" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { config, queryById } from './api';
  const emit = defineEmits(['success']);
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const type = ref('add');
  const info: any = ref({
    supplyList: [],
  });
  const infoForm = ref();
  const from: any = ref({});
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '姓名',
      field: 'name',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '工号',
      field: 'workNo',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '所属单位',
      field: 'orgName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '所属车间',
      field: 'departName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '岗位',
      field: 'postName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
  ];
  //表单配置
  const [registerForm, { setProps, setFieldsValue }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    type.value = data.type;
    await infoForm.value.resetFields();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    info.value.supplyList = [];
    queryById({
      orgCode: data.data.orgCode,
      departCode: data.data.departCode,
      postCode: data.data.postCode,
      workNo: data.data.workNo,
    }).then((res) => {
      if (res) {
        setFieldsValue({
          name: res.name,
          workNo: res.workNo,
          orgName: res.orgName,
          departName: res.departName,
          postName: res.postName,
        });
        Object.assign(from.value, res);
        info.value.supplyList =
          res.supplyList?.map((item: any) => {
            item.firstFlag = item.firstFlag == '1' ? true : false;
            if (!item.id) {
              item.model = item.modelList?.length == 1 ? item.modelList[0].value : undefined;
            }
            return item;
          }) || [];
      }
    });
    if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });
  const handleSubmit = async () => {
    try {
      const values = await infoForm.value.validate();
      setDrawerProps({ confirmLoading: true });
      const obj = JSON.parse(JSON.stringify(values));
      obj.supplyList.forEach((item: any) => {
        item.firstFlag = item.firstFlag ? '1' : '2';
      });
      await config({ ...from.value, ...obj }).then((res) => {
        if (res) {
          //刷新列表
          emit('success');
          //关闭弹窗
          closeDrawer();
        }
      });
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };
  const handleFirstChange = (e: any, item: any) => {
    if (e.target.checked) {
      item.lastDistributeTime = null;
      infoForm.value.clearValidate();
    }
  };
</script>
<style lang="less" scoped>
  .nav {
    color: #1890ff;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  }

  .configuration-list {
    .configuration-item {
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
      transition: all 0.3s ease;

      .item-header {
        background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
        padding: 12px 16px;
        .item-number {
          color: white;
          font-weight: 600;
          font-size: 14px;
        }
      }

      .item-content {
        padding: 20px 16px 16px;
        background: white;
        border: 1px solid #e8e8e8;
        border-top: none;
        border-radius: 0 0 8px 8px;
        &:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
        }
        .ant-form-item {
          margin-bottom: 16px;
        }

        .ant-form-item-label > label {
          font-weight: 500;
          color: #262626;
        }

        .ant-select,
        .ant-picker {
          border-radius: 6px;

          &:hover {
            border-color: #40a9ff;
          }

          &:focus {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          height: 30px;
          padding: 8px 12px;
          background: #f6f6f6;
          border-radius: 6px;
          transition: all 0.3s ease;
          margin-left: 40px;
          &:hover {
            background: #e6f7ff;
          }

          .ant-checkbox-wrapper {
            .checkbox-label {
              font-weight: 500;
              color: #595959;
            }
          }

          .ant-checkbox-checked + .checkbox-label {
            color: #1890ff;
          }
        }
      }
    }
  }
</style>
