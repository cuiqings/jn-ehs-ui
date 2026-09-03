<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="getTitle"
    width="35%"
    @ok="handleSubmit"
    destroyOnClose
    okText="提交"
    :showFooter="showFooter"
  >
    <BasicForm @register="registerForm">
      <!-- 选择人员 -->
      <template #PeopleSlot="{ model, field }">
        <a-select
          mode="multiple"
          v-model:value="model[field]"
          @change="valueSelect = model[field]"
          allowClear
          :open="false"
          :disabled="!showFooter"
          @click="showFooter && openTreeModal()"
          placeholder="请选择"
        >
          <a-select-option v-for="(item, index) in optionsNew" :key="index" :value="item.username">
            {{ item.realname }}
          </a-select-option>
        </a-select>
      </template>
      <!-- 安全生产职责 -->
      <template #SafeSlot="{ model, field }">
        <ul>
          <li v-for="(e, i) in model[field]" :key="i" style="margin-bottom: 10px"
            >{{ i + 1 }}、
            <a-input
              v-model:value.trim="model[field][i]"
              @input="handleInput($event, model[field], i)"
              style="width: 80%"
              :disabled="!showFooter"
              :maxLength="100"
              placeholder="请输入"
            />
            <a-icon
              v-if="showFooter"
              type="plus-circle"
              @click="addSafe(model[field], e, i)"
              style="color: #1f7df8; margin: 0 10px; cursor: pointer"
            />
            <a-icon type="minus-circle" @click="delSafe(model[field], e, i)" v-if="showFooter && i != 0" style="color: red; cursor: pointer" />
          </li>
        </ul>
      </template>
    </BasicForm>
    <!-- <DemoFormModal @register="registerModal" @success="backPeople" :ifMul="false" /> -->
    <UseSingleSelectModal :selectUserIds="selectUserIds" @register="registerModal" @select="backPeople" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, onMounted, watch } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { formSchema } from './demo.data';
  import { saveOrUpdateDemo, getTree } from './demo.api';
  import DemoFormModal from './DemoFormModal.vue';
  import UseSingleSelectModal from './components/UseSingleSelectModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { toRaw } from '@vue/reactivity';
  import { getNextDep } from './demo.api';
  import { TreeSelect } from 'ant-design-vue';
  import { queryByPost } from '../securityOrgSetting/api'
  const SHOW_ALL = TreeSelect.SHOW_ALL;
  const { createMessage: $message } = useMessage();
  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const props = defineProps({
    data: { type: Object, default: () => ({}) },
    options: { type: Array, default: () => [] },
  });
  const optionsNew = ref<any>([]); // 选中的人员options
  const selp = ref<any>([]); // 选中的人员
  const isUpdate = ref(true);
  const showFooter = ref(true);
  const valueSelect = ref<string[]>([]);
  const idCur = ref('');
  const treeArr = ref([]);
  const selectUserIds: any = ref([]); // 选中的人员id数组
  // 注册 modal ======
  const [registerModal, { openModal }] = useModal();
  // 选择人员弹框确定
  function backPeople(selectArr, selectOptions) {
    console.log('selectArr', selectArr);
    console.log('selectOptions', selectOptions);
    selectUserIds.value = selectArr; // 返回选中的人员id数组
    optionsNew.value = selectOptions; // 返回选中的人员options
    selp.value = selectOptions.map((item) => {
      // 选中的人员真实name数组
      return item.username;
    });
    setFieldsValue({
      userName: selp.value, // 设置人员数据
    });
  }
  /**
   * 打开弹出框
   */
  function openTreeModal() {
    openModal(true, { isUpdate: false });
  }
  formSchema.forEach((item) => { 
    if (item.field == 'safetyManagementPost') { 
      item.componentProps.onChange = (v) => {
        queryByPost({post: v}).then(res => {
          console.log(res);
          if(res && res.list && res.list.length > 0){
            setFieldsValue({
              list: res.list.map(v => v.name)
            })
          } else {
            setFieldsValue({
              list: ['']
            })
          }
        })
      }
    }
  })
  // 注册Form ======
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema, clearValidate }] = useForm({
    labelWidth: 90,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  const initGetTree = async () => {
    await getTree().then((res) => {
      if (res) {
        treeArr.value = res;
      }
    });
  };
  // 注册Drawer ======
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    selectUserIds.value = [];
    treeArr.value = [];
    isUpdate.value = !!data?.isUpdate;
    showFooter.value = data?.showFooter ?? true;
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value });
    initGetTree();
    updateSchema({
      field: 'departName',
      ifShow: false,
      componentProps: {
        disabled: false,
      },
    });
    updateSchema({
      field: 'departNameCode',
      ifShow: true,
    });
    if (unref(isUpdate)) {
      if (data.record.list && data.record.list.length == 0) {
        data.record.list = [''];
      }
      if (!data.record.userName) {
        selectUserIds.value = [];
      } else {
        let arr = [];
        arr.push(data.record.userName);
        selectUserIds.value = arr;
      }
      setFieldsValue({
        ...data.record,
      });
    }
    idCur.value = data.record?.id ? data.record.id : '';
    if (!unref(isUpdate)) {
      // 新增
      updateSchema([
        {
          field: 'superiorDepartCode',
          componentProps: ({ formModel }) => {
            return {
              treeDataArr: treeArr.value,
              fieldNames: {
                label: 'title',
                value: 'departNameCode',
                key: 'departNameCode',
                options: 'children',
              },
              load: false,
              treeNodeFilterProp: 'title',
              showCheckedStrategy: SHOW_ALL,
              onChange: async (value: any, extra, label) => {
                formModel.superiorDepart = label[0];
                formModel.parentId = extra?.triggerNode?.props?.id;
                let res = await getNextDep({ orgCode: value });
                let options = res.map((e) => {
                  return {
                    id: e.id,
                    label: e.departName,
                    value: e.departNameCode,
                  };
                });
                formModel.departNameCode = undefined;
                formModel.departName = undefined;
                // 判断是否车间
                if (extra?.triggerNode?.props?.orgAttribute === '2') {
                  updateSchema({
                    field: 'departNameCode',
                    ifShow: false,
                  });
                  updateSchema({
                    field: 'departName',
                    ifShow: true,
                  });
                } else {
                  updateSchema({
                    field: 'departNameCode',
                    ifShow: true,
                  });
                  updateSchema({
                    field: 'departName',
                    ifShow: false,
                  });
                  updateSchema({
                    field: 'departNameCode',
                    componentProps: {
                      options: options,
                      onChange: async (e: any) => {
                        let curNast = options.find((e1) => {
                          return e1.value === e;
                        });
                        formModel.departName = curNast.label;
                      },
                    },
                  });
                }
              },
            };
          },
        },
        {
          field: 'departNameCode', // 部门options清空
          componentProps: {
            options: [],
            disabled: false,
          },
        },
      ]);
      setFieldsValue({
        list: [''],
      });
    } else {
      updateSchema({
        field: 'departName',
        ifShow: true,
        componentProps: {
          disabled: true,
        },
      });
      updateSchema({
        field: 'departNameCode',
        ifShow: false,
      });
      // 编辑 - 上级部门和部门名称不可编辑
      updateSchema([
        {
          field: 'superiorDepartCode',
          componentProps: () => {
            return {
              treeDataArr: treeArr.value,
              disabled: true,
              fieldNames: {
                label: 'title',
                value: 'departNameCode',
                key: 'departNameCode',
                options: 'children',
              },
              load: false,
              treeNodeFilterProp: 'title',
              showCheckedStrategy: SHOW_ALL,
            };
          },
        },
      ]);
    }
    if (!showFooter.value) {
      // 查看 - 清理字段的表单验证信息
      clearValidate();
    }
    //禁用表单
    setProps({ disabled: !showFooter.value });
  });
  /**
   * 标题
   */
  const getTitle = computed(() => {
    if (!unref(isUpdate)) {
      return '新增';
    } else {
      return showFooter.value ? '编辑' : '查看';
    }
  });
  /**
   * 提交
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      let arr: Array<object> = [];
      if (values.list) {
        let ar = values.list.split(',');
        for (var i = 0; i < ar.length; i++) {
          if (ar[i] === '') {
            $message.warning('请输入第' + (i + 1) + '项安全生产职责！');
            return;
          }
          arr.push({
            safetyProductionZz: ar[i],
          });
        }
      }
      values.list = arr;
      if (!unref(isUpdate)) {
        // 添加
        values.id = null;
      } else {
        values.id = idCur.value;
      }
      delete values.parentId;
      Object.keys(values).forEach((e) => {
        // 判断是否有下拉框字段undefined 处理
        if (!values[e]) {
          values[e] = '';
        }
      });
      setDrawerProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemo(values, isUpdate.value);
      closeDrawer();
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
  function addSafe(arr, _e, i) {
    toRaw(arr).splice(i + 1, 0, '');
    updateSchema([
      {
        field: 'list',
        defaultValue: toRaw(arr),
      },
    ]);
  }
  function delSafe(arr, _e, i) {
    toRaw(arr).splice(i, 1);
    updateSchema([
      {
        field: 'list',
        defaultValue: toRaw(arr),
      },
    ]);
  }
  function handleInput(event, arr, i) {
    const regex = /^[^,]*$/;
    if (!regex.test(event.target.value)) {
      arr[i] = event.target.value.replace(/,/g, '');
      updateSchema([
        {
          field: 'list',
          defaultValue: toRaw(arr),
        },
      ]);
    }
  }
  onMounted(() => {
    // 禁用字段
    // updateSchema([
    //   { field: 'parentId', componentProps: { disabled: true } },
    // ]);
    // 更新
    watch(
      () => props.options,
      async () => {
        optionsNew.value = toRaw(props.options);
      },
      { deep: true, immediate: true }
    );
  });
</script>
