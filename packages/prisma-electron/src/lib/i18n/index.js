import i18n, { alpha } from './i18n';

export default i18n;

const __ = i18n.namespace();
const n__ = __.n;
const changeLanguage = i18n.changeLanguage;

export { __, n__, alpha, i18n, changeLanguage };
