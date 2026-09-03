<template>
  <van-field
    readonly
    v-if="elInfo.type === 'vant'"
    :disabled="disabled"
    v-model="selectedValue"
    v-bind="elInfo.attr"
    placeholder="请选择"
    @click="handleUserModal"
  />
  <InputTextArea
    v-else
    v-model:value="selectedValue"
    auto-size
    :style="userStyle"
    readonly
    :disabled="disabled"
    :placeholder="placeholder"
    @click="handleUserModal"
  />
  <van-popup v-model:show="visible" teleport="body" position="bottom" :style="{ height: '90vh' }" round closeable @close="cancel">
    <div class="user-modal">
      <div class="modal-header">
        <h3>人员选择</h3>
      </div>
      <div class="search-section">
        <div class="search-bar">
          <VanField
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
            <van-button v-if="resultList.length > 0" type="danger" size="mini" @click="clearAll" class="clear-all-btn"> 清空 </van-button>
          </div>
          <div v-if="resultList.length > 0" class="selected-tags">
            <van-tag v-for="item in resultList" :key="item.id" type="primary" closeable @close="delItem(item)" class="user-tag">
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
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <van-cell
            v-for="item in dataSource"
            :key="item.id"
            :title="`${item.realname}（${item.username}）`"
            :label="setDepartName(item)"
            :class="{ 'selected-cell': isSelected(item.id) }"
          >
            <template #right-icon>
              <van-checkbox
                v-if="type === 'checkbox'"
                :model-value="selectedRowKeys.includes(item.id)"
                shape="square"
                :disabled="isDisabled(item.id) || isDisabledAndSelected(item.id)"
                @click.stop="toggleSelect(item)"
              />
              <van-radio
                v-else
                v-model="selectedRowKeys"
                :name="item.id"
                :disabled="isDisabled(item.id) || isDisabledAndSelected(item.id)"
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
  import { userListByOrg, getUserById } from '/@/api/common/api';
  import { Input } from 'ant-design-vue';
  import { defHttp } from '/@/utils/http/axios';
  import {
    Popup as VanPopup,
    List as VanList,
    Cell as VanCell,
    Checkbox as VanCheckbox,
    Radio as VanRadio,
    Tag as VanTag,
    Button as VanButton,
    Icon as VanIcon,
    Field as VanField,
  } from 'vant';

  interface User {
    id: string;
    realname: string;
    username: string;
    org3Name: string;
    orgName: string;
    orgCode: string;
  }

  interface PageInfo {
    pageNo: number;
    pageSize: number;
    total: number;
  }

  interface QueryParams {
    userName: string;
  }
  const props = defineProps({
    value: {
      type: String,
      default: '',
    },
    placeholder: { type: String, default: '请选择用户' },
    userStyle: {
      type: Object,
      default: () => {
        return {
          width: '100%',
        };
      },
    },
    type: { type: String, default: 'radio' },
    disabled: {
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
    // 班组id
    teamId: {
      type: String,
      default: '',
    },
    // 判断是否调用接口
    isInit: {
      type: Boolean,
      default: true,
    },
    // 接口地址
    url: {
      type: String,
      default: '',
    },
    // 接口参数
    params: {
      type: Object,
      default: () => ({}),
    },
    elInfo: {
      type: Object,
      default: () => ({
        type: 'antd',
        label: '',
        required: false,
      }),
    },
    fieldKeys: {
      type: Object,
      default: () => {},
    },
    // 是否查询id（只根传递了url有关）
    isSerchId: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });
  const InputTextArea = Input.TextArea;
  const selectedValue = ref('');
  const visible = ref(false);
  const userIds = ref<string[]>([]);
  const selectedRowKeys = ref<string | string[]>(props.type === 'radio' ? '' : []);
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
  const emit = defineEmits(['update:value', 'click-user', 'confirm', 'click-useralready', 'beforeChange']);
  const useralready = ref<string[]>([]);
  const resultList = ref<User[]>([]);
  const fetchId = ref(0);
  const isInnerUpdate = ref(false);
  const fieldKey = ref({
    id: 'id',
    realname: 'realname',
    username: 'username',
    orgCode: 'orgCode',
  });
  const isMultiSelect = computed(() => props.type === 'checkbox');
  const initValue = async (value?: string) => {
    const val = value !== undefined ? value : props.value;
    fetchId.value += 1;
    const currentId = fetchId.value;
    if (!val) {
      selectedValue.value = '';
      return;
    }
    try {
      const res = await (props.url && props.url !== '' && (props.url.includes('getIdCode') || props.isSerchId)
        ? defHttp.get({ url: props.url, params: { userIds: val, ...props.params } })
        : getUserById({ userIds: val }));
      if (fetchId.value === currentId && (res?.length > 0 || res?.records?.length > 0)) {
        let data: User[] = [];
        // 按id排序
        if (res?.length) {
          data = sortByFirstArray(val.split(','), res, 'id');
        } else {
          data = sortByFirstArray(val.split(','), res.records, 'id');
        }
        if (!isEmptyObject(props.fieldKeys)) {
          data =
            data.map((item) => {
              for (const [key, value] of Object.entries(getCommonFieldsFromBase())) {
                item[key] = item[value];
              }
              return item;
            }) || [];
        }
        selectedValue.value = data.map((item: User) => `${item.realname}（${item.username}）`).join(',');
      } else {
        selectedValue.value = '';
      }
    } catch (error) {
      selectedValue.value = '';
    }
  };
  function sortByFirstArray(arr1, arr2, idKey = 'id') {
    const idIndexMap = new Map();
    arr1.forEach((item, index) => {
      idIndexMap.set(item, index);
    });
    return [...arr2].sort((a, b) => {
      const indexA = idIndexMap.get(a[idKey]) ?? Infinity;
      const indexB = idIndexMap.get(b[idKey]) ?? Infinity;
      return indexA - indexB;
    });
  }
  watch(
    () => props.value,
    (newVal) => {
      if (isInnerUpdate.value) {
        isInnerUpdate.value = false;
        return;
      }
      initValue(newVal);
    },
    { immediate: true }
  );
  // 监听用户名搜索
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
  watch(
    () => visible.value,
    (val) => {
      if (val) {
        loadData();
        if (props.value) {
          reviewData(props.value);
        }
      }
    },
    {
      deep: true,
    }
  );
  const loadData = async (reset = true) => {
    if (reset) {
      resetPagination();
    }
    if (!props.isInit) {
      dataSource.value = [];
      page.value.total = 0;
      return;
    }
    loading.value = true;
    try {
      const res = await (props.url && props.url !== ''
        ? defHttp.get({
            url: props.url,
            params: { userName: queryParams.value.userName, ...props.params, pageNo: page.value.pageNo, pageSize: page.value.pageSize },
          })
        : userListByOrg({
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            userName: queryParams.value.userName,
            orgCode: props.orgCode,
            roleCode: props.roleCode,
            teamId: props.teamId,
          }));
      let newData = [] as User[];
      if (isEmptyObject(props.fieldKeys)) {
        newData = res.records || [];
      } else {
        newData =
          res.records.map((item) => {
            for (const [key, value] of Object.entries(getCommonFieldsFromBase())) {
              item[key] = item[value];
            }
            return item;
          }) || [];
      }
      dataSource.value = reset ? newData : [...dataSource.value, ...newData];
      page.value.total = res.total;
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      loading.value = false;
      finished.value = false;
    }
  };
  const resetPagination = () => {
    dataSource.value = [];
    page.value.pageNo = 1;
    page.value.pageSize = 20;
    page.value.total = 0;
    finished.value = false;
    loading.value = false;
  };
  const onLoad = () => {
    if (dataSource.value.length >= page.value.total) {
      finished.value = true;
      return;
    }
    page.value.pageNo++;
    loadData(false);
  };
  const onSearch = () => {
    loadData();
  };
  const onClear = () => {
    loadData();
  };
  const reviewData = (data: string) => {
    selectedRowKeys.value = isMultiSelect.value ? data.split(',') : data;
    initUser();
  };
  // 判断是否是空对象
  const isEmptyObject = (obj) => {
    return obj != null && typeof obj === 'object' && Object.keys(obj).length === 0;
  };
  // 取出fieldKeys和fieldKey不同的
  const getCommonFieldsFromBase = () => {
    const result = {};
    for (const key in props.fieldKeys) {
      if (key in fieldKey.value) {
        result[key] = props.fieldKeys[key];
      }
    }
    return result;
  };
  const initUser = async () => {
    const keys = isMultiSelect.value ? (selectedRowKeys.value as string[]) : [selectedRowKeys.value as string];
    if (keys.length === 0 || (keys.length === 1 && !keys[0])) {
      resultList.value = [];
      return;
    }
    try {
      const res = await (props.url && props.url !== '' && (props.url.includes('getIdCode') || props.isSerchId)
        ? defHttp.get({ url: props.url, params: { userIds: keys.join(','), ...props.params, pageSize: 10000 } })
        : getUserById({ userIds: keys.join(',') }));
      resultList.value = props.url && (props.url.includes('getIdCode') || props.isSerchId) ? res.records || [] : res || [];
      if (!isEmptyObject(props.fieldKeys)) {
        resultList.value =
          resultList.value.map((item) => {
            for (const [key, value] of Object.entries(getCommonFieldsFromBase())) {
              item[key] = item[value];
            }
            return item;
          }) || [];
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      resultList.value = [];
    }
  };
  const handleUserModal = () => {
    if (props.disabled || props.readonly) {
      return;
    }
    queryParams.value.userName = '';
    emit('click-user', (arr: string[]) => {
      const currentValues = isMultiSelect.value ? props.value.split(',') : [props.value];
      userIds.value = arr.filter((item) => !currentValues.includes(item));
    });
    // 赋值置灰
    emit('click-useralready', (arr: string[]) => {
      useralready.value = arr;
    });
    visible.value = true;
  };
  const cancel = () => {
    clearAll();
    visible.value = false;
  };
  const confirm = () => {
    isInnerUpdate.value = true;
    const selectedIds = resultList.value.map((item) => item.id).join(',');
    const selectedNames = resultList.value.map((item) => `${item.realname}（${item.username}）`).join(',');
    const realNames = resultList.value.map((item) => item.realname).join(',');
    const orgCode = resultList.value.map((item) => item.orgCode).join(',');
    emit('beforeChange', selectedIds);
    emit('update:value', selectedIds);
    selectedValue.value = selectedNames;
    emit('confirm', realNames, selectedNames, orgCode, resultList.value);
    clearAll();
    visible.value = false;
  };
  const toggleSelect = (item: User) => {
    if (isMultiSelect.value && !isDisabled(item.id) && !isDisabledAndSelected(item.id)) {
      const keys = selectedRowKeys.value as string[];
      const index = keys.indexOf(item.id);

      if (index > -1) {
        keys.splice(index, 1);
        resultList.value = resultList.value.filter((i) => i.id !== item.id);
      } else {
        keys.push(item.id);
        resultList.value.push(item);
      }
    }
    if (!isMultiSelect.value && !isDisabled(item.id) && !isDisabledAndSelected(item.id)) {
      selectedRowKeys.value = item.id;
      resultList.value = [item];
    }
  };
  const isSelected = (id: string): boolean => {
    return isMultiSelect.value ? (selectedRowKeys.value as string[]).includes(id) : selectedRowKeys.value === id;
  };
  const isDisabled = (id: string): boolean => {
    if (isMultiSelect.value) {
      const keys = selectedRowKeys.value as string[];
      return userIds.value.filter((item) => !keys.includes(item)).includes(id);
    }
    return userIds.value.filter((item) => item !== selectedRowKeys.value).includes(id);
  };
  // 置灰并选中
  const isDisabledAndSelected = (id: string): boolean => {
    return useralready.value.includes(id);
  };
  const delItem = (item: User) => {
    if (useralready.value.includes(item.id)) return;
    if (isMultiSelect.value) {
      const keys = selectedRowKeys.value as string[];
      selectedRowKeys.value = keys.filter((i) => i !== item.id);
    } else {
      selectedRowKeys.value = '';
    }
    resultList.value = resultList.value.filter((i) => i.id !== item.id);
  };
  const clearAll = () => {
    if (useralready.value.length > 0) {
      selectedRowKeys.value = useralready.value;
      resultList.value = resultList.value.filter((i) => useralready.value.includes(i.id));
    } else {
      resultList.value = [];
      selectedRowKeys.value = isMultiSelect.value ? [] : '';
    }
  };
  const setDepartName = (item) => {
    return `${item.org3Name}${item.departName ? '-' + item.departName : item.orgName ? '-' + item.orgName : ''}`
  }
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
            height: 24px;
            padding: 0 8px;
            font-size: 12px;
            border-radius: 12px;
          }
        }

        .selected-tags {
          display: flex;
          flex-wrap: nowrap;
          gap: 8px;
          align-items: center;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 4px;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */

          &::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }

          .user-tag {
            margin: 0;
            border-radius: 12px;
            font-size: 12px;
            line-height: 1.4;
            padding: 4px 8px;
            background: #e6f7ff;
            border: 1px solid #91d5ff;
            color: #1890ff;
            flex-shrink: 0;
            white-space: nowrap;
          }
        }

        .empty-tip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #969799;
          font-size: 14px;
          background: #fff;
          border-radius: 8px;
          border: 1px dashed #d9d9d9;
          height: 32.8px;
          .van-icon {
            font-size: 16px;
            color: #c8c9cc;
          }
        }
      }
    }

    .user-list {
      flex: 1;
      overflow-y: auto;
      background: #fff;

      .selected-cell {
        background-color: #f0f7ff !important;
      }
    }

    .modal-footer {
      flex-shrink: 0;
      padding: 16px;
      display: flex;
      gap: 12px;
      border-top: 1px solid #ebedf0;
      background: #fff;

      .cancel-btn,
      .confirm-btn {
        flex: 1;
        height: 44px;
        border-radius: 8px;
        font-size: 16px;
      }
    }
  }

  // 自定义样式
  :deep(.van-field) {
    background: #fff;

    .van-field__control {
      text-align: left;
      color: #323233;
    }

    .van-field__placeholder {
      color: #c8c9cc;
    }
  }

  :deep(.van-popup) {
    border-radius: 16px 16px 0 0;
  }

  :deep(.van-cell) {
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
    background: #fff;

    &:last-child {
      border-bottom: none;
    }

    .van-cell__title {
      font-size: 14px;
      color: #323233;
      font-weight: 400;
    }

    .van-cell__label {
      font-size: 12px;
      color: #969799;
      margin-top: 4px;
    }

    .van-cell__right-icon {
      margin-left: 8px;
    }
  }

  :deep(.van-checkbox) {
    .van-checkbox__icon {
      font-size: 18px;
    }
  }

  :deep(.van-radio) {
    .van-radio__icon {
      font-size: 18px;
    }
  }

  :deep(.van-tag) {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    line-height: 1.4;
  }

  :deep(.van-list) {
    .van-list__loading,
    .van-list__finished-text {
      padding: 16px;
      text-align: center;
      color: #969799;
      font-size: 14px;
    }
  }

  // 移动端适配
  @media (max-width: 768px) {
    .user-modal {
      .modal-header {
        padding: 12px 16px;

        h3 {
          font-size: 16px;
        }
      }

      .search-section {
        .selected-tags {
          gap: 6px;

          .user-tag {
            font-size: 11px;
            padding: 2px 6px;
          }
        }

        .clear-all-btn {
          height: 20px;
          padding: 0 6px;
          font-size: 11px;
        }
      }

      .user-list {
        :deep(.van-cell) {
          padding: 12px 16px;

          .van-cell__title {
            font-size: 14px;
          }

          .van-cell__label {
            font-size: 11px;
          }
        }
      }

      .modal-footer {
        padding: 12px 16px;

        .cancel-btn,
        .confirm-btn {
          height: 40px;
          font-size: 14px;
        }
      }
    }
  }
</style>
