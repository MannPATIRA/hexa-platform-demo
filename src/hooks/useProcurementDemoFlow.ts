"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type {
  ProcurementItem,
  ProcurementDemoData,
} from "@/lib/procurement-types";
import {
  RFQ_PATH_STEPS,
  DIRECT_PO_PATH_STEPS,
  getStartingStepIndex,
  detectPath,
  type ProcurementDemoStep,
  type DemoContext,
} from "@/lib/procurement-demo-steps";
import {
  getDraftRFQ,
  getDraftRFQForItem,
  getRFQSupplierEntries,
  getQuotesForRFQ,
  getPurchaseOrder,
} from "@/data/procurement-data";

interface DemoState {
  item: ProcurementItem;
  demoData: ProcurementDemoData;
  steps: ProcurementDemoStep[];
  stepIndex: number;
  isAutoProgressing: boolean;
  isActive: boolean;
  path: "rfq" | "po" | null;
  ctx: DemoContext;
}

type DemoAction =
  | { type: "start_demo"; path: "rfq" | "po"; supplierIds: string[] }
  | { type: "advance"; selectedQuoteId?: string }
  | { type: "set_auto_progressing"; value: boolean };

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "start_demo": {
      const steps =
        action.path === "rfq" ? RFQ_PATH_STEPS : DIRECT_PO_PATH_STEPS;
      const ctx: DemoContext = { selectedSupplierIds: action.supplierIds };
      const step = steps[0];
      if (!step) return state;
      const result = step.apply(state.item, state.demoData, ctx);
      return {
        item: result.item,
        demoData: result.data,
        steps,
        stepIndex: 1,
        isAutoProgressing: false,
        isActive: true,
        path: action.path,
        ctx,
      };
    }
    case "advance": {
      const step = state.steps[state.stepIndex];
      if (!step) return state;
      const ctx = action.selectedQuoteId
        ? { ...state.ctx, selectedQuoteId: action.selectedQuoteId }
        : state.ctx;
      const result = step.apply(state.item, state.demoData, ctx);
      return {
        ...state,
        item: result.item,
        demoData: result.data,
        stepIndex: state.stepIndex + 1,
        isAutoProgressing: false,
        ctx,
      };
    }
    case "set_auto_progressing":
      return { ...state, isAutoProgressing: action.value };
    default:
      return state;
  }
}

function buildInitialDemoData(item: ProcurementItem): ProcurementDemoData {
  const data: ProcurementDemoData = {};

  if (item.activeRfqId) {
    const rfq = getDraftRFQ(item.activeRfqId);
    if (rfq) {
      data.rfq = rfq;
      data.rfqEntries = getRFQSupplierEntries(item.activeRfqId);
    }
    const quotes = getQuotesForRFQ(item.activeRfqId);
    if (quotes.length > 0) data.quotes = quotes;
  } else {
    const rfq = getDraftRFQForItem(item.id);
    if (rfq) data.rfq = rfq;
  }

  if (item.purchaseOrderId) {
    const po = getPurchaseOrder(item.purchaseOrderId);
    if (po) data.po = po;
  }

  if (item.selectedQuoteId) {
    data.selectedQuoteId = item.selectedQuoteId;
  }

  return data;
}

export function useProcurementDemoFlow(
  initialItem: ProcurementItem,
  onItemUpdate?: (item: ProcurementItem) => void,
) {
  const needsAutoStart =
    initialItem.status !== "flagged" &&
    initialItem.status !== "delivered";

  const autoStartPath = needsAutoStart ? detectPath(initialItem) : null;
  const autoStartSteps = autoStartPath
    ? autoStartPath === "rfq"
      ? RFQ_PATH_STEPS
      : DIRECT_PO_PATH_STEPS
    : [];
  const autoStartIndex = autoStartPath
    ? getStartingStepIndex(autoStartPath, initialItem.status)
    : 0;

  const initialDemoData = needsAutoStart
    ? buildInitialDemoData(initialItem)
    : {};
  const initialSupplierIds = initialDemoData.rfq?.supplierIds ?? [];

  const [state, dispatch] = useReducer(reducer, {
    item: initialItem,
    demoData: initialDemoData,
    steps: autoStartSteps,
    stepIndex: autoStartIndex,
    isAutoProgressing: false,
    isActive: needsAutoStart,
    path: autoStartPath,
    ctx: { selectedSupplierIds: initialSupplierIds },
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevItemRef = useRef(state.item);

  useEffect(() => {
    if (state.item !== prevItemRef.current) {
      prevItemRef.current = state.item;
      onItemUpdate?.(state.item);
    }
  }, [state.item, onItemUpdate]);

  useEffect(() => {
    if (!state.isActive) return;
    const nextStep = state.steps[state.stepIndex];
    if (!nextStep || nextStep.type !== "auto") return;

    dispatch({ type: "set_auto_progressing", value: true });

    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance" });
    }, nextStep.delayMs ?? 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.stepIndex, state.isActive, state.steps]);

  const startDemo = useCallback(
    (path: "rfq" | "po", supplierIds: string[]) => {
      dispatch({ type: "start_demo", path, supplierIds });
    },
    [],
  );

  const advance = useCallback((selectedQuoteId?: string) => {
    dispatch({ type: "advance", selectedQuoteId });
  }, []);

  const currentStep = state.steps[state.stepIndex] as
    | ProcurementDemoStep
    | undefined;
  const isComplete = state.stepIndex >= state.steps.length;

  return {
    item: state.isActive ? state.item : initialItem,
    demoData: state.demoData,
    isAutoProgressing: state.isAutoProgressing,
    isComplete,
    isDemoActive: state.isActive,
    currentStepId: currentStep?.id ?? (isComplete ? "complete" : "idle"),
    currentStepLabel: currentStep?.label ?? "",
    stepIndex: state.stepIndex,
    path: state.path,
    startDemo,
    advance,
  };
}
