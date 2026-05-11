"use client";

const brands = [
  "اسکانیا", "اسکواتر", "اویکو", "بنز", "تویوتا",
  "تیلر", "داف", "رینالت", "لکسیز", "مان", "هینو", "ولوو"
];

interface BrandGridProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export default function BrandGrid({ selectedBrand, onSelectBrand }: BrandGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {brands.map((brand) => (
        <button
          key={brand}
          onClick={() => onSelectBrand(brand)}
          className={`py-3 px-4 rounded-lg text-center font-medium transition-all duration-200
            ${selectedBrand === brand 
              ? "bg-amber-700 text-white shadow-lg" 
              : "bg-amber-50 text-stone-700 hover:bg-amber-100 border border-amber-200"}`}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}