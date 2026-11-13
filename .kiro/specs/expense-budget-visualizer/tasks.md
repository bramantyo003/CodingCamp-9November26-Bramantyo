# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a zero-backend, no-build-step Expense & Budget Visualizer with HTML, CSS, and vanilla JavaScript. The plan builds the page structure first, then the state and Local Storage layer, then the four required MVP features (form, transaction list, total balance, pie chart), then the three chosen optional challenges (sorting, spending limit highlight, dark/light mode), and finally edge-case checks, manual verification, and deployment. All logic lives in a single `js/script.js` and all styling in a single `css/style.css`. Per the brief (NFR-1), no test setup is used; verification is the manual checklist in `design.md`.

## Tasks

- [x] 1. Set up project structure
  - [x] 1.1 Create the project files
    - Create `index.html`, `css/style.css` (the only CSS file), and `js/script.js` (the only JS file)
    - _Requirements: 10.1, 10.3, 10.4_

  - [x] 1.2 Write `README.md`
    - Describe the app, the required features, the three optional challenges, the folder structure, and how to run it by opening `index.html`
    - Leave a placeholder for the GitHub Pages link
    - _Requirements: 10.2, 10.6_

- [x] 2. Build the page markup and styling
  - [x] 2.1 Write `index.html` semantic markup
    - Header with title and theme toggle button
    - Total Balance card with `#total-balance`, `#limit-alert`, and the "Spending limit" input
    - "Add Transaction" form with Item Name (max 60 characters), Amount, Category (Food, Transport, Fun, plus disabled placeholder), `#form-error`, and the submit button
    - Transactions card with the sort select, `#transaction-list`, and `#list-empty`
    - Spending by Category card with `#chart-wrap`, the `<canvas>`, and `#chart-empty`
    - Load Chart.js from the CDN, then `js/script.js`, with classic scripts at the end of `<body>`
    - _Requirements: 1.1, 1.2, 1.9, 2.5, 3.1, 4.1, 6.1, 7.1, 8.1, 9.1, 9.6, 10.4_

  - [x] 2.2 Write `css/style.css`
    - Define light and dark theme tokens as CSS custom properties on `:root` and `:root[data-theme="dark"]`
    - Style the cards, form, buttons, tags, and focus outlines
    - Scrollable transaction list (`max-height: 360px`, `overflow-y: auto`) and chart container (`height: 300px`)
    - Two-column grid at `min-width: 768px`; single column below; header and balance tweaks at `max-width: 480px`
    - Wrap long names with `overflow-wrap: anywhere`; add `[hidden] { display: none !important; }`
    - _Requirements: 2.1, 2.7, 4.7, 8.4, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 3. Implement state and Local Storage (`js/script.js`)
  - [x] 3.1 Implement the storage layer
    - Add `readStorage` and `writeStorage`, each wrapped in `try/catch`
    - Add `loadTransactions` (discard invalid entries), `loadLimit`, `loadSort`, and `loadTheme` (fall back to `prefers-color-scheme`)
    - Use the keys `ebv.transactions`, `ebv.limit`, `ebv.sort`, `ebv.theme`
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_

  - [x] 3.2 Implement state and helper functions
    - Wrap the script in an IIFE with `'use strict'`; collect DOM references in one `els` object; keep code in commented sections
    - Create the single `state` object (`transactions`, `limit`, `sort`, `theme`)
    - Add `toCents`, `generateId`, `getTotalCents`, `getCategoryTotals`, and a US-dollar `Intl.NumberFormat`
    - Keep all data client-side only
    - _Requirements: 3.3, 5.3, 10.7_

- [x] 4. Implement the input form
  - [x] 4.1 Implement validation in `handleSubmit`
    - Prevent the default submit; trim the name
    - Show "Please fill in all fields." when any field is empty
    - Show "Amount must be a number greater than 0." for non-finite, zero, or negative amounts
    - Show "Amount is too large." above 1,000,000,000
    - Hide the Form Error as soon as the User edits any field
    - _Requirements: 1.3, 1.4, 1.5, 1.8_

  - [x] 4.2 Implement transaction creation
    - Create the Transaction (`id`, trimmed `name`, amount rounded to 2 decimals, `category`, `createdAt`) and push it into `state.transactions`
    - Save to Local Storage, reset the form, hide the Form Error, focus Item Name, and call `render()`
    - _Requirements: 1.6, 1.7, 5.1_

- [x] 5. Implement the transaction list
  - [x] 5.1 Implement `createTransactionItem` and `renderList`
    - Build each `<li>` with name, formatted amount, and Category tag using `textContent` only (never `innerHTML`)
    - Add a Delete button carrying `data-id`
    - Replace the list contents on each render and toggle the empty-state message
    - _Requirements: 2.2, 2.3, 2.5, 2.6, 2.7_

  - [x] 5.2 Implement deletion with event delegation
    - Add one `click` listener on the list that finds `button[data-id]`, removes the Transaction with that `id`, saves to Local Storage, and calls `render()`
    - _Requirements: 2.4, 5.1_

- [x] 6. Implement the total balance
  - [x] 6.1 Compute the total in integer cents
    - Sum `toCents(amount)` over all Transactions so that 0.10 + 0.20 is exactly 0.30
    - _Requirements: 3.2, 3.3_

  - [x] 6.2 Implement `renderBalance` and the `render()` orchestrator
    - Write the formatted total (`$0.00` when empty) into `#total-balance`
    - Make `render()` call `renderBalance()`, `renderList()`, and `renderChart()` so every add or delete updates all three views
    - _Requirements: 3.2, 3.4_

- [x] 7. Implement the pie chart
  - [x] 7.1 Implement `renderChart` with Chart.js
    - Create a `pie` chart once, with labels Food, Transport, Fun and the fixed colors `#2ecc71`, `#3498db`, `#e67e22`
    - On later renders, update the dataset values and call `chart.update()` instead of recreating the chart
    - Use `responsive: true`, `maintainAspectRatio: false`, a bottom legend, and a tooltip showing the Category and the formatted total
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.7, 9.7_

  - [x] 7.2 Handle the empty and failure states
    - When there is no data, destroy the chart, hide `#chart-wrap`, and show "Add a transaction to see your spending chart."
    - When `Chart` is undefined, show "The chart could not be loaded. Check your internet connection and refresh." and leave all other features working
    - _Requirements: 4.4, 4.6_

- [x] 8. Checkpoint — MVP verified
  - Walk through the form, list, balance, and chart items of the manual checklist in `design.md`; ask the user if questions arise.

- [x] 9. Optional challenge: sort transactions
  - [x] 9.1 Implement sorting
    - Add the sort select with "Newest first", "Amount: high to low", "Amount: low to high", and "Category (A–Z)"
    - Implement `getSortedTransactions` to sort a copy of the array, breaking ties by newest first
    - Save the selection to Local Storage, restore it in `init()`, and call `renderList()` on change
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 10. Optional challenge: highlight spending over a limit
  - [x] 10.1 Implement the limit input
    - On every `input` event, set `state.limit` to the number when it is greater than 0, otherwise to `null`
    - Save to Local Storage, restore in `init()`, and call `renderBalance()` and `renderList()`
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

  - [x] 10.2 Implement the highlights
    - Add `isOverLimit` and use it to mark each Over-Limit Transaction with a red style and the "Over limit" tag
    - In `renderBalance`, highlight the Total Balance card and show "Over your limit by [difference]" when the total is strictly greater than the limit
    - _Requirements: 7.3, 7.4, 7.5, 7.7_

- [x] 11. Optional challenge: dark/light mode
  - [x] 11.1 Implement theme detection and `applyTheme`
    - Choose the saved Theme, or `prefers-color-scheme` when none is saved
    - Set `data-theme` on `<html>`, update the toggle label and `aria-label`, and recolor the live chart's legend text and slice borders from the CSS tokens
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x] 11.2 Implement the toggle button
    - Switch the Theme on click, save it to Local Storage, and restore it in `init()`
    - _Requirements: 8.1, 8.3, 8.5, 8.6_

- [x] 12. Verify error and edge-case handling
  - [x] 12.1 Verify storage and chart failure paths
    - Confirm corrupt JSON, a wrong shape, blocked storage, and a blocked Chart.js CDN all leave the App working without exceptions
    - _Requirements: 4.6, 5.4, 5.5_

  - [x] 12.2 Verify unsafe input and small screens
    - Confirm a name such as `<img src=x onerror=alert(1)>` is shown as literal text, a long unbroken name wraps, and a 375 px viewport has no horizontal scroll
    - _Requirements: 2.6, 2.7, 9.3_

- [ ] 13. Final checkpoint — manual verification in real browsers
  - [ ] 13.1 Confirm the real Chart.js pie
    - Open `index.html` with an internet connection and confirm the pie chart renders with the right colors, updates on add and delete, and its legend stays readable in both Themes
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ] 13.2 Run the manual checklist across browsers
    - Run the checklist from `design.md` in at least one browser, and a smoke test (add, delete, chart, theme) in Chrome, Firefox, Edge, and Safari
    - _Requirements: 10.5_

- [ ] 14. Prepare the repository, deployment, and submission
  - [x] 14.1 Add the Kiro spec folder
    - Keep `.kiro/specs/expense-budget-visualizer/` (`requirements.md`, `design.md`, `tasks.md`, `tasks.meta.json`, `.config.kiro`) in the project so that it is pushed with the code
    - _Requirements: 11.2_

  - [ ] 14.2 Create the repository and push
    - Create a repository named `CodingCamp-[batch date (ddmmyy)]-[participantname]` (batch date = first day of the course) and commit and push the project with GitHub Desktop
    - _Requirements: 11.1, 11.3_

  - [ ] 14.3 Publish with GitHub Pages
    - Enable GitHub Pages for the repository, open the public URL, and confirm there are no 404 errors for `css/style.css`, `js/script.js`, or Chart.js
    - _Requirements: 11.4_

  - [ ] 14.4 Submit
    - Submit the AWS Builder ID, the GitHub repository URL, and the published website URL through the Paperform form before Saturday 23:59 WIB
    - _Requirements: 11.5_

## Notes

- No task is marked optional (`*`): the three optional challenges (sort, spending limit highlight, dark/light mode) are the ones chosen from the brief's five, so they are part of this plan. Custom categories and the monthly summary view are intentionally out of scope.
- No test-writing tasks are included because the brief states that no test setup is required (NFR-1); verification is the manual checklist in `design.md`.
- Unchecked tasks are actions that need the participant's own browsers, GitHub account, and Paperform access.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation before moving to the next phase.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "14.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2"] },
    { "id": 4, "tasks": ["4.1", "5.1", "6.1", "7.1"] },
    { "id": 5, "tasks": ["4.2", "5.2", "6.2", "7.2"] },
    { "id": 6, "tasks": ["9.1", "10.1", "11.1"] },
    { "id": 7, "tasks": ["10.2", "11.2"] },
    { "id": 8, "tasks": ["12.1", "12.2"] },
    { "id": 9, "tasks": ["13.1", "13.2"] },
    { "id": 10, "tasks": ["14.2"] },
    { "id": 11, "tasks": ["14.3"] },
    { "id": 12, "tasks": ["14.4"] }
  ]
}
```
