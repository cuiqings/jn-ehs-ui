<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmit"
    :width="600"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
  >
    <a-form :model="info" ref="infoForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="24">
          <a-form-item label="所属单位" name="organizationName">
            <a-input v-model:value="info.organizationName" disabled />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item label="所属车间" name="workshopName">
            <a-input v-model:value="info.workshopName" disabled />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item label="班组名称" name="sectionName">
            <a-input v-model:value="info.sectionName" disabled />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item label="班组人员" name="teamUserList">
            <div v-show="teamUserList.length > 0" class="team-user-list" ref="scrollContainer" @scroll="handleScroll">
              <div v-for="(item, index) in displayedUserList" :key="`user-${info.id}-${index}`" class="bzUser">
                <p>{{ item.realName }}（{{ item.username }}）</p>
                <span @click="handleCertificate(item)"> {{ render.renderDictText(item.certificationsType, 'pq_certificate_type') }}</span>
              </div>
            </div>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item label="互保对子" name="userId">
            <div class="info-list" v-for="(item, index) in info.pairsList" :key="index" style="margin-bottom: 10px">
              <div v-if="type === 'edit'" style="display: flex; align-items: center">
                <JUserModal
                  :userStyle="{ width: '350px' }"
                  v-model:value="item.userId"
                  type="checkbox"
                  :teamId="info.id"
                  @click-user="(cb) => handleUserIds(cb)"
                  @confirm="(name, userName) => userConfirm(name, userName, index)"
                />
                <span style="color: #4498f0; margin-left: 20px; cursor: pointer" @click="add(index)">添加</span>
                <span v-if="info.pairsList.length > 1" style="color: red; margin-left: 20px; cursor: pointer" @click="remove(index)">删除</span>
              </div>
              <div v-else style="line-height: 32px">
                {{ item.userName.replace(/,/g, '\u00A0\u00A0\u00A0↔\u00A0\u00A0\u00A0') }}
              </div>
            </div>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item label="备注" name="remark">
            <a-textarea v-model:value="info.remark" :rows="3" :disabled="type === 'view'" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </BasicDrawer>
  <certificateDrawer @register="registerCertificateDrawer" />
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import { ref } from 'vue';
  import useDrawer from './hooks/useDrawer';
  import { JUserModal } from '/@/components/Form';
  import certificateDrawer from '../../safetyProductionSystem/certificate/certificateDrawer.vue';
  import { render } from '/@/utils/common/renderUtils';
  const emit = defineEmits(['success']);
  const infoForm = ref();
  const scrollContainer = ref();
  const {
    BasicDrawer,
    registerDrawer,
    title,
    showFooter,
    showOkBtn,
    handleSubmit,
    info,
    add,
    remove,
    handleUserIds,
    userConfirm,
    type,
    registerCertificateDrawer,
    handleCertificate,
    teamUserList,
    displayedUserList,
    handleScroll,
  } = useDrawer(emit, infoForm, scrollContainer);
</script>
<style lang="less" scoped>
  .info-list:last-child {
    margin-bottom: 0 !important;
  }
  .team-user-list {
    max-height: 420px;
    overflow-y: auto;
  }
  .bzUser {
    display: flex;
    p {
      margin-bottom: 0 !important;
      line-height: 32px;
    }
    span {
      cursor: pointer;
      color: #1890ff;
      margin-left: 15px;
      line-height: 32px;
    }
  }
</style>
