'use client';

import React from 'react';
import Link from 'next/link';
import { SCENARIO_GROUPS, SCENARIO_DESCRIPTIONS } from '@/lib/scenarioGroups';

/**
 * The scenario switcher on the Approver and Authoriser review pages.
 * Presets are laid out in named groups, and hovering (or focusing) one shows
 * what it demonstrates.
 */
export default function ScenarioPresetBar({ scenarios, activeKey, basePath }) {
  const grouped = new Set(SCENARIO_GROUPS.flatMap((g) => g.keys));
  const groups = SCENARIO_GROUPS
    .map((g) => ({ ...g, keys: g.keys.filter((key) => scenarios[key]) }))
    .filter((g) => g.keys.length > 0);
  const ungrouped = Object.keys(scenarios).filter((key) => !grouped.has(key));
  if (ungrouped.length > 0) groups.push({ name: 'Other', keys: ungrouped });

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[6px] px-4 py-3 mb-7">
      <span className="text-[13.5px] font-bold text-[#0f172a] block mb-1.5">Scenario presets</span>
      <div className="flex flex-col gap-1">
        {groups.map((group) => (
          <div key={group.name} className="flex items-start gap-3">
            <span className="w-[140px] shrink-0 pt-1.5 text-[13px] font-semibold text-[#475569]">
              {group.name}
            </span>
            <div className="flex flex-wrap gap-1">
              {group.keys.map((key) => {
                const description = SCENARIO_DESCRIPTIONS[key];
                const tipId = `scenario-tip-${key}`;
                return (
                  <Link
                    key={key}
                    href={`${basePath}/${key}`}
                    aria-describedby={description ? tipId : undefined}
                    className={`group relative text-[14px] font-bold no-underline px-3 py-1.5 rounded-[6px] border transition-all duration-150
                      ${activeKey === key
                        ? 'text-[#0f172a] bg-transparent border-[#0d9488]/30'
                        : 'text-[#334155] border-transparent hover:text-[#0f172a] hover:bg-[#f1f5f9]'}`}
                  >
                    {scenarios[key].label}
                    {description && (
                      <span
                        id={tipId}
                        role="tooltip"
                        className="pointer-events-none absolute left-0 top-full z-30 mt-1.5 w-64 rounded-md bg-[#0f172a] px-3 py-2 text-[12.5px] font-normal leading-snug text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                      >
                        {description}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
