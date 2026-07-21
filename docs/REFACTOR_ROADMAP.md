# Refactor Roadmap

This document outlines future extraction opportunities for the Law AI Academy Engine Renaissance.

---

## Purpose

As the Engine Renaissance has grown, certain components have become larger than ideal. This roadmap documents future opportunities to extract modules for improved maintainability.

No implementation is required at this time – this is a planning document only.

---

## Extraction Candidates

### 1. DevPanel Modules

**Current State:** `js/debug/devPanel.js` has grown significantly with each Renaissance part.

**Future Extraction:**

- `js/debug/panels/architecturePanel.js` – Architecture information
- `js/debug/panels/runtimePanel.js` – Runtime information
- `js/debug/panels/enginePanel.js` – Engine governance information
- `js/debug/panels/healthPanel.js` – Health information
- `js/debug/panels/registryPanel.js` – Registry information
- `js/debug/panels/eventPanel.js` – Engine events information
- `js/debug/panels/intelligencePanel.js` – Runtime intelligence
- `js/debug/panels/coordinationPanel.js` – Engine coordination
- `js/debug/panels/discoveryPanel.js` – Engine discovery
- `js/debug/panels/communicationPanel.js` – Engine communication
- `js/debug/panels/signalPanel.js` – Engine signals
- `js/debug/panels/awarenessPanel.js` – System awareness
- `js/debug/panels/bootPanel.js` – Boot orchestration

**Benefits:**
- Smaller, focused devPanel.js
- Independent panel updates
- Easier testing

---

### 2. BootManager Modules

**Current State:** `js/core/BootManager.js` contains initialization for all Renaissance parts (Parts 1-24).

**Future Extraction:**

- `js/core/boot/architectureInit.js` – Architecture layer initialization
- `js/core/boot/runtimeInit.js` – Runtime layer initialization
- `js/core/boot/governanceInit.js` – Governance layer initialization
- `js/core/boot/discoveryInit.js` – Discovery layer initialization
- `js/core/boot/coordinationInit.js` – Coordination layer initialization
- `js/core/boot/communicationInit.js` – Communication layer initialization
- `js/core/boot/signalInit.js` – Signal layer initialization
- `js/core/boot/awarenessInit.js` – Awareness layer initialization
- `js/core/boot/orchestrationInit.js` – Orchestration layer initialization

**Benefits:**
- BootManager becomes a coordinator only
- Easier to test each initialization independently
- Clearer separation of concerns

---

### 3. Governance Modules

**Current State:** Governance functionality is distributed across multiple core files.

**Future Extraction:**

- `js/core/governance/architectureGovernor.js`
- `js/core/governance/runtimeGovernor.js`
- `js/core/governance/featureGovernor.js`
- `js/core/governance/uiGovernor.js`
- `js/core/governance/engineGovernor.js`
- `js/core/governance/registryGovernor.js`
- `js/core/governance/domainGovernor.js`
- `js/core/governance/dependencyGovernor.js`
- `js/core/governance/capabilityGovernor.js`
- `js/core/governance/lifecycleGovernor.js`

**Benefits:**
- Each governance domain is isolated
- Easier to modify individual governance rules
- Clearer dependency management

---

## Implementation Timeline

| Phase | Description | Priority |
|-------|-------------|----------|
| 1 | Extract BootPanel to separate module | Low |
| 2 | Extract remaining panels | Low |
| 3 | Extract BootManager initialization | Medium |
| 4 | Extract Governance modules | Medium |
| 5 | Full modularization | Low |

---

## Notes

- All extractions must preserve existing functionality
- window.LawAIApp interface must remain unchanged
- No ES Module migration required
- No new registries or event buses
- All changes are structural only
