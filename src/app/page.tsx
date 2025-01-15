/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import styles from './page.module.css';
import { Dashboard } from '@quillsql/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Card, Select, DatePicker, Segmented } from 'antd';
const { RangePicker } = DatePicker;
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';

const DATE_BUCKETING_OPTIONS = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
];

dayjs.extend(utc);
dayjs.extend(timezone);

// Set timezone to GMT
dayjs.tz.setDefault('UTC');

export default function Home() {
  const router = useRouter();
  const [dateBucket, setDateBucket] = useState<
    'month' | 'day' | 'week' | 'year'
  >('month');
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Dashboard
          FilterContainerComponent={({ children }: any) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 12,
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
          name="test"
          dateBucket={dateBucket}
          ChartComponent={({ report, children }: any) => (
            <Card
              title={report.name}
              onClick={() => {
                router.push(`/reports/${report.id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              {children}
            </Card>
          )}
          SelectComponent={SelectComponent}
          MultiSelectComponent={MultiSelectComponent}
          DateRangePickerComponent={DateRangePickerComponent}
        />
      </main>
    </div>
  );
}

const SelectComponent = ({ value, onChange, options }: {
  value: string | null | undefined;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) => {
  return (
    <Select value={value} onChange={(e: string) => { onChange({ target: { value: e }} as any)} } style={{ width: 200 }}>
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
}

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
