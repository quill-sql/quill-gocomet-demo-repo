/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import styles from "./page.module.css";
import { Dashboard } from "@quillsql/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Card, Select, DatePicker, Table, Spin, Tabs, Typography } from "antd";
const { RangePicker } = DatePicker;
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { formatRows } from "./reports/[slug]/utils/format";

dayjs.extend(utc);
dayjs.extend(timezone);

// Set timezone to GMT
dayjs.tz.setDefault("UTC");

export default function Home() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string>("Overview");
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Dashboard
          name="trackings"
          onClickReport={(report) => router.push(`/reports/${report.id}`)}
          DashboardSectionTabsComponent={({ sections }) => (
            <Tabs
              defaultActiveKey="1"
              items={sections.map((section) => ({
                key: section,
                label: section,
              }))}
              activeKey={selectedSection}
              onChange={(activeKey) => setSelectedSection(activeKey)}
            />
          )}
          chartContainerStyle={{ height: 500, width: "100%" }}
          ChartComponent={({ report, children }: any) => (
            <Card
              title={report.name}
              onClick={() => {
                router.push(`/reports/${report.id}`);
              }}
              style={{ cursor: "pointer", width: "100%", height: 600 }}
            >
              {children}
            </Card>
          )}
          MetricComponent={({ report, isLoading, children }: any) => (
            <Card
              // title={report.name}
              onClick={() => {
                router.push(`/reports/${report.id}`);
              }}
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <Spin />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography.Title level={1}>{children}</Typography.Title>
                  <Typography.Title style={{ margin: 0 }} level={5}>
                    {report.name}
                  </Typography.Title>
                </div>
              )}
            </Card>
          )}
          DashboardSectionComponent={({ section, children }: any) => {
            if (section === selectedSection) {
              if (section === "Carrier Performance") {
                return <div>{children}</div>;
              }
              return (
                <div
                  style={{
                    display: "grid",
                    // gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gridTemplateColumns: "1fr 2fr",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: "repeat(3, minmax(0, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {children.slice(0, 3)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    {children.slice(3)}
                  </div>
                </div>
              );
            } else {
              return null;
            }
          }}
          SelectComponent={SelectComponent}
          MultiSelectComponent={MultiSelectComponent}
          DateRangePickerComponent={DateRangePickerComponent}
          TableComponent={({ report, isLoading }) => (
            <div>
              <Typography.Title
                onClick={() => {
                  router.push(`/reports/${report.id}`);
                }}
                level={5}
              >
                {report.name}
              </Typography.Title>
              <Table
                size="small"
                loading={isLoading}
                locale={{ emptyText: "" }}
                bordered
                scroll={{ x: "max-content" }}
                columns={
                  report?.columns?.map((column) => ({
                    title: column.label,
                    dataIndex: column.field,
                    key: column.field,
                  })) || []
                }
                dataSource={formatRows(
                  report?.rows || [],
                  report?.columns || []
                )}
              />
            </div>
          )}
        />
      </main>
    </div>
  );
}

const SelectComponent = ({
  value,
  onChange,
  options,
}: {
  value: string | null | undefined;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) => {
  return (
    <Select
      value={value}
      onChange={(e: string) => {
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
