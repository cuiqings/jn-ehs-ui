<template>
  <div class="safeIcon">
    <div class="action">
      <a-button v-auth="'safeBaseMap:add'" type="primary" @click="add">新增</a-button>
      <div class="hint">
        <span>说明：</span>
        <div style="line-height: 20px;">
          1.安全管理底图用于风险大屏-安全管理一张图中的底图展示，有限空间、消防器材、排气筒、职业健康告知的位置标记底图<br />
          2.建议尺寸：宽1813px 高 424px，建议上传png格式图片
        </div>
      </div>
    </div>
    <div class="safeIcon-main" v-if="listData.length > 0">
      <div class="item" v-for="item in listData" :key="item">
        <img :src="getFileAccessHttpUrl(item.picture)" />
        <div>
          <div>所属机构：{{ item.orgName }}<span v-auth="'safeBaseMap:edit'" style="margin-left: 15px" @click="edit(item)">更新</span></div>
          <span style="color: #d9001b; margin-right: 10px" v-auth="'safeBaseMap:del'" @click="handleDel(item)">删除</span>
        </div>
      </div>
    </div>
    <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" style="margin-top: 14%" />
    <BasicModal @register="register">
      <BasicForm @register="addRegisterForm" />
      <div class="hint-size">建议尺寸：宽1813px 高 424px</div>
      <div class="footer">
        <a-button @click="cancel">取消</a-button>
        <a-button type="primary" @click="submit">确定</a-button>
      </div>
    </BasicModal>
  </div>
</template>
<script setup name="limitSpace" lang="ts">
  import { onMounted, ref, createVNode } from 'vue';
  import { useForm, FormSchema, BasicForm } from '/@/components/Form';
  import { useModal, BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { Empty } from 'ant-design-vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { Modal } from 'ant-design-vue';
  import { list, addOrEdit, del, details, getOrganizationNew } from './url/index';
import { rules } from '/@/utils/helper/validator';
  const [register, { openModal, setModalProps, closeModal }] = useModal();
  const { createConfirm } = useMessage();
  const addFormSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '所属机构',
      field: 'org',
      component: 'Select',
      required: true,
      componentProps: () => {
        return {
          options: [],
        };
      },
    },
    {
      label: '',
      field: 'orgName',
      component: 'Input',
      show: false,
    },
    {
      label: '图片',
      field: 'picture',
      component: 'JImageUpload',
      componentProps: {
        accept: '.jpeg,.jpg,.png,.gif,.bmp,.webp',
        fileMax: 1,
      },
      rules: [{ required: true, message: '请上传图片' }],
      required: true,
    },
  ];
  const orgOptions = ref([]);
  const listData = ref([]);
  const pageDate = ref({
    pageNo: 1,
    pageSize: 10,
  });
  const [addRegisterForm, { validate, resetFields, updateSchema, setFieldsValue }] = useForm({
    schemas: addFormSchema,
    actionColOptions: { span: 24 },
    labelWidth: 120,
    showActionButtonGroup: false,
  });
  onMounted(() => {
    setModalProps({
      footer: null,
    });
    init();
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  });
  const init = () => {
    list({ ...pageDate.value }).then((res) => {
      if (res.records) {
        listData.value = res.records;
      }
    });
  };
  const add = async () => {
    setModalProps({
      title: '安全管理底图新增',
    });
    await openModal(true, {
      isUpdate: false,
    });
    await resetFields();
    await updateSchema({
      field: 'org',
      componentProps: ({ formModel }) => {
        return {
          options: orgOptions.value,
          onChange: (value, extra) => {
            if (value) {
              formModel.orgName = extra.label;
            } else {
              formModel.orgName = '';
            }
          },
        };
      },
    });
    if (orgOptions.value.length === 1) {
      await setFieldsValue({
        org: orgOptions.value[0].value,
        orgName: orgOptions.value[0].label,
      });
    }
  };
  const edit = (item: any) => {
    details({ id: item.id }).then(async (res) => {
      if (res) {
        await setModalProps({
          title: '安全管理底图更新',
        });
        await openModal(true);
        await resetFields();
        await updateSchema({
          field: 'org',
          componentProps: ({ formModel }) => {
            return {
              options: orgOptions.value,
              onChange: (value, extra) => {
                if (value) {
                  formModel.orgName = extra.label;
                } else {
                  formModel.orgName = '';
                }
              },
            };
          },
        });
        await setFieldsValue({ ...JSON.parse(JSON.stringify(res)) });
      }
    });
  };
  const cancel = () => {
    closeModal();
  };
  const handleDel = (data) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '删除底图当前已标记点位将同时清空，是否确认删除？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del({ id: data.id })
            .then((res) => {
              if (res) {
                init();
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  const submit = async () => {
    const values = await validate();
    if(values.id){
      Modal.confirm({
        content: '提示：当前已标记点位有可能与新的底图不符，是否确认更新？',
        onOk() {
          addOrEdit({ ...values }).then((res) => {
            if (res) {
              //关闭弹窗
              closeModal();
              init();
            }
          });
        },
        onCancel() {
          Modal.destroyAll();
        },
      });
    } else {
      addOrEdit({ ...values }).then((res) => {
        if (res) {
          //关闭弹窗
          closeModal();
          init();
        }
      });
    }
  };
</script>
<style lang="less" scoped>
  .safeIcon {
    height: calc(100vh - 98px);
    width: 100%;
    padding: 10px;
    .action {
      height: 62px;
      background-color: #fff;
      padding: 10px;
      display: flex;
      .hint {
        color: #d9001b;
        display: flex;
        margin-left: 30px;
      }
    }
    .safeIcon-main {
      background: #fff;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      overflow: auto;
      padding: 0 10px 10px;
      width: 100%;
      height: calc(100% - 62px);
      .item {
        box-sizing: border-box;
        width: calc(50% - 0.5%);
        padding: 0.5%;
        margin: 0 0.25%;
        border: 1px solid #eee;
        border-radius: 5px;
        height: auto;
        img {
          width: 100%;
          height: 424px;
          object-fit: cover;
        }
        & > div {
          line-height: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          span {
            color: rgb(45, 120, 255);
            cursor: pointer;
          }
        }
      }
    }
  }
  .footer {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    .ant-btn {
      margin: 0 10px;
    }
  }
  .hint-size {
    transform: translateY(-10px);
    padding-left: 120px;
    color: #d9001b;
    padding-bottom: 10px;
  }
</style>
