// app/admin/calculate-tax/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getMakes, getModelsByMake, getVehiclesByMakeAndModel, calculateTax, getCurrentRates, searchGoods, type Vehicle, type CalculationResult } from '@/lib/api';

export default function CalculateTaxPage() {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // State برای جستجو
  const [searchType, setSearchType] = useState<'chassis' | 'hs' | 'tsc'>('chassis');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // State برای محاسبه
  const [calculatingVehicleId, setCalculatingVehicleId] = useState<string | null>(null);
  const [calculations, setCalculations] = useState<Record<string, CalculationResult>>({});
  const [isLicensed, setIsLicensed] = useState(true);
  const [currentRates, setCurrentRates] = useState<any>(null);
  
  // مقادیر پیش‌فرض حمل و بیمه
  const [defaultFreight] = useState(1000);
  const [defaultInsurance] = useState(100);

  // بارگذاری نرخ‌های جاری
  useEffect(() => {
    const loadRates = async () => {
      try {
        const rates = await getCurrentRates();
        setCurrentRates(rates);
      } catch (error) {
        console.error('Error loading rates:', error);
      }
    };
    loadRates();
  }, []);

  // بارگذاری برندها
  useEffect(() => {
    const loadMakes = async () => {
      setLoadingMakes(true);
      try {
        const data = await getMakes();
        setMakes(data || []);
      } catch (error: any) {
        console.error('Error loading makes:', error);
        setMakes([]);
      } finally {
        setLoadingMakes(false);
      }
    };
    loadMakes();
  }, []);

  // بارگذاری مدل‌ها
  const handleMakeSelect = async (make: string) => {
    setSelectedMake(make);
    setSelectedModel('');
    setVehicles([]);
    setCalculations({});
    setShowSearchResults(false);
    setLoadingModels(true);
    
    try {
      const data = await getModelsByMake(make);
      setModels(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading models:', error);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // بارگذاری موترها
  const handleModelSelect = async (model: string) => {
    setSelectedModel(model);
    setLoadingVehicles(true);
    setCalculations({});
    setShowSearchResults(false);
    
    try {
      const data = await getVehiclesByMakeAndModel(selectedMake, model);
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // جستجوی موتر
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      alert('لطفاً مقدار جستجو را وارد کنید');
      return;
    }
    
    setSearchLoading(true);
    setShowSearchResults(true);
    setVehicles([]);
    setSelectedMake('');
    setSelectedModel('');
    
    try {
      let results: Vehicle[] = [];
      
      if (searchType === 'chassis') {
        // جستجو با شماره شاسی - نیاز به API جدید دارد
        // فعلاً از searchGoods استفاده می‌کنیم
        results = await searchGoods({ name: searchValue });
      } else if (searchType === 'hs') {
        results = await searchGoods({ hsCode: searchValue });
      } else if (searchType === 'tsc') {
        results = await searchGoods({ tscCode: searchValue });
      }
      
      setSearchResults(results);
    } catch (error: any) {
      console.error('Search error:', error);
      alert(error.message || 'خطا در جستجو');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // محاسبه مالیات
  const handleCalculate = async (vehicle: Vehicle) => {
    setCalculatingVehicleId(vehicle.variant_id);
    try {
      const result = await calculateTax(
        vehicle.variant_id,
        vehicle.price,
        defaultFreight,
        defaultInsurance,
        isLicensed
      );
      setCalculations(prev => ({ ...prev, [vehicle.variant_id]: result }));
    } catch (error: any) {
      console.error('Calculation error:', error);
      alert(error.message || 'خطا در محاسبه');
    } finally {
      setCalculatingVehicleId(null);
    }
  };

  const formatNumber = (num: number) => {
    if (!num && num !== 0) return '-';
    return num.toLocaleString('fa-IR');
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fa-AF', {
      style: 'currency',
      currency: 'AFN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const displayVehicles = showSearchResults ? searchResults : vehicles;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a4a6a]">📊 محاسبه نرخ گمرکی</h1>
        <p className="text-gray-500 text-sm">جستجو و محاسبه مالیات گمرکی موترها</p>
      </div>
      
      {/* نرخ ارز جاری */}
      {currentRates && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm border border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold">💵 نرخ ارز جاری:</span>
            <span>{currentRates.usd_to_afn} AFN = 1 USD</span>
            <span className="text-gray-500">|</span>
            <span>مالیات BRT: {currentRates.brt_rate}%</span>
            <span className="text-gray-500">|</span>
            <span>مالیات ثابت: {isLicensed ? currentRates.fixed_tax_licensed : currentRates.fixed_tax_unlicensed}%</span>
          </div>
        </div>
      )}
      
      {/* بخش جستجو */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 text-[#1a4a6a]">🔍 جستجوی موتر</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">نوع جستجو</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
            >
              <option value="chassis">شماره شاسی</option>
              <option value="hs">کد HS</option>
              <option value="tsc">کد TSC</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">
              {searchType === 'chassis' && 'شماره شاسی'}
              {searchType === 'hs' && 'کد HS'}
              {searchType === 'tsc' && 'کد TSC'}
            </label>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                searchType === 'chassis' ? 'مثال: JHMGD18503S123456' :
                searchType === 'hs' ? 'مثال: 870323' :
                'مثال: TSC123456'
              }
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a] font-mono"
              dir="ltr"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="w-full bg-[#1a4a6a] text-white py-2 rounded-lg hover:bg-[#0b2b3b] transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-search"></i>
              {searchLoading ? 'در حال جستجو...' : 'جستجو'}
            </button>
          </div>
        </div>
        
        {showSearchResults && searchResults.length === 0 && !searchLoading && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-center text-yellow-700">
            <i className="fas fa-exclamation-triangle ml-2"></i>
            نتیجه‌ای یافت نشد
          </div>
        )}
      </div>
      
      {/* بخش برندها (مخفی در حالت جستجو) */}
      {!showSearchResults && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a4a6a]">🚗 انتخاب برند</h2>
            {loadingMakes ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin text-[#1a4a6a]"></i>
                <span className="mr-2">در حال بارگذاری...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {makes.map((make) => (
                  <button
                    key={make}
                    onClick={() => handleMakeSelect(make)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedMake === make
                        ? 'bg-[#2c5f2d] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {make}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* بخش مدل‌ها */}
          {selectedMake && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 text-[#1a4a6a]">🔧 انتخاب مدل</h2>
              {loadingModels ? (
                <div className="text-center py-4">
                  <i className="fas fa-spinner fa-spin text-[#1a4a6a]"></i>
                  <span className="mr-2">در حال بارگذاری...</span>
                </div>
              ) : models.length === 0 ? (
                <p className="text-gray-500 text-center py-4">مدلی یافت نشد</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => handleModelSelect(model)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        selectedModel === model
                          ? 'bg-[#2c5f2d] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* بخش نتایج */}
      {(selectedModel || showSearchResults) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-xl font-bold text-[#1a4a6a]">
              🚘 موترها ({displayVehicles.length})
              {showSearchResults && (
                <span className="text-sm text-gray-500 mr-2">(نتیجه جستجو)</span>
              )}
            </h2>
            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg">
              <input
                type="checkbox"
                checked={isLicensed}
                onChange={(e) => {
                  setIsLicensed(e.target.checked);
                  setCalculations({});
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">✅ دارای جواز کسب</span>
            </label>
          </div>
          
          {loadingVehicles ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
              <p className="mt-2 text-gray-500">در حال بارگذاری...</p>
            </div>
          ) : displayVehicles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <i className="fas fa-car-side text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">موتری یافت نشد</p>
              {showSearchResults && (
                <button
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchValue('');
                  }}
                  className="mt-4 text-[#1a4a6a] hover:underline"
                >
                  بازگشت به جستجوی برند و مدل
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {displayVehicles.map((vehicle) => (
                <div key={vehicle.variant_id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-[#1a4a6a]">
                          {vehicle.make_name} - {vehicle.model_name}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500">سال:</span>{' '}
                            <span className="font-semibold">{vehicle.year}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">وزن:</span>{' '}
                            <span className="font-semibold">{formatNumber(vehicle.weight)} kg</span>
                          </div>
                          <div>
                            <span className="text-gray-500">کد HS:</span>{' '}
                            <span className="font-mono font-semibold">{vehicle.code}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">کد TSC:</span>{' '}
                            <span className="font-mono font-semibold">{vehicle.tsc_code}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">نرخ گمرکی:</span>{' '}
                            <span className="font-semibold text-[#2c5f2d]">{vehicle.tax_rate}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">قیمت پایه:</span>{' '}
                            <span className="font-semibold">{formatUSD(vehicle.price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid md:grid-cols-3 gap-3 mb-3 text-sm text-gray-500">
                        <div>🚚 هزینه حمل: {formatUSD(defaultFreight)}</div>
                        <div>🛡️ هزینه بیمه: {formatUSD(defaultInsurance)}</div>
                        <div>💰 ارزش کالا: {formatUSD(vehicle.price)} (از دیتابیس)</div>
                      </div>
                      
                      <button
                        onClick={() => handleCalculate(vehicle)}
                        disabled={calculatingVehicleId === vehicle.variant_id}
                        className="w-full bg-[#1a4a6a] text-white py-2 rounded-lg hover:bg-[#0b2b3b] transition flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-calculator"></i>
                        {calculatingVehicleId === vehicle.variant_id ? 'در حال محاسبه...' : 'محاسبه مالیات'}
                      </button>
                      
                      {calculations[vehicle.variant_id] && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3">💰 نتیجه محاسبه</h4>
                          
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">ارزش کالا (USD):</span>
                              <span className="font-semibold">{formatUSD(vehicle.price)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">هزینه حمل (USD):</span>
                              <span>{formatUSD(defaultFreight)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">هزینه بیمه (USD):</span>
                              <span>{formatUSD(defaultInsurance)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-t mt-1 pt-1">
                              <span className="text-gray-600">ارزش CIF:</span>
                              <span className="font-semibold">{formatMoney(calculations[vehicle.variant_id].calculations.base_price_afn)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">حقوق گمرکی ({vehicle.tax_rate}%):</span>
                              <span>{formatMoney(calculations[vehicle.variant_id].calculations.customs_duty)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">مالیات BRT ({calculations[vehicle.variant_id].rates_used.brt_rate}%):</span>
                              <span>{formatMoney(calculations[vehicle.variant_id].calculations.brt)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">مالیات ثابت ({calculations[vehicle.variant_id].rates_used.fixed_tax_rate}%):</span>
                              <span>{formatMoney(calculations[vehicle.variant_id].calculations.fixed_tax)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">مالیات هلال احمر:</span>
                              <span>{formatMoney(calculations[vehicle.variant_id].calculations.red_crescent)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">مالیات شهرداری:</span>
                              <span>{formatMoney(calculations[vehicle.variant_id].calculations.municipality)}</span>
                            </div>
                            <div className="flex justify-between py-2 mt-2 border-t border-green-200 col-span-2 text-base font-bold text-green-800">
                              <span>جمع کل قابل پرداخت:</span>
                              <span>{formatMoney(calculations[vehicle.variant_id].calculations.total_tax)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-400 text-center">
                            نرخ ارز: {calculations[vehicle.variant_id].rates_used.usd_to_afn} AFN = 1 USD
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* راهنما */}
      {!selectedMake && !showSearchResults && (
        <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
          <i className="fas fa-info-circle text-blue-500 text-2xl mb-2"></i>
          <p className="text-blue-700">🔹 می‌توانید با جستجو یا انتخاب برند و مدل، موتر مورد نظر را پیدا کنید</p>
          <p className="text-blue-500 text-sm mt-1">🔸 سپس روی دکمه محاسبه مالیات کلیک کنید</p>
        </div>
      )}
    </div>
  );
}