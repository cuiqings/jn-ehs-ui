<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="800" title="会议详情" :body-style="{ padding: '0 20px' }" destroyOnClose>
    <div>
      <a-form :model="info" ref="infoRef" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" autocomplete="off">
        <div class="item">
          <div class="tit">会议主题</div>
          <div class="content">{{ info.conferenceTheme }}</div>
        </div>
        <div class="item">
          <div class="tit">会议时间</div>
          <div class="content">{{ info.startDate }}~{{ info.endDate }}</div>
        </div>
        <div class="item">
          <div class="tit">会议地点</div>
          <div class="content">{{ info.location }}</div>
        </div>
        <div class="item">
          <div class="tit">组织者</div>
          <div class="content">{{ info.userName }}</div>
        </div>
        <div class="item">
          <div class="tit">参会人员</div>
          <div class="content">
            <template v-for="item in info.userList">  
              <a-tag style="margin-bottom: 5px;" color="green" v-if="item.signTime">{{ item.realname }}({{ item.username }})</a-tag>
              <a-tag style="margin-bottom: 5px;" v-else>{{ item.realname }}({{ item.username }})</a-tag>
            </template>
          </div>
        </div>
        <div class="item">
          <div class="tit">签到统计</div>
          <div class="content">
            {{info.signStatistics}}
          </div>
        </div>
        <a-form-item label="会议附件" name="name">
          <customize-upload disabled v-model:value="info.annex" :max-count="5" />
        </a-form-item>
        <a-form-item label="备注" name="name">{{ info.remark }}</a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="blacklist-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
   import CustomizeUpload from '../component/CustomizeUpload.vue';
  import { queryById } from './url/index';
  import { ref } from 'vue';
  const info: any = ref({
    id: '',
    blackRemark: '',
    blackFlag: '1',
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    queryById({id: data.data.id}).then((res) => { 
      Object.assign(info.value, res);
    });
  });
  const close = () => {
    closeModal();
  };
</script>
<style  lang="less" scoped>
  .tit{
    font-weight: 600;
    padding-top: 10px;
  }
  .item{
    padding-bottom: 10px;
    border-bottom: 1px solid #eaeaea;
  }
  :deep(label){
    font-weight: 600;
  }
</style>
