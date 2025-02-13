/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Chart,
  FilterType,
  StringOperator,
  useExport,
  useQuill,
} from "@quillsql/react";
import { useParams } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { Table, Select, DatePicker, Skeleton, Button } from "antd";
import { formatRows } from "./utils/format";
const { RangePicker } = DatePicker;

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("UTC");

export default function Page() {
  const params = useParams();
  const id = params?.slug as string;
  const { data, loading } = useQuill(id || "");
  const [filters, setFilters] = useState<
    {
      table: string;
      field: string;
      operator: string;
      value: string;
      filterType: string;
    }[]
  >([]);

  const handleDrillDown = (payload: any) => {
    if (!data) return;
    if (filters.length) {
      setFilters([]);
      return;
    }
    const xAxisField = data.xAxisField;
    const value = payload[xAxisField];
    setFilters([
      {
        table: "source",
        field: data.xAxisField,
        operator: StringOperator.Equals,
        value: value,
        filterType: FilterType.StringFilter,
      },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          gap: 12,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <h1>{data?.name}</h1>
        {data?.chartType !== "table" ? (
          <Chart
            reportId={id}
            containerStyle={{
              display: "flex",
              height: 400,
            }}
            onClickChartElement={handleDrillDown}
            filters={filters}
            DateRangePickerComponent={DateRangePickerComponent}
            MultiSelectComponent={MultiSelectComponent}
          />
        ) : null}
        {loading ? (
          <Skeleton active />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: 350,
              }}
            >
              <Table
                size="small"
                locale={{ emptyText: "" }}
                bordered
                scroll={{ x: "max-content" }}
                columns={
                  data?.columns?.map((column) => ({
                    title: column.label,
                    dataIndex: column.field,
                    key: column.field,
                  })) || []
                }
                dataSource={data?.rows}
              />
            </div>
          </div>
        )}
      </div>
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
        display: "flex",
        flexDirection: "row",
        alignItems: "end",
        gap: 10,
      }}
    >
      <div style={{ width: 250 }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
        <RangePicker
          value={[
            dayjs(dateRange.startDate).tz("UTC"),
            dayjs(dateRange.endDate).tz("UTC"),
          ]}
          onChange={(dateRange) => {
            if (!dateRange?.[1]) return;
            onChangeDateRange({
              startDate: new Date(
                Date.parse(dateRange[0]?.tz("UTC").toISOString() ?? "")
              ),
              endDate: new Date(
                Date.parse(dateRange[1]?.tz("UTC").toISOString() ?? "")
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

const MultiSelectComponent = ({
  value,
  onChange,
  options,
  label,
}: {
  value: (string | null)[] | null | undefined;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  label?: string;
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <div style={{ fontSize: 12 }}>{label}</div>}
      <Select
        mode="multiple"
        value={value?.filter((v) => v !== null)}
        onChange={(e: string[]) => {
          onChange({ target: { value: e } } as any);
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
};
