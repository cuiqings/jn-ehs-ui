import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { FormSchema } from '/@/components/Table';
import { ref } from 'vue';
import { message, Upload } from 'ant-design-vue';
import { add, edit, details } from '../api';
import { useMessage } from '/@/hooks/web/useMessage';
export const useAddOrEditDrawer = (emit: any) => {
  const title = ref('新增');
  const showFooter = ref(true);
  const { createMessage } = useMessage();
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '文件名称',
      field: 'fileName',
      component: 'Input',
      rules: [{ required: true, message: '文件名称不可为空!' }],
      componentProps: {
        maxlength: 100,
      },
    },
    {
      label: '文件类别',
      field: 'fileCategory',
      component: 'JDictSelectTag',
      rules: [{ required: true, message: '文件类别不可为空!' }],
      componentProps: {
        dictCode: 'file_category',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '编号',
      field: 'fileNum',
      component: 'Input',
      componentProps: {
        maxlength: 100,
      },
    },
    {
      label: '发布日期',
      field: 'publishDate',
      component: 'DatePicker',
      defaultValue: new Date(),
      rules: [{ required: true, message: '发布日期不可为空!' }],
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '请选择',
        style: { width: '100%' },
      },
    },
    {
      label: '备注',
      field: 'remarks',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 800,
        rows: 5,
      },
    },
    // {
    //   label: '是否上传知识库',
    //   field: 'uploadKnowledgeBase',
    //   component: 'Switch',
    //   required: true,
    //   defaultValue: '0',
    //   componentProps: () => {
    //     return {
    //       checked: false,
    //       checkedValue: '1',
    //       unCheckedValue: '0',
    //     };
    //   },
    // },
    {
      field: 'fileUrl',
      label: '附件',
      component: 'JUpload',
      rules: [{ required: true, message: '附件不可为空!' }],
      componentProps: {
        maxCount: 1,
        text: '添加附件',
        bizPath: 'knowledgeBase',
        isFileManage: true,
        beforeUpload: (file: File) => {
          const isLt300M = file.size / 1024 / 1024 < 300;
          const isPdf = file.type === 'application/pdf';
          const isDoc = file.type === 'application/msword';
          const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf && !isDoc && !isDocx) {
            message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
    {
      label: '在线正文',
      field: 'fileContent',
      component: 'JEditor',
    },
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, setProps }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    showFooter.value = true;
    if (data.type === 'add') {
      title.value = '新增';
    }
    if (data.type == 'edit') {
      title.value = '修改';
      const res = await details({ id: data.record.id });
      if (res && res.fileCategory) {
        res.fileCategory = res.fileCategory.toString();
      }
      setFieldsValue({ ...res });
    }
    if (data.type === 'view') {
      title.value = '查看';
      showFooter.value = false;
      const res = await details({ id: data.record.id });
      if (res && res.fileCategory) {
        res.fileCategory = res.fileCategory.toString();
      }
      setFieldsValue({ ...res });
      // 所有表单不可编辑
      setProps({ disabled: data.type === 'view' });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value });
  });
  const handleSubmit = async () => {
    try {
      const values = await validate();
      const obj = JSON.parse(JSON.stringify(values));
      setDrawerProps({ confirmLoading: true });
      obj.uploadKnowledgeBase = '1';
      if (title.value === '修改') {
        edit(obj).then((res: any) => {
          if (res.success) {
            createMessage.success('修改成功！');
            //关闭弹窗
            closeDrawer();
            //刷新列表
            emit('success');
          } else {
            createMessage.error(res.message);
          }
        });
      } else {
        add(obj).then(() => {
          //关闭弹窗
          closeDrawer();
          //刷新列表
          emit('success');
        });
      }
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };
  return {
    BasicDrawer,
    registerDrawer,
    BasicForm,
    registerForm,
    handleSubmit,
    title,
    showFooter,
  };
};
export default useAddOrEditDrawer;
