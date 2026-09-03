<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerModal"
    :width="600"
    :title="title"
    :body-style="{ padding: '0 10px', maxHeight: '600px', overflow: 'auto' }"
    destroyOnClose
    :canFullscreen="false"
  >
    <BasicForm @register="registerForm" />
    <template #footer>
      <div style="text-align: right" v-if="type === 'add'">
        <a-button @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="confirmClose">确定</a-button>
      </div>
    </template>
    <div v-if="type === 'view' && repairList && repairList.length > 0" class="record-container">
      <div class="record-section">
        <h3 class="section-title">整改记录</h3>
        <div v-for="(item, index) in repairList" :key="index">
          <div class="record-item">
            <div class="record-header">
              <span class="record-person">{{ item.handlerName }}</span>
              <span class="record-time">{{ item.handleTime }}</span>
            </div>
            <div class="record-content">
              <div v-if="item.node === '3'">
                <span class="record-label">验收结果：</span>
                <span :class="item.checkResult === '1' ? 'text-success' : 'text-danger'">
                  {{ item.checkResult === '1' ? '合格' : '不合格' }}
                </span>
              </div>
              <div v-if="item.checkResult === '2' && item.node === '3'" class="record-detail">
                <span class="record-label">不合格原因：</span>
                <span>{{ item.checkReason }}</span>
              </div>
              <div v-if="item.node === '2'" class="record-detail">
                <span class="record-label">整改措施：</span>
                <span>{{ item.repairMsr }}</span>
              </div>
              <div v-if="item.node === '2'" class="record-images">
                <span class="record-label">整改后照片：</span>
                <div class="image-list">
                  <j-image-upload v-model:value="item.repairPicture" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="record-section record-container" v-if="type === 'view' && info.checkResult">
      <h3 class="section-title">检查结果</h3>
      <div>
        <div class="record-item">
          <div class="record-header">
            <span class="record-person">{{ info.checkByName }}</span>
            <span class="record-time">{{ info.checkTime }}</span>
          </div>
          <div class="record-content">
            <div>
              <span class="record-label">检查结果：</span>
              <span :class="info.checkResult === '1' ? 'text-success' : 'text-danger'">
                {{ info.checkResult === '1' ? '合格' : '不合格' }}
              </span>
            </div>
            <div v-if="info.checkResult === '2'" class="record-detail">
              <span class="record-label">不合格原因：</span>
              <span>{{ info.checkComment }}</span>
            </div>
            <div class="record-images">
              <span class="record-label">相关图片：</span>
              <div class="image-list">
                <j-image-upload v-if="info.checkImg && info.checkImg !== ''" v-model:value="info.checkImg" disabled />
                <span v-else>无</span>
              </div>
            </div>
            <div v-if="info.checkFile" class="record-files">
              <span class="record-label">相关文件：</span>
              <div class="file-list">
                <customize-upload v-if="info.checkFile && info.checkFile !== ''" v-model:value="info.checkFile" disabled />
                <span v-else>无</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </basic-modal>
</template>
<script lang="ts" name="add-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { message, Upload } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { add, getEnterList, queryById } from './url/index';
  import { getDetailList } from '../admissionApplication/url/index';
  import { JImageUpload } from '/@/components/Form';
  import CustomizeUpload from '../../sm/components/CustomizeUpload.vue';
  import { getPopupContainer } from '/@/utils';
  const emit = defineEmits(['success']);
  const userStore: any = useUserStore();
  const loading = ref(false);
  const title = ref('');
  const type = ref('');
  const orgOptions: any = ref([]);
  const repairList: any = ref([]);
  const info: any = ref({});
  const formSchema: FormSchema[] = [
    {
      label: '相关方名称',
      field: 'companyId',
      required: true,
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          getPopupContainer: getPopupContainer,
          allowClear: false,
        };
      },
    },
    {
      label: '',
      field: 'companyName',
      component: 'Input',
      show: false,
    },
    {
      label: '项目名称',
      field: 'enterId',
      required: true,
      component: 'Select',
      componentProps: {
        options: [],
        placeholder: '请选择',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
    },
    {
      label: '发包单位',
      field: 'publishName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '资料类型',
      field: 'dataType',
      required: true,
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '周例会', value: '1' },
          { label: '周检查', value: '2' },
          { label: '培训', value: '3' },
        ],
      },
    },
    {
      label: '相关文档',
      field: 'file',
      component: 'JUpload',
      required: true,
      componentProps: {
        bizPath: 'sm',
        maxCount: 10,
        text: '添加附件',
        beforeUpload: (file: File) => {
          const isPdf = file.type === 'application/pdf';
          const isDoc = file.type === 'application/msword';
          const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf && !isDoc && !isDocx) {
            message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
  ];
  const formSchema1: FormSchema[] = [
    {
      label: '相关方名称',
      field: 'companyName',
      component: 'Input',
    },
    {
      label: '项目名称',
      field: 'enterName',
      component: 'Input',
    },
    {
      label: '发包单位',
      field: 'publishName',
      component: 'Input',
    },
    {
      label: '资料类型',
      field: 'dataType',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '周例会', value: '1' },
          { label: '周检查', value: '2' },
          { label: '培训', value: '3' },
        ],
      },
    },
    {
      label: '相关文档',
      field: 'file',
      component: 'JUpload',
      componentProps: {
        bizPath: 'sm',
        maxCount: 10,
        text: '添加附件',
        beforeUpload: (file: File) => {
          const isPdf = file.type === 'application/pdf';
          const isDoc = file.type === 'application/msword';
          const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf && !isDoc && !isDocx) {
            message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, validate, updateSchema, setFieldsValue, clearValidate, setProps }] = useForm({
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
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await resetFields();
    title.value = data.title;
    type.value = data.type;
    await setProps({ schemas: data.type === 'view' ? formSchema1 : formSchema, disabled: data.type === 'view' });
    if (data.type === 'add') {
      updateSchema({
        field: 'enterId',
        componentProps: {
          options: [],
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      await getDetailList().then((res) => {
        orgOptions.value = res.map((item) => {
          return {
            label: item.companyName,
            value: item.id,
            key: item.orgCode,
          };
        });
        updateSchema({
          field: 'companyId',
          componentProps: ({ formModel }) => {
            return {
              options: orgOptions.value,
              placeholder: '请选择',
              showSearch: true,
              allowClear: false,
              disabled: userStore.userInfo.orgCode.includes('A04B12'),
              filterOption: (input: string, option: any) => {
                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              },
              getPopupContainer: getPopupContainer,
              onChange: (value, extra) => {
                formModel.companyName = extra.label;
                setFieldsValue({
                  enterId: undefined,
                  publishName: undefined,
                });
                if (value) {
                  initEnter(extra.key);
                } else {
                  updateSchema({
                    field: 'enterId',
                    componentProps: {
                      options: [],
                      placeholder: '请选择',
                      showSearch: true,
                      filterOption: (input: string, option: any) => {
                        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                      },
                    },
                  });
                  setFieldsValue({
                    publishName: '',
                  });
                }
              },
            };
          },
        });
        if (userStore.userInfo.orgCode.includes('A04B12')) {
          setFieldsValue({
            companyId: orgOptions.value.filter((item) => userStore.userInfo.orgCode.includes(item.key))[0].value,
          });
          initEnter(userStore.userInfo.orgCode);
        } else {
          setFieldsValue({
            companyId: undefined,
          });
          clearValidate(['companyId']);
        }
      });
    }
    if (data.type === 'view') {
      queryById({
        id: data.data.id,
      }).then((res) => {
        info.value = res;
        repairList.value = res.repairList;
        setFieldsValue({
          ...res,
        });
      });
    }
  });
  const initEnter = (orgCode) => {
    getEnterList({
      orgCode: orgCode,
    }).then((res) => {
      const projectArr = res.map((item) => {
        return {
          label: item.projectName,
          value: item.id,
          publishName: item.publishName,
        };
      });
      updateSchema({
        field: 'enterId',
        componentProps: {
          options: projectArr,
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value, extra) => {
            setFieldsValue({
              publishName: undefined,
            });
            if (value) {
              setFieldsValue({
                publishName: extra.publishName,
              });
            }
          },
        },
      });
    });
  };
  const confirmClose = async () => {
    const values = await validate();
    const data = JSON.parse(JSON.stringify(values));
    add({
      ...data,
      status: '1',
    })
      .then(() => {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const close = () => {
    closeModal();
  };
</script>
<style lang="less" scoped>
  .record-container {
    padding: 10px;
  }

  .record-section {
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    color: #1890ff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .record-item {
    border: 1px solid #d9d9d9;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 6px;
    .record-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      margin: 6px 16px 12px;
      .record-person {
        font-weight: 500;
        color: #333;
      }

      .record-time {
        color: #666;
        font-size: 13px;
        margin-left: 10px;
      }
    }

    .record-content {
      padding-left: 16px;

      .record-label {
        color: #666;
        font-weight: 500;
        margin-right: 4px;
      }

      .record-detail {
        margin-top: 8px;
        color: #333;
        line-height: 1.6;
      }

      .text-success {
        color: #52c41a;
      }

      .text-danger {
        color: #ff4d4f;
      }

      .record-images {
        margin-top: 12px;

        .image-list {
          margin-top: 8px;
        }
      }

      .record-files {
        margin-top: 12px;

        .file-list {
          margin-top: 8px;
        }
      }
    }
  }
</style>
