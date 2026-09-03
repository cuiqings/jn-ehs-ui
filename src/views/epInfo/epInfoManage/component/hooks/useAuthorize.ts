import { reactive, ref, watch } from 'vue';
import { TreeSelect } from 'ant-design-vue';
import { getUser, doAuth, getInitAuth, getDepart, getRole } from '../../url/index';
type orgIdsValueType = {
  value: string;
  label: string;
  disabled?: boolean | undefined;
  halfChecked?: boolean | undefined;
};
export const useAuthorize = (emit: any) => {
  const visibleAuthorize = ref(false);
  const authorizeFromInfo = reactive({
    userAuthorize: <string[]>[],
    roleIds: <string[]>[],
    orgIds: <orgIdsValueType[]>[],
    orgIdsValue: <orgIdsValueType[]>[],
  });
  const dataSourceLeft = ref([]);
  const dataSourceRole = ref([]);
  const orgArr = ref<any[]>([]);
  const orgTreeData = ref([]);
  const cardKeys = ref('org');
  const orgLoading = ref(false);
  const userLoading = ref(false);
  const roleLoading = ref(false);
  const SHOW_ALL = TreeSelect.SHOW_ALL;
  const tabList = [
    {
      key: 'org',
      tab: '组织机构授权',
    },
    {
      key: 'role',
      tab: '角色授权',
    },
    {
      key: 'user',
      tab: '用户授权',
    },
  ];
  const columnsRole = [
    {
      title: '角色名称',
      align: 'center',
      dataIndex: 'roleName',
    },
  ];
  const columnsAuthorize = [
    {
      title: '用户账号',
      align: 'center',
      dataIndex: 'username',
    },
    {
      title: '真实姓名',
      align: 'center',
      dataIndex: 'realname',
    },
  ];
  const queryParam = reactive({ id: '' });
  const openAuthorize = async (id: string) => {
    queryParam.id = id;
    cardKeys.value = 'org';
    authorizeFromInfo.userAuthorize = [];
    authorizeFromInfo.roleIds = [];
    authorizeFromInfo.orgIds = [];
    authorizeFromInfo.orgIdsValue = [];
    orgArr.value = [];
    visibleAuthorize.value = true;
    onPermission(queryParam.id);
    initGetDepart();
    initRole();
    onList();
  };
  const onTabChange = (key: string) => {
    cardKeys.value = key;
  };
  // 获取用户
  const onList = async () => {
    userLoading.value = true;
    try {
      const res = await getUser();
      dataSourceLeft.value = res.records;
    } finally {
      userLoading.value = false;
    }
  };
  // 获取组织机构
  const initGetDepart = async () => {
    orgLoading.value = true;
    try {
      const res = await getDepart();
      orgTreeData.value = res;
      if (orgArr.value.length > 0) {
        getFiles(orgArr.value, orgTreeData.value);
      }
    } finally {
      orgLoading.value = false;
    }
  };
  // 获取角色表格
  const initRole = async () => {
    roleLoading.value = true;
    try {
      const res = await getRole();
      dataSourceRole.value = res.records;
    } finally {
      roleLoading.value = false;
    }
  };
  // 获取当前权限
  const onPermission = (id: string) => {
    getInitAuth(id).then((res) => {
      authorizeFromInfo.userAuthorize = res.userIds ? res.userIds.split(',') : [];
      orgArr.value = res.departIds ? res.departIds.split(',') : [];
      authorizeFromInfo.roleIds = res.roleIds ? res.roleIds.split(',') : [];
    });
  };
  watch(
    () => authorizeFromInfo.orgIds,
    (news, olds) => {
      // tree-select取消选中时进行
      if (olds.length > news.length) {
        const newsArr = news.map((item) => item.value);
        const includesArr = olds.filter((ite) => !newsArr.includes(ite.value));
        authorizeFromInfo.orgIdsValue = authorizeFromInfo.orgIdsValue.filter((item) => item.value !== includesArr[0].value);
      }
      if (news.length === 0) {
        authorizeFromInfo.orgIdsValue = [];
      }
    }
  );
  // 获取当前组织机构权限
  const getFiles = (Did: any[], list) => {
    list.forEach((item) => {
      if (item.children && item.children.length > 0) {
        getFiles(Did, item.children);
      }
      Did.forEach((id) => {
        if (item.id === id) {
          authorizeFromInfo.orgIdsValue.push({
            value: item.id,
            label: item.title,
          });
          authorizeFromInfo.orgIds.push({
            disabled: undefined,
            halfChecked: undefined,
            label: item.title,
            value: item.id,
          });
        }
      });
    });
  };
  const changeOrgSelect = (value: string, node: any) => {
    authorizeFromInfo.orgIdsValue.push({
      value: node.id,
      label: node.title,
    });
  };
  const clearOrg = () => {
    authorizeFromInfo.orgIds = [];
    authorizeFromInfo.orgIdsValue = [];
  };
  const closeSelectOrg = (value: string) => {
    authorizeFromInfo.orgIds = authorizeFromInfo.orgIds.filter((item) => item.value !== value);
    authorizeFromInfo.orgIdsValue = authorizeFromInfo.orgIdsValue.filter((item) => item.value !== value);
  };
  const getRowSelection = ({ selectedKeys, onItemSelectAll, onItemSelect }: Record<string, any>) => {
    return {
      onSelectAll(selected: boolean, selectedRows: Record<string, string | boolean>[]) {
        const treeSelectedKeys = selectedRows.map(({ id }) => id);
        onItemSelectAll(treeSelectedKeys, selected);
      },
      onSelect({ id }: Record<string, string>, selected: boolean) {
        onItemSelect(id, selected);
      },
      selectedRowKeys: selectedKeys,
    };
  };
  const okAuthorize = () => {
    const orgIds = authorizeFromInfo.orgIds.map((item) => item.value);
    const params = {
      id: queryParam.id,
      userIds: authorizeFromInfo.userAuthorize.join(','),
      roleIds: authorizeFromInfo.roleIds.join(','),
      orgIds: orgIds.join(','),
    };
    const formData = getFormDateVal(params);
    doAuth(formData).then((res) => {
      if (res.success) {
        visibleAuthorize.value = false;
        emit('ok');
      }
    });
  };
  // 整合formData数据
  const getFormDateVal = (data: any) => {
    const formData = new FormData();
    const fd_keys = Object.keys(data) || [];
    fd_keys.forEach((item) => {
      formData.set(item, data[item]);
    });
    return formData;
  };
  const cancelAuthorize = () => {
    visibleAuthorize.value = false;
  };
  return {
    visibleAuthorize,
    authorizeFromInfo,
    okAuthorize,
    cancelAuthorize,
    openAuthorize,
    dataSourceLeft,
    columnsAuthorize,
    getRowSelection,
    orgTreeData,
    dataSourceRole,
    columnsRole,
    cardKeys,
    tabList,
    onTabChange,
    orgLoading,
    userLoading,
    clearOrg,
    closeSelectOrg,
    changeOrgSelect,
    SHOW_ALL,
    roleLoading,
  };
};
export default useAuthorize;
