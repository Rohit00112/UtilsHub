'use client';

import { useState, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'time' | 'speed' | 'data';

interface Unit {
    name: string;
    symbol: string;
    toBase: (value: number) => number;
    fromBase: (value: number) => number;
}

interface CategoryInfo {
    name: string;
    icon: string;
    baseUnit: string;
    units: Unit[];
}

const categories: Record<UnitCategory, CategoryInfo> = {
    length: {
        name: 'Length',
        icon: '📏',
        baseUnit: 'meter',
        units: [
            { name: 'Kilometer', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
            { name: 'Meter', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
            { name: 'Centimeter', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
            { name: 'Millimeter', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            { name: 'Mile', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
            { name: 'Yard', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
            { name: 'Foot', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
            { name: 'Inch', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
            { name: 'Nautical Mile', symbol: 'nmi', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
        ],
    },
    weight: {
        name: 'Weight',
        icon: '⚖️',
        baseUnit: 'kilogram',
        units: [
            { name: 'Tonne', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
            { name: 'Kilogram', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
            { name: 'Gram', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            { name: 'Milligram', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
            { name: 'Pound', symbol: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
            { name: 'Ounce', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
            { name: 'Stone', symbol: 'st', toBase: (v) => v * 6.35029, fromBase: (v) => v / 6.35029 },
        ],
    },
    temperature: {
        name: 'Temperature',
        icon: '🌡️',
        baseUnit: 'celsius',
        units: [
            { name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
            { name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
            { name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
        ],
    },
    area: {
        name: 'Area',
        icon: '📐',
        baseUnit: 'square meter',
        units: [
            { name: 'Square Kilometer', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
            { name: 'Square Meter', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
            { name: 'Square Centimeter', symbol: 'cm²', toBase: (v) => v / 10000, fromBase: (v) => v * 10000 },
            { name: 'Hectare', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
            { name: 'Acre', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
            { name: 'Square Mile', symbol: 'mi²', toBase: (v) => v * 2589988.11, fromBase: (v) => v / 2589988.11 },
            { name: 'Square Yard', symbol: 'yd²', toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
            { name: 'Square Foot', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
            { name: 'Square Inch', symbol: 'in²', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
        ],
    },
    volume: {
        name: 'Volume',
        icon: '🧪',
        baseUnit: 'liter',
        units: [
            { name: 'Cubic Meter', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
            { name: 'Liter', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
            { name: 'Milliliter', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            { name: 'Gallon (US)', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
            { name: 'Gallon (UK)', symbol: 'gal (UK)', toBase: (v) => v * 4.54609, fromBase: (v) => v / 4.54609 },
            { name: 'Quart (US)', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
            { name: 'Pint (US)', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
            { name: 'Cup (US)', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
            { name: 'Fluid Ounce (US)', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
            { name: 'Tablespoon', symbol: 'tbsp', toBase: (v) => v * 0.0147868, fromBase: (v) => v / 0.0147868 },
            { name: 'Teaspoon', symbol: 'tsp', toBase: (v) => v * 0.00492892, fromBase: (v) => v / 0.00492892 },
        ],
    },
    time: {
        name: 'Time',
        icon: '⏱️',
        baseUnit: 'second',
        units: [
            { name: 'Year', symbol: 'yr', toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
            { name: 'Month', symbol: 'mo', toBase: (v) => v * 2592000, fromBase: (v) => v / 2592000 },
            { name: 'Week', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
            { name: 'Day', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
            { name: 'Hour', symbol: 'h', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
            { name: 'Minute', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
            { name: 'Second', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
            { name: 'Millisecond', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            { name: 'Microsecond', symbol: 'μs', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
            { name: 'Nanosecond', symbol: 'ns', toBase: (v) => v / 1000000000, fromBase: (v) => v * 1000000000 },
        ],
    },
    speed: {
        name: 'Speed',
        icon: '🚀',
        baseUnit: 'meter per second',
        units: [
            { name: 'Meter per Second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
            { name: 'Kilometer per Hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
            { name: 'Mile per Hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
            { name: 'Foot per Second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
            { name: 'Knot', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
            { name: 'Speed of Light', symbol: 'c', toBase: (v) => v * 299792458, fromBase: (v) => v / 299792458 },
            { name: 'Mach (sea level)', symbol: 'Ma', toBase: (v) => v * 340.29, fromBase: (v) => v / 340.29 },
        ],
    },
    data: {
        name: 'Data',
        icon: '💾',
        baseUnit: 'byte',
        units: [
            { name: 'Bit', symbol: 'b', toBase: (v) => v / 8, fromBase: (v) => v * 8 },
            { name: 'Byte', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
            { name: 'Kilobyte', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
            { name: 'Megabyte', symbol: 'MB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
            { name: 'Gigabyte', symbol: 'GB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
            { name: 'Terabyte', symbol: 'TB', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
            { name: 'Petabyte', symbol: 'PB', toBase: (v) => v * 1125899906842624, fromBase: (v) => v / 1125899906842624 },
            { name: 'Kibibyte', symbol: 'KiB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
            { name: 'Mebibyte', symbol: 'MiB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
            { name: 'Gibibyte', symbol: 'GiB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
        ],
    },
};

export default function UnitConverter() {
    const [category, setCategory] = useState<UnitCategory>('length');
    const [inputValue, setInputValue] = useState<string>('1');
    const [fromUnit, setFromUnit] = useState<number>(0);
    const [toUnit, setToUnit] = useState<number>(1);

    const currentCategory = categories[category];

    const convertedValue = useMemo(() => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) return '';

        const fromUnitObj = currentCategory.units[fromUnit];
        const toUnitObj = currentCategory.units[toUnit];

        const baseValue = fromUnitObj.toBase(value);
        const result = toUnitObj.fromBase(baseValue);

        // Format result based on magnitude
        if (Math.abs(result) >= 1000000 || (Math.abs(result) < 0.001 && result !== 0)) {
            return result.toExponential(6);
        }
        return result.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }, [inputValue, fromUnit, toUnit, currentCategory]);

    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
        setInputValue(convertedValue);
    };

    const allConversions = useMemo(() => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) return [];

        const fromUnitObj = currentCategory.units[fromUnit];
        const baseValue = fromUnitObj.toBase(value);

        return currentCategory.units.map((unit, idx) => ({
            ...unit,
            value: unit.fromBase(baseValue),
            isSource: idx === fromUnit,
        }));
    }, [inputValue, fromUnit, currentCategory]);

    const formatValue = (value: number): string => {
        if (Math.abs(value) >= 1000000 || (Math.abs(value) < 0.001 && value !== 0)) {
            return value.toExponential(4);
        }
        return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
    };

    return (
        <ToolLayout
            title="Unit Converter"
            description="Convert between different units of measurement: length, weight, temperature, area, volume, time, speed, and data"
            category="calculator"
        >
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Category Selection */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(categories) as UnitCategory[]).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setCategory(cat);
                                    setFromUnit(0);
                                    setToUnit(1);
                                    setInputValue('1');
                                }}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${category === cat
                                        ? 'bg-primary text-white'
                                        : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                                    }`}
                            >
                                {categories[cat].icon} {categories[cat].name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Converter Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    {/* From Unit */}
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                        <label className="block text-sm font-medium text-text-secondary mb-2">From</label>
                        <select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary font-medium mb-4 focus:outline-none focus:border-primary"
                        >
                            {currentCategory.units.map((unit, idx) => (
                                <option key={idx} value={idx}>
                                    {unit.name} ({unit.symbol})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full px-4 py-4 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-2xl font-bold focus:outline-none focus:border-primary"
                            placeholder="Enter value"
                        />
                        <p className="mt-2 text-sm text-text-tertiary">
                            {currentCategory.units[fromUnit].symbol}
                        </p>
                    </div>

                    {/* Swap Button */}
                    <button
                        onClick={swapUnits}
                        className="w-12 h-12 mx-auto bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center text-white text-xl transition-all duration-150 hover:scale-110"
                        title="Swap units"
                    >
                        ⇄
                    </button>

                    {/* To Unit */}
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                        <label className="block text-sm font-medium text-text-secondary mb-2">To</label>
                        <select
                            value={toUnit}
                            onChange={(e) => setToUnit(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary font-medium mb-4 focus:outline-none focus:border-primary"
                        >
                            {currentCategory.units.map((unit, idx) => (
                                <option key={idx} value={idx}>
                                    {unit.name} ({unit.symbol})
                                </option>
                            ))}
                        </select>
                        <div className="w-full px-4 py-4 bg-primary/10 border-2 border-primary/30 rounded-md text-primary text-2xl font-bold min-h-[68px] flex items-center">
                            {convertedValue || '—'}
                        </div>
                        <p className="mt-2 text-sm text-text-tertiary">
                            {currentCategory.units[toUnit].symbol}
                        </p>
                    </div>
                </div>

                {/* All Conversions */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                        All {currentCategory.name} Conversions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {allConversions.map((conversion, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg border ${conversion.isSource
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-bg-tertiary border-border'
                                    }`}
                            >
                                <p className="text-xs text-text-tertiary mb-1">{conversion.name}</p>
                                <p className="text-lg font-bold text-text-primary">
                                    {formatValue(conversion.value)} <span className="text-sm font-normal text-text-secondary">{conversion.symbol}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Reference */}
                <div className="bg-bg-secondary border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Quick Reference</h3>
                    <div className="text-sm text-text-secondary space-y-2">
                        {category === 'length' && (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <li>1 mile = 1.609 kilometers</li>
                                <li>1 foot = 30.48 centimeters</li>
                                <li>1 inch = 2.54 centimeters</li>
                                <li>1 yard = 0.9144 meters</li>
                            </ul>
                        )}
                        {category === 'weight' && (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <li>1 pound = 0.4536 kilograms</li>
                                <li>1 ounce = 28.35 grams</li>
                                <li>1 stone = 6.35 kilograms</li>
                                <li>1 tonne = 1000 kilograms</li>
                            </ul>
                        )}
                        {category === 'temperature' && (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <li>°F = (°C × 9/5) + 32</li>
                                <li>°C = (°F - 32) × 5/9</li>
                                <li>K = °C + 273.15</li>
                                <li>Water freezes at 0°C / 32°F / 273.15K</li>
                            </ul>
                        )}
                        {category === 'data' && (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <li>1 byte = 8 bits</li>
                                <li>1 KB = 1024 bytes</li>
                                <li>1 MB = 1024 KB</li>
                                <li>1 GB = 1024 MB</li>
                            </ul>
                        )}
                        {!['length', 'weight', 'temperature', 'data'].includes(category) && (
                            <p>Select a value above to see all conversions for {currentCategory.name.toLowerCase()}.</p>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
