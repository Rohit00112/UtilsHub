'use client';

import { useState, useMemo } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolPanel } from '@/components/tools/ToolPrimitives';

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
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Category Selection */}
                <ToolPanel>
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
                                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${category === cat
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {categories[cat].name}
                            </button>
                        ))}
                    </div>
                </ToolPanel>

                {/* Converter Section */}
                <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
                    {/* From Unit */}
                    <ToolPanel title="From">
                        <select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(Number(e.target.value))}
                            className="input h-10 mb-4"
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
                            className="w-full rounded-md border border-input bg-background px-4 py-4 text-2xl font-semibold text-foreground shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Enter value"
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                            {currentCategory.units[fromUnit].symbol}
                        </p>
                    </ToolPanel>

                    {/* Swap Button */}
                    <button
                        onClick={swapUnits}
                        className="btn btn-secondary mx-auto h-12 w-12 rounded-full p-0"
                        title="Swap units"
                    >
                        <ArrowLeftRight className="h-5 w-5" />
                    </button>

                    {/* To Unit */}
                    <ToolPanel title="To">
                        <select
                            value={toUnit}
                            onChange={(e) => setToUnit(Number(e.target.value))}
                            className="input h-10 mb-4"
                        >
                            {currentCategory.units.map((unit, idx) => (
                                <option key={idx} value={idx}>
                                    {unit.name} ({unit.symbol})
                                </option>
                            ))}
                        </select>
                        <div className="flex min-h-[68px] w-full items-center rounded-md border border-primary/30 bg-primary/10 px-4 py-4 text-2xl font-semibold text-foreground">
                            {convertedValue || '—'}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {currentCategory.units[toUnit].symbol}
                        </p>
                    </ToolPanel>
                </div>

                {/* All Conversions */}
                <ToolPanel title={`All ${currentCategory.name} conversions`}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {allConversions.map((conversion, idx) => (
                            <div
                                key={idx}
                                className={`rounded-md border p-3 ${conversion.isSource
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-muted/30 border-border'
                                    }`}
                            >
                                <p className="mb-1 text-xs text-muted-foreground">{conversion.name}</p>
                                <p className="text-lg font-semibold text-foreground">
                                    {formatValue(conversion.value)} <span className="text-sm font-normal text-muted-foreground">{conversion.symbol}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </ToolPanel>

                {/* Quick Reference */}
                <ToolPanel title="Quick reference">
                    <div className="space-y-2 text-sm text-muted-foreground">
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
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
