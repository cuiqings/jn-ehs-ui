import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { FormSchema } from '/@/components/Table';
import { nextTick, ref } from 'vue';
import { message, Upload } from 'ant-design-vue';
import { add, edit, getRelatedFile, queryRelateById } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { neic, isc, csc, area } from './useStatic';
// import { queryKnowledgeBase } from '../../knowledgeBase/api';

export const useAddOrEditDrawer = (emit: any) => {
  const title = ref('新增');
  const { createMessage } = useMessage();
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '文件类型',
      field: 'fileType',
      component: 'JDictSelectTag',
      defaultValue: '1',
      rules: [{ required: true, message: '文件类型不可为空!' }],
      componentProps: ({ formModel }) => {
        return {
          dictCode: 'law_file_type',
          placeholder: '请选择',
          stringToNumber: false,
          showChooseOption: false,
          onChange: () => {
            if (formModel.fileType === '1') {
              formModel.chinaStandardNumber = '';
              formModel.chinaStandardNumberCode = null;
              formModel.internalStandardNumber = '';
              formModel.internalStandardNumberCode = null;
              formModel.tradeStandardCategort = '';
              formModel.tradeStandardCategortCode = null;
              formModel.area = null;
              formModel.technicalOmmittees = '';
              formModel.draftingUnit = '';
              formModel.drafter = '';
            }
            if (formModel.fileType === '2') {
              formModel.legalHierarchy = '';
              formModel.tradeStandardCategort = '';
              formModel.tradeStandardCategortCode = null;
              formModel.area = null;
            }
            if (formModel.fileType === '3') {
              formModel.legalHierarchy = '';
              formModel.area = null;
            }
            if (formModel.fileType === '4') {
              formModel.legalHierarchy = '';
              formModel.tradeStandardCategort = '';
              formModel.tradeStandardCategortCode = null;
            }
          },
        };
      },
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
      label: '发文字号',
      field: 'standardNumber',
      component: 'Input',
      rules: [{ required: true, message: '发文字号不可为空!' }],
      componentProps: {
        maxlength: 100,
      },
      ifShow: ({ values }) => values.fileType == '1',
    },
    {
      label: '标准编号',
      field: 'standardNumber',
      component: 'Input',
      rules: [{ required: true, message: '标准编号不可为空!' }],
      componentProps: {
        maxlength: 100,
      },
      ifShow: ({ values }) => values.fileType == '2' || values.fileType == '3' || values.fileType == '4',
    },
    {
      label: '',
      field: 'topicCategory',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'topicTwoCategory',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'topicCategoryId',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'topicTwoCategoryId',
      component: 'Input',
      show: false,
    },
    {
      label: '主题分类',
      field: 'topicType',
      component: 'JTreeSelect1',
      rules: [{ required: true, message: '主题分类不可为空!' }],
      componentProps: ({ formModel }) => {
        return {
          url: '/sys/category/childList',
          params: {
            pid: '1719911661011816449',
          },
          fieldNames: {
            label: 'name',
            value: 'name',
            options: 'children',
          },
          onChange: (value, extra) => {
            if (value) {
              if (extra.triggerNode.props.fatherName) {
                formModel.topicCategory = extra.triggerNode.props.fatherName;
                formModel.topicTwoCategory = value;
                formModel.topicCategoryId = extra.triggerNode.props.pid;
                formModel.topicTwoCategoryId = extra.triggerNode.props.id;
              } else {
                formModel.topicCategory = value;
                formModel.topicTwoCategory = '';
                formModel.topicCategoryId = extra.triggerNode.props.id;
                formModel.topicTwoCategoryId = '';
              }
            } else {
              formModel.topicCategory = '';
              formModel.topicTwoCategory = '';
              formModel.topicCategoryId = '';
              formModel.topicTwoCategoryId = '';
            }
          },
          getPopupContainer: () => document.body,
        };
      },
    },
    {
      label: '法律层级',
      field: 'legalHierarchy',
      component: 'JDictSelectTag',
      // rules: [{ required: true, message: '法律层级不可为空!' }],
      componentProps: {
        dictCode: 'law_level',
        stringToNumber: false,
        showChooseOption: false,
      },
      ifShow: ({ values }) => values.fileType == '1',
    },
    {
      label: '',
      field: 'chinaStandardNumber',
      component: 'Input',
      show: false,
    },
    {
      label: '中国标准分类号',
      field: 'chinaStandardNumberCode',
      component: 'JTreeSelect1',
      // rules: [{ required: true, message: '中国标准分类号不可为空!' }],
      componentProps: ({ formModel }) => {
        return {
          treeDataArr: csc,
          getPopupContainer: () => document.body,
          onChange: (value, extra) => {
            if (value) {
              formModel.chinaStandardNumber = extra.triggerNode.props.label;
            } else {
              formModel.chinaStandardNumber = '';
            }
          },
        };
      },
      ifShow: ({ values }) => values.fileType == '2' || values.fileType == '3' || values.fileType == '4',
    },
    {
      label: '',
      field: 'internalStandardNumber',
      component: 'Input',
      show: false,
    },
    {
      label: '国际标准分类号',
      field: 'internalStandardNumberCode',
      component: 'JTreeSelect1',
      // rules: [{ required: true, message: '国际标准分类号不可为空!' }],
      componentProps: ({ formModel }) => {
        return {
          treeDataArr: isc,
          getPopupContainer: () => document.body,
          onChange: (value, extra) => {
            if (value) {
              formModel.internalStandardNumber = extra.triggerNode.props.label;
            } else {
              formModel.internalStandardNumber = '';
            }
          },
        };
      },
      ifShow: ({ values }) => values.fileType == '2' || values.fileType == '3' || values.fileType == '4',
    },
    {
      label: '',
      field: 'tradeStandardCategort',
      component: 'Input',
      show: false,
    },
    {
      label: '行业标准分类',
      field: 'tradeStandardCategortCode',
      component: 'JTreeSelect1',
      // rules: [{ required: true, message: '行业标准分类不可为空!' }],
      componentProps: ({ formModel }) => {
        return {
          treeDataArr: neic,
          getPopupContainer: () => document.body,
          onChange: (value, extra) => {
            if (value) {
              formModel.tradeStandardCategort = extra.triggerNode.props.label;
            } else {
              formModel.tradeStandardCategort = '';
            }
          },
        };
      },
      ifShow: ({ values }) => values.fileType == '3',
    },
    {
      label: '地区',
      field: 'area',
      component: 'Select',
      rules: [{ required: true, message: '地区不可为空!' }],
      componentProps: {
        options: area,
      },
      ifShow: ({ values }) => values.fileType == '4',
    },
    {
      label: '发布部门',
      field: 'publishDepart',
      component: 'Input',
      // rules: [{ required: true, message: '发布部门不可为空!' }],
      componentProps: {
        maxlength: 100,
      },
    },
    {
      label: '归口单位',
      field: 'technicalOmmittees',
      component: 'Input',
      // rules: [{ required: true, message: '归口单位不可为空!' }],
      componentProps: {
        maxlength: 100,
      },
      ifShow: ({ values }) => values.fileType == '2' || values.fileType == '3' || values.fileType == '4',
    },
    {
      label: '起草单位',
      field: 'draftingUnit',
      component: 'Input',
      // rules: [{ required: true, message: '起草单位不可为空!' }],
      componentProps: {
        maxlength: 100,
      },
      ifShow: ({ values }) => values.fileType == '2' || values.fileType == '3' || values.fileType == '4',
    },
    {
      label: '起草人',
      field: 'drafter',
      component: 'Input',
      // rules: [{ required: true, message: '起草人不可为空!' }],
      componentProps: {
        maxlength: 100,
      },
      ifShow: ({ values }) => values.fileType == '2' || values.fileType == '3' || values.fileType == '4',
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
      label: '实施日期',
      field: 'executeDate',
      component: 'DatePicker',
      defaultValue: new Date(),
      rules: [{ required: true, message: '实施日期不可为空!' }],
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '请选择',
        style: { width: '100%' },
      },
    },
    // {
    //   label: '是否上传知识库',
    //   field: 'uploadKnowledgeBase',
    //   component: 'Switch',
    //   required: true,
    //   defaultValue: '0',
    //   componentProps: ({ formModel }) => {
    //     return {
    //       checked: false,
    //       checkedValue: '1',
    //       unCheckedValue: '0',
    //       onChange: (checked: string) => {
    //         if (checked === '0') {
    //           formModel.knowledgeBaseName = undefined;
    //         }
    //       },
    //     };
    //   },
    // },
    // {
    //   label: '知识库名称',
    //   field: 'knowledgeBaseName',
    //   component: 'ApiSelect',
    //   ifShow: ({ values }) => values.uploadKnowledgeBase == '1',
    //   required: true,
    //   componentProps: {
    //     mode: 'multiple',
    //     api: queryKnowledgeBase,
    //     labelField: 'kb_name',
    //     valueField: 'kb_name',
    //     filterOption: (input: string, option: any) => {
    //       return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    //     },
    //   },
    // },
    {
      label: '适用范围',
      field: 'scopeUse',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 800,
        rows: 5,
      },
    },
    {
      label: '相关文件',
      field: 'relateFile',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        api: getRelatedFile,
        labelField: 'fileName',
        valueField: 'id',
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
    },
    {
      label: '法规状态',
      field: 'hierarchyStatus',
      defaultValue: '1',
      component: 'JDictSelectTag',
      rules: [{ required: true, message: '法规状态不可为空!' }],
      componentProps: {
        dictCode: 'law_status',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      field: 'fileUrl',
      label: '附件',
      component: 'JUpload',
      rules: [{ required: true, message: '附件不可为空!' }],
      componentProps: {
        maxCount: 1,
        text: '添加附件',
        bizPath: 'lawfile',
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
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
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
    if (data.type === 'add') {
      title.value = '新增';
    }
    if (data.type !== 'add') {
      title.value = '修改';
      queryRelateById({ id: data.record.id }).then((res) => {
        nextTick(() => {
          if (data.record.topicTwoCategory) {
            data.record.topicType = data.record.topicTwoCategory;
          } else {
            data.record.topicType = data.record.topicCategory;
          }
          getRelatedFile().then((res) => {
            let relateFileData: any = [];
            relateFileData = res;
            // 去除删除某条相关文件后回显问题
            if (data.record.relateFile && data.record.relateFile !== '' && relateFileData.length > 0) {
              const arr = data.record.relateFile.split(',').filter((item) => relateFileData.some((ite) => item === ite.id));
              if (arr.length > 0) {
                data.record.relateFile = arr.join(',');
              } else {
                data.record.relateFile = '';
              }
            } else {
              data.record.relateFile = '';
            }
          });
          updateSchema([
            {
              field: 'fileContent',
              componentProps: {
                disabled: res.associationContentList.length > 0,
              },
            },
            {
              field: 'relateFile',
              componentProps: {
                removeId: data.record.id,
              },
            },
          ]);
          setFieldsValue({ ...data.record });
          setFieldsValue({
            uploadKnowledgeBase: res.uploadKnowledgeBase ? res.uploadKnowledgeBase : '0',
            knowledgeBaseName: res.knowledgeBaseName ? res.knowledgeBaseName : undefined,
          });
        });
      });
    }
  });
  const handleSubmit = async () => {
    try {
      const values = await validate();
      setDrawerProps({ confirmLoading: true });
      if (title.value === '修改') {
        await edit(values).then((res: any) => {
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
        await add(values).then(() => {
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
  };
};
export default useAddOrEditDrawer;
