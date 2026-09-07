import fs from 'fs';
import path from 'path';
import { CityConfig, CityData } from '../types/city.types';

export class CityLoaderService {
  private filePath: string;

  constructor(customPath?: string) {
    this.filePath = customPath || path.resolve(__dirname, '../data/cities.json');
  }

  public getCities(): CityData[] {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`City configuration file not found at path: ${this.filePath}`);
    }

    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    let parsed: { List: CityConfig[] };

    try {
      parsed = JSON.parse(fileContent);
    } catch (err) {
      throw new Error('Failed to parse cities.json: Invalid JSON format');
    }

    if (!parsed || !Array.isArray(parsed.List)) {
      throw new Error('Invalid cities.json structure: Missing "List" array');
    }

    const validCities: CityData[] = [];

    for (const item of parsed.List) {
      if (!item.CityCode || !item.CityName) {
        continue;
      }
      const codeNum = parseInt(item.CityCode, 10);
      if (isNaN(codeNum)) {
        continue;
      }
      validCities.push({
        cityCode: codeNum,
        cityName: item.CityName.trim(),
      });
    }

    if (validCities.length < 10) {
      throw new Error(`Insufficient valid city configurations. Expected at least 10, found ${validCities.length}`);
    }

    return validCities;
  }
}
