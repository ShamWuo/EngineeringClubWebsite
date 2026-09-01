'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, DollarSign } from 'lucide-react';

export interface LineItem {
  id: string;
  description: string;
  vendor: string;
  unit_cost_cents: number;
  quantity: number;
  url: string;
}

interface LineItemBuilderProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

export function LineItemBuilder({ items, onChange }: LineItemBuilderProps) {
  const addItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      vendor: '',
      unit_cost_cents: 0,
      quantity: 1,
      url: '',
    };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const totalCents = items.reduce(
    (sum, item) => sum + (item.unit_cost_cents || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Budget Line Items
        </h4>
        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <DollarSign className="h-4 w-4" />
          <span>Total: ${(totalCents / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const rowTotalCents = (item.unit_cost_cents || 0) * (item.quantity || 1);

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                <span>Item #{index + 1}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Subtotal: ${(rowTotalCents / 100).toFixed(2)}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-2xs font-medium text-zinc-500 mb-1">
                    Description *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Gigavac 400V Contactor"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-zinc-500 mb-1">
                    Vendor / Supplier
                  </label>
                  <Input
                    placeholder="e.g. Mouser / DigiKey / McMaster"
                    value={item.vendor}
                    onChange={(e) => updateItem(item.id, 'vendor', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-2xs font-medium text-zinc-500 mb-1">
                    Unit Price ($) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={(item.unit_cost_cents / 100) || ''}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        'unit_cost_cents',
                        Math.round(parseFloat(e.target.value || '0') * 100)
                      )
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-zinc-500 mb-1">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', parseInt(e.target.value || '1', 10))
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-zinc-500 mb-1">
                    Product Link
                  </label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={item.url}
                    onChange={(e) => updateItem(item.id, 'url', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full text-xs gap-1 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Another Line Item
      </Button>
    </div>
  );
}
