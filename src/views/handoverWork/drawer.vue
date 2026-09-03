<template>
  <BasicDrawer
    forceRender
    v-bind="$attrs"
    @register="register"
    @close="close"
    :title="title"
    width="65%"
    @ok="handleSubmit"
    :showFooter="false"
    destroyOnClose
  >
    <div class="d-inner">
      <a-form class="d-form" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="单位" name="orgCodeName">
              {{ formState.orgCodeName }}
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="车间" name="workshopName">
              {{ formState.workshopName }}
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="上班时间" name="workTime">
              {{ formState.workTime }}
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label-col="{ span: 2 }" :wrapper-col="{ span: 22 }" label="班次" name="teamName">
              {{ formState.teamName }}
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div class="title">交班内容</div>
      <a-form :layout="'vertical'" class="d-form" ref="formRef" :model="formState" name="basic">
        <a-col :span="12">
          <a-form-item label="接班班组" name="successionTeamId" :rules="[{ required: true, message: '请选择' }]">
            <a-select
              style="width: 100%"
              v-model:value="formState.successionTeamId"
              @change="successionTeamChange"
              placeholder="请选择"
              :disabled="readonly"
              :options="teamOptions"
            >
            </a-select>
          </a-form-item>
        </a-col>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="生产（维修）情况（包括原料供应、产品品种规格、重量、质量等）"
              :name="['handoverContent', 'production']"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-textarea
                placeholder="请输入"
                style="width: 100%"
                :disabled="readonly"
                v-model:value="formState.handoverContent.production"
                :maxLength="200"
                :auto-size="{ minRows: 2, maxRows: 5 }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              label="技术操作、设备运转（点检）等情况"
              :name="['handoverContent', 'operation']"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-textarea
                placeholder="请输入"
                style="width: 100%"
                :disabled="readonly"
                v-model:value="formState.handoverContent.operation"
                :maxLength="200"
                :auto-size="{ minRows: 2, maxRows: 5 }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="安全生产情况" :name="['handoverContent', 'safety']" :rules="[{ required: true, message: '请选择' }]">
              <a-textarea
                placeholder="请输入"
                style="width: 100%"
                :disabled="readonly"
                v-model:value="formState.handoverContent.safety"
                :maxLength="200"
                :auto-size="{ minRows: 2, maxRows: 5 }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="文明生产、工具交接情况" :name="['handoverContent', 'cleanliness']" :rules="[{ required: true, message: '请选择' }]">
              <a-textarea
                placeholder="请输入"
                style="width: 100%"
                :disabled="readonly"
                v-model:value="formState.handoverContent.cleanliness"
                :maxLength="200"
                :auto-size="{ minRows: 2, maxRows: 5 }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="上级领导指示" :name="['handoverContent', 'leaderInstruction']" :rules="[{ required: true, message: '请选择' }]">
              <a-textarea
                placeholder="请输入"
                style="width: 100%"
                :disabled="readonly"
                v-model:value="formState.handoverContent.leaderInstruction"
                :maxLength="200"
                :auto-size="{ minRows: 2, maxRows: 5 }"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <div class="title">签字确认</div>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="交班人签字" name="shiftsUserSign" :rules="[{ required: true, message: '请选择' }]">
              <template v-if="!formState.shiftsUserSign">
                <template v-if="title == '交班'">
                  <a-button v-if="!userInfo.signature" :disabled="readonly" type="primary" @click="signClick(1)">签字</a-button>
                  <a-image v-else :width="200" :src="getFileAccessHttpUrl(userInfo.signature)" />
                </template>
                <template v-else>
                  <a-button :disabled="true" type="primary">签字</a-button>
                </template>
              </template>
              <div v-else class="sign-img">
                <!-- <CloseOutlined v-if="!readonly" style="color: #ff4d4f" class="icon-i" @click="removeSign(1)" /> -->
                <a-image :width="200" :src="getFileAccessHttpUrl(formState.shiftsUserSign)" />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="接班人签字" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
              <template v-if="!formState.successionUserSign">
                <template v-if="title == '接班'">
                  <a-button v-if="!userInfo.signature" :disabled="readonly" type="primary" @click="signClick(2)">签字</a-button>
                  <a-image v-else :width="200" :src="getFileAccessHttpUrl(userInfo.signature)" />
                </template>
                <template v-else>
                  <a-button :disabled="true" type="primary">签字</a-button>
                </template>
              </template>
              <div v-else class="sign-img">
                <!-- <CloseOutlined v-if="!readonly" style="color: #ff4d4f" class="icon-i" @click="removeSign(2)" /> -->
                <a-image :width="200" :src="getFileAccessHttpUrl(formState.successionUserSign)" />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="领导签字" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
              <template v-if="!formState.leadersSign">
                <template v-if="title == '签字'">
                  <a-button v-if="!userInfo.signature" :disabled="readonly" type="primary" @click="signClick(3)">签字</a-button>
                  <a-image v-else :width="200" :src="getFileAccessHttpUrl(userInfo.signature)" />
                </template>
                <template v-else>
                  <a-button :disabled="true" type="primary">签字</a-button>
                </template>
              </template>
              <div v-else class="sign-img">
                <!-- <CloseOutlined v-if="!readonly" style="color: #ff4d4f" class="icon-i" @click="removeSign(3)" /> -->
                <a-image :width="200" :src="getFileAccessHttpUrl(formState.leadersSign)" />
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div class="footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <template v-if="title != '详情'">
            <a-button v-if="title == '签字'" :loading="submitIng" type="primary" @click="handleSubmit">确认签字</a-button>
            <a-button v-else :loading="submitIng" type="primary" @click="handleSubmit">确认{{ title }}</a-button>
          </template>
        </a-space>
      </div>
    </div>
    <my-model @register="registerMyModal" @confirm="signConfrim" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { getTeam, handoverInfo, handoverSubmit, successorSign, leLeadersSign } from './api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { FormInstance } from 'ant-design-vue/es/form';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import MyModel from './MyModel.vue';
  import { ref, reactive } from 'vue';
  import { Image } from 'ant-design-vue'
  const AImage = Image;

  const $message = useMessage();
  const userStore = useUserStore();
  const userInfo: any = userStore.getUserInfo;
  const readonly = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const title = ref('新增');
  const departList = ref<any[]>([]);
  const formState = reactive({
    id: '',
    teamId: '',
    teamName: '',
    sign: undefined,
    successionTeamId: undefined,
    successionTeamName: '',
    shiftsUserSign: '',
    successionUserSign: undefined,
    leadersSign: undefined,
    handoverContent: {
      production: '',
      operation: '',
      safety: '',
      cleanliness: '',
      leaderInstruction: '',
    },
  });

  const [registerMyModal, { openModal: openMyModal, closeModal: closeMyModal }] = useModal();

  const emits = defineEmits(['submitSuccess']);
  const teamOptions = ref<any[]>([]);
  const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
    title.value = data.title;
    readonly.value = false;
    departList.value = await getDepart3ListWithSecurity();
    getTeam({
      orgCode: data.record.orgCode,
      workShopCode: data.record.workshop,
    }).then((res) => {
      teamOptions.value = res.map((item) => {
        return {
          label: item.sectionName,
          value: item.id,
        };
      });
    });
    if (['详情', '接班', '签字'].includes(title.value)) {
      handoverInfo({ id: data.record.id }).then((res) => {
        Object.assign(formState, res);
        if(userInfo.signature) {
          formState.sign = userInfo.signature;
          if(title.value == '接班') {
            formState.successionUserSign = userInfo.signature;
          }
          if(title.value == '签字') {
            formState.leadersSign = userInfo.signature;
          }
        }
      });
      readonly.value = true;
      return;
    }
    Object.assign(formState, data.record);
    formState.sign = userInfo.signature;
    if(title.value == '交班' && userInfo.signature) {
      formState.shiftsUserSign = userInfo.signature;
      formState.successionTeamId = userInfo.workSection;
    }
  });

  const successionTeamChange = async (value, o) => {
    formState.successionTeamName = o.label;
  };

  const handleCancel = () => {
    closeDrawer();
    formRef.value?.resetFields();
  };

  const submitIng = ref(false);
  const handleSubmit = (type) => {
    const params = JSON.parse(JSON.stringify(formState));
    console.log(params);
    formRef.value
      ?.validate()
      .then(() => {
        if (title.value == '交班') {
          submitIng.value = true;
          handoverSubmit(params)
            .then((res) => {
              emits('submitSuccess', res);
              closeDrawer();
              formRef.value?.resetFields();
            })
            .finally(() => {
              setTimeout(() => {
                submitIng.value = false;
              }, 500);
            });
          return;
        }
        if (!params.sign) {
          $message.createMessage.warn('请签名');
          return;
        }
        submitIng.value = true;
        if (title.value == '接班') {
          successorSign({
            id: params.id,
            sign: params.successionUserSign,
          })
            .then((res) => {
              emits('submitSuccess', res);
              closeDrawer();
              formRef.value?.resetFields();
            })
            .finally(() => {
              setTimeout(() => {
                submitIng.value = false;
              }, 500);
            });
        }
        if (title.value == '签字') {
          leLeadersSign({
            id: params.id,
            sign: params.leadersSign,
          })
            .then((res) => {
              emits('submitSuccess', res);
              closeDrawer();
              formRef.value?.resetFields();
            })
            .finally(() => {
              setTimeout(() => {
                submitIng.value = false;
              }, 500);
            });
        }
      })
      .catch(() => {
        submitIng.value = false;
      });
  };

  const signClick = (type) => {
    openMyModal(true);
  };
  const signConfrim = (data) => {
    if (title.value == '交班') {
      formState.shiftsUserSign = data.sign;
    }
    if (title.value == '接班') {
      formState.successionUserSign = data.sign;
    }
    if (title.value == '签字') {
      formState.leadersSign = data.sign;
    }
    formState.sign = data.sign;
  };
  const removeSign = (type) => {
    if (type == '1') {
      formState.shiftsUserSign = '';
    }
    if (type == '2') {
      formState.successionUserSign = undefined;
    }
    if (type == '3') {
      formState.leadersSign = undefined;
    }
    formState.sign = undefined;
  }

  const close = () => {
    formRef.value?.resetFields();
    closeDrawer();
  };
</script>
<style lang="less" scoped>
  .title {
    font-size: 16px;
    font-weight: 600;
    padding: 16px 0;
  }
  .sign-img {
    height: 200px;
    width: 200px;
    position: relative;
    .icon-i{
      position: absolute;
      right: -6px;
      top: -6px;
    }
  }
  .d-inner {
    width: 100%;
    height: 100%;
    padding-bottom: 55px;
    .d-form {
      flex: 1;
    }
  }
  .footer {
    background-color: #ffffff;
    width: 100%;
    height: 55px;
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    // 盒子顶部阴影
    box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.09);
  }
</style>
