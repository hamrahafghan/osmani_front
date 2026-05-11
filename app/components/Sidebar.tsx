"use client";

import { useState } from "react";
import { 
  Menu, 
  MessageCircle, 
  Truck, 
  Package, 
  Calculator, 
  Share2, 
  LogOut,
  X,
  Globe
} from "lucide-react";

const menuItems = [
  { icon: Menu, label: "منو", href: "/" },
  { icon: MessageCircle, label: "چت", href: "/chat" },
  { icon: Truck, label: "اموال", href: "/vehicles" },
  { icon: Package, label: "عراده", href: "/cargo" },
  { icon: Calculator, label: "ماشین حساب", href: "/calculator" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* دکمه همبرگر برای موبایل */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-amber-800 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* سایدبار */}
      <aside
        className={`fixed right-0 top-0 h-full bg-white shadow-xl z-40 transition-all duration-300 border-l border-amber-200
          ${isOpen ? "w-72" : "w-0 overflow-hidden lg:w-72"}`}
      >
        <div className="p-6">
          {/* لوگو */}
          <div className="text-center mb-8 border-b border-amber-200 pb-4">
            <h1 className="text-2xl font-bold text-amber-800">اموال</h1>
            <p className="text-sm text-stone-500 mt-1">سیستم محاسبه گمرک</p>
          </div>

          {/* منوی اصلی */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-stone-700 rounded-lg hover:bg-amber-50 hover:text-amber-800 transition-colors"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* اطلاعات هاستینگ */}
          <div className="absolute bottom-24 right-0 left-0 px-6">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <Globe size={16} />
                <span className="text-sm font-medium">Domin Hosting</span>
              </div>
              <p className="text-xs text-stone-500">hostingdomin5@gmail.com</p>
            </div>
          </div>

          {/* دکمه‌های پایین */}
          <div className="absolute bottom-6 right-0 left-0 px-6 space-y-2">
            <button className="flex items-center gap-3 px-4 py-3 text-stone-700 rounded-lg hover:bg-amber-50 w-full transition-colors">
              <Share2 size={20} />
              <span>اشتراک</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 w-full transition-colors">
              <LogOut size={20} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}