<template>
  <BasicModal @register="registerModal" :title="getTitle" width="1200px" @ok="handleSubmit">
    <div class="safeSign">
      <div class="search">
        <BasicForm @register="registerForm" @submit="handleSubmitForm" @reset="reset" />
      </div>
      <div class="main">
        <!-- key最好用index或者item自带的id 或者不写但是控制台会报警告-->
        <div class="item" v-for="(item, idx) in iconList" :key="item.id">
          <a-checkbox
            class="checkbox"
            v-model:checked="item.selected"
            @change="clickCheckbox($event, item.signPicture, idx)"
            :value="item.id"
          ></a-checkbox>
          <img :src="getFileAccessHttpUrl(item.signPicture)" @click="clickImg(item.signPicture, idx)" />
          <div class="item-bt">
            <span :title="item.name" style="text-overflow: ellipsis; overflow: hidden; word-break: break-all; white-space: nowrap; width: 59%">{{
              item.name
            }}</span>
            <span class="tag" :class="'tag' + item.signType">{{ renderDict(item.signType, 'jn_risk_sign_type') }}</span>
          </div>
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
    </div>
    <template #footer>
      <div>
        <a-button @click="close">取消</a-button>
        <a-button type="primary" @click="handleSubmit">提交</a-button>
      </div>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { signList } from './url/index';
  import { Pagination } from 'ant-design-vue';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const total = ref<number>(0);
  const pageSize = ref<number>(10);
  const pageNum = ref(1);
  const getTitle = '添加安全标志';
  const emits = defineEmits(['callback-value']);
  let pictures = ref([]);
  const maxLen = ref(20);
  // 表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('safetySignArr', data.data);
    if (data.maxLen) {
      maxLen.value = data.maxLen;
    }
    getList({});
    if (data.data) {
      pictures.value = JSON.parse(JSON.stringify(data.data));
      setChecked();
    }
    setModalProps({ confirmLoading: false, minHeight: 180 });
  });

  function setChecked() {
    iconList.value.forEach((item) => {
      pictures.value.forEach((k) => {
        if (k == item.signPicture) {
          item.selected = true;
        }
      });
    });
  }

  //点击图片选中
  const clickImg = (signPicture, idx) => {
    if (pictures.value.length >= maxLen.value) {
      createMessage.info('添加安全标志数量已达上限！');
      iconList.value[idx].selected = false;
      return;
    }
    let temp = null;
    iconList.value.find((item) => {
      if (item.signPicture == signPicture) {
        item.selected = !item.selected;
        temp = item;
      }
    });
    //选中添加
    if (temp.selected) {
      pictures.value.push(signPicture);
    } else {
      pictures.value = pictures.value.filter((item) => item != signPicture);
    }
  };
  //点击框框选中
  const clickCheckbox = (e, signPicture, idx) => {
    if (pictures.value.length >= maxLen.value && e.target.checked) {
      createMessage.info('添加安全标志数量已达上限！');
      iconList.value[idx].selected = false;
      return;
    }
    //改变iconList里的checked
    iconList.value.find((item) => {
      if (item.signPicture == signPicture) {
        item.selected = e.target.checked;
      }
    });
    //选中则添加到ids中  其实这个参数id和e.target.value一样，用哪个都行
    if (e.target.checked) {
      pictures.value.push(signPicture);
    } else {
      pictures.value = pictures.value.filter((item) => item != signPicture);
    }
  };

  const pageChange = (page: number) => {
    getList({});
  };

  const handleSubmit = () => {
    emits('callback-value', pictures.value);
    close();
  };

  const close = () => {
    iconList.value.forEach((item) => {
      item.selected = false;
    });
    closeModal();
  };

  const searchSafeSign = <FormSchema[]>[
    {
      label: '安全标志名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '标志类别',
      field: 'signType',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'jn_risk_sign_type',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
  ];

  const [registerForm] = useForm({
    schemas: searchSafeSign,
    baseColProps: { span: 6 },
    actionColOptions: { span: 4 },
    labelWidth: 120,
  });

  pageInit();
  function pageInit() {
    getList({});
  }

  const iconList = ref<any[]>([]);

  function getList(params) {
    signList({
      ...params,
      pageNo: pageNum.value,
      pageSize: pageSize.value,
    }).then((res) => {
      total.value = res.total;
      console.log(res);
      //额外增加checked字段默认false
      iconList.value = res.records.map((item) => ({
        ...item,
        checked: false,
      }));
      setChecked();
    });
  }

  const renderDict = (v, code) => {
    let text = '';
    let array = getDictItemsByCode(code) || [];
    let obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };

  const handleSubmitForm = (e) => {
    console.log(e);

    getList(e);
  };

  const reset = () => {
    getList({});
  };
</script>

<style lang="less">
  .safeSign {
    width: 100%;
    flex-direction: column;

    .search {
      width: 100%;
      height: 60px;
      background-color: #fff;

      .ant-form-item-control-input-content {
        display: flex;
      }
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
      min-height: 546px;
      .item {
        box-sizing: border-box;
        width: calc((100% - 60px) / 5);
        border: 1px solid #ccc;
        margin: 0 15px 15px 0;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
        position: relative;

        .checkbox {
          position: absolute;
          top: 5px;
          right: 5px;
        }

        &:nth-child(5n) {
          // 去除第3n个的margin-right
          margin-right: 0;
        }

        .item-bt {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding: 0 20px;
          width: 100%;
        }

        img {
          width: 120px;
          height: 150px;
          cursor: pointer;
        }

        .tag {
          padding: 0 8px;
          border-radius: 4px;
          display: inline-block;
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

    .pagation-box {
      height: 45px;
      background-color: #fff;
      text-align: right;
      padding: 5px 10px;
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
