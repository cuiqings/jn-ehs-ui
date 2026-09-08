<template>
  <div class="permission-transfer">
    <van-tabs v-model:active="activeTab" sticky color="#1989fa">
      <!-- Tab 1: 新建转交 -->
      <van-tab title="新建转交">
        <div class="tab-body">
          <!-- 选择接收人员 -->
          <div class="form-block">
            <div class="block-label required">选择接收人员</div>
            <van-field
              v-model="form.recipientName"
              readonly
              clickable
              name="picker"
              placeholder="请选择接收人员"
              right-icon="arrow"
              @click="showUserPicker = true"
              class="field-border"
            />
          </div>

          <!-- 选择角色 -->
          <div class="form-block">
            <div class="block-label required">选择角色</div>
            <van-checkbox-group v-model="form.selectedRoles">
              <van-cell-group :border="false">
                <van-cell
                  v-for="(role, index) in myRoles"
                  :key="role.roleCode"
                  clickable
                  :title="role.roleName"
                  @click="toggleRole(role)"
                  class="role-cell"
                >
                  <template #icon>
                    <van-checkbox :name="role.roleCode" ref="checkboxes" :disabled="role.disabled" style="margin-right: 8px" />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-checkbox-group>
            <div v-if="myRoles.length === 0" class="empty-roles">当前无可用角色</div>
          </div>

          <!-- 转交结束日期 -->
          <div class="form-block">
            <div class="block-label required">转交结束日期</div>
            <van-field
              v-model="form.endDate"
              readonly
              clickable
              name="calendar"
              placeholder="年 / 月 / 日"
              right-icon="calendar-o"
              @click="showCalendar = true"
              class="field-border"
            />
            <van-calendar v-model:show="showCalendar" :min-date="minDate" @confirm="onConfirmDate" color="#1989fa" />
          </div>

          <!-- 转交原因 -->
          <div class="form-block">
            <div class="block-label required">转交原因</div>
            <van-field
              v-model="form.remark"
              type="textarea"
              rows="3"
              autosize
              placeholder="请输入转交原因"
              class="field-border"
              :maxlength="200"
              show-word-limit
            />
          </div>

          <!-- 证明材料 -->
          <div class="form-block" style="margin-bottom: 80px">
            <div class="block-label">证明材料</div>
            <AppUpload v-model:fileList="form.annexStr" />
          </div>

          <!-- 底部按钮 -->
          <div class="footer-btns">
            <van-button style="margin-right: 10px" block plain @click="resetForm">取消</van-button>
            <van-button block type="primary" color="#1989fa" @click="onSubmit">确认转交</van-button>
          </div>
        </div>
      </van-tab>

      <!-- Tab 2: 转交历史 -->
      <van-tab title="转交历史">
        <div class="tab-body">
          <van-list v-model:loading="loadingHistory" :finished="historyFinished" finished-text="没有更多了" @load="onLoadHistory">
            <div v-for="item in historyList" :key="item.id" class="history-card">
              <div class="history-card__header">
                <div class="history-card__name">转交给 {{ item.receiverName }}</div>
                <van-tag :type="getStatusType(item.status)" size="medium">{{ getStatusText(item.status) }}</van-tag>
              </div>

              <div class="history-card__info"> 工号：{{ item.receiverWorkNo }} | {{ item.receiverOrgName }} </div>

              <div class="history-card__info"> 转交时间：{{ item.assignTime.slice(0, 10) }} 至 {{ item.endTime.split(' ')[0] }} </div>

              <div class="history-card__roles">
                <span v-for="role in item.roleName.split(',')" :key="role" class="role-tag">
                  {{ role }}
                </span>
              </div>

              <!-- 撤销按钮 -->
              <div v-if="item.status === '1'" style="margin-top: 8px">
                <van-button plain type="danger" size="small" @click="onRevoke(item)">撤销转交</van-button>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 人员选择组件 -->
    <UserPicker v-model:show="showUserPicker" @select="onUserSelected" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { showConfirmDialog, showToast, showSuccessToast } from 'vant';
  import { useUserStore } from '/@/store/modules/user';
  import UserPicker from './components/UserPicker.vue';
  import AppUpload from '/@/views/app/components/AppUpload.vue';
  import { getTransferList, addTransfer, revokeTransfer, getUserRoleList } from './api';
  import dayjs from 'dayjs';

  const userStore = useUserStore();
  const activeTab = ref(0);

  // --- Tab 1: 新建转交 ---
  const showUserPicker = ref(false);
  const showCalendar = ref(false);
  const minDate = new Date();
  const myRoles = ref<any[]>([]);

  const form = reactive({
    receiver: '',
    recipientName: '',
    recipientObj: null as any,
    selectedRoles: [] as string[],
    endDate: '',
    remark: '',
    annexStr: '',
  });

  const recipientExistingRoles = ref<string[]>([]);

  function getMyRoles() {
    getUserRoleList({ userId: userStore.getUserInfo?.id }).then((res) => {
      myRoles.value = res || [];
    });
  }
  getMyRoles();

  const resetForm = () => {
    form.receiver = '';
    form.recipientName = '';
    form.recipientObj = null;
    form.selectedRoles = [];
    form.endDate = '';
    form.remark = '';
    form.annexStr = '';
    recipientExistingRoles.value = [];
  };

  const onUserSelected = async (user: any) => {
    form.receiver = user.id;
    form.recipientName = user.realname;
    form.recipientObj = user;
    await getUserRoleList({ userId: user.id }).then((res) => {
      recipientExistingRoles.value = res || [];
    });
    if (recipientExistingRoles.value.length === 0) return;
    const recipientExistingRoleCodes: string[] = recipientExistingRoles.value.map((role: any) => role.roleCode);
    myRoles.value = myRoles.value.map((role: any) => {
      role.disabled = recipientExistingRoleCodes.includes(role.roleCode);
      return role;
    });
  };

  const toggleRole = (role: any) => {
    if (role.disabled) return;
    const index = form.selectedRoles.indexOf(role.roleCode);
    if (index !== -1) {
      form.selectedRoles.splice(index, 1);
    } else {
      form.selectedRoles.push(role.roleCode);
    }
  };

  const onConfirmDate = (date: Date) => {
    form.endDate = dayjs(date).format('YYYY-MM-DD');
    showCalendar.value = false;
  };

  const onSubmit = () => {
    if (!form.receiver) { showToast('请选择接收人员'); return; }
    if (form.selectedRoles.length === 0) { showToast('请选择角色'); return; }
    if (!form.endDate) { showToast('请选择转交结束日期'); return; }
    if (!form.remark) { showToast('请输入转交原因'); return; }

    const selectedRoleNames = myRoles.value
      .filter((r: any) => form.selectedRoles.includes(r.roleCode))
      .map((r: any) => r.roleName)
      .join(',');
    const selectedRoleCodes = myRoles.value
      .filter((r: any) => form.selectedRoles.includes(r.roleCode))
      .map((r: any) => r.roleCode)
      .join(',');

    showConfirmDialog({
      title: '确认转交',
      message: `确定将${form.recipientName}赋予${selectedRoleNames}角色？确认后，在结束日期前，该员工将具备相应权限`,
    })
      .then(async () => {
        try {
          await addTransfer({
            receiver: form.receiver,
            roleCode: selectedRoleCodes,
            endTime: form.endDate,
            remark: form.remark,
            annex: form.annexStr || '',
          });
          showSuccessToast('转交成功');
          resetForm();
          onRefreshHistory();
          activeTab.value = 1;
        } catch (error) {
          console.error(error);
        }
      })
      .catch(() => {});
  };

  // --- Tab 2: 转交历史 ---
  const loadingHistory = ref(false);
  const historyFinished = ref(false);
  const historyList = ref<any[]>([]);
  const historyPage = ref(1);

  const onLoadHistory = async () => {
    loadingHistory.value = true;
    try {
      const res = await getTransferList({ pageNo: historyPage.value, pageSize: 10 });
      const records = res?.records || [];
      if (historyPage.value === 1) {
        historyList.value = records;
      } else {
        historyList.value = [...historyList.value, ...records];
      }
      if (records.length < 10) historyFinished.value = true;
      historyPage.value++;
    } catch (error) {
      historyFinished.value = true;
    } finally {
      loadingHistory.value = false;
    }
  };

  const onRefreshHistory = () => {
    historyPage.value = 1;
    historyFinished.value = false;
    historyList.value = [];
    onLoadHistory();
  };

  const getStatusText = (status: any) => {
    if (status === '1') return '进行中';
    if (status === '2') return '已完成';
    if (status === '3') return '已撤销';
  };

  const getStatusType = (status: any) => {
    if (status === '3') return 'default';
    if (status === '2') return 'success';
    return 'primary';
  };

  const onRevoke = (item: any) => {
    showConfirmDialog({ title: '撤销确认', message: '确定要撤销此权限转交吗？' })
      .then(async () => {
        try {
          await revokeTransfer({ id: item.id });
          showSuccessToast('撤销成功');
          onRefreshHistory();
        } catch (error) {
          console.error(error);
        }
      })
      .catch(() => {});
  };

  onMounted(() => {});
</script>

<style scoped lang="less">
.permission-transfer {
  background-color: #f7f8fa;
  min-height: 100vh;

  :deep(.van-field__label) {
    display: none;
  }
}

.tab-body {
  padding: 12px;
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

.form-block {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.block-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;

  &.required::before {
    content: '*';
    color: #ee0a24;
    margin-right: 4px;
  }
}

.field-border {
  border: 1px solid #ebedf0;
  border-radius: 6px;
}

.role-cell {
  margin-bottom: 8px;
  border: 1px solid #ebedf0;
  border-radius: 6px;
}

.empty-roles {
  color: #969799;
  font-size: 12px;
  text-align: center;
  padding: 8px 0;
}

.footer-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  box-sizing: border-box;
}

.history-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  &__name {
    font-weight: 600;
    font-size: 16px;
  }

  &__info {
    color: #969799;
    font-size: 12px;
    margin-bottom: 4px;
  }

  &__roles {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
    margin-top: 6px;
  }
}

.role-tag {
  background: #f2f3f5;
  color: #646566;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
