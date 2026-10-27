import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface TreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  /** متن کوچک انتهای ردیف، مثل تعداد یا حجم */
  meta?: ReactNode;
  disabled?: boolean;
  children?: TreeNode[];
}

export interface TreeViewProps {
  items: TreeNode[];
  selected?: string | null;
  defaultSelected?: string | null;
  onSelect?: (id: string, node: TreeNode) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  "aria-label"?: string;
  className?: string;
}

const Chevron = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>;

interface Flat { node: TreeNode; level: number; parent: string | null }

/**
 * درخت پوشه‌ها یا دسته‌بندی‌ها با الگوی Tree در WAI-ARIA:
 * ↑↓ حرکت، → و ← (در RTL برعکس) باز و بسته کردن، Home/End، Enter یا Space انتخاب.
 */
export function TreeView({ items, selected, defaultSelected = null, onSelect, expanded, defaultExpanded = [], onExpandedChange, "aria-label": ariaLabel, className }: TreeViewProps) {
  const [innerSel, setInnerSel] = useState(defaultSelected);
  const [innerExp, setInnerExp] = useState(defaultExpanded);
  const sel = selected !== undefined ? selected : innerSel;
  const exp = expanded ?? innerExp;
  const [focusId, setFocusId] = useState<string | null>(null);
  const root = useRef<HTMLUListElement>(null);

  // ردیف‌های قابل‌مشاهده به ترتیب، برای پیمایش با کیبورد
  const visible: Flat[] = [];
  const walk = (nodes: TreeNode[], level: number, parent: string | null) => {
    for (const n of nodes) {
      visible.push({ node: n, level, parent });
      if (n.children?.length && exp.includes(n.id)) walk(n.children, level + 1, n.id);
    }
  };
  walk(items, 1, null);
  const current = focusId && visible.some((v) => v.node.id === focusId) ? focusId : sel && visible.some((v) => v.node.id === sel) ? sel : visible[0]?.node.id;

  const setExp = (ids: string[]) => {
    if (expanded === undefined) setInnerExp(ids);
    onExpandedChange?.(ids);
  };
  const toggle = (id: string, open = !exp.includes(id)) => setExp(open ? [...new Set([...exp, id])] : exp.filter((x) => x !== id));
  const choose = (n: TreeNode) => {
    if (n.disabled) return;
    if (selected === undefined) setInnerSel(n.id);
    onSelect?.(n.id, n);
  };
  const focus = (id: string) => {
    setFocusId(id);
    root.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const i = visible.findIndex((v) => v.node.id === current);
    const v = visible[i];
    if (!v) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const inKey = rtl ? "ArrowLeft" : "ArrowRight";
    const outKey = rtl ? "ArrowRight" : "ArrowLeft";
    const hasKids = !!v.node.children?.length;
    const open = exp.includes(v.node.id);
    let handled = true;
    if (e.key === "ArrowDown") visible[i + 1] && focus(visible[i + 1].node.id);
    else if (e.key === "ArrowUp") visible[i - 1] && focus(visible[i - 1].node.id);
    else if (e.key === "Home") focus(visible[0].node.id);
    else if (e.key === "End") focus(visible[visible.length - 1].node.id);
    else if (e.key === inKey) {
      if (hasKids && !open) toggle(v.node.id, true);
      else if (hasKids) focus(v.node.children![0].id);
    } else if (e.key === outKey) {
      if (hasKids && open) toggle(v.node.id, false);
      else if (v.parent) focus(v.parent);
    } else if (e.key === "Enter" || e.key === " ") choose(v.node);
    else handled = false;
    if (handled) e.preventDefault();
  };

  const render = (nodes: TreeNode[], level: number): ReactNode =>
    nodes.map((n) => {
      const hasKids = !!n.children?.length;
      const open = exp.includes(n.id);
      return (
        <li
          key={n.id}
          role="treeitem"
          data-id={n.id}
          className="k-tree__item"
          aria-level={level}
          aria-expanded={hasKids ? open : undefined}
          aria-selected={sel === n.id}
          aria-disabled={n.disabled || undefined}
          tabIndex={current === n.id ? 0 : -1}
          onFocus={(e) => {
            if (e.target === e.currentTarget) setFocusId(n.id);
          }}
        >
          <div
            className="k-tree__row"
            onClick={() => {
              if (hasKids) toggle(n.id);
              choose(n);
              focus(n.id);
            }}
          >
            {hasKids ? <span className="k-tree__toggle" aria-hidden="true"><Chevron /></span> : <span className="k-tree__spacer" />}
            {n.icon && <span className="k-tree__icon" aria-hidden="true">{n.icon}</span>}
            <span className="k-tree__label">{n.label}</span>
            {n.meta && <span className="k-tree__meta">{n.meta}</span>}
          </div>
          {hasKids && open && <ul role="group">{render(n.children!, level + 1)}</ul>}
        </li>
      );
    });

  return (
    <ul ref={root} role="tree" aria-label={ariaLabel} className={cx("k-tree", className)} onKeyDown={onKeyDown}>
      {render(items, 1)}
    </ul>
  );
}
