// app/[locale]/calculator/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { calculateTaxByHsCode, getCurrentRates, type CalculationResult, type Vehicle } from '@/lib/api';
import { getTranslation, type Locale } from '@/lib/translations';

export default function CalculatorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as Locale) || 'fa';
  const t = (key: string) => getTranslation(locale, key);
  
  // دریافت hsCode از URL اگر وجود داشته باشد
  const hsCodeFromUrl = searchParams.get('hsCode') || '';
  
  const [formData, setFormData] = useState({
    hsCode: hsCodeFromUrl,
    value: 10000,
    freight: 1000,
    insurance: 100,
    isLicensed: true
  });
  
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<any>(null);

  // دریافت نرخ‌های جاری
  useEffect(() => {
    const loadRates = async () => {
      try {
        const data = await getCurrentRates();
        setRates(data);
      } catch (error) {
        console.error('Error loading rates:', error);
      }
    };
    loadRates();
  }, []);

  // اگر hsCode از URL آمده، محاسبه خودکار انجام شود
  useEffect(() => {
    if (hsCodeFromUrl) {
      handleCalculate();
    }
  }, [hsCodeFromUrl]);

  const handleCalculate = async () => {
    if (!formData.hsCode) {
      alert('لطفاً کد HS را وارد کنید');
      return;
    }
    
    setLoading(true);
    try {
      const result = await calculateTaxByHsCode(
        formData.hsCode,
        formData.value,
        formData.freight,
        formData.insurance,
        formData.isLicensed
      );
      setVehicle(result.vehicle);
      setCalculation(result.calculation);
    } catch (error: any) {
      console.error('Calculation error:', error);
      alert(error.message || t('error'));
      setCalculation(null);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fa' ? 'fa-AF' : 'en-US', {
      style: 'currency',
      currency: 'AFN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fa' ? 'fa-AF' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1a4a6a] mb-8">{t('calculatorTitle')}</h1>
      
      {/* نرخ‌های جاری */}
      {rates && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm border border-blue-200">
          <h3 className="font-bold mb-2 text-blue-800">📊 {t('currentRates') || 'نرخ‌های جاری'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>💵 نرخ دلار: <span className="font-bold">{rates.usd_to_afn} AFN</span></div>
            <div>📊 BRT: <span className="font-bold">{rates.brt_rate}%</span></div>
            <div>❤️ هلال احمر: <span className="font-bold">{rates.red_crescent_rate}%</span></div>
            <div>🏙️ شهرداری: <span className="font-bold">{rates.municipality_rate}%</span></div>
            <div>💵 مالیات ثابت (مجاز): <span className="font-bold">{rates.fixed_tax_licensed}%</span></div>
            <div>💵 مالیات ثابت (غیرمجاز): <span className="font-bold">{rates.fixed_tax_unlicensed}%</span></div>
          </div>
        </div>
      )}
      
      {/* فرم ورودی */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">{t('hsCode')}</label>
            <input
              type="text"
              value={formData.hsCode}
              onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
              placeholder="مثال: 87042300"
              className="input-field font-mono"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-2">{t('goodsValue')}</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">{t('freightCost')}</label>
              <input
                type="number"
                value={formData.freight}
                onChange={(e) => setFormData({ ...formData, freight: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">{t('insuranceCost')}</label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="licensed"
              checked={formData.isLicensed}
              onChange={(e) => setFormData({ ...formData, isLicensed: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="licensed" className="font-semibold cursor-pointer">
              {t('licensed')}
            </label>
          </div>
          
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            <i className="fas fa-calculator"></i>
            {loading ? t('loading') : t('calculateBtn')}
          </button>
        </div>
      </div>
      
      {/* نتیجه */}
      {calculation && vehicle && (
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
          <h2 className="text-xl font-bold text-[#1a4a6a] mb-4">{t('calculationResult')}</h2>
          
          {/* اطلاعات کالا */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <span className="text-gray-500">{t('browseTitle') || 'کالا'}:</span>
                <span className="font-bold mr-2">{vehicle.make_name} - {vehicle.model_name}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('year')}:</span>
                <span className="font-semibold mr-2">{vehicle.year}</span>
              </div>
              <div>
                <span className="text-gray-500">کد HS:</span>
                <span className="font-mono font-semibold mr-2">{vehicle.code}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('taxRate')}:</span>
                <span className="font-semibold text-[#2c5f2d] mr-2">{vehicle.tax_rate}%</span>
              </div>
            </div>
          </div>
          
          {/* جزئیات محاسبه */}
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">{t('cifValue')}:</span>
              <span>{formatMoney(calculation.calculations.base_price_afn)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">{t('customsDuty')} ({vehicle.tax_rate}%):</span>
              <span>{formatMoney(calculation.calculations.customs_duty)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">{t('brt')} ({calculation.rates_used.brt_rate}%):</span>
              <span>{formatMoney(calculation.calculations.brt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">{t('fixedTax')} ({calculation.rates_used.fixed_tax_rate}%):</span>
              <span>{formatMoney(calculation.calculations.fixed_tax)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">{t('redCrescent')} ({calculation.rates_used.red_crescent_rate}%):</span>
              <span>{formatMoney(calculation.calculations.red_crescent)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">{t('municipality')} ({calculation.rates_used.municipality_rate}%):</span>
              <span>{formatMoney(calculation.calculations.municipality)}</span>
            </div>
            <div className="flex justify-between py-3 mt-2 text-lg font-bold text-[#2c5f2d] border-t-2 border-[#2c5f2d]">
              <span>{t('total')}:</span>
              <span>{formatMoney(calculation.calculations.total_tax)}</span>
            </div>
          </div>
          
          {/* اطلاعات نرخ ارز */}
          <div className="mt-4 pt-3 text-xs text-gray-400 border-t text-center">
            نرخ محاسبه: {calculation.rates_used.usd_to_afn} AFN = 1 USD
          </div>
        </div>
      )}
      
      {/* راهنما - اگر محاسبه‌ای انجام نشده */}
      {!calculation && !loading && (
        <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
          <i className="fas fa-calculator text-5xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">
            کد HS را وارد کنید و دکمه محاسبه را بزنید
          </p>
        </div>
      )}
    </div>
  );
}