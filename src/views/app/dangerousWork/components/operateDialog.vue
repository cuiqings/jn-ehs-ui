<template>
  <van-popup
    position="bottom"
    :style="{ height: '80%' }"
    v-model:show="show"
    :title="curItem.reformType == '1' ? '去整改' : '确认整改'"
    show-cancel-button
    @cancel="cancel"
  >
    <div class="popup-body">
      <div class="tit">{{ curItem.myType == '1' ? '操作步骤记录' : '操作步骤确认' }}</div>
      <van-form ref="dialogForm" :model="checkInfo" class="divinput">
        <van-collapse v-model="activeNames">
          <van-collapse-item v-for="(item, index) in checkInfo" :title="item.workProcedure" :name="index">
            <van-field
              v-model="item.operatingTime"
              name="operatingTime"
              label="完成时间"
              required
              readonly
              :disabled="curItem.myType == '2'"
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择' }]"
              @click="showDateTimePicker(index)"
            />
            <van-field
              v-model="item.operatingUserName"
              name="operatingUser"
              label="操作者"
              placeholder="请选择"
              readonly
              :disabled="curItem.myType == '2'"
              @click="userClick('operatingUser', index)"
            />
            <van-field
              v-model="item.confirmUserName"
              name="confirmUser"
              label="确认人"
              placeholder="请选择"
              readonly
              :disabled="curItem.myType == '2'"
              required
              @click="userClick('confirmUser', index)"
              :rules="[{ required: true, message: '请选择' }]"
            />
          </van-collapse-item>
        </van-collapse>
      </van-form>
      <div class="foot">
        <van-button
          class="cancel-btn"
          @click="cancel"
        >取消</van-button>
        <van-button
          type="primary"
          class="submit-btn"
          :loading="confirmLoading"
          @click="dialogConfirm"
        >提交</van-button>
      </div>
    </div>
    <DateTimePicker
      :values="dialogFormData.analysisTime"
      @changeValue="showPicker = false"
      :showPicker="showPicker"
      @confirm="onConfirm"
    />
    <van-popup v-model:show="showUserPicker" position="bottom">
      <van-picker :columns-field-names="{text: 'realname', value: 'id'}" :columns="userList" @confirm="onUserConfirm" @cancel="showUserPicker = false" />
    </van-popup>
  </van-popup>
  <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose" show-cancel-button>
    <Sign v-if="signShow" v-model:value="signature" />
  </van-dialog>
</template>
<script lang="ts" setup>
  import { queryOperation, queryConfirmOperation, queryWorkUser, recordOperation, operationSign} from '/@/views/hazardousOperation/api/index';
  import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
   import Sign from '../../components/sign.vue';
  import { ref, reactive, computed, toRefs } from 'vue';
  import { FormInstance, showFailToast } from 'vant';

  const active = ref(0);
	const activeNames = ref([]);
  const curIndex = ref(0);
  const curfield = ref('');
  const showPicker = ref(false);
  const showUserPicker = ref(false);
  const dialogForm = ref<FormInstance>();
    const signature = ref('');
  const signShow = ref(false);
  
  const onConfirm = (value: any) => {
    checkInfo.value[curIndex.value].operatingTime = value;
    showPicker.value = false;
  };
  const showDateTimePicker = (index: number) => {
    if(curItem.value.myType == '2') return;
    curIndex.value = index;
    showPicker.value = true;
  };
  const userClick = (type: string, index: number) => {
    if(curItem.value.myType == '2') return;
    curIndex.value = index;
    curfield.value = type;
    showUserPicker.value = true;
  };
const onUserConfirm = (value: any) => {
  let item = value.selectedOptions[0];
    checkInfo.value[curIndex.value][curfield.value] = value.selectedValues[0];
    checkInfo.value[curIndex.value][curfield.value+'Name'] = item.realname;
    showUserPicker.value = false;
  };
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    curItem: {
      type: Object,
      default: () => ({}),
    },
    isIn: {
      type: Boolean,
      default: true, // true表示进入空间，false表示出来空间
    },
  });

  const { curItem } = toRefs(props);
  const emits = defineEmits(['submit', 'update:show']);
  const show = computed(() => {
    if (props.show) {
      init();
    }
    return props.show;
  });

  const dialogFormData = reactive<any>({
    id: '',
    result: '',
		imgUrl: ''
  });
  const checkInfo = ref<any>({});
  const init = async () => {
    activeNames.value = [];
    getUsers();
    if(curItem.value.myType == '1') {
      queryOperation({
        id: curItem.value.id,
      }).then((res) => {
        console.log(res);
        res.forEach((item, idx) => {
          item.workApplyId = curItem.value.id
          activeNames.value.push(idx)
        });
        checkInfo.value = res;
      });
    } else {
      queryConfirmOperation({
        id: curItem.value.id
      }).then((res) => {
        checkInfo.value = res;
        res.map((item, idx) => activeNames.value.push(idx))
      });
    }
  }
  const userList = ref<any[]>([]);
  const getUsers = () => {
    queryWorkUser({ id: curItem.value.id }).then((res) => {
      res.forEach((item) => {
        // item.realname = item.realname +'-'+ item.workNo+'-' + item.org3Name
        item.realname = item.realname + (item.workNo ? `(${item.workNo})` : '') + (item.org3Name ? `-${item.org3Name}` : '');
        item.label = item.realname;
      });
      userList.value = res;
    }).catch((err) => {
      userList.value = [];
    });
  }

  const cancel = () => {
    emits('update:show', false);
    active.value = 0; // 重置选项卡
		dialogFormData.result = '';
		dialogFormData.imgUrl = '';
		dialogFormData.id = '';
    dialogForm.value[active.value]?.resetValidation();
  };

  const confirmLoading = ref(false);
  const dialogConfirm = () => {
    dialogForm.value
      ?.validate()
      .then(() => {
        return new Promise(async (resolve, reject) => {
					if(curItem.value.myType == '1') {
            confirmLoading.value = true;
            recordOperation(checkInfo.value).then(res => {
              emits('submit');
              emits('update:show', false);
              confirmLoading.value = false;
            }).catch((err) => {
              confirmLoading.value = false;
            });
          } else {
            signShow.value = true;
          }
			  });
      })
      .catch(() => {
        return false;
      });
  };
  const beforeClose = (c) => {
    if (c == 'cancel') {
      signShow.value = false;
      return Promise.resolve(false);
    }
    return new Promise(async (resolve, reject) => {
      if (!signature.value) {
        showFailToast('请签名！');
        resolve(false);
      } else {
        operationSign({ workApplyId: curItem.value?.id, sign: signature.value }).then((res) => {
          resolve(true);
          emits('update:show', false);
          emits('submit');
        }).catch((err) => {
          showFailToast(err.message || '操作失败');
          resolve(false);
        });
      }
    });
  };
</script>
<style lang="less" scoped>
  .divinput{
    :deep(.van-cell){
      padding: 10px 0 !important;
    }
  }
  .popup-body {
    padding: 20px;
    height: calc(100% - 60px);
    overflow-y: auto;
    .tit{
      font-weight: 600;
      color: #1989fa;
    }
    .foot{
      position: absolute;
      left: 0;
      bottom: 0;
      height: 50px;
      background-color: #ffffff;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-around;
      // 上面有阴影
      box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
    }
  } 
</style>
