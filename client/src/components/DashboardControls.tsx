import React from 'react';

export type SortOption =
  | 'comfort-desc'
  | 'comfort-asc'
  | 'temp-desc'
  | 'temp-asc'
  | 'name-asc';

export type ComfortFilterOption = 'all' | 'high' | 'moderate' | 'low';

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  comfortFilter: ComfortFilterOption;
  onFilterChange: (filter: ComfortFilterOption) => void;
}

export const DashboardControls: React.FC<ControlsProps> = ({
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange,
  comfortFilter,
  onFilterChange,
}) => {
  return (
    <div className="controls-bar">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search city name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="controls-right">
        <div className="control-group">
          <label htmlFor="filter-select" className="control-label">
            Filter:
          </label>
          <select
            id="filter-select"
            className="control-select"
            value={comfortFilter}
            onChange={(e) => onFilterChange(e.target.value as ComfortFilterOption)}
          >
            <option value="all">All Comfort Levels</option>
            <option value="high">High Comfort (80+)</option>
            <option value="moderate">Moderate (60-79.9)</option>
            <option value="low">Low Comfort (&lt;60)</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort-select" className="control-label">
            Sort by:
          </label>
          <select
            id="sort-select"
            className="control-select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="comfort-desc">Comfort: High → Low</option>
            <option value="comfort-asc">Comfort: Low → High</option>
            <option value="temp-desc">Temperature: High → Low</option>
            <option value="temp-asc">Temperature: Low → High</option>
            <option value="name-asc">City Name: A → Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};
