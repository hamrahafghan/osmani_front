// app/[locale]/browse/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMakes, getModelsByMake, getVehiclesByMakeAndModel, calculateTax, getCurrentRates, type Vehicle, type CalculationResult } from '@/lib/api';
import { getTranslation, type Locale } from '@/lib/translations';

export default function BrowsePage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'fa';
  const t = (key: string) => getTranslation(locale, key);
  
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  
  // State برای محاسبه
  const [calculatingVehicleId, setCalculatingVehicleId] = useState<string | null>(null);
  const [calculations, setCalculations] = useState<Record<string, CalculationResult>>({});
  const [isLicensed, setIsLicensed] = useState(true);
  const [currentRates, setCurrentRates] = useState<any>(null);
  
  // مقادیر پیش‌فرض حمل و بیمه (از تنظیمات)
  const [defaultFreight, setDefaultFreight] = useState(0);
  const [defaultInsurance, setDefaultInsurance] = useState(0);

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
      try {
        const data = await getMakes();
        setMakes(data);
      } catch (error) {
        console.error('Error loading makes:', error);
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
    setLoadingModels(true);
    
    try {
      const data = await getModelsByMake(make);
      setModels(data);
    } catch (error) {
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
    
    try {
      const data = await getVehiclesByMakeAndModel(selectedMake, model);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // محاسبه مالیات - همیشه از قیمت دیتابیس استفاده می‌کند
  const handleCalculate = async (vehicle: Vehicle) => {
    setCalculatingVehicleId(vehicle.variant_id);
    try {
      // استفاده از price دیتابیس به عنوان ارزش کالا
      const result = await calculateTax(
        vehicle.variant_id,
        vehicle.price,      // ← قیمت از دیتابیس (اجباری)
        defaultFreight,     // هزینه حمل پیش‌فرض
        defaultInsurance,   // هزینه بیمه پیش‌فرض
        isLicensed
      );
      setCalculations(prev => ({ ...prev, [vehicle.variant_id]: result }));
    } catch (error: any) {
      console.error('Calculation error:', error);
      alert(error.message || t('error'));
    } finally {
      setCalculatingVehicleId(null);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fa' ? 'fa-AF' : 'en-US', {
      style: 'currency',
      currency: 'AFN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fa' ? 'fa-AF' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1a4a6a] mb-8">{t('browseTitle')}</h1>
      
      {/* نرخ ارز جاری */}
      {currentRates && (
        <div className="bg-blue-50 rounded-xl p-3 mb-6 text-sm text-center border border-blue-200">
          <span className="font-semibold">💵 نرخ ارز جاری:</span>
          <span className="mr-2">{currentRates.usd_to_afn} AFN = 1 USD</span>
        </div>
      )}
      
      {/* بخش برندها */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 text-[#1a4a6a]">{t('brands')}</h2>
        {loadingMakes ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-[#1a4a6a]"></i>
            <span className="mr-2">{t('loading')}</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
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
          <h2 className="text-lg font-bold mb-4 text-[#1a4a6a]">{t('models')}</h2>
          {loadingModels ? (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin text-[#1a4a6a]"></i>
              <span className="mr-2">{t('loading')}</span>
            </div>
          ) : models.length === 0 ? (
            <p className="text-gray-500 text-center py-4">مدلی یافت نشد</p>
          ) : (
            <div className="flex flex-wrap gap-2">
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
      
      {/* بخش نتایج */}
      {selectedModel && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-xl font-bold">{t('vehicles')} ({vehicles.length})</h2>
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
              <span className="text-sm font-semibold">✅ {t('licensed')}</span>
            </label>
          </div>
          
          {loadingVehicles ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
              <p className="mt-2 text-gray-500">{t('loading')}</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <i className="fas fa-car-side text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">موتری یافت نشد</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.variant_id} className="card">
                  {/* اطلاعات موتر */}
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {vehicle.make_name} - {vehicle.model_name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">{t('year')}:</span>{' '}
                          <span className="font-semibold">{vehicle.year}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('weight')}:</span>{' '}
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
                          <span className="text-gray-500">{t('taxRate')}:</span>{' '}
                          <span className="font-semibold text-[#2c5f2d]">{vehicle.tax_rate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('price')}:</span>{' '}
                          <span className="font-semibold">{formatUSD(vehicle.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* دکمه محاسبه */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid md:grid-cols-3 gap-3 mb-3 text-sm text-gray-500">
                      <div>🚚 هزینه حمل: {formatUSD(defaultFreight)}</div>
                      <div>🛡️ هزینه بیمه: {formatUSD(defaultInsurance)}</div>
                      <div>💰 ارزش کالا: {formatUSD(vehicle.price)} (از دیتابیس)</div>
                    </div>
                    
                    <button
                      onClick={() => handleCalculate(vehicle)}
                      disabled={calculatingVehicleId === vehicle.variant_id}
                      className="w-full btn-primary py-2 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-calculator"></i>
                      {calculatingVehicleId === vehicle.variant_id ? t('calculating') : t('calculate')}
                    </button>
                    
                    {/* نتیجه محاسبه */}
                    {calculations[vehicle.variant_id] && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-800 mb-3">💰 {t('result')}</h4>
                        
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">{t('value')}:</span>
                            <span className="font-semibold">{formatUSD(vehicle.price)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">{t('freight')}:</span>
                            <span>{formatUSD(defaultFreight)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">{t('insurance')}:</span>
                            <span>{formatUSD(defaultInsurance)}</span>
                          </div>
                          <div className="flex justify-between py-1 border-t mt-1 pt-1">
                            <span className="text-gray-600">{t('cifValue')}:</span>
                            <span className="font-semibold">{formatMoney(calculations[vehicle.variant_id].calculations.base_price_afn)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">{t('customsDuty')} ({vehicle.tax_rate}%):</span>
                            <span>{formatMoney(calculations[vehicle.variant_id].calculations.customs_duty)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">{t('brt')} ({calculations[vehicle.variant_id].rates_used.brt_rate}%):</span>
                            <span>{formatMoney(calculations[vehicle.variant_id].calculations.brt)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">{t('fixedTax')} ({calculations[vehicle.variant_id].rates_used.fixed_tax_rate}%):</span>
                            <span>{formatMoney(calculations[vehicle.variant_id].calculations.fixed_tax)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">{t('redCrescent')}:</span>
                            <span>{formatMoney(calculations[vehicle.variant_id].calculations.red_crescent)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">{t('municipality')}:</span>
                            <span>{formatMoney(calculations[vehicle.variant_id].calculations.municipality)}</span>
                          </div>
                          <div className="flex justify-between py-2 mt-2 border-t border-green-200 col-span-2 text-base font-bold text-green-800">
                            <span>{t('total')}:</span>
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
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* راهنما */}
      {!selectedMake && (
        <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
          <i className="fas fa-info-circle text-blue-500 text-2xl mb-2"></i>
          <p className="text-blue-700">{t('selectBrand')}</p>
          <p className="text-blue-500 text-sm mt-1">{t('selectModel')}</p>
        </div>
      )}
    </div>
  );
}