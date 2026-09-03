<template>
  <InputTextArea
    v-model:value="selectedValue"
    :auto-size="autoSize"
    :style="userStyle"
    readonly
    :disabled="disabled"
    :placeholder="placeholder"
    @click="handleUserModal"
  />
  <a-modal :visible="visible" title="人员选择" destroyOnClose @cancel="cancel" @ok="confirm" width="1200px" :z-index="zIndex">
    <div class="usermain">
      <div class="left">
        <a-form
          style="margin-top: 20px; width: 100%"
          :model="queryParams"
          :label-col="{
            xs: { span: 24 },
            sm: { span: 6 },
          }"
          :wrapper-col="{
            xs: { span: 24 },
            sm: { span: 18 },
          }"
        >
          <a-row :gutter="24">
            <a-col :md="12" :sm="12">
              <a-form-item label="人员姓名/工号:">
                <a-input allowClear placeholder="请输入" v-model:value="queryParams.userName" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <a-table
          :dataSource="dataSource"
          rowKey="id"
          :columns="columns"
          :pagination="false"
          :rowSelection="rowSelection"
          :loading="loading"
          size="small"
        />
        <!-- 分页 -->
        <div class="bottom-page" v-if="dataSource.length > 0">
          <pagination
            v-model:current="page.pageNo"
            v-model:pageSize="page.pageSize"
            style="margin: 10px 0"
            size="small"
            show-quick-jumper
            show-size-changer
            :total="page.total"
            :show-total="(total) => `共 ${total} 条数据`"
            @change="onChange"
          >
            <template #buildOptionText="props">
              <span>{{ props.value }}条/页</span>
            </template>
          </pagination>
        </div>
      </div>
      <div class="right">
        <div class="hd"> 已选择：{{ resultList.length }}<span @click="clearAll" class="clearall">清空</span> </div>
        <div class="r-main">
          <template v-for="item in resultList" :key="item.id">
            <div class="r-item">
              <span class="name" :title="getUserDisplayText(item)">{{ getUserDisplayText(item) }}</span
              ><CloseOutlined style="color: #ff4d4f" @click="delItem(item)" v-if="!useralready.includes(item.id)" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
  import { ref, watch, computed, watchEffect, nextTick } from 'vue';
  import { userListByOrg, getUserById } from '/@/api/common/api';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { Pagination, Input } from 'ant-design-vue';
  import { propTypes } from '/@/utils/propTypes';
  import { defHttp } from '/@/utils/http/axios';
  import { getWithSharedCache, buildSharedKey, clearSharedCache } from '../utils/userCache';
  // 类型定义
  interface User {
    id: string;
    username: string;
    realname: string;
    org3Name?: string;
    orgCode?: string;
  }

  interface QueryParams {
    userName: string;
  }

  interface PageInfo {
    pageNo: number;
    pageSize: number;
    total: number;
  }

  interface UserListResponse {
    records: User[];
    total: number;
  }
  const props = defineProps({
    value: propTypes.string.def(''),
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
    // 角色
    roleCode: {
      type: String,
      default: '',
    },
    // 班组id
    teamId: {
      type: String,
      default: '',
    },
    zIndex: {
      type: Number,
      default: 1000,
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
    curColumns: {
      type: Array,
      default: () => [],
    },
    // 缓存作用域：global（跨页面共享）或 page（按页面隔离）
    cacheScope: {
      type: String as any,
      default: 'global',
    },
    // 当 cacheScope 为 page 时建议传入，用于区分页面
    pageKey: {
      type: String,
      default: '',
    },
    autoSize: {
      type: [Boolean, Object],
      default: true,
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
    label: {
      type: String,
      default: '',
    },
  });
  const InputTextArea = Input.TextArea;
  const selectedValue = ref<string>('');
  const visible = ref<boolean>(false);
  const userIds = ref<string[]>([]);
  const useralready = ref<string[]>([]);
  const selectedRowKeys = ref<string[]>([]);
  const dataSource = ref<User[]>([]);
  const queryParams = ref<QueryParams>({
    userName: '',
  });
  const page = ref<PageInfo>({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });
  const fieldKey = ref({
    id: 'id',
    realname: 'realname',
    username: 'username',
    orgCode: 'orgCode',
  });
  const emit = defineEmits(['update:value', 'change', 'click-user', 'confirm', 'click-useralready', 'beforeChange']);
  const columns = ref<any[]>([
    {
      title: '用户账号',
      align: 'center' as const,
      dataIndex: 'username',
    },
    {
      title: '人员姓名',
      align: 'center' as const,
      dataIndex: 'realname',
    },
    {
      title: '所属3级',
      align: 'center' as const,
      dataIndex: 'org3Name',
    },
  ]);
  const resultList = ref<User[]>([]);
  const isInnerUpdate = ref<boolean>(false);
  const loading = ref<boolean>(false);

  let initRequestId = 0;
  const rowSelection = computed(() => {
    return {
      fixed: 'left',
      type: props.type,
      onChange: (selectedRowKeys) => {
        setResult(selectedRowKeys);
      },
      selectedRowKeys: selectedRowKeys.value,
      getCheckboxProps: (record) => ({
        disabled: userIds.value.filter((item) => !selectedRowKeys.value.includes(item)).includes(record.id) || useralready.value.includes(record.id),
      }),
    };
  });

  // 构建共享缓存 key（按作用域决定是否纳入页面标识）
  const buildCacheKey = (userIds: string) => {
    const scope = props.cacheScope === 'page' ? props.pageKey || 'NO_PAGE' : 'GLOBAL';
    const urlPart = props.url || 'DEFAULT_URL';
    const paramPart = JSON.stringify(props.params || {});
    return buildSharedKey([scope, urlPart, paramPart, userIds]);
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
  // 带共享缓存与去重的 getUserById
  const getUserByIdWithCache = async (userIds: string): Promise<User[]> => {
    if (!userIds) return [];
    const key = buildCacheKey(userIds);
    return getWithSharedCache<User>(key, async () => {
      if (props.url && props.url !== '' && (props.url.includes('getIdCode') || props.isSerchId)) {
        const res: any = await defHttp.get({ url: props.url, params: { userIds, ...props.params, pageSize: 10000 } });
        if (isEmptyObject(props.fieldKeys)) {
          return res.records || [];
        }
        return (
          res?.records.map((item) => {
            for (const [key, value] of Object.entries(getCommonFieldsFromBase())) {
              item[key] = item[value];
            }
            return item;
          }) || []
        );
      }
      const res = await getUserById({ userIds });
      return res || [];
    });
  };

  const initValue = async (value?: string) => {
    const val = value !== undefined ? value : props.value;
    initRequestId += 1;
    const currentRequestId = initRequestId;

    if (!val) {
      selectedValue.value = '';
      return;
    }

    try {
      const res = await getUserByIdWithCache(val);
      // 只处理最新的请求结果
      if (initRequestId === currentRequestId) {
        if (res && res.length > 0) {
            selectedValue.value = res.map(getUserDisplayText).join(',');
          } else {
            selectedValue.value = props.label || '';
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        if (initRequestId === currentRequestId) {
          selectedValue.value = props.label || '';
        }
      }
  };
  // 优化响应式监听，避免重复调用
  let lastPropValue = ref<string>('');

  watch(
    () => props.label,
    (val) => {
      if (val) {
        selectedValue.value = val;
      }
    },
    { immediate: true },
  );

  watchEffect(() => {
    // 只有在 props.value 真正发生变化时才调用 initValue
    if (props.value !== lastPropValue.value && !isInnerUpdate.value) {
      lastPropValue.value = props.value || '';
      initValue(props.value);
    }
    // 重置内部更新标志，但要在下一个 tick 后，确保本次更新完成
    if (isInnerUpdate.value) {
      nextTick(() => {
        isInnerUpdate.value = false;
      });
    }
    if (props.curColumns && props.curColumns.length > 0) {
      columns.value = props.curColumns;
    }
  });

  // 优化用户名搜索的防抖处理
  let searchTimer: number | null = null;
  watch(
    () => queryParams.value.userName,
    () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      searchTimer = setTimeout(() => {
        page.value.pageNo = 1;
        init();
      }, 300) as unknown as number;
    }
  );

  watch(
    () => visible.value,
    (val) => {
      if (val) {
        // 只在模态框首次打开时调用 init，避免重复请求
        if (dataSource.value.length === 0 || page.value.pageNo === 1) {
          init();
        }
      } else {
        // 模态框关闭时可按页面维度清理缓存，避免内存增长
        if (props.cacheScope === 'page' && props.pageKey) {
          const prefix = buildSharedKey([props.pageKey]);
          clearSharedCache((k) => k.includes(prefix));
        }
      }
    }
  );
  const init = async () => {
    if (!props.isInit) {
      dataSource.value = [];
      page.value.total = 0;
      return;
    }

    // 防止重复请求
    if (loading.value) {
      return;
    }
    loading.value = true;
    try {
      const res: UserListResponse = await (props.url && props.url !== ''
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
            ...props.params,
          }));
      if (isEmptyObject(props.fieldKeys)) {
        dataSource.value = res.records || [];
      } else {
        dataSource.value =
          res.records.map((item) => {
            for (const [key, value] of Object.entries(getCommonFieldsFromBase())) {
              item[key] = item[value];
            }
            return item;
          }) || [];
      }
      fieldKey.value;
      page.value.total = res.total || 0;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      dataSource.value = [];
      page.value.total = 0;
    } finally {
      loading.value = false;
    }
  };
  const resetPagination = () => {
    page.value.pageNo = 1;
    page.value.pageSize = 10;
  };

  const searchReset = () => {
    queryParams.value.userName = '';
    resetPagination();
  };

  const getUserDisplayText = (user: User): string => {
    return `${user.realname}（${user.username}）`;
  };

  const getSelectedDisplayText = (): string => {
    return resultList.value.map(getUserDisplayText).join(',');
  };

  const getSelectedIds = (): string => {
    return resultList.value.map((item) => item.id).join(',');
  };

  const getSelectedNames = (): string => {
    return resultList.value.map((item) => item.realname).join(',');
  };
  const getSelectedOrgCode = (): string => {
    return resultList.value.map((item) => item.orgCode).join(',');
  };

  // 分页
  const onChange = (pageNo: number, pageSize: number) => {
    page.value.pageNo = pageNo;
    page.value.pageSize = pageSize;
    init();
  };
  // 回显选中
  const reviewData = (data: string) => {
    selectedRowKeys.value = data.split(',').filter(Boolean);
    initUser();
  };
  const initUser = async () => {
    if (selectedRowKeys.value.length === 0) {
      resultList.value = [];
      return;
    }

    const userIds = selectedRowKeys.value.join(',');
    try {
      const res = await getUserByIdWithCache(userIds);
      resultList.value = res || [];
    } catch (error) {
      console.error('获取选中用户信息失败:', error);
      resultList.value = [];
    }
  };
  const handleUserModal = () => {
    emit('click-user', (arr: string[]) => {
      const currentValues = props.value ? props.value.split(',') : [];
      userIds.value = arr.filter((item) => !currentValues.includes(item));
    });
    emit('click-useralready', (arr: string[]) => {
      useralready.value = arr;
    });
    // 重置搜索条件，但不立即调用 init
    queryParams.value.userName = '';
    resetPagination();
    visible.value = true;

    // 异步处理回显数据，避免阻塞 UI
    if (props.value) {
      nextTick(() => {
        reviewData(props.value);
      });
    }
  };
  const cancel = () => {
    clearAll();
    visible.value = false;
  };
  const confirm = () => {
    isInnerUpdate.value = true;
    const userIdStr = getSelectedIds();
    const displayStr = getSelectedDisplayText();
    const namesStr = getSelectedNames();
    const orgCode = getSelectedOrgCode();
    emit('beforeChange', userIdStr);
    emit('update:value', userIdStr);
    emit('change', userIdStr);
    selectedValue.value = displayStr;
    emit('confirm', namesStr, displayStr, orgCode, resultList.value);

    clearAll();
    searchReset();
    visible.value = false;
  };
  const setResult = (ids: string[]) => {
    if (props.type === 'radio') {
      selectedRowKeys.value = ids;
    } else {
      const currentPageKeys = dataSource.value.map((item) => item.id);
      let merged = selectedRowKeys.value.filter((key) => !currentPageKeys.includes(key));
      merged = merged.concat(ids);
      selectedRowKeys.value = merged;
    }
    initUser();
  };
  // 删除
  const delItem = (item: User) => {
    selectedRowKeys.value = selectedRowKeys.value.filter((id) => id !== item.id);
    initUser();
  };
  const clearAll = () => {
    if (useralready.value.length > 0) {
      selectedRowKeys.value = useralready.value;
      resultList.value = resultList.value.filter((i) => useralready.value.includes(i.id));
    } else {
      resultList.value = [];
      selectedRowKeys.value = [];
    }
  };
</script>
<style lang="less" scoped>
  .usermain {
    display: flex;
    gap: 20px;
    height: 600px;

    .left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 0 20px;

      :deep(.ant-table) {
        flex: 1;
      }
    }

    .right {
      width: 240px;
      display: flex;
      flex-direction: column;
      background-color: #fafafa;
      border-radius: 6px;
      overflow: hidden;

      .hd {
        padding: 12px 16px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #d9d9d9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 500;

        .clearall {
          color: #1890ff;
          cursor: pointer;
          font-size: 12px;

          &:hover {
            color: #40a9ff;
          }
        }
      }

      .r-main {
        flex: 1;
        padding: 8px;
        overflow-y: auto;

        .r-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          margin-bottom: 4px;
          background-color: #fff;
          border-radius: 4px;
          border: 1px solid #e8e8e8;
          transition: all 0.2s;

          &:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .name {
            flex: 1;
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 8px;
          }

          .anticon {
            cursor: pointer;
            transition: color 0.2s;

            &:hover {
              color: #ff7875 !important;
            }
          }
        }
      }
    }
  }

  :deep(.ant-table-title) {
    min-height: 0 !important;
  }

  .bottom-page {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 0;
  }
</style>
