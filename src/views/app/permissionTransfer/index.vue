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
              <van-checkbox
                v-for="role in myRoles"
                :key="role.roleCode"
                :name="role.roleCode"
                :disabled="role.disabled"
                class="role-checkbox-row"
                label-position="right"
              >
                {{ role.roleName }}
              </van-checkbox>
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

              <!-- 撤销按钮：仅进行中 且 查看自己数据时显示 -->
              <div v-if="item.status === '1' && filterParams.isMy === '1'" style="margin-top: 8px">
                <van-button plain type="danger" size="small" @click="onRevoke(item)">撤销转交</van-button>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 安全部专属：筛选浮动按钮 -->
    <van-floating-bubble
      v-if="isSafetyDept"
      axis="xy"
      icon="filter-o"
      :offset="filterBubbleOffset"
      magnetic="x"
      @click="filterPopupShow = true"
    />

    <!-- 筛选抽屉（右侧滑出） -->
    <van-popup
      v-if="isSafetyDept"
      v-model:show="filterPopupShow"
      position="right"
      :style="{ height: '100%', width: '72%' }"
    >
      <div class="search-box">
        <div class="hd">
          <span>筛选</span>
          <van-icon name="cross" @click="filterPopupShow = false" />
        </div>

        <!-- 时间范围 -->
        <div class="filter-section" @click="filterCalendarShow = true">
          <div class="filter-label">转交时间</div>
          <div class="filter-value-row" :class="{ placeholder: !filterParams.startDate }">
            <span>{{ filterParams.startDate ? `${filterParams.startDate} ~ ${filterParams.endDate}` : '请选择时间范围' }}</span>
            <div class="filter-value-right">
              <van-icon
                v-if="filterParams.startDate"
                name="clear"
                @click.stop="filterParams.startDate = ''; filterParams.endDate = ''"
              />
              <van-icon v-else name="arrow" />
            </div>
          </div>
        </div>

        <!-- 查看范围：自己 / 全部 -->
        <div class="filter-section">
          <div class="filter-label">查看范围</div>
          <div class="toggle-wrap">
            <span :class="['toggle-item', filterParams.isMy === '1' ? 'active' : '']" @click="filterParams.isMy = '1'">仅看自己</span>
            <span :class="['toggle-item', filterParams.isMy === '0' ? 'active' : '']" @click="filterParams.isMy = '0'">全部</span>
          </div>
        </div>

        <!-- 转交角色（内联下拉） -->
        <div class="filter-section">
          <div class="filter-label">转交角色</div>
          <!-- 可输入的触发行，输入时直接展开下拉并搜索 -->
          <div class="role-input-wrap">
            <van-icon name="search" size="15" color="#c8c9cc" />
            <input
              ref="roleInputRef"
              class="role-input-field"
              v-model="roleSearchVal"
              :placeholder="filterParams.roleName || '搜索角色名称'"
              @input="onRoleInputChange"
              @focus="onRoleInputFocus"
            />
            <van-icon
              v-if="filterParams.roleName || roleSearchVal"
              name="clear"
              size="16"
              color="#c8c9cc"
              @click.stop="onRoleClear"
            />
            <van-icon v-else :name="roleDropdownShow ? 'arrow-up' : 'arrow-down'" size="14" color="#c8c9cc" @click.stop="toggleRoleDropdown" />
          </div>
          <!-- 下拉列表 -->
          <div v-if="roleDropdownShow" class="role-dropdown">
            <div class="role-dropdown__list">
              <div v-if="roleLoading" class="role-dropdown__loading">
                <van-loading size="18px" color="#1989fa" />
              </div>
              <template v-else>
                <div
                  v-for="item in roleList"
                  :key="item.id"
                  class="role-dropdown__item"
                  :class="{ 'is-selected': filterParams.roleName === item.roleName }"
                  @click="onRoleSelect(item)"
                >
                  <span v-html="highlightRole(item.roleName)"></span>
                  <van-icon v-if="filterParams.roleName === item.roleName" name="success" color="#1989fa" size="14" />
                </div>
                <div v-if="roleList.length === 0" class="role-dropdown__empty">未找到匹配角色</div>
              </template>
            </div>
          </div>
        </div>

        <div class="foot">
          <van-button plain @click="onFilterReset">重置</van-button>
          <van-button type="primary" color="#1989fa" @click="onFilterSearch">搜索</van-button>
        </div>
      </div>
    </van-popup>



    <!-- 日期范围选择（与其他页面保持一致） -->
    <van-calendar
      :minDate="new Date(20200101)"
      allow-same-day
      v-model:show="filterCalendarShow"
      type="range"
      @confirm="onFilterCalendarConfirm"
    />

    <!-- 人员选择组件 -->
    <UserPicker v-model:show="showUserPicker" @select="onUserSelected" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
  import { showConfirmDialog, showToast, showSuccessToast } from 'vant';
  import { useUserStore } from '/@/store/modules/user';
  import UserPicker from './components/UserPicker.vue';
  import AppUpload from '/@/views/app/components/AppUpload.vue';
  import { getTransferList, addTransfer, revokeTransfer, getUserRoleList, getSysRoleList } from './api';
  import { dateFormat } from '/@/utils/common/compUtils';
  import dayjs from 'dayjs';

  const userStore = useUserStore();
  const activeTab = ref(0);

  // ─── 筛选权限判断：安全部 或 admin 可见 ────────────────────────
  const isSafetyDept = computed(() => {
    const info = userStore.getUserInfo as any;
    if (!info) return false;
    // admin 账号直接放行
    if (info.username === 'admin') return true;
    const orgCode: string = info.orgCode || '';
    const orgCodeTxt: string = info.orgCodeTxt || '';
    return orgCode.substring(0, 9) === 'A04B01C11' || orgCodeTxt.includes('安全');
  });

  // ─── Tab 1: 新建转交 ──────────────────────────────────────────
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

  // ─── Tab 2: 转交历史 ──────────────────────────────────────────
  const loadingHistory = ref(false);
  const historyFinished = ref(false);
  const historyList = ref<any[]>([]);
  const historyPage = ref(1);

  const onLoadHistory = async () => {
    loadingHistory.value = true;
    try {
      const params: any = { pageNo: historyPage.value, pageSize: 10 };
      // 安全部用户带上筛选参数
      if (isSafetyDept.value) {
        if (filterParams.startDate) {
          params.startDate = filterParams.startDate;
          params.endDate = filterParams.endDate;
        }
        params.isMy = filterParams.isMy;
        if (filterParams.roleName) params.roleName = filterParams.roleName;
      }
      const res = await getTransferList(params);
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

  // ─── 筛选面板（安全部专属） ──────────────────────────────────
  const filterBubbleOffset = ref({ x: window.innerWidth - 68, y: window.innerHeight - 180 });
  const filterPopupShow = ref(false);
  const filterCalendarShow = ref(false);

  const filterParams = reactive({
    startDate: '',
    endDate: '',
    isMy: '1',
    roleName: '',
  });

  const onFilterCalendarConfirm = (e: Date[]) => {
    filterParams.startDate = dateFormat(e[0], 'yyyy-MM-dd');
    filterParams.endDate = dateFormat(e[1], 'yyyy-MM-dd');
    filterCalendarShow.value = false;
  };

  const onFilterReset = () => {
    filterParams.startDate = '';
    filterParams.endDate = '';
    filterParams.isMy = '1';
    filterParams.roleName = '';
    filterPopupShow.value = false;
    onRefreshHistory();
  };

  const onFilterSearch = () => {
    filterPopupShow.value = false;
    onRefreshHistory();
  };

  // ─── 角色选择器（内联下拉） ───────────────────────────────────
  const roleDropdownShow = ref(false);
  const roleLoading = ref(false);
  const roleList = ref<any[]>([]);
  const roleSearchVal = ref('');
  const roleInputRef = ref<HTMLInputElement | null>(null);
  let roleDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  const loadRoleList = async (keyword?: string) => {
    roleLoading.value = true;
    try {
      const res = await getSysRoleList({ roleName: keyword ?? '', pageSize: 100, pageNo: 1 });
      roleList.value = res?.records || [];
    } catch (e) {
      roleList.value = [];
    } finally {
      roleLoading.value = false;
    }
  };

  // 点击箭头图标：收起/展开
  const toggleRoleDropdown = () => {
    if (roleDropdownShow.value) {
      roleDropdownShow.value = false;
    } else {
      roleDropdownShow.value = true;
      loadRoleList(roleSearchVal.value || undefined);
      nextTick(() => roleInputRef.value?.focus());
    }
  };

  // 输入框获得焦点时展开
  const onRoleInputFocus = () => {
    if (!roleDropdownShow.value) {
      roleDropdownShow.value = true;
      loadRoleList(roleSearchVal.value || undefined);
    }
  };

  // 输入框内容变化：防抖搜索
  const onRoleInputChange = () => {
    roleDropdownShow.value = true;
    if (roleDebounceTimer) clearTimeout(roleDebounceTimer);
    roleDebounceTimer = setTimeout(() => {
      loadRoleList(roleSearchVal.value || undefined);
    }, 300);
  };

  // 兼容旧引用（已无单独搜索框，保留空函数避免报错）
  const onRoleSearch = onRoleInputChange;

  const highlightRole = (text: string) => {
    const kw = roleSearchVal.value.trim();
    if (!kw || !text) return text;
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  };

  const onRoleSelect = (item: any) => {
    filterParams.roleName = item.roleName;
    roleSearchVal.value = '';
    roleDropdownShow.value = false;
  };

  const onRoleClear = () => {
    filterParams.roleName = '';
    roleSearchVal.value = '';
    roleDropdownShow.value = false;
  };

  // 筛选面板打开时预加载角色列表
  watch(filterPopupShow, (val) => {
    if (val && roleList.value.length === 0) {
      loadRoleList();
    }
    if (!val) {
      // 面板关闭时收起下拉
      roleDropdownShow.value = false;
    }
  });

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

.role-checkbox-row {
  padding: 12px 8px;
  margin-bottom: 8px;
  border: 1px solid #ebedf0;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;

  :deep(.van-checkbox__label) {
    font-size: 14px;
    color: #323233;
  }
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

// ─── 筛选抽屉 ────────────────────────────────────────────────
.search-box {
  .hd {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-size: 15px;
    font-weight: 600;
    color: #323233;
    border-bottom: 1px solid #f0f0f0;
  }

  .filter-section {
    padding: 14px 16px 0;

    .filter-label {
      font-size: 13px;
      color: #969799;
      margin-bottom: 8px;
    }

    .filter-value-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f7f8fa;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 14px;
      color: #323233;
      min-height: 40px;

      &.placeholder {
        color: #c8c9cc;
      }

      .filter-value-right {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #c8c9cc;
      }
    }
  }

  .foot {
    display: flex;
    gap: 10px;
    padding: 20px 16px 16px;

    .van-button {
      flex: 1;
      height: 40px;
      border-radius: 6px;
    }
  }
}

// 日期范围选择
// 查看范围切换按钮
.toggle-wrap {
  display: flex;
  gap: 8px;

  .toggle-item {
    padding: 6px 16px;
    border-radius: 6px;
    border: 1px solid #ebedf0;
    font-size: 13px;
    color: #646566;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      border-color: #1989fa;
      color: #1989fa;
      background: #ecf5ff;
      font-weight: 500;
    }
  }
}

// ─── 角色内联下拉 ─────────────────────────────────────────────
.role-input-wrap {
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 0 10px;
  height: 38px;
  gap: 6px;
  cursor: text;

  .role-input-field {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: #323233;
    min-width: 0;

    &::placeholder {
      color: #c8c9cc;
    }
  }
}

.role-dropdown {
  margin-top: 4px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #ebedf0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &__list {
    max-height: 180px;
    overflow-y: auto;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 14px 0;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    font-size: 14px;
    color: #323233;
    border-bottom: 1px solid #f5f6f7;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f7f8fa;
    }

    &.is-selected {
      color: #1989fa;
      background: #f0f7ff;
      font-weight: 500;
    }
  }

  &__empty {
    text-align: center;
    color: #c8c9cc;
    font-size: 13px;
    padding: 14px 0;
  }
}

:deep(mark) {
  background-color: #fff3cd;
  color: #ee0a24;
  padding: 0 1px;
  font-weight: 600;
  border-radius: 2px;
}
</style>
