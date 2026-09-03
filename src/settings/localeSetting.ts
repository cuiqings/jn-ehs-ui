import type { DropMenu } from '../components/Dropdown';
import type { LocaleSetting, LocaleType } from '/#/config';
import chinese from '/@/assets/images/chinese.png';
import english from '/@/assets/images/english.png';
import french from '/@/assets/images/french.png';
export const LOCALE: { [key: string]: LocaleType } = {
  ZH_CN: 'zh_CN',
  EN_US: 'en',
  FR_US: 'fr_CN',
};

export const localeSetting: LocaleSetting = {
  // 是否显示语言选择器
  showPicker: false,
  // 当前语言
  locale: LOCALE.ZH_CN,
  // 默认语言
  fallback: LOCALE.ZH_CN,
  // 允许的语言
  availableLocales: [LOCALE.ZH_CN, LOCALE.EN_US, LOCALE.FR_US],
};

// 语言列表
export const localeList: DropMenu[] = [
  {
    text: '简体中文',
    event: LOCALE.ZH_CN,
    img: chinese,
  },
  {
    text: 'English',
    event: LOCALE.EN_US,
    img: english,
  },
  {
    text: 'French',
    event: LOCALE.FR_US,
    img: french,
  },
];
