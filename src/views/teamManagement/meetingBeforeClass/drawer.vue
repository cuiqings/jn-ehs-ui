<template>
  <BasicDrawer
    :show-footer="showFooter"
    :show-ok-btn="false"
    :title="title"
    :width="1000"
    destroyOnClose
    v-bind="$attrs"
    @register="registerDrawer"
  >
    <a-form ref="infoForm" :label-col="{ span: 4 }" :model="info" :wrapper-col="{ span: 20 }">
      <div class="nav"> 基本信息</div>
      <a-row :gutter="24">
        <a-col :span="24" class="gutter-row">
          <a-form-item label="所属单位" name="orgName">
            <a-input v-model:value="info.orgName" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="24" class="gutter-row">
          <a-form-item label="所属车间" name="departName">
            <a-input v-model:value="info.departName" disabled />
          </a-form-item>
        </a-col>
        <template v-if="isTeamData">
          <a-col :span="24" class="gutter-row">
            <a-form-item label="班组名称" name="teamName">
              <a-input v-model:value="info.teamName" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24" class="gutter-row">
            <a-form-item label="上班方式" name="workType">
              <a-input :value="info.workType === '1' ? '三班倒' : info.workType === '2' ? '两班倒' : info.workType === '3' ? '长白班' : ''" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24" class="gutter-row">
            <a-form-item :rules="[{ required: showOkBtn, message: '请选择班次!' }]" label="班次" name="teamOrder">
              <a-select v-model:value="info.teamOrder" :disabled="!showOkBtn" :options="teamOrderOption" placeholder="请选择" />
            </a-form-item>
          </a-col>
        </template>
        <a-col :span="24" class="gutter-row">
          <a-form-item :rules="[{ required: showOkBtn, message: '请输入应到人数!' }]" label="应到人数" name="expectedNumber">
            <a-input-number
              v-model:value="info.expectedNumber"
              :controls="false"
              :disabled="!showOkBtn"
              :min="0"
              :precision="0"
              placeholder="请输入"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24" class="gutter-row">
          <a-form-item :rules="[{ required: showOkBtn, message: '请输实到人数!' }]" label="实到人数" name="actualNumber">
            <a-input-number
              v-model:value="info.actualNumber"
              :controls="false"
              :disabled="!showOkBtn"
              :min="0"
              :precision="0"
              placeholder="请输入"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="!isTeamData" :span="24" class="gutter-row">
          <a-form-item :rules="[{ required: showOkBtn, message: '请选择参加人员!' }]" label="参加人员" name="joinPerson">
            <JUserModal
              v-model:value="info.joinPerson"
              :disabled="!showOkBtn"
              :orgCode="info.depart"
              type="checkbox"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24" class="gutter-row">
          <a-form-item label="请假人员" name="leavePerson">
            <JUserModal
              v-model:value="info.leavePerson"
              :disabled="!showOkBtn"
              :orgCode="info.depart"
              type="checkbox"
              @confirm="confirmLeavePersonName"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24" class="gutter-row">
          <a-form-item label="班前会时间" name="preShiftTime">
            <a-input v-model:value="info.preShiftTime" disabled />
          </a-form-item>
        </a-col>
        <template v-if="isTeamData">
          <a-col :span="24" class="gutter-row">
            <a-form-item label="临时互保对子" name="userId">
              <div v-for="(item, index) in info.pairsList" :key="index" class="info-list" style="margin-bottom: 10px">
                <div v-if="type === 'edit'" style="display: flex; align-items: center">
                  <JUserModal
                    v-model:value="item.userId"
                    :orgCode="info.depart"
                    :userStyle="{ width: '700px' }"
                    type="checkbox"
                    @confirm="(name, userName) => userConfirm(name, userName, index)"
                    @click-user="(cb) => handleUserIds(cb)"
                  />
                  <span style="color: #4498f0; margin-left: 20px; cursor: pointer" @click="add(index)">添加</span>
                  <span v-if="info.pairsList.length > 1" style="color: red; margin-left: 20px; cursor: pointer" @click="remove(index)">删除</span>
                </div>
                <div v-else style="margin-top: 6px">
                  {{ item.userName.replace(/,/g, '\u00A0\u00A0\u00A0↔\u00A0\u00A0\u00A0') }}
                </div>
              </div>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
      <template v-if="isTeamData">
        <div class="nav"> 班前会记录</div>
        <div class="nav" style="margin-left: 20px; font-size: 15px"> 班前准备</div>
        <a-table :columns="columns" :data-source="info.dataSource" :pagination="false" bordered>
          <template #jl="{ record }">
            <div>
              <div style="text-align: left; margin-bottom: 10px">
                准备状态：
                <a-radio-group v-model:value="record.status" :disabled="!showOkBtn">
                  <a-radio value="1">准备好</a-radio>
                  <a-radio value="2">未准备好</a-radio>
                </a-radio-group>
              </div>
              <div style="display: flex; align-items: center">
                <span style="width: 118px">说明（必填）：</span>
                <InputTextArea v-model:value="record.illustrate" :disabled="!showOkBtn" auto-size placeholder="请输入" />
              </div>
            </div>
          </template>
        </a-table>
      </template>
      <div class="nav" style="margin: 15px 0 15px 20px; font-size: 15px"> 流程记录</div>
      <a-table :columns="columns1" :data-source="displayDataSource1" :pagination="false" bordered>
        <template #standard="{ record }">
          <div v-html="record.standard"></div>
        </template>
        <template #jl="{ record }">
          <div v-if="record.rowKey !== '5'">
            <VideoOrImgUpload v-model:value="record.file" :disabled="!showOkBtn" style="text-align: left" :text="record.rowKey === '7' ? '上传图片' : '上传（必填）'" />
            <div style="display: flex; align-items: center">
              <span style="width: 118px">{{ record.rowKey === '7' ? '会议纪要（必填）：' : '说明（必填）：' }}</span>
              <InputTextArea v-model:value="record.illustrate" :disabled="!showOkBtn" auto-size placeholder="请输入" />
            </div>
          </div>
          <div v-else>
            <div>
              <div class="nav" style="font-size: 14px; text-align: left; margin-left: 0"> 手指口述</div>
              <VideoOrImgUpload v-model:value="record.file1" :disabled="!showOkBtn" style="text-align: left" text="上传（必填）" />
              <div style="display: flex; align-items: center">
                <span style="width: 118px">说明（必填）：</span>
                <InputTextArea v-model:value="record.illustrate1" :disabled="!showOkBtn" auto-size placeholder="请输入" />
              </div>
            </div>
            <div>
              <div class="nav" style="font-size: 14px; text-align: left; margin-left: 0; margin-top: 10px"> 吓一跳</div>
              <VideoOrImgUpload v-model:value="record.file2" :disabled="!showOkBtn" style="text-align: left" text="上传（必填）" />
              <div style="display: flex; align-items: center">
                <span style="width: 118px">说明（必填）：</span>
                <InputTextArea v-model:value="record.illustrate2" :disabled="!showOkBtn" auto-size placeholder="请输入" />
              </div>
            </div>
            <div>
              <div class="nav" style="font-size: 14px; text-align: left; margin-left: 0; margin-top: 10px"> 一口清</div>
              <VideoOrImgUpload v-model:value="record.file3" :disabled="!showOkBtn" style="text-align: left" text="上传（必填）" />
              <div style="display: flex; align-items: center">
                <span style="width: 118px">说明（必填）：</span>
                <InputTextArea v-model:value="record.illustrate3" :disabled="!showOkBtn" auto-size placeholder="请输入" />
              </div>
            </div>
            <div>
              <div class="nav" style="font-size: 14px; text-align: left; margin-left: 0; margin-top: 10px"> 安全分享 </div>
              <VideoOrImgUpload v-model:value="record.file4" :disabled="!showOkBtn" style="text-align: left" text="上传（必填）" />
              <div style="display: flex; align-items: center">
                <span style="width: 118px">说明（必填）：</span>
                <InputTextArea v-model:value="record.illustrate4" :disabled="!showOkBtn" auto-size placeholder="请输入" />
              </div>
            </div>
          </div>
        </template>
      </a-table>
      <template v-if="info.bzkTime">
        <div class="nav" style="margin: 15px 0 15px 20px; font-size: 15px"> 本次不召开</div>
        <a-row :gutter="24" style="padding: 0 20px">
          <a-col :span="24">
            <a-form-item label="原因">
              <span>{{ info.bzkReason }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="当班工作及安全措施">
              <span>{{ info.bzkMsr }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="照片">
              <VideoOrImgUpload v-model:value="info.bzkPicture" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="提交时间">
              <span>{{ info.bzkTime }}</span>
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </a-form>
    <template #footer>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <a-button v-if="isTeamData && showOkBtn" type="primary" danger @click="handleBzkOpen">本次不召开</a-button>
        <span v-else></span>
        <div>
          <a-button @click="closeDrawer">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" style="margin-left: 8px" @click="handleSubmit">提交</a-button>
        </div>
      </div>
    </template>
  </BasicDrawer>
  <a-modal v-model:visible="bzkVisible" title="本次不召开" :width="650" :confirm-loading="bzkLoading" @ok="handleBzkSubmit">
    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" style="padding-top: 16px">
      <a-form-item label="班次" required>
        <a-select v-model:value="bzkForm.teamOrder" :options="teamOrderOption" placeholder="请选择班次" />
      </a-form-item>
      <a-form-item label="原因" required>
        <a-textarea v-model:value="bzkForm.bzkReason" :rows="3" placeholder="请输入原因" />
      </a-form-item>
      <a-form-item label="当班工作及安全措施" required>
        <a-textarea v-model:value="bzkForm.bzkMsr" :rows="3" placeholder="请输入当班工作及安全措施" />
      </a-form-item>
      <a-form-item label="上传照片">
        <VideoOrImgUpload v-model:value="bzkForm.bzkPicture" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import { ref } from 'vue';
  import useDrawer from './hooks/useDrawer';
  import { JUserModal } from '/@/components/Form';
  import { Input } from 'ant-design-vue';
  import VideoOrImgUpload from './VideoOrImgUpload.vue';

  const InputTextArea = Input.TextArea;
  const emit = defineEmits(['success']);
  const infoForm = ref();
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
    columns,
    columns1,
    confirmLeavePersonName,
    teamOrderOption,
    isTeamData,
    displayDataSource1,
    bzkVisible,
    bzkForm,
    bzkLoading,
    handleBzkOpen,
    handleBzkSubmit,
    closeDrawer,
  } = useDrawer(emit, infoForm);
</script>
<style lang="less" scoped>
  .info-list:last-child {
    margin-bottom: 0 !important;
  }

  .nav {
    color: #1890ff;
    margin-bottom: 10px;
    margin-left: 20px;
    font-size: 16px;
  }

  :deep(.ant-upload),
  :deep(.ant-upload-list-item),
  :deep(.ant-upload-list-picture-card-container) {
    height: 100px;
    width: 100px;
  }
</style>
