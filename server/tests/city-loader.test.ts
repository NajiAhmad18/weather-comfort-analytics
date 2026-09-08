import { CityLoaderService } from '../src/services/city-loader.service';

describe('Assignment city configuration', () => {
  it('loads all 12 configured cities in order, including all eight supplied cities', () => {
    const cities = new CityLoaderService().getCities();

    expect(cities.length).toBeGreaterThanOrEqual(10);
    expect(cities).toEqual([
      { cityCode: 1248991, cityName: 'Colombo' },
      { cityCode: 1850147, cityName: 'Tokyo' },
      { cityCode: 2644210, cityName: 'Liverpool' },
      { cityCode: 2988507, cityName: 'Paris' },
      { cityCode: 2147714, cityName: 'Sydney' },
      { cityCode: 4930956, cityName: 'Boston' },
      { cityCode: 1796236, cityName: 'Shanghai' },
      { cityCode: 3143244, cityName: 'Oslo' },
      { cityCode: 2643743, cityName: 'London' },
      { cityCode: 5128581, cityName: 'New York' },
      { cityCode: 1880252, cityName: 'Singapore' },
      { cityCode: 3169070, cityName: 'Rome' },
    ]);
  });
});
