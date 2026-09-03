<template>
  <van-popup 
    v-model:show="visible" 
    teleport="body" 
    position="bottom" 
    :style="{ height: '90vh' }" 
    round 
    closeable 
    @close="cancel"
  >
    <div class="user-modal">
      <div class="modal-header">
        <h3>选择处理人员</h3>
      </div>
      
      <div class="search-section">
        <div class="search-bar">
          <van-field
            v-model="queryParams.userName"
            placeholder="请输入姓名/工号"
            left-icon="search"
            clearable
            @clear="onClear"
            @keyup.enter="onSearch"
          />
        </div>
        
        <!-- 已选择人员标签 -->
        <div class="selected-section">
          <div class="selected-header">
            <span class="selected-title">已选择人员 ({{ resultList.length }})</span>
            <van-button 
              v-if="resultList.length > 0" 
              type="danger" 
              size="mini" 
              @click="clearAll" 
              class="clear-all-btn"
            > 
              清空 
            </van-button>
          </div>
          
          <div v-if="resultList.length > 0" class="selected-tags">
            <van-tag 
              v-for="item in resultList" 
              :key="item.id" 
              type="primary" 
              closeable 
              @close="delItem(item)" 
              class="user-tag"
            >
              {{ `${item.realname}（${item.username}）` }}
            </van-tag>
          </div>
          
          <div v-else class="empty-tip">
            <van-icon name="info-o" />
            <span>暂无已选择人员</span>
          </div>
        </div>
      </div>
      
      <!-- 用户列表 -->
      <div class="user-list">
        <van-list 
          v-model:loading="loading" 
          :finished="finished" 
          finished-text="没有更多了" 
          @load="onLoad"
        >
          <van-cell
            v-for="item in dataSource"
            :key="item.id"
            :title="`${item.realname}（${item.username}）`"
            :label="item.org3Name"
            :class="{ 'selected-cell': isSelected(item.id) }"
          >
            <template #right-icon>
              <van-radio
                v-model="selectedRowKeys"
                :name="item.id"
                @click.stop="toggleSelect(item)"
              />
            </template>
          </van-cell>
        </van-list>
      </div>
      
      <!-- 底部操作按钮 -->
      <div class="modal-footer">
        <van-button @click="cancel" class="cancel-btn">取消</van-button>
        <van-button type="primary" @click="confirm" class="confirm-btn">确定</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, watch, onUnmounted, computed } from 'vue';
  import { userListByOrg } from '/@/api/common/api';
  import {
    Popup as VanPopup,
    List as VanList,
    Cell as VanCell,
    Radio as VanRadio,
    Tag as VanTag,
    Button as VanButton,
    Icon as VanIcon,
    Field as VanField,
  } from 'vant';

  /**
   * 用户信息接口
   */
  interface User {
    id: string;
    realname: string;
    username: string;
    org3Name: string;
    orgName: string;
    orgCode: string;
  }

  /**
   * 分页信息接口
   */
  interface PageInfo {
    pageNo: number;
    pageSize: number;
    total: number;
  }

  /**
   * 查询参数接口
   */
  interface QueryParams {
    userName: string;
  }

  /**
   * 组件属性定义
   */
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    orgCode: {
      type: String,
      default: '',
    },
    roleCode: {
      type: String,
      default: '',
    },
  });

  /**
   * 组件事件定义
   */
  const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

  // 响应式数据
  const visible = ref(false);
  const selectedRowKeys = ref<string>('');
  const dataSource = ref<User[]>([]);
  const queryParams = ref<QueryParams>({
    userName: '',
  });
  const page = ref<PageInfo>({
    pageNo: 1,
    pageSize: 20,
    total: 0,
  });
  const loading = ref(false);
  const finished = ref(false);
  const searchTimer = ref<NodeJS.Timeout | null>(null);
  const resultList = ref<User[]>([]);

  /**
   * 监听弹窗显示状态
   */
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val;
      if (val) {
        loadData();
      }
    },
    { immediate: true }
  );

  /**
   * 监听弹窗内部状态变化
   */
  watch(
    () => visible.value,
    (val) => {
      emit('update:modelValue', val);
    }
  );

  /**
   * 监听用户名搜索
   */
  watch(
    () => queryParams.value.userName,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        // 使用防抖，避免频繁请求
        clearTimeout(searchTimer.value as NodeJS.Timeout);
        searchTimer.value = setTimeout(() => {
          loadData();
        }, 300);
      }
    }
  );

  /**
   * 加载用户数据
   * @param {boolean} reset 是否重置分页
   */
  const loadData = async (reset = true) => {
    if (reset) {
      resetPagination();
    }

    loading.value = true;
    try {
      const res = await userListByOrg({
        pageNo: page.value.pageNo,
        pageSize: page.value.pageSize,
        userName: queryParams.value.userName,
        orgCode: props.orgCode,
        roleCode: props.roleCode,
      });

      const newData = res.records as User[];
      dataSource.value = reset ? newData : [...dataSource.value, ...newData];
      page.value.total = res.total;
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      loading.value = false;
      finished.value = false;
    }
  };

  /**
   * 重置分页信息
   */
  const resetPagination = () => {
    dataSource.value = [];
    page.value.pageNo = 1;
    page.value.pageSize = 20;
    page.value.total = 0;
    finished.value = false;
  };

  /**
   * 加载更多数据
   */
  const onLoad = () => {
    if (dataSource.value.length >= page.value.total) {
      finished.value = true;
      return;
    }
    page.value.pageNo++;
    loadData(false);
  };

  /**
   * 搜索事件
   */
  const onSearch = () => {
    loadData();
  };

  /**
   * 清空搜索事件
   */
  const onClear = () => {
    loadData();
  };

  /**
   * 切换选择用户
   * @param {User} item 用户信息
   */
  const toggleSelect = (item: User) => {
    selectedRowKeys.value = item.id;
    resultList.value = [item];
  };

  /**
   * 判断用户是否被选中
   * @param {string} id 用户ID
   * @returns {boolean} 是否选中
   */
  const isSelected = (id: string): boolean => {
    return selectedRowKeys.value === id;
  };

  /**
   * 删除已选择的用户
   * @param {User} item 用户信息
   */
  const delItem = (item: User) => {
    selectedRowKeys.value = '';
    resultList.value = [];
  };

  /**
   * 清空所有选择
   */
  const clearAll = () => {
    resultList.value = [];
    selectedRowKeys.value = '';
  };

  /**
   * 取消操作
   */
  const cancel = () => {
    clearAll();
    visible.value = false;
    emit('cancel');
  };

  /**
   * 确认选择
   */
  const confirm = () => {
    const selectedIds = resultList.value.map((item) => item.id).join(',');
    const selectedNames = resultList.value.map((item) => `${item.realname}（${item.username}）`).join(',');
    const realNames = resultList.value.map((item) => item.realname).join(',');
    const orgCode = resultList.value.map((item) => item.orgCode).join(',');
    
    emit('confirm', realNames, selectedNames, orgCode, resultList.value);
    clearAll();
    visible.value = false;
  };

  /**
   * 组件卸载时清理定时器
   */
  onUnmounted(() => {
    if (searchTimer.value) {
      clearTimeout(searchTimer.value);
    }
  });
</script>

<style lang="less" scoped>
  .user-modal {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;

    .modal-header {
      flex-shrink: 0;
      padding: 16px;
      text-align: center;
      border-bottom: 1px solid #ebedf0;
      position: relative;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #323233;
      }
    }

    .search-section {
      flex-shrink: 0;
      background: #fff;
      border-bottom: 1px solid #ebedf0;

      .search-bar {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        gap: 8px;
        background: #fff;

        .van-field {
          flex: 1;
          background: #f7f8fa;
          border-radius: 8px;
          padding: 8px 12px;
        }
      }

      .selected-section {
        padding: 12px 16px;
        background: #f7f8fa;

        .selected-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .selected-title {
            font-size: 14px;
            font-weight: 500;
            color: #323233;
          }

          .clear-all-btn {
            font-size: 12px;
            padding: 2px 8px;
            height: 24px;
            line-height: 20px;
          }
        }

        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .user-tag {
            margin: 0;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 4px;
          }
        }

        .empty-tip {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          color: #969799;
          font-size: 14px;
          gap: 4px;
        }
      }
    }

    .user-list {
      flex: 1;
      overflow-y: auto;
      background: #fff;

      .selected-cell {
        background-color: #f0f9ff;
      }

      .van-cell {
        padding: 12px 16px;
        border-bottom: 1px solid #f7f8fa;

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .modal-footer {
      flex-shrink: 0;
      display: flex;
      padding: 16px;
      gap: 12px;
      border-top: 1px solid #ebedf0;
      background: #fff;

      .cancel-btn,
      .confirm-btn {
        flex: 1;
        height: 44px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
      }

      .cancel-btn {
        background: #f7f8fa;
        color: #646566;
        border: 1px solid #ebedf0;
      }

      .confirm-btn {
        background: #1989fa;
        color: #fff;
        border: 1px solid #1989fa;
      }
    }
  }

  // 深度选择器样式
  :deep(.van-popup) {
    .van-popup__close-icon {
      color: #969799;
      font-size: 18px;
    }
  }

  :deep(.van-list) {
    .van-list__finished-text {
      color: #969799;
      font-size: 14px;
      padding: 16px;
    }
  }

  :deep(.van-field__control) {
    font-size: 14px;
  }

  :deep(.van-tag--closeable) {
    padding-right: 20px;
  }
</style>