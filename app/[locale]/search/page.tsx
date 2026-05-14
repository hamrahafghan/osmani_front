// app/[locale]/search/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { searchGoods, calculateTax, getCurrentRates, type Vehicle, type CalculationResult } from '@/lib/api';
import { getTranslation, type Locale } from '@/lib/translations';

export default function SearchPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'fa';
  const t = (key: string) => getTranslation(locale, key);
  
  const [searchParams, setSearchParams] = useState({
    name: '',
    hsCode: '',
    tscCode: ''
  });
  const [results, setResults] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // State برای محاسبه
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [calculationValues, setCalculationValues] = useState({
    value: 10000,
    freight: 1000,
    insurance: 100,
    isLicensed: true
  });
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [rates, setRates] = useState<any>(null);

  // بارگذاری نرخ‌ها
  useState(() => {
    getCurrentRates().then(setRates).catch(console.error);
  });

  const handleSearch = async () => {
    if (!searchParams.name && !searchParams.hsCode && !searchParams.tscCode) {
      alert('لطفاً حداقل یکی از فیلدهای جستجو را پر کنید');
      return;
    }
    
    setLoading(true);
    setSearched(true);
    setSelectedVehicle(null);
    setCalculation(null);
    
    try {
      const data = await searchGoods({
        name: searchParams.name,
        hsCode: searchParams.hsCode,
        tscCode: searchParams.tscCode
      });
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      alert(t('error'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCalculating(true);
    try {
      const result = await calculateTax(
        vehicle.variant_id,
        calculationValues.value,
        calculationValues.freight,
        calculationValues.insurance,
        calculationValues.isLicensed
      );
      setCalculation(result);
    } catch (error: any) {
      console.error('Calculation error:', error);
      alert(error.message || t('error'));
    } finally {
      setCalculating(false);
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

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1a4a6a] mb-8">{t('searchTitle')}</h1>
      
      {/* فرم جستجو */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-2">{t('searchName')}</label>
            <input
              type="text"
              value={searchParams.name}
              onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
              placeholder={t('searchName')}
              className="input-field"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">{t('searchHsCode')}</label>
            <input
              type="text"
              value={searchParams.hsCode}
              onChange={(e) => setSearchParams({ ...searchParams, hsCode: e.target.value })}
              placeholder="مثال: 87042300"
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">{t('searchTscCode')}</label>
            <input
              type="text"
              value={searchParams.tscCode}
              onChange={(e) => setSearchParams({ ...searchParams, tscCode: e.target.value })}
              placeholder="مثال: 0311"
              className="input-field font-mono"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            <i className="fas fa-search"></i>
            {loading ? t('searching') : t('searchBtn')}
          </button>
        </div>
      </div>
      
      {/* نتایج جستجو */}
      {searched && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">{t('searchResults')} ({results.length})</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
              <p className="mt-2 text-gray-500">{t('loading')}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <i className="fas fa-box-open text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">{t('noResults')}</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {results.map((vehicle) => (
                <div key={vehicle.variant_id} className="card">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {vehicle.make_name} - {vehicle.model_name}
                      </h3>
                      <div className="grid md:grid-cols-4 gap-3 mt-3 text-sm">
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
                          <span className="font-semibold">${formatNumber(vehicle.price)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCalculate(vehicle)}
                      disabled={calculating && selectedVehicle?.variant_id === vehicle.variant_id}
                      className="btn-primary whitespace-nowrap"
                    >
                      <i className="fas fa-calculator ml-1"></i>
                      {calculating && selectedVehicle?.variant_id === vehicle.variant_id ? t('loading') : 'محاسبه مالیات'}
                    </button>
                  </div>
                  
                  {/* فرم محاسبه و نتیجه - فقط برای موتر انتخاب شده */}
                  {selectedVehicle?.variant_id === vehicle.variant_id && (
                    <div className="mt-4 pt-4 border-t">
                      {/* فرم ارزش */}
                      <div className="grid md:grid-cols-4 gap-3 mb-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1">ارزش کالا (USD)</label>
                          <input
                            type="number"
                            value={calculationValues.value}
                            onChange={(e) => setCalculationValues({ ...calculationValues, value: parseFloat(e.target.value) || 0 })}
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">هزینه حمل (USD)</label>
                          <input
                            type="number"
                            value={calculationValues.freight}
                            onChange={(e) => setCalculationValues({ ...calculationValues, freight: parseFloat(e.target.value) || 0 })}
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">هزینه بیمه (USD)</label>
                          <input
                            type="number"
                            value={calculationValues.insurance}
                            onChange={(e) => setCalculationValues({ ...calculationValues, insurance: parseFloat(e.target.value) || 0 })}
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={calculationValues.isLicensed}
                              onChange={(e) => setCalculationValues({ ...calculationValues, isLicensed: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold">دارای جواز کسب</span>
                          </label>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleCalculate(vehicle)}
                        disabled={calculating}
                        className="w-full btn-secondary py-2 text-sm"
                      >
                        <i className="fas fa-sync-alt ml-1"></i>
                        محاسبه مجدد
                      </button>
                      
                      {/* نتیجه محاسبه */}
                      {calculation && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-bold mb-3">💰 نتیجه محاسبه</h4>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span>ارزش CIF:</span>
                              <span className="font-semibold">{formatMoney(calculation.calculations.base_price_afn)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>حقوق گمرکی ({vehicle.tax_rate}%):</span>
                              <span>{formatMoney(calculation.calculations.customs_duty)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>مالیات BRT ({calculation.rates_used.brt_rate}%):</span>
                              <span>{formatMoney(calculation.calculations.brt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>مالیات ثابت ({calculation.rates_used.fixed_tax_rate}%):</span>
                              <span>{formatMoney(calculation.calculations.fixed_tax)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>مالیات هلال احمر ({calculation.rates_used.red_crescent_rate}%):</span>
                              <span>{formatMoney(calculation.calculations.red_crescent)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>مالیات شهرداری ({calculation.rates_used.municipality_rate}%):</span>
                              <span>{formatMoney(calculation.calculations.municipality)}</span>
                            </div>
                            <div className="flex justify-between pt-2 mt-2 border-t text-base font-bold text-[#2c5f2d] col-span-2">
                              <span>جمع کل قابل پرداخت:</span>
                              <span>{formatMoney(calculation.calculations.total_tax)}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-400 text-center">
                            نرخ ارز: {calculation.rates_used.usd_to_afn} AFN = 1 USD
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}