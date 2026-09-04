<template>
  <div class="permission-transfer">
    <van-tabs v-model:active="activeTab" sticky color="#1989fa">
      <!-- Tab 1: 新建转交 -->
      <van-tab title="新建转交">
        <div class="p-4 bg-gray-50 min-h-screen">
          <!-- 选择接收人员 -->
          <div class="mb-4 bg-white rounded-lg p-4">
            <div class="text-sm font-bold mb-2 flex"> <span class="text-red-500 mr-1">*</span>选择接收人员 </div>
            <van-field
              v-model="form.recipientName"
              readonly
              clickable
              name="picker"
              placeholder="请选择接收人员"
              right-icon="arrow"
              @click="showUserPicker = true"
              class="border rounded-md p-2"
            />
          </div>

          <!-- 选择角色 -->
          <div class="mb-4 bg-white rounded-lg p-4">
            <div class="text-sm font-bold mb-2 flex"> <span class="text-red-500 mr-1">*</span>选择角色 </div>
            <van-checkbox-group v-model="form.selectedRoles">
              <van-cell-group :border="false">
                <van-cell
                  v-for="(role, index) in myRoles"
                  :key="role.roleCode"
                  clickable
                  :title="role.roleName"
                  @click="toggleRole(role)"
                  class="mb-2 border rounded-md"
                >
                  <template #icon>
                    <van-checkbox :name="role.roleCode" ref="checkboxes" :disabled="role.disabled" class="mr-2" />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-checkbox-group>
            <div v-if="myRoles.length === 0" class="text-gray-400 text-sm text-center py-2"> 当前无可用角色 </div>
          </div>

          <!-- 转交结束日期 -->
          <div class="bg-white rounded-lg p-4 mb-4">
            <div class="text-sm font-bold mb-2 flex"> <span class="text-red-500 mr-1">*</span>转交结束日期 </div>
            <van-field
              v-model="form.endDate"
              readonly
              clickable
              name="calendar"
              placeholder="年 / 月 / 日"
              right-icon="calendar-o"
              @click="showCalendar = true"
              class="border rounded-md p-2"
            />
            <van-calendar v-model:show="showCalendar" :min-date="minDate" @confirm="onConfirmDate" color="#1989fa" />
          </div>

          <!-- 转交原因 -->
          <div class="bg-white rounded-lg p-4 mb-4">
            <div class="text-sm font-bold mb-2 flex"> <span class="text-red-500 mr-1">*</span>转交原因 </div>
            <van-field
              v-model="form.remark"
              type="textarea"
              rows="3"
              autosize
              placeholder="请输入转交原因"
              class="border rounded-md p-2"
              :maxlength="200"
              show-word-limit
            />
          </div>

          <!-- 证明材料 -->
          <div class="mb-20 bg-white rounded-lg p-4">
            <div class="text-sm font-bold mb-2">证明材料</div>
            <AppUpload v-model:fileList="form.annexStr" />
          </div>

          <!-- 底部按钮 -->
          <div class="fixed bottom-0 left-0 w-full bg-white p-4 flex justify-between shadow-lg z-10">
            <van-button style="margin-right: 10px" block class="mr-2 bg-gray-100 border-0 text-gray-700" @click="resetForm">取消</van-button>
            <van-button block type="primary" color="#1989fa" @click="onSubmit">确认转交</van-button>
          </div>
        </div>
      </van-tab>

      <!-- Tab 2: 转交历史 -->
      <van-tab title="转交历史">
        <div class="p-4 bg-gray-50 min-h-screen pb-20">
          <van-list v-model:loading="loadingHistory" :finished="historyFinished" finished-text="没有更多了" @load="onLoadHistory">
            <div v-for="item in historyList" :key="item.id" class="bg-white rounded-lg p-4 mb-4 relative">
              <div class="flex justify-between items-start mb-2">
                <div class="font-bold text-base">转交给 {{ item.receiverName }}</div>
                <van-tag :type="getStatusType(item.status)" size="medium">{{ getStatusText(item.status) }}</van-tag>
              </div>

              <div class="text-gray-500 text-sm mb-1"> 工号：{{ item.receiverWorkNo }} | {{ item.receiverOrgName }} </div>

              <div class="text-gray-500 text-sm mb-2"> 转交时间：{{ item.assignTime.slice(0, 10) }} 至 {{ item.endTime.split(' ')[0] }} </div>

              <div class="flex flex-wrap gap-2 mb-2">
                <span v-for="role in item.roleName.split(',')" :key="role" class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  {{ role }}
                </span>
              </div>

              <!-- 撤销按钮 -->
              <div v-if="item.status === '1'" class="mt-2">
                <van-button plain type="danger" size="small" @click="onRevoke(item)"> 撤销转交 </van-button>
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
  import { ref, reactive, computed, onMounted } from 'vue';
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

  // 表单数据
  const form = reactive({
    receiver: '',
    recipientName: '',
    recipientObj: null as any,
    selectedRoles: [] as string[],
    endDate: '',
    remark: '',
    annexStr: '',
  });

  // 接收人已有的角色（用于置灰）
  const recipientExistingRoles = ref<string[]>([]);
  // 当前登录人的角色列表
  function getMyRoles() {
    getUserRoleList({ userId: userStore.getUserInfo?.id }).then((res) => {
      console.log('myRoles', res);
      myRoles.value = res || [];
    });
  }
  getMyRoles();
  // 重置表单
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

  // 选择人员回调
  const onUserSelected = async (user: any) => {
    form.receiver = user.id;
    form.recipientName = user.realname;
    form.recipientObj = user;
    // 获取接收人已有的角色
    await getUserRoleList({ userId: user.id }).then((res) => {
      console.log('recipientExistingRoles', res);
      recipientExistingRoles.value = res || [];
    });
    // 如果选择的接收人员有和登录人一样的角色，该角色置灰，不可选
    if (recipientExistingRoles.value.length === 0) return;
    let recipientExistingRoleCodes: string[] = [];
    recipientExistingRoles.value.forEach((role: any) => {
      recipientExistingRoleCodes.push(role.roleCode);
    });

    console.log('recipientExistingRoleCodes', recipientExistingRoleCodes);
    myRoles.value = myRoles.value.map((role: any) => {
      if (recipientExistingRoleCodes.includes(role.roleCode)) {
        role.disabled = true;
      } else {
        role.disabled = false;
      }
      return role;
    });
  };

  // 点击角色行
  const toggleRole = (role: any) => {
    if (role.disabled) return;

    const index = form.selectedRoles.indexOf(role.value);
    if (index !== -1) {
      form.selectedRoles.splice(index, 1);
    } else {
      form.selectedRoles.push(role.value);
    }
  };

  // 日期确认
  const onConfirmDate = (date: Date) => {
    form.endDate = dayjs(date).format('YYYY-MM-DD');
    showCalendar.value = false;
  };

  // 提交转交
  const onSubmit = () => {
    if (!form.receiver) {
      showToast('请选择接收人员');
      return;
    }
    if (form.selectedRoles.length === 0) {
      showToast('请选择角色');
      return;
    }
    if (!form.endDate) {
      showToast('请选择转交结束日期');
      return;
    }
    if (!form.remark) {
      showToast('请输入转交原因');
      return;
    }
    // 获取选中的角色名称用于提示
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
          console.log('form.selectedRoles', form.selectedRoles);
          await addTransfer({
            receiver: form.receiver,
            roleCode: selectedRoleCodes,
            endTime: form.endDate,
            remark: form.remark,
            annex: form.annexStr || '',
          });
          showSuccessToast('转交成功');
          resetForm();
          // 刷新历史列表
          onRefreshHistory();
          // 切换到历史Tab
          activeTab.value = 1;
        } catch (error) {
          // 错误处理由axios拦截器或API层处理，或者在这里显示
          console.error(error);
        }
      })
      .catch(() => {
        // 取消
      });
  };

  // --- Tab 2: 转交历史 ---
  const loadingHistory = ref(false);
  const historyFinished = ref(false);
  const historyList = ref<any[]>([]);
  const historyPage = ref(1);

  const onLoadHistory = async () => {
    loadingHistory.value = true;
    try {
      const res = await getTransferList({
        pageNo: historyPage.value,
        pageSize: 10,
      });
      // 假设API返回 { records: [], total: 0 }
      const records = res?.records || [];

      if (historyPage.value === 1) {
        historyList.value = records;
      } else {
        historyList.value = [...historyList.value, ...records];
      }

      if (records.length < 10) {
        historyFinished.value = true;
      }
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
    if (status === '3') return 'default'; // 灰色
    if (status === '2') return 'success'; // 绿色
    return 'primary'; // 蓝色
  };


  // 撤销操作
  const onRevoke = (item: any) => {
    showConfirmDialog({
      title: '撤销确认',
      message: '确定要撤销此权限转交吗？',
    })
      .then(async () => {
        try {
          await revokeTransfer({ id: item.id });
          showSuccessToast('撤销成功');
          // 刷新列表
          onRefreshHistory();
        } catch (error) {
          console.error(error);
        }
      })
      .catch(() => {
        // 取消
      });
  };

  // 监听Tab切换
  onMounted(() => {
    // 可以在这里做一些初始化
  });
</script>

<style scoped lang="less">
  .permission-transfer {
    background-color: #f7f8fa;
    min-height: 100vh;

    :deep(.van-field__label) {
      display: none;
    }
  }
</style>
