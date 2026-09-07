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
          placeholder="Search city or country..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="controls-right">
        <div className="control-group">
          <label htmlFor="filter-select" className="visually-hidden">
            Filter:
          </label>
          <select
            id="filter-select"
            className="control-select"
            value={comfortFilter}
            onChange={(e) => onFilterChange(e.target.value as ComfortFilterOption)}
          >
            <option value="all">Filter: All</option>
            <option value="high">Filter: High (80+)</option>
            <option value="moderate">Filter: Mod (60-79)</option>
            <option value="low">Filter: Low (&lt;60)</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort-select" className="visually-hidden">
            Sort by:
          </label>
          <select
            id="sort-select"
            className="control-select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="comfort-desc">Sort: Comfort High → Low</option>
            <option value="comfort-asc">Sort: Comfort Low → High</option>
            <option value="temp-desc">Sort: Temp High → Low</option>
            <option value="temp-asc">Sort: Temp Low → High</option>
            <option value="name-asc">Sort: City A → Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};
