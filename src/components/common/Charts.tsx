import React, { useState } from 'react';

export interface ChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  meta?: string;
}

interface LineChartProps {
  points: ChartPoint[];
  unitLabel: string;
  primaryLabel: string;
  secondaryLabel?: string;
  emptyMessage: string;
  height?: number;
}

export const TrendLineChart: React.FC<LineChartProps> = ({
  points,
  unitLabel,
  primaryLabel,
  secondaryLabel,
  emptyMessage,
  height = 220,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!points.length) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 px-4 text-center">
        {emptyMessage}
      </div>
    );
  }

  const width = 640;
  const padLeft = 48;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 34;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const allValues = points.flatMap((p) =>
    p.secondaryValue !== undefined ? [p.value, p.secondaryValue] : [p.value]
  );
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const span = rawMax - rawMin || Math.max(rawMax * 0.2, 10);
  const minVal = Math.max(0, rawMin - span * 0.15);
  const maxVal = rawMax + span * 0.15;
  const range = maxVal - minVal || 1;

  const getX = (i: number) =>
    points.length === 1 ? padLeft + innerW / 2 : padLeft + (i / (points.length - 1)) * innerW;
  const getY = (val: number) => padTop + innerH - ((val - minVal) / range) * innerH;

  const primaryPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.value).toFixed(1)}`)
    .join(' ');

  const secondaryPoints = points.filter((p) => p.secondaryValue !== undefined);
  const secondaryPath =
    secondaryPoints.length > 0
      ? points
          .map((p, i) =>
            p.secondaryValue !== undefined
              ? `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.secondaryValue).toFixed(1)}`
              : ''
          )
          .filter(Boolean)
          .join(' ')
      : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => minVal + t * range);
  const activePoint = activeIndex !== null ? points[activeIndex] : points[points.length - 1];

  return (
    <div className="space-y-2">
      {/* Live Readout Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" />
            {primaryLabel}
          </span>
          {secondaryLabel && secondaryPath && (
            <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />
              {secondaryLabel}
            </span>
          )}
        </div>
        {activePoint && (
          <div className="font-mono tabular-nums text-neutral-700 dark:text-neutral-200">
            <span>{activePoint.label}</span>
            <span className="mx-1.5 text-neutral-400">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {activePoint.value} {unitLabel}
            </span>
            {activePoint.secondaryValue !== undefined && (
              <>
                <span className="mx-1.5 text-neutral-400">/</span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold">
                  {activePoint.secondaryValue} {unitLabel}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div dir="ltr" className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Gridlines */}
          {yTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-neutral-500 dark:fill-neutral-400 text-[10px] font-mono tabular-nums"
                >
                  {Math.round(tick * 10) / 10}
                </text>
              </g>
            );
          })}

          {/* Secondary Line */}
          {secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}

          {/* Primary Line */}
          {points.length > 1 && (
            <path
              d={primaryPath}
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points & X-axis labels */}
          {points.map((p, i) => {
            const cx = getX(i);
            const cy = getY(p.value);
            const showLabel =
              points.length <= 7 || i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 6) === 0;
            const isActive = activeIndex === i;

            return (
              <g key={i}>
                {showLabel && (
                  <text
                    x={cx}
                    y={height - 10}
                    textAnchor="middle"
                    className="fill-neutral-500 dark:fill-neutral-400 text-[10px] font-mono"
                  >
                    {p.label}
                  </text>
                )}
                {p.secondaryValue !== undefined && (
                  <circle
                    cx={cx}
                    cy={getY(p.secondaryValue)}
                    r={isActive ? 5 : 3}
                    fill="#38BDF8"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 6 : 4}
                  fill="#22C55E"
                  stroke="currentColor"
                  className="text-white dark:text-[#121417]"
                  strokeWidth="2"
                />
                <rect
                  x={cx - 14}
                  y={padTop}
                  width={28}
                  height={innerH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={() => setActiveIndex(i)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface BarChartProps {
  bars: { label: string; value: number; subLabel?: string }[];
  unitLabel: string;
  emptyMessage: string;
  height?: number;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  bars,
  unitLabel,
  emptyMessage,
  height = 190,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!bars.length || bars.every((b) => b.value === 0)) {
    return (
      <div className="flex items-center justify-center h-44 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 px-4 text-center">
        {emptyMessage}
      </div>
    );
  }

  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const width = 600;
  const padLeft = 36;
  const padRight = 12;
  const padTop = 18;
  const padBottom = 32;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const slotW = innerW / bars.length;
  const barW = Math.min(34, slotW * 0.62);

  return (
    <div className="space-y-1.5">
      <div className="h-4 text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-300 flex justify-end">
        {hovered !== null && bars[hovered] ? (
          <span>
            {bars[hovered].label}: <strong className="text-emerald-500">{bars[hovered].value} {unitLabel}</strong>
          </span>
        ) : (
          <span className="text-neutral-400">{unitLabel}</span>
        )}
      </div>
      <div dir="ltr" className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {[0, 0.5, 1].map((t, idx) => {
            const y = padTop + innerH * (1 - t);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-neutral-500 dark:fill-neutral-400 text-[10px] font-mono tabular-nums"
                >
                  {Math.round(maxVal * t)}
                </text>
              </g>
            );
          })}

          {bars.map((bar, i) => {
            const barH = (bar.value / maxVal) * innerH;
            const x = padLeft + i * slotW + (slotW - barW) / 2;
            const y = padTop + innerH - barH;
            const isActive = hovered === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(barH, 2)}
                  rx={4}
                  fill={isActive ? '#4ADE80' : '#22C55E'}
                  fillOpacity={bar.value === 0 ? 0.15 : 0.9}
                />
                <text
                  x={x + barW / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-neutral-500 dark:fill-neutral-400 text-[10px] font-mono"
                >
                  {bar.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
