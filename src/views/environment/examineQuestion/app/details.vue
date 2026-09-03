<template>
  <a-card>
    <a-form :model="info" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
      <div>
        <p style="color: #1890ff">基本信息</p>
        <a-form-item label="所属机构">
          <a-input v-model:value="info.subsidiaryName" disabled />
        </a-form-item>
        <a-form-item label="检查部位">
          <a-textarea auto-size v-model:value="info.checkSite" disabled />
        </a-form-item>
        <a-form-item label="问题描述">
          <a-textarea auto-size v-model:value="info.description" disabled />
        </a-form-item>
        <a-form-item label="问题照片">
          <div v-if="info.image">
            <j-image-upload disabled v-model:value="info.image" />
          </div>
          <div v-else style="color: rgba(0, 0, 0, 0.3); line-height: 32px">无</div>
        </a-form-item>
        <a-form-item label="整改期限">
          <a-input v-model:value="info.reviseDate" disabled />
        </a-form-item>
        <a-form-item label="整改责任部门">
          <a-input v-model:value="info.dutyDepart" disabled />
        </a-form-item>
        <a-form-item label="责任人">
          <a-input v-model:value="info.dutyPerson" disabled />
        </a-form-item>
      </div>
      <div v-for="(item, index) in info.jnEnvironmentalProblemChecklistRecordVos" :key="index">
        <div v-if="item.rectFeedback">
          <p style="color: #1890ff; margin-top: 10px">整改记录</p>
          <a-form-item label="整改结果">
            <a-radio v-model:checked="item.rectResult" disabled>{{ item.rectResult === '0' ? '整改中' : '整改完成' }}</a-radio>
          </a-form-item>
          <a-form-item label="整改反馈">
            <a-textarea v-model:value="item.rectFeedback" auto-size disabled />
          </a-form-item>
          <a-form-item label="整改照片">
            <div v-if="item.rectImage">
              <j-image-upload disabled v-model:value="item.rectImage" />
            </div>
            <div v-else style="color: rgba(0, 0, 0, 0.3); line-height: 32px">无</div>
          </a-form-item>
          <div v-if="item.reviewResult && item.reviewDetail">
            <p style="color: #1890ff; margin-top: 10px">问题复查</p>
            <a-form-item label="复查结果">
              <a-radio v-model:checked="item.reviewResult" disabled>{{ item.reviewResult === '0' ? '通过' : '不通过' }}</a-radio>
            </a-form-item>
            <a-form-item label="复查说明">
              <a-textarea v-model:value="item.reviewDetail" auto-size disabled />
            </a-form-item>
            <a-form-item label="复查照片">
              <div v-if="item.reviewImage">
                <j-image-upload disabled v-model:value="item.reviewImage" />
              </div>
              <div v-else style="color: rgba(0, 0, 0, 0.3); line-height: 32px">无</div>
            </a-form-item>
          </div>
        </div>
      </div>
    </a-form>
    <div class="footer">
      <a-button style="width: 120px" @click="handleClose">取消</a-button>
    </div>
  </a-card>
</template>
<script lang="ts" name="app-examineQuestion-details" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { JImageUpload } from '/@/components/Form';
  import { queryById } from '../url/index';
  import { ref, onMounted } from 'vue';
  const route = useRoute();
  const router = useRouter();
  const info = ref<any>({});
  onMounted(() => {
    queryById({ id: route.query.id }).then((res) => {
      info.value = res;
    });
  });
  const handleClose = () => {
    router.push({
      path: '/app/examineQuestion/list',
    });
  };
</script>
<style lang="less" scoped>
  .footer {
    margin: 10px 30px;
    text-align: center;
  }
  .ant-card-bordered {
    border: none;
  }
</style>
