<template>
  <div class="safeIcon">
    <div class="search">
      <BasicForm @register="registerForm" @submit="handleSubmit" @reset="reset" />
    </div>
    <div class="action">
      <a-button v-auth="'safeIcon:add'" type="primary" @click="add">新增</a-button>
    </div>
    <div class="main">
      <div class="item" @click="edit(item)" v-for="item in iconList" :key="item">
        <img :src="getFileAccessHttpUrl(item.signPicture)" alt="" />
        <ul class="item-bt">
          <li :title="'安全标志名称：' + item.name">安全标志名称： {{ item.name }} </li>
          <li :title="'英文名称：' + item.enname">英文名称： {{ item.enname }}</li>
          <li :title="'国标代码：' + item.standardCode">国标代码：{{ item.standardCode }}</li>
          <li
            ><span class="tag" :class="'tag' + item.signType">{{ renderDict(item.signType, 'jn_risk_sign_type') }}</span></li
          >
        </ul>
      </div>
    </div>
    <div class="pagation-box">
      <pagination
        v-model:current="pageNum"
        show-quick-jumper
        show-size-changer
        :total="total"
        @change="pageChange"
        v-model:page-size="pageSize"
        :defaultPageSize="pageSize"
        :show-total="(total: number) => `共${total}条记录  第${pageNum}/${Math.ceil(total / pageSize)}页`"
        :pageSizeOptions="[10, 20, 50, 100]"
    /></div>
    <BasicModal @register="register">
      <BasicForm @register="addRegisterForm" />
      <div class="footer">
        <a-button @click="cancel">取消</a-button>
        <a-button v-auth="'safeIcon:del'" danger @click="del" :loading="submiting" v-if="handleType == 'edit'">删除</a-button>
        <a-button v-auth="'safeIcon:edit'" type="primary" :loading="submiting" @click="submit">确定</a-button>
      </div>
    </BasicModal>
  </div>
</template>
<script setup name="limitSpace" lang="ts">
  import { Pagination } from 'ant-design-vue';
  import { BasicForm } from '/@/components/Form';
  import useContent from './hooks/useContent';
  import { BasicModal } from '/@/components/Modal';
  import { onMounted, ref, nextTick } from 'vue';
  import { add as addapi, list, del as delapi } from './url/index';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { register, openModal, closeModal, setModalProps, registerForm, addRegisterForm, validate, getFieldsValue, setFieldsValue, resetFields } =
    useContent();

  const $message = useMessage();
  const submiting = ref<boolean>(false);
  const handleType = ref<string>('add');
  const total = ref<number>(0);
  const pageSize = ref<number>(10);
  const pageNum = ref(1);
  const pageChange = (page: number) => {
    getList({});
    console.log(pageNum.value, page);
  };

  onMounted(() => {
    setModalProps({
      footer: null,
    });
  });

  const currentItem = ref<any>({});
  pageInit();
  function pageInit() {
    getList({});
  }

  const iconList = ref<any[]>([]);

  const handleSubmit = (e) => {
    console.log(e);

    getList(e);
  };

  const reset = () => {
    getList({});
  };

  function getList(params) {
    list({
      ...params,
      pageNo: pageNum.value,
      pageSize: pageSize.value,
    }).then((res) => {
      total.value = res.total;
      console.log(res);
      iconList.value = res.records;
    });
  }

  const add = () => {
    handleType.value = 'add';
    setModalProps({
      title: '新增安全标志',
    });
    openModal(true, {
      isUpdate: false,
    });
    nextTick(() => {
      resetFields();
    });
  };

  const edit = (item: any) => {
    handleType.value = 'edit';
    currentItem.value = item;
    setModalProps({
      title: '安全标志编辑',
    });
    openModal();
    nextTick(() => {
      resetFields();
      setFieldsValue(item);
    });
  };

  const cancel = () => {
    closeModal();
  };

  const del = () => {
    $message.createConfirm({
      iconType: 'warning',
      title: '删除',
      content: `是否确认删除？`,
      onOk: () => {
        submiting.value = true;
        delapi({ id: currentItem.value.id })
          .then(() => {
            submiting.value = false;
            getList({});
            closeModal();
          })
          .catch((_) => (submiting.value = false));
      },
    });
  };

  const submit = () => {
    validate()
      .then(() => {
        submiting.value = true;
        const data = getFieldsValue();
        addapi(data).then((res) => {
          console.log(res);
          getList({});
          submiting.value = false;
          closeModal();
        });
      })
      .catch(() => {
        submiting.value = false;
      });
  };

  const renderDict = (v, code) => {
    let text = '';
    let array = getDictItemsByCode(code) || [];
    let obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
</script>
<style lang="less">
  .safeIcon {
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    padding: 10px;
    overflow: hidden;
    .search {
      height: 72px;
      background-color: #fff;
      padding-top: 20px;
    }
    .action {
      height: 45px;
      background-color: #fff;
      padding: 0 10px;
      margin-top: 10px;
      line-height: 45px;
    }
    .pagation-box {
      height: 45px;
      background-color: #fff;
      text-align: right;
      padding: 5px 10px;
    }
    .main {
      flex: 1;
      background: #fff;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: flex-start;
      overflow: auto;
      padding: 10px;
      .item {
        box-sizing: border-box;
        width: calc((100% - 60px) / 5);
        height: 300px;
        border: 1px solid #ccc;
        margin: 0 15px 15px 0;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
        &:nth-child(5n) {
          // 去除第3n个的margin-right
          margin-right: 0;
        }
        .item-bt {
          width: 100%;
          overflow: hidden;
          text-align: left;
          padding: 0 20px;
          li {
            width: 100%;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
            white-space: nowrap;
          }
        }
        img {
          width: 120px;
          height: 150px;
        }
        .tag {
          padding: 0 8px;
          border-radius: 4px;
        }
        .tag2 {
          background-color: #ffff80;
        }
        .tag1 {
          background-color: #e67c89;
        }
        .tag3 {
          background-color: #81d3f8;
        }
        .tag4 {
          background-color: #caf982;
        }
      }
    }
  }
  .footer {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    .ant-btn {
      margin: 0 10px;
    }
  }
</style>
