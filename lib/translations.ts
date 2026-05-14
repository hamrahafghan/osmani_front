// lib/translations.ts

export type Locale = 'fa' | 'en';

export const translations = {
  fa: {
    // Sidebar Menu
    menuSearch: '🔍 جستجو',
    menuBrowse: '🚗 مرور برند و مدل',
    menuRegisterVehicle: '📝 ثبت اطلاعات گمرکی موتر',
    menuVehicleList: '📄 لیست موترهای ثبت شده',
    menuSettings: '⚙️ تنظیمات',
    appTitle: 'شرکت تجارتی عثمان عثمانی کاکر لمیتد',
    appSubtitle: 'سیستم محاسبه مالیات گمرکی',
    
    // Search Page
    searchTitle: 'جستجوی کالا',
    searchName: 'نام کالا',
    searchHsCode: 'کد HS',
    searchTscCode: 'کد TSC',
    searchBtn: 'جستجو',
    searching: 'در حال جستجو...',
    noResults: 'کالایی یافت نشد',
    searchResults: 'نتایج جستجو',
    
    // Browse Page
    browseTitle: 'مرور موترها بر اساس برند و مدل',
    selectBrand: '🔹 یک برند را انتخاب کنید',
    selectModel: '🔸 سپس یک مدل را انتخاب کنید',
    selectBrandFirst: 'لطفاً ابتدا یک برند انتخاب کنید',
    brands: 'برندها',
    models: 'مدل‌ها',
    vehicles: 'موترها',
    
    // Settings Page
    settingsTitle: 'تنظیمات سیستم',
    currencyRate: 'نرخ ارز و مالیات',
    usdRate: 'نرخ دلار (USD to AFN)',
    brtTax: 'مالیات BRT (%)',
    redCrescentTax: 'مالیات هلال احمر (%)',
    municipalityTax: 'مالیات شهرداری (%)',
    fixedTaxLicensed: 'مالیات ثابت (دارای جواز) (%)',
    fixedTaxUnlicensed: 'مالیات ثابت (بدون جواز) (%)',
    defaultValues: 'مقادیر پیش‌فرض محاسبه',
    defaultValue: 'ارزش پیش‌فرض کالا (USD)',
    defaultFreight: 'هزینه حمل پیش‌فرض (USD)',
    defaultInsurance: 'هزینه بیمه پیش‌فرض (USD)',
    saveRates: 'ذخیره نرخ‌ها',
    saveDefaults: 'ذخیره مقادیر پیش‌فرض',
    saving: 'در حال ذخیره...',
    saveSuccess: 'با موفقیت ذخیره شد',
    saveError: 'خطا در ذخیره',
    
    // Common
    loading: 'در حال بارگذاری...',
    error: '❌ خطا رخ داد',
    year: 'سال',
    weight: 'وزن',
    price: 'قیمت پایه',
    taxRate: 'نرخ گمرکی',
    calculate: 'محاسبه مالیات',
    calculating: 'در حال محاسبه...',
    result: 'نتیجه محاسبه',
    cifValue: 'ارزش CIF',
    customsDuty: 'حقوق گمرکی',
    brt: 'مالیات BRT',
    fixedTax: 'مالیات ثابت',
    redCrescent: 'مالیات هلال احمر',
    municipality: 'مالیات شهرداری',
    total: 'جمع کل قابل پرداخت',
    licensed: '✅ دارای جواز کسب',
    value: 'ارزش کالا',
    freight: 'هزینه حمل',
    insurance: 'هزینه بیمه',
  },
  
  en: {
    // Sidebar Menu
    menuSearch: '🔍 Search',
    menuBrowse: '🚗 Browse Brand & Model',
    menuRegisterVehicle: '📝 Register Vehicle Customs Info',
    menuVehicleList: '📄 Registered Vehicles List',
    menuSettings: '⚙️ Settings',
    appTitle: 'Osman Osmani Kakar Limited',
    appSubtitle: 'Customs Tax Calculation System',
    
    // Search Page
    searchTitle: 'Search Goods',
    searchName: 'Goods Name',
    searchHsCode: 'HS Code',
    searchTscCode: 'TSC Code',
    searchBtn: 'Search',
    searching: 'Searching...',
    noResults: 'No goods found',
    searchResults: 'Search Results',
    
    // Browse Page
    browseTitle: 'Browse Vehicles by Brand & Model',
    selectBrand: '🔹 Select a brand',
    selectModel: '🔸 Then select a model',
    selectBrandFirst: 'Please select a brand first',
    brands: 'Brands',
    models: 'Models',
    vehicles: 'Vehicles',
    
    // Settings Page
    settingsTitle: 'System Settings',
    currencyRate: 'Currency & Tax Rates',
    usdRate: 'USD Rate (USD to AFN)',
    brtTax: 'BRT Tax (%)',
    redCrescentTax: 'Red Crescent Tax (%)',
    municipalityTax: 'Municipality Tax (%)',
    fixedTaxLicensed: 'Fixed Tax (Licensed) (%)',
    fixedTaxUnlicensed: 'Fixed Tax (Unlicensed) (%)',
    defaultValues: 'Calculation Default Values',
    defaultValue: 'Default Goods Value (USD)',
    defaultFreight: 'Default Freight Cost (USD)',
    defaultInsurance: 'Default Insurance Cost (USD)',
    saveRates: 'Save Rates',
    saveDefaults: 'Save Defaults',
    saving: 'Saving...',
    saveSuccess: 'Saved successfully',
    saveError: 'Error saving',
    
    // Common
    loading: 'Loading...',
    error: '❌ Error occurred',
    year: 'Year',
    weight: 'Weight',
    price: 'Base Price',
    taxRate: 'Duty Rate',
    calculate: 'Calculate Tax',
    calculating: 'Calculating...',
    result: 'Calculation Result',
    cifValue: 'CIF Value',
    customsDuty: 'Customs Duty',
    brt: 'BRT Tax',
    fixedTax: 'Fixed Tax',
    redCrescent: 'Red Crescent Tax',
    municipality: 'Municipality Tax',
    total: 'Total Payable',
    licensed: '✅ Licensed',
    value: 'Goods Value',
    freight: 'Freight Cost',
    insurance: 'Insurance Cost',
  }
};

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let result: any = translations[locale];
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      return key;
    }
  }
  return result as string;
}