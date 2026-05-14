import { useTranslation } from 'react-i18next';

export const useLocalizedTranslation = () => {
  const { t, i18n } = useTranslation();

  const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(num);
  };

  const formatCurrency = (amount: number) => {
    return formatNumber(amount, {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDecimal = (num: number, decimals = 2) => {
    return formatNumber(num, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return {
    t,
    formatNumber,
    formatCurrency,
    formatDecimal,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
};
