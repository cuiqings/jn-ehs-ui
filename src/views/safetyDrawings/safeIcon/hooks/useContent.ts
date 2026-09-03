import { useForm, FormSchema } from '/@/components/Form';
import { useModal } from '/@/components/Modal';

const useContent = () => {
  const formSchema: FormSchema[] = [
    {
      label: '安全标志名称',
      field: 'name',
      component: 'Input',
    },
    {
      label: '英文名称',
      field: 'enname',
      component: 'Input',
    },
    {
      label: '标志类别',
      field: 'signType',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'jn_risk_sign_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
  ];

  const [registerForm] = useForm({
    schemas: formSchema,
    baseColProps: { span: 6 },
    actionColOptions: { span: 4 },
    labelWidth: 120,
  });

  const [register, { openModal, closeModal, setModalProps }] = useModal();

  const addFormSchema: FormSchema[] = [
    {
      label: '',
      component: 'Input',
      field: 'id',
      ifShow: false,
    },
    {
      label: '标志类别',
      field: 'signType',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'jn_risk_sign_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '安全标志名称',
      field: 'name',
      component: 'Input',
      required: true,
      componentProps: {
        maxLength: 20
      }
    },
    {
      label: '英文名称',
      field: 'enname',
      component: 'Input',
      componentProps: {
        maxLength: 30
      }
    },
    {
      label: '国际代码',
      field: 'standardCode',
      component: 'Input',
      componentProps: {
        maxLength: 30
      }
    },
    {
      label: '标志图片',
      field: 'signPicture',
      component: 'JImageUpload',
      rules: [{ required: true, message: '请上传标志图片！'}],
      componentProps: {
        accept: '.jpeg,.jpg,.png,.gif,.bmp,.webp',
      },
      required: true,
    },
  ];

  const [addRegisterForm, { validate, getFieldsValue, setFieldsValue, resetFields }] = useForm({
    schemas: addFormSchema,
    actionColOptions: { span: 24 },
    labelWidth: 120,
    showActionButtonGroup: false,
  });

  return {
    register,
    openModal,
    closeModal,
    setModalProps,
    registerForm,
    validate,
    resetFields,
    getFieldsValue,
    setFieldsValue,
    addRegisterForm,
  };
};

export default useContent;
