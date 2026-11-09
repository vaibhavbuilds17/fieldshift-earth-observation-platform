import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  ArrowUpDown,
  Filter,
  FileSpreadsheet,
  FileCode,
  Check,
  Eye,
} from 'lucide-react';
import { EnvironmentalPointData, StudyLocation, DataSetStatistics } from '../types/nasa';
import { generateCsvExport, generateJsonExport } from '../services/reportService';

interface DataTableSectionProps {
  data: EnvironmentalPointData[];
  location: StudyLocation;
  statistics: DataSetStatistics;
  retrievedAt: string;
  isSampleData: boolean;
}

type SortField =
  | 'date'
  | 'temperatureMean'
  | 'temperatureMax'
  | 'temperatureMin'
  | 'precipitation'
  | 'solarRadiation'
  | 'relativeHumidity'
  | 'windSpeed';

export const DataTableSection: React.FC<DataTableSectionProps> = ({
  data,
  location,
  statistics,
  retrievedAt,
  isSampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  // Column visibility controls
  const [visibleCols, setVisibleCols] = useState({
    tMean: true,
    tMax: true,
    tMin: true,
    precip: true,
    solar: true,
    humidity: true,
    wind: true,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setPage(1);
  };

  // Filtered & sorted rows
  const filteredRows = useMemo(() => {
    return data
      .filter((row) => {
        if (!searchTerm) return true;
        return row.date.includes(searchTerm) || row.dateKey.includes(searchTerm);
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [data, searchTerm, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page]);

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-5 text-slate-100">
      {/* Table Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
            Verified Meteorological Observation Table
          </h3>
          <p className="text-xs text-slate-400">
            Displaying {filteredRows.length} daily time steps with units and sentinel filtering for {location.name}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateCsvExport(data, location, retrievedAt, isSampleData)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-2xs cursor-pointer"
            title="Download complete daily observations with headers and units in CSV format"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => generateJsonExport(data, location, statistics, retrievedAt)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
            title="Download GeoJSON and metadata payload"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Column Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by date (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-200 placeholder:text-slate-500 text-xs"
          />
        </div>

        {/* Visible Column Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className="text-slate-500">Columns:</span>
          <button
            onClick={() => setVisibleCols((c) => ({ ...c, tMean: !c.tMean }))}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              visibleCols.tMean ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            T2M
          </button>
          <button
            onClick={() => setVisibleCols((c) => ({ ...c, tMax: !c.tMax }))}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              visibleCols.tMax ? 'bg-slate-800 text-rose-400 border-slate-700' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            T2M_MAX
          </button>
          <button
            onClick={() => setVisibleCols((c) => ({ ...c, tMin: !c.tMin }))}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              visibleCols.tMin ? 'bg-slate-800 text-sky-400 border-slate-700' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            T2M_MIN
          </button>
          <button
            onClick={() => setVisibleCols((c) => ({ ...c, precip: !c.precip }))}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              visibleCols.precip ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Precip
          </button>
          <button
            onClick={() => setVisibleCols((c) => ({ ...c, solar: !c.solar }))}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              visibleCols.solar ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Solar
          </button>
          <button
            onClick={() => setVisibleCols((c) => ({ ...c, humidity: !c.humidity }))}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              visibleCols.humidity ? 'bg-blue-950/80 text-blue-300 border-blue-800' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            RH2M
          </button>
          <button
            onClick={() => setVisibleCols((c) => ({ ...c, wind: !c.wind }))}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              visibleCols.wind ? 'bg-teal-950/80 text-teal-300 border-teal-800' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            WS2M
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-300 font-mono border-b border-slate-800 text-[11px]">
              <th
                onClick={() => handleSort('date')}
                className="p-2.5 cursor-pointer hover:bg-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {visibleCols.tMean && (
                <th
                  onClick={() => handleSort('temperatureMean')}
                  className="p-2.5 cursor-pointer hover:bg-slate-900 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>T2M (°C)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              )}

              {visibleCols.tMax && (
                <th
                  onClick={() => handleSort('temperatureMax')}
                  className="p-2.5 cursor-pointer hover:bg-slate-900 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>T2M_MAX (°C)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              )}

              {visibleCols.tMin && (
                <th
                  onClick={() => handleSort('temperatureMin')}
                  className="p-2.5 cursor-pointer hover:bg-slate-900 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>T2M_MIN (°C)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              )}

              {visibleCols.precip && (
                <th
                  onClick={() => handleSort('precipitation')}
                  className="p-2.5 cursor-pointer hover:bg-slate-900 transition-colors whitespace-nowrap text-cyan-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Rain (mm)</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
              )}

              {visibleCols.solar && (
                <th
                  onClick={() => handleSort('solarRadiation')}
                  className="p-2.5 cursor-pointer hover:bg-slate-900 transition-colors whitespace-nowrap text-emerald-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Solar (MJ/m²)</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  </div>
                </th>
              )}

              {visibleCols.humidity && (
                <th
                  onClick={() => handleSort('relativeHumidity')}
                  className="p-2.5 cursor-pointer hover:bg-slate-900 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>RH (%)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              )}

              {visibleCols.wind && (
                <th
                  onClick={() => handleSort('windSpeed')}
                  className="p-2.5 cursor-pointer hover:bg-slate-900 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Wind (m/s)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono tabular-nums text-slate-300">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No records match your search filter.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-2.5 text-white font-semibold">{row.date}</td>

                  {visibleCols.tMean && (
                    <td className="p-2.5 text-slate-200">
                      {row.temperatureMean !== null && row.temperatureMean !== undefined ? (
                        `${row.temperatureMean}°`
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                  )}

                  {visibleCols.tMax && (
                    <td className="p-2.5 text-rose-400 font-medium">
                      {row.temperatureMax !== null && row.temperatureMax !== undefined ? (
                        `${row.temperatureMax}°`
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                  )}

                  {visibleCols.tMin && (
                    <td className="p-2.5 text-sky-400 font-medium">
                      {row.temperatureMin !== null && row.temperatureMin !== undefined ? (
                        `${row.temperatureMin}°`
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                  )}

                  {visibleCols.precip && (
                    <td className="p-2.5 text-cyan-400 font-medium">
                      {row.precipitation !== null && row.precipitation !== undefined ? (
                        row.precipitation > 0 ? (
                          `${row.precipitation} mm`
                        ) : (
                          '0.0'
                        )
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                  )}

                  {visibleCols.solar && (
                    <td className="p-2.5 text-emerald-400 font-medium">
                      {row.solarRadiation !== null && row.solarRadiation !== undefined ? (
                        `${row.solarRadiation}`
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                  )}

                  {visibleCols.humidity && (
                    <td className="p-2.5 text-slate-300">
                      {row.relativeHumidity !== null && row.relativeHumidity !== undefined ? (
                        `${row.relativeHumidity}%`
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                  )}

                  {visibleCols.wind && (
                    <td className="p-2.5 text-slate-300">
                      {row.windSpeed !== null && row.windSpeed !== undefined ? (
                        `${row.windSpeed} m/s`
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2">
        <div>
          Showing page <span className="font-semibold text-white font-mono">{page}</span> of{' '}
          <span className="font-semibold text-white font-mono">{totalPages}</span> ({filteredRows.length} total rows)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-300 cursor-pointer transition-colors"
          >
            Previous
          </button>
          <span className="px-2 font-mono text-slate-300">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-300 cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
