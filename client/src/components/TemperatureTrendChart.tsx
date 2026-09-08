import React, { useMemo } from 'react';
import type { ForecastPoint } from '../types/weather-api.types';

interface TemperatureTrendChartProps {
  points: ForecastPoint[];
  cityName: string;
}

export const TemperatureTrendChart: React.FC<TemperatureTrendChartProps> = ({ points, cityName }) => {
  const { viewBoxWidth, viewBoxHeight, pathData, pointData, yAxisLabels } = useMemo(() => {
    const width = 800;
    const height = 240;
    const padding = { top: 40, right: 20, bottom: 40, left: 40 };

    if (!points || points.length === 0) {
      return { viewBoxWidth: width, viewBoxHeight: height, pathData: '', pointData: [], yAxisLabels: [], xAxisLabels: [], yMin: 0, yMax: 0 };
    }

    const temps = points.map((p) => p.temperature);
    let minT = Math.min(...temps);
    let maxT = Math.max(...temps);

    // Padding for Y axis to avoid touching top/bottom
    if (maxT === minT) {
      minT -= 2;
      maxT += 2;
    } else {
      const diff = maxT - minT;
      minT -= diff * 0.2;
      maxT += diff * 0.2;
    }

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getX = (index: number) => {
      if (points.length === 1) return padding.left + chartWidth / 2;
      return padding.left + (index / (points.length - 1)) * chartWidth;
    };

    const getY = (temp: number) => {
      const ratio = (temp - minT) / (maxT - minT);
      return padding.top + chartHeight - ratio * chartHeight;
    };

    let d = '';
    const pointCoords = points.map((p, i) => {
      const x = getX(i);
      const y = getY(p.temperature);
      if (i === 0) d += `M ${x} ${y} `;
      else d += `L ${x} ${y} `;
      
      const date = new Date(p.timestamp);
      // "3 PM" format
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const label = `${hours} ${ampm}`;

      return { x, y, temp: p.temperature, label };
    });

    // 3 subtle Y grid lines
    const yLabels = [
      { temp: minT + (maxT - minT) * 0.2, y: getY(minT + (maxT - minT) * 0.2) },
      { temp: minT + (maxT - minT) * 0.5, y: getY(minT + (maxT - minT) * 0.5) },
      { temp: minT + (maxT - minT) * 0.8, y: getY(minT + (maxT - minT) * 0.8) },
    ];

    return {
      viewBoxWidth: width,
      viewBoxHeight: height,
      pathData: d,
      pointData: pointCoords,
      yAxisLabels: yLabels,
      xAxisLabels: pointCoords,
      yMin: minT,
      yMax: maxT
    };
  }, [points]);

  if (!points || points.length === 0) {
    return (
      <div className="chart-empty-state">
        <span className="state-text">No forecast data available</span>
      </div>
    );
  }

  const minActualTemp = Math.min(...points.map((p) => p.temperature)).toFixed(1);
  const maxActualTemp = Math.max(...points.map((p) => p.temperature)).toFixed(1);

  return (
    <div className="chart-wrapper">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
        className="temperature-trend-svg"
        role="img"
        aria-label={`Temperature forecast for ${cityName} over the next 24 hours. Low ${minActualTemp}°C, High ${maxActualTemp}°C`}
      >
        {/* Y Axis Grid Lines */}
        {yAxisLabels.map((lbl, i) => (
          <g key={`y-${i}`}>
            <line x1={30} y1={lbl.y} x2={viewBoxWidth - 20} y2={lbl.y} className="chart-grid-line" />
            <text x={25} y={lbl.y + 4} className="chart-axis-text" textAnchor="end">
              {Math.round(lbl.temp)}°
            </text>
          </g>
        ))}

        {/* Path line */}
        {points.length > 1 && (
          <path d={pathData} className="chart-path-line" fill="none" />
        )}

        {/* Points and X Labels */}
        {pointData.map((pt, i) => (
          <g key={`x-${i}`}>
            <circle cx={pt.x} cy={pt.y} r={4} className="chart-point-circle" />
            <text x={pt.x} y={pt.y - 12} className="chart-temp-label" textAnchor="middle">
              {Math.round(pt.temp)}°
            </text>
            {/* Show every label on desktop, skip every other on narrow views - handled in CSS */}
            <text x={pt.x} y={viewBoxHeight - 10} className={`chart-axis-text x-label x-label-${i % 2 === 0 ? 'even' : 'odd'}`} textAnchor="middle">
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
