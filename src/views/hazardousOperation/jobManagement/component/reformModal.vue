<template>
  <BasicModal
    v-bind="$attrs"
    width="780px"
    :z-index="100"
    :mask="false"
    @register="registerModal"
    style="top: 550px; right: -150px"
    @cancel="cancel"
    :maskClosable="false"
    @ok="handleSubmit"
    :title="title"
    :loading="loading"
    :confirmLoading="confirmLoading"
  >
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane forceRender v-for="(item, idx) in recordList" :key="idx" :tab="'第' + (idx + 1) + '条'">
        <div class="tabbody">
          <a-form :model="item.reformFormData" ref="formRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
            <template v-if="title == '整改确认'">
              <a-form-item
                name="result"
                label="检查结果"
                required
                :rules="{
                  required: true,
                  message: '请选择',
                }"
              >
                <a-radio-group style="padding-left: 10px" v-model:value="item.reformFormData.result">
                  <a-radio value="1">合格</a-radio>
                  <a-radio value="2">不合格</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                v-if="item.reformFormData.result == 2"
                label="不合格描述"
                name="desc"
                :colon="false"
                required
                :rules="{
                  required: true,
                  message: '请输入',
                }"
              >
                <a-input :maxlength="200" v-model:value="item.reformFormData.desc" placeholder="请输入" />
              </a-form-item>
            </template>
            <template v-if="title == '去整改'">
              <a-form-item
                label="整改措施"
                name="result"
                :colon="false"
                required
                :rules="{
                  required: true,
                  message: '请输入',
                }"
              >
                <a-input :maxlength="200" v-model:value="item.reformFormData.result" placeholder="请输入" />
              </a-form-item>
              <a-form-item
                label="整改后照片"
                name="imgUrl"
                required
                :rules="{
                  required: true,
                  message: '请上传',
                }"
              >
                <JImageUpload v-model:value="item.reformFormData.imgUrl" :isYhWatermark="true" :fileMax="10" text="" bizPath="hiddenTrouble" />
              </a-form-item>
            </template>
          </a-form>
          <div class="info">
            <div class="tit">整改记录</div>
            <template v-for="citem in item.reformList">
              <p>{{ citem.head }} {{ citem.reformTime }}</p>
              <p
                >整改措施：<span style="color: #ff4d4f">{{ citem.result }}</span>
              </p>
              <p
                >整改后照片：
                <JImageUpload v-model:value="citem.imgUrl" :disabled="true" text="" bizPath="hiddenTrouble" />
              </p>
              <p v-if="citem.confirmDesc"
                >不合格描述：<span style="color: #ff4d4f">{{ citem.confirmDesc }}</span>
              </p>
            </template>
            <div class="tit">安全作业检查</div>
            <p>{{ item.head }} {{ item.checkTime }}</p>
            <p
              >检查结果：<span style="color: #ff4d4f">{{ item.result }}</span>
            </p>
            <p
              >检查描述：<span>{{ item.remark }}</span>
            </p>
            <p
            >隐患类别：<span>{{ item.yhlb }}</span>
            </p>
            <p>检查照片：</p>
            <CheckImgView :record="item" />
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script setup lang="ts">
  import { workCheckList, workCheck, workCheckconfirm } from '../../api';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { JImageUpload } from '/@/components/Form';
  import CheckImgView from '../../components/CheckImgView.vue';
  import { message } from 'ant-design-vue';
  import { ref } from 'vue';
  const activeKey = ref<number>(0);
  const confirmLoading = ref<boolean>(false);
  const reformFormData = ref({ result: '', imgUrl: '', id: '' });
  const recordList = ref<any[]>([]);
  const curItem = ref({});
  const [registerModal, { closeModal }] = useModalInner((data) => {
    data.type == 1 ? (title.value = '去整改') : (title.value = '整改确认');
    curItem.value = data;
    confirmLoading.value = false;
    reformFormData.value.id = data.id;
    getList(data);
  });
  const loading = ref<boolean>(false);
  const formRef = ref<any>();
  const title = ref<string>('去整改');
  const getList = (data) => {
    loading.value = true;
    recordList.value = [];
    workCheckList({
      type: data.type,
      id: data.id,
    }).then((res) => {
      loading.value = false;
      res.forEach((item, idx) => {
        item.reformFormData = { result: '', imgUrl: '', id: item.id, desc: '' };
      });
      recordList.value = res;
    });
  };
  const emit = defineEmits(['success', 'cancle']);
  const handleSubmit = async () => {
    if (recordList.value.length == 0) {
      return;
    }
    confirmLoading.value = true;
    let promiseAll: any = [];
    formRef.value.forEach((item, idx) => {
      promiseAll.push(item.validate());
    });
    Promise.all(promiseAll)
      .then((res) => {
        const isReform = title.value == '去整改';
        const arr = recordList.value.map((item: any) => {
          const { id, result, desc, imgUrl } = item.reformFormData;
          // 整改确认只填结果和描述，不传照片
          if (!isReform) return { id, result, desc };
          return { id, result, imgUrl };
        });
        if (isReform) {
          workCheck(arr)
            .then((res) => {
              confirmLoading.value = false;
              getList(curItem.value);
              formRef.value[activeKey.value].resetFields();
              activeKey.value = 0; // 重置选项卡
              closeModal();
              emit('success');
            })
            .catch((err) => {
              confirmLoading.value = false;
            });
        } else {
          workCheckconfirm(arr)
            .then((res) => {
              confirmLoading.value = false;
              getList(curItem.value);
              formRef.value[activeKey.value].resetFields();
              activeKey.value = 0; // 重置选项卡
              closeModal();
              emit('success');
            })
            .catch((err) => {
              confirmLoading.value = false;
            });
        }
      })
      .catch((err) => {
        console.log(err);
        message.warning('请填写必填项!');
        confirmLoading.value = false;
      });
  };
  const cancel = () => {
    formRef.value.resetFields();
    emit('cancle');
  };
</script>

<style lang="less" scoped>
  .tit {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .info {
    p {
      padding-left: 20px;
    }
  }
  .tabbody {
    height: 500px;
    overflow: auto;
  }
</style>
