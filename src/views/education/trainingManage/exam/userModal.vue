<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" title="培训对象" @close="onClose" destroyOnClose>
      <div class="usermain">
        <div class="left">
          <a-tabs v-model:activeKey="activeKey" size="size">
            <a-tab-pane key="1" tab="选择部门">
              <div class="tabinner">
                <div class="treewrap">
                  <a-checkbox v-model:checked="allChecked">全选</a-checkbox>
                  <a-tree
                    v-model:checkedKeys="checkedKeys"
                    checkable
                    @check="treeSelectDepart"
                    :fieldNames="{ title: 'departName', key: 'orgCode' }"
                    :tree-data="treeData"
                  ></a-tree>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="选择学员">
              <div class="tabinner">
                <div class="treewrap">
                  <a-checkbox v-model:checked="allChecked">全部</a-checkbox>
                  <a-tree
                    @select="treeSelect"
                    v-model:checkedKeys="checkedKeys"
                    :fieldNames="{ title: 'departName', key: 'orgCode' }"
                    :tree-data="treeData"
                  ></a-tree>
                </div>
                <div class="userList">
                  <div class="item"><span>全选</span><a-checkbox @change="allCheckUserChange" v-model:checked="allCheckedUser"></a-checkbox></div>
                  <div class="listwrap">
                    <a-checkbox-group v-model:value="checkedUserList" @change="userCheckChange" style="width: 100%">
                      <div class="item" v-for="item in userList"
                        ><span>{{ item.realname }}</span
                        ><a-checkbox :value="item"></a-checkbox
                      ></div>
                    </a-checkbox-group>
                  </div>
                  <a-pagination size="small" hideOnSinglePage v-model:current="current" :total="total" @change="pageChange" show-less-items />
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
        <div class="right">
          <div class="hd"> 已选择：<span @click="clearAll" class="clearall">清空</span> </div>
          <div class="r-main">
            <template v-for="item in resultList">
              <div class="r-item" v-if="item.custmorType == 'user'">
                <span class="name">{{ item.realname }}</span
                ><CloseOutlined style="color: #ff4d4f" @click="delItem(item)" />
              </div>
              <div class="r-item" v-else>
                <span class="name">{{ item.departName }}</span
                ><CloseOutlined style="color: #ff4d4f" @click="delItem(item)" />
              </div>
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">确定</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepartTreeBy23, userListByOrg } from '/@/api/common/api';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { Pagination } from 'ant-design-vue';
  const APagination = Pagination;
  const emit = defineEmits(['success']);
  const loading = ref(false);
  const activeKey = ref('1');
  const checkedUserList = ref<any[]>([]);
  const allChecked = ref(false);
  const allCheckedUser = ref(false);
  // 分页
  const total = ref(0);
  const current = ref(1);

  onMounted(() => {
    getDepartTree();
  });
  // 部门
  const treeData = ref<any[]>([]);
  const checkedKeys = ref<any[]>([]);
  const getDepartTree = () => {
    getDepartTreeBy23().then(async (res) => {
      console.log(res);
      treeData.value = res;
    });
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    getUserList();
    reviewData(data);
  });

  const close = () => {
    closeModal();
    clearAll();
  };

  // 回显选中
  const reviewData = (data) => {
    if (data.type == 'edit') {
      let userList = data.detailInfo.userList.map(val => {
        val.custmorType = 'user'
        return val;
      });
      resultList.value = [...userList, ...data.detailInfo.orgList];
      checkedKeys.value = data.detailInfo.orgList.map((val) => val.orgCode);
    }
  };

  const confirmClose = async () => {
    let map = { trainObjectPerson: '', trainObjectPersonName: '', trainObjectOrg: '', trainObjectOrgName: '' };
    resultList.value.forEach((item) => {
      if (item.custmorType == 'user') {
        map.trainObjectPerson += item.id + ',';
        map.trainObjectPersonName += item.realname + ',';
      } else {
        map.trainObjectOrg += item.orgCode + ',';
        map.trainObjectOrgName += item.departName + ',';
      }
    });
    map.trainObjectPerson = map.trainObjectPerson.slice(0, -1);
    map.trainObjectPersonName = map.trainObjectPersonName.slice(0, -1);
    map.trainObjectOrg = map.trainObjectOrg.slice(0, -1);
    map.trainObjectOrgName = map.trainObjectOrgName.slice(0, -1);
    console.log(map);
    emit('success', map);
  };
  // 选择部门
  const treeSelectDepart = (e, { checkedNodes, node }) => {
    console.log(e, checkedNodes);
    if (e.length == 0) {
      resultList.value = resultList.value.filter((x) => x.id !== node.id);
      return;
    }
    if (!resultList.value.some((x) => x.id === node.id)) {
      resultList.value.push(node);
    }
  };
  const pageChange = (v) => {
    current.value = v;
    getUserList();
    allCheckedUser.value = false;
    checkedUserList.value = resultList.value.filter((x) => x.custmorType === 'user');
  };
  const userName = ref('');
  const orgCode = ref('');
  const userList = ref<any[]>([]);
  const getUserList = () => {
    userListByOrg({ pageNo: current.value, pageSize: 10, orgCode: orgCode.value, userName: userName.value }).then((res) => {
      userList.value = res.records;
      total.value = res.total;
      let arr = [];
      resultList.value.filter((x) => x.custmorType === 'user').map(val => {
        userList.value.forEach((item) => {
          console.log(item);
          if (item.id == val.id) {
            arr.push(item);
          }
        })
      });
      checkedUserList.value = arr;
      console.log(checkedUserList.value);
      
    });
  };
  const treeSelect = (e) => {
    orgCode.value = e[0];
    getUserList();
  };

  const allCheckUserChange = (e) => {
    if (allCheckedUser.value) {
      checkedUserList.value = userList.value;
      setResult('user');
    } else {
      resultList.value = resultList.value.filter((x) => !checkedUserList.value.some((item) => x.id === item.id));
      checkedUserList.value = [];
    }
  };

  const userCheckChange = (e) => {
    console.log(e);
    console.log(checkedUserList.value);
    setResult('user');
    console.log(resultList.value);
  };

  const setResult = (type) => {
    if (type === 'user') {
      checkedUserList.value.forEach((item) => {
        item.custmorType = 'user';
      });
      let arr = [...resultList.value, ...checkedUserList.value];
      let arr2 = [];
      let hash = {};
      arr2 = arr.reduce((item, next) => {
        hash[next.id] ? '' : (hash[next.id] = true && item.push(next));
        return item;
      }, []);
      console.log(arr2);

      resultList.value = arr2;
    }
  };

  const resultList = ref<any[]>([]);
  const delItem = (item) => {
    resultList.value = resultList.value.filter((i) => i.id !== item.id);
  };

  const clearAll = () => {
    resultList.value = [];
    checkedKeys.value = [];
    checkedUserList.value = [];
    allCheckedUser.value = false;
    allChecked.value = false;
  };
</script>
<style lang="less" scoped>
  .usermain {
    display: flex;
    position: relative;
    justify-content: space-between;
    .left {
      flex: 1;
    }
    .right {
      width: 200px;
      height: 464px;
      display: flex;
      flex-direction: column;
      background-color: #fafafa;
      padding: 10px;
      padding-top: 0;
      overflow-y: auto;
      .hd {
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        span {
          color: #1890ff;
        }
      }
      .r-main {
        flex: 1;
        overflow-y: auto;
        .r-item {
          line-height: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }
    }
    .tabinner {
      height: 400px;
      display: flex;
      .treewrap {
        width: 200px;
        height: 100%;
        overflow-y: auto;
      }
      .userList {
        flex: 1;
        width: 340px;
        padding: 0 10px;
        display: flex;
        flex-direction: column;
        .listwrap {
          flex: 1;
        }
        .item {
          line-height: 32px;
          display: flex;
          justify-content: space-between;
        }
      }
    }
  }
</style>
