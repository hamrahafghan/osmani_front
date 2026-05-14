// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================
// موجودیت‌ها (Interfaces)
// ============================================

export interface Vehicle {
  _id: string;
  variant_id: string;
  model_id: string;
  make_id: string;
  model_name: string;
  make_name: string;
  year: number;
  price: number;
  tax_rate: number;
  weight: number;
  code: string;
  tsc_code: string;
  is_active: boolean;
}

export interface CalculationResult {
  calculations: {
    base_price_afn: number;
    customs_duty: number;
    brt: number;
    fixed_tax: number;
    red_crescent: number;
    municipality: number;
    total_tax: number;
  };
  rates_used: {
    usd_to_afn: number;
    brt_rate: number;
    fixed_tax_rate: number;
    red_crescent_rate: number;
    municipality_rate: number;
  };
  vehicle: {
    variant_id: string;
    make_name: string;
    model_name: string;
    year: number;
    base_price_usd: number;
    tax_rate: number;
    weight: number;
    hs_code: string;
  };
  is_licensed: boolean;
}

export interface RegisteredVehicle {
  _id: string;
  chassis_number: string;
  plate_number?: string;
  make_name: string;
  model_name: string;
  year: number;
  weight: number;
  code: string;
  tsc_code: string;
  document_count?: number;
  createdAt: string;
}

export interface VehicleDocument {
  _id: string;
  chassis_number: string;
  document_type: string;
  custom_type_name?: string;
  image_url?: string;
  text_content: string;
  uploaded_by?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 1. موترها (Vehicles) - جستجو و مرور
// ============================================

// جستجوی کالا
export async function searchGoods(params: {
  name?: string;
  hsCode?: string;
  tscCode?: string;
}): Promise<Vehicle[]> {
  const searchParams = new URLSearchParams();
  if (params.name) searchParams.append('query', params.name);
  if (params.hsCode) searchParams.append('code', params.hsCode);
  if (params.tscCode) searchParams.append('tsc_code', params.tscCode);
  
  const res = await fetch(`${API_BASE_URL}/vehicles/search?${searchParams}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// دریافت لیست برندها
export async function getMakes(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/vehicles/makes`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// دریافت مدل‌های یک برند
export async function getModelsByMake(make: string): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/vehicles/models/${encodeURIComponent(make)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// دریافت موترهای یک برند و مدل
export async function getVehiclesByMakeAndModel(make: string, model: string): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE_URL}/vehicles/search?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// دریافت موتر با variant_id
export async function getVehicleByVariantId(variantId: string): Promise<Vehicle | null> {
  const res = await fetch(`${API_BASE_URL}/vehicles/${variantId}`);
  const data = await res.json();
  if (!data.success) return null;
  return data.data;
}

// دریافت سال‌های موجود برای یک برند و مدل
export async function getAvailableYears(make: string, model: string): Promise<number[]> {
  const vehicles = await getVehiclesByMakeAndModel(make, model);
  const years = [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a);
  return years;
}

// دریافت اطلاعات کامل یک موتر بر اساس برند، مدل و سال
export async function getVehicleFullInfo(make: string, model: string, year: number): Promise<Vehicle | null> {
  const vehicles = await getVehiclesByMakeAndModel(make, model);
  const vehicle = vehicles.find(v => v.year === year);
  return vehicle || null;
}

// ============================================
// 2. محاسبات مالیاتی (Calculator)
// ============================================

// محاسبه مالیات با variant_id
export async function calculateTax(
  variantId: string,
  value: number,
  freight: number,
  insurance: number,
  isLicensed: boolean
): Promise<CalculationResult> {
  const res = await fetch(`${API_BASE_URL}/calculator/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variant_id: variantId,
      value,
      freight,
      insurance,
      is_licensed: isLicensed
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// دریافت نرخ‌های جاری
export async function getCurrentRates(): Promise<{
  usd_to_afn: number;
  brt_rate: number;
  red_crescent_rate: number;
  municipality_rate: number;
  fixed_tax_licensed: number;
  fixed_tax_unlicensed: number;
}> {
  const res = await fetch(`${API_BASE_URL}/calculator/rates`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// تنظیم نرخ‌های جدید (برای صفحه تنظیمات)
export async function setMonthlyRates(rates: {
  usd_to_afn: number;
  brt_rate?: number;
  red_crescent_rate?: number;
  municipality_rate?: number;
  fixed_tax_licensed?: number;
  fixed_tax_unlicensed?: number;
  notes?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/calculator/rates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usd_to_afn: rates.usd_to_afn,
      brt_rate: rates.brt_rate || 4,
      red_crescent_rate: rates.red_crescent_rate || 2,
      municipality_rate: rates.municipality_rate || 0.4,
      fixed_tax_licensed: rates.fixed_tax_licensed || 2,
      fixed_tax_unlicensed: rates.fixed_tax_unlicensed || 3,
      announced_by: 'admin',
      notes: rates.notes || ''
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// دریافت مقادیر پیش‌فرض محاسبات (ارزش، حمل، بیمه)
export async function getCalculationDefaults(): Promise<{
  default_value: number;
  default_freight: number;
  default_insurance: number;
}> {
  const res = await fetch(`${API_BASE_URL}/settings/defaults`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// به‌روزرسانی مقادیر پیش‌فرض محاسبات
export async function updateCalculationDefaults(defaults: {
  default_value: number;
  default_freight: number;
  default_insurance: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/settings/defaults`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaults)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ============================================
// 3. ثبت اطلاعات گمرکی موتر (Registry)
// ============================================

// ثبت موتر جدید با اسناد
export async function registerVehicle(data: {
  chassis_number: string;
  plate_number?: string;
  make_name: string;
  model_name: string;
  year: number;
  weight: number;
  hs_code: string;
  tsc_code: string;
  documents: {
    type: string;
    custom_name?: string;
    image_url?: string;
    text_content: string;
  }[];
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/registry/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
}

// دریافت لیست موترهای ثبت شده
export async function getRegisteredVehicles(params?: { 
  search?: string; 
  limit?: number; 
  page?: number 
}): Promise<{ data: RegisteredVehicle[]; pagination: any }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  
  const res = await fetch(`${API_BASE_URL}/registry/vehicles?${searchParams}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return { data: data.data, pagination: data.pagination };
}

// دریافت جزئیات یک موتر با اسنادش
export async function getRegisteredVehicleDetail(chassis: string): Promise<{ 
  vehicle: RegisteredVehicle; 
  documents: any; 
  allDocuments: VehicleDocument[] 
}> {
  const res = await fetch(`${API_BASE_URL}/registry/vehicles/${encodeURIComponent(chassis)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// حذف موتر
export async function deleteRegisteredVehicle(chassis: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/registry/vehicles/${encodeURIComponent(chassis)}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
}

// افزودن سند به موتر موجود
export async function addDocumentToVehicle(chassis: string, doc: {
  document_type: string;
  custom_type_name?: string;
  image_url?: string;
  text_content: string;
}): Promise<VehicleDocument> {
  const res = await fetch(`${API_BASE_URL}/registry/vehicles/${encodeURIComponent(chassis)}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ============================================
// 4. اسناد گمرکی (Documents) - مستقیم
// ============================================

// دریافت لیست اسناد (با جستجو)
export async function getDocuments(params?: { 
  q?: string; 
  chassis?: string; 
  type?: string;
  limit?: number;
  page?: number;
}): Promise<{ data: VehicleDocument[]; pagination: any }> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.append('q', params.q);
  if (params?.chassis) searchParams.append('chassis', params.chassis);
  if (params?.type && params.type !== 'all') searchParams.append('type', params.type);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  
  const res = await fetch(`${API_BASE_URL}/documents?${searchParams}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return { data: data.data, pagination: data.pagination };
}

// دریافت یک سند با شناسه
export async function getDocument(id: string): Promise<VehicleDocument> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// دریافت همه اسناد یک موتر (بر اساس شماره شاسی)
export async function getDocumentsByChassis(chassis: string): Promise<VehicleDocument[]> {
  const res = await fetch(`${API_BASE_URL}/documents?chassis=${encodeURIComponent(chassis)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ثبت سند جدید
export async function createDocument(doc: {
  chassis_number: string;
  document_type: string;
  custom_type_name?: string;
  text_content: string;
  image_url?: string;
}): Promise<VehicleDocument> {
  const res = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ویرایش سند
export async function updateDocument(id: string, doc: Partial<VehicleDocument>): Promise<VehicleDocument> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// حذف سند
export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
}