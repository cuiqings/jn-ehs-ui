import { genMessage } from '../helper';
import antdLocale from 'ant-design-vue/es/locale/fr_FR';

const modules = import.meta.glob('./fr-FR/**/*.ts', { eager: true });
export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'fr-FR'),
    antdLocale,
  },
};
