"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { Props as SelectProps, GroupBase } from "react-select";
import type { City } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactSelect = dynamic(() => import("react-select"), { ssr: false }) as unknown as ComponentType<SelectProps<any, false, GroupBase<any>>>;

interface CitySelectProps {
  cities: City[];
  value: string;
  onChange: (slug: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  excludeSlug?: string;
  "data-testid"?: string;
}

interface CityOption {
  value: string;
  label: string;
  city: City;
}

function formatOptionLabel(option: CityOption) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{option.city.name}</span>
        <span className="text-xs text-muted-foreground">
          {option.city.stateCode}
        </span>
      </div>
    </div>
  );
}

export function CitySelect({
  cities,
  value,
  onChange,
  placeholder = "Select a city...",
  isLoading = false,
  excludeSlug,
  ...rest
}: CitySelectProps) {
  const options: CityOption[] = cities
    .filter((c) => !excludeSlug || c.slug !== excludeSlug)
    .map((c) => ({
      value: c.slug,
      label: `${c.name}, ${c.stateCode}`,
      city: c,
    }));

  const selectedOption = options.find((o) => o.value === value) || null;

  return (
    <ReactSelect
      instanceId={rest["data-testid"] || "city-select"}
      options={options}
      value={selectedOption}
      onChange={(opt: unknown) => {
        const selected = opt as CityOption | null;
        if (selected) onChange(selected.value);
      }}
      placeholder={placeholder}
      isLoading={isLoading}
      isSearchable
      formatOptionLabel={formatOptionLabel}
      classNames={{
        control: (state) =>
          `!bg-background !border-input !rounded-md !min-h-[36px] !shadow-none ${
            state.isFocused
              ? "!ring-2 !ring-ring !ring-offset-2 !ring-offset-background !border-input"
              : ""
          }`,
        menu: () =>
          "!bg-popover !border !border-border !rounded-md !shadow-md !z-50",
        menuList: () => "!p-1",
        option: (state) =>
          `!text-sm !rounded-sm !px-2 !py-1.5 !cursor-pointer ${
            state.isSelected
              ? "!bg-primary !text-primary-foreground"
              : state.isFocused
                ? "!bg-accent !text-accent-foreground"
                : "!bg-transparent !text-popover-foreground"
          }`,
        singleValue: () => "!text-foreground !text-sm",
        placeholder: () => "!text-muted-foreground !text-sm",
        input: () => "!text-foreground !text-sm",
        indicatorSeparator: () => "!bg-border",
        dropdownIndicator: () => "!text-muted-foreground !p-1",
        clearIndicator: () => "!text-muted-foreground !p-1",
        loadingIndicator: () => "!text-muted-foreground",
        noOptionsMessage: () => "!text-muted-foreground !text-sm",
        valueContainer: () => "!px-3 !py-0",
      }}
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--background))",
          borderColor: "hsl(var(--input))",
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--popover))",
          borderColor: "hsl(var(--border))",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "hsl(var(--primary))"
            : state.isFocused
              ? "hsl(var(--accent))"
              : "transparent",
          color: state.isSelected
            ? "hsl(var(--primary-foreground))"
            : "hsl(var(--popover-foreground))",
          "&:active": {
            backgroundColor: "hsl(var(--accent))",
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: "hsl(var(--foreground))",
        }),
        input: (base) => ({
          ...base,
          color: "hsl(var(--foreground))",
        }),
        placeholder: (base) => ({
          ...base,
          color: "hsl(var(--muted-foreground))",
        }),
        indicatorSeparator: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--border))",
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: "hsl(var(--muted-foreground))",
          padding: "4px",
        }),
      }}
      {...rest}
    />
  );
}

interface SimpleSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "data-testid"?: string;
}

export function SimpleSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  ...rest
}: SimpleSelectProps) {
  const selectedOption = options.find((o) => o.value === value) || null;

  return (
    <ReactSelect
      instanceId={rest["data-testid"] || "simple-select"}
      options={options}
      value={selectedOption}
      onChange={(opt: unknown) => {
        const selected = opt as { value: string; label: string } | null;
        if (selected) onChange(selected.value);
      }}
      placeholder={placeholder}
      isSearchable
      classNames={{
        control: (state) =>
          `!bg-background !border-input !rounded-md !min-h-[36px] !shadow-none ${
            state.isFocused
              ? "!ring-2 !ring-ring !ring-offset-2 !ring-offset-background !border-input"
              : ""
          }`,
        menu: () =>
          "!bg-popover !border !border-border !rounded-md !shadow-md !z-50",
        menuList: () => "!p-1",
        option: (state) =>
          `!text-sm !rounded-sm !px-2 !py-1.5 !cursor-pointer ${
            state.isSelected
              ? "!bg-primary !text-primary-foreground"
              : state.isFocused
                ? "!bg-accent !text-accent-foreground"
                : "!bg-transparent !text-popover-foreground"
          }`,
        singleValue: () => "!text-foreground !text-sm",
        placeholder: () => "!text-muted-foreground !text-sm",
        input: () => "!text-foreground !text-sm",
        indicatorSeparator: () => "!bg-border",
        dropdownIndicator: () => "!text-muted-foreground !p-1",
        noOptionsMessage: () => "!text-muted-foreground !text-sm",
        valueContainer: () => "!px-3 !py-0",
      }}
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--background))",
          borderColor: "hsl(var(--input))",
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--popover))",
          borderColor: "hsl(var(--border))",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "hsl(var(--primary))"
            : state.isFocused
              ? "hsl(var(--accent))"
              : "transparent",
          color: state.isSelected
            ? "hsl(var(--primary-foreground))"
            : "hsl(var(--popover-foreground))",
        }),
        singleValue: (base) => ({
          ...base,
          color: "hsl(var(--foreground))",
        }),
        input: (base) => ({
          ...base,
          color: "hsl(var(--foreground))",
        }),
        placeholder: (base) => ({
          ...base,
          color: "hsl(var(--muted-foreground))",
        }),
        indicatorSeparator: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--border))",
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: "hsl(var(--muted-foreground))",
          padding: "4px",
        }),
      }}
      {...rest}
    />
  );
}
