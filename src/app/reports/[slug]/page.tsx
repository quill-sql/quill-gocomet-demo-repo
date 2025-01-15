/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  Chart,
  FilterType,
  useExport,
  useQuill,
  format,
} from '@quillsql/react';
import { useParams } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { Table, Select, DatePicker, Skeleton, Button, Segmented } from 'antd';
import { getDateBucket } from './utils/date';
const { RangePicker } = DatePicker;

const DATE_BUCKETING_OPTIONS = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
];

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault('UTC');

export default function Page() {
  const params = useParams();
  const id = params?.slug as string;
  const { data, loading } = useQuill(id || '');
  const [filters, setFilters] = useState<any>([]);
  const [dateBucket, setDateBucket] = useState<
    'month' | 'day' | 'week' | 'year'
  >('month');
  const { downloadCSV } = useExport(id || '');
  const applyDrilldown = (row: any) => {
    const dateField = data?.xAxisField;
    if (!dateField || !row) {
      return;
    }
    const currentBucket = getDateBucket(row[dateField]);
    if (currentBucket === 'day') {
      return;
    }
    if (currentBucket === 'month') {
      const date = dayjs(row[dateField], 'MMM YYYY');
      const startOfMonth = date.startOf('month').format('YYYY-MM-DD');
      const endOfMonth = date.endOf('month').format('YYYY-MM-DD');
      setFilters([
        {
          filterType: FilterType.DateCustomFilter,
          table: 'shipment_jobs',
          field: 'DELIVERY_DATE',
          value: { startDate: startOfMonth, endDate: endOfMonth },
        },
      ]);
      setDateBucket('week');
      return;
    }
    if (currentBucket === 'week') {
      const [start] = row[dateField].split(' - ');
      const rawDate = row['__quillRawDate'];
      const startDate = rawDate ? dayjs(rawDate) : dayjs(start, 'MMM d');
      const startOfWeek = startDate.startOf('week').format('YYYY-MM-DD');
      const endOfWeek = startDate.endOf('week').format('YYYY-MM-DD');
      setFilters([
        {
          filterType: FilterType.DateCustomFilter,
          table: 'shipment_jobs',
          field: 'DELIVERY_DATE',
          value: { startDate: startOfWeek, endDate: endOfWeek },
        },
      ]);
      setDateBucket('day');
      return;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          gap: 12,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <Chart
          reportId={id}
          filters={filters}
          containerStyle={{
            display: 'flex',
            height: 400,
          }}
          dateBucket={dateBucket}
          onClickChartElement={(row) => applyDrilldown(row)}
          DateRangePickerComponent={DateRangePickerComponent}
          MultiSelectComponent={MultiSelectComponent}
          FilterContainerComponent={({ children }: any) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 24,
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Bucket by</div>
                <Segmented
                  value={dateBucket}
                  options={DATE_BUCKETING_OPTIONS}
                  onChange={(value) => {
                    setDateBucket(value as 'month' | 'day' | 'week' | 'year');
                  }}
                />
              </div>
              {children}
            </div>
          )}
        />
        {loading ? (
          <Skeleton active />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginTop: 12,
            }}
          >
            <Button
              style={{ width: 150, marginBottom: 6 }}
              variant="filled"
              onClick={downloadCSV}
            >
              Download CSV
            </Button>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: 350,
              }}
            >
              <Table
                size="small"
                bordered
                columns={
                  data?.columns?.map((column) => ({
                    title: column.label,
                    dataIndex: column.field,
                    key: column.field,
                  })) || []
                }
                dataSource={formatRows(data?.rows || [], data?.columns || [])}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRows(rows: any[], columns: any[]) {
  return rows.map((row) => {
    return columns.reduce((acc, column) => {
      const value = row[column.field];
      acc[column.field] = format({ value, format: column.format });
      return acc;
    }, {});
  });
}

const DateRangePickerComponent = ({
  dateRange,
  label,
  onChangeDateRange,
  presetOptions,
  onChangePreset,
  preset,
  selectWidth,
}: any) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'end',
        gap: 10,
      }}
    >
      <div style={{ width: 250 }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
        <RangePicker
          value={[
            dayjs(dateRange.startDate).tz('UTC'),
            dayjs(dateRange.endDate).tz('UTC'),
          ]}
          onChange={(dateRange) => {
            if (!dateRange?.[1]) return;
            onChangeDateRange({
              startDate: new Date(
                Date.parse(dateRange[0]?.tz('UTC').toISOString() ?? ''),
              ),
              endDate: new Date(
                Date.parse(dateRange[1]?.tz('UTC').toISOString() ?? ''),
              ),
            });
          }}
        />
      </div>
      <Select
        value={preset}
        onChange={(value) => onChangePreset({ target: { value } })}
        style={{ width: selectWidth }}
      >
        <Select.Option value="">Select</Select.Option>
        {presetOptions.map((option: any) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

const MultiSelectComponent = ({ value, onChange, options, label }: {
  value: (string | null)[] | null | undefined;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  label?: string;
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <div style={{ fontSize: 12 }}>{label}</div>}
      <Select
        mode="multiple"
        value={value?.filter((v) => v !== null)}
        onChange={(e: string[]) => {
          onChange({ target: { value: e }} as any);
        }}
        style={{ width: 200 }}
      >
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
}