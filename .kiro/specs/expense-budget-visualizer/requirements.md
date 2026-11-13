# Requirements Document

## Introduction

Expense & Budget Visualizer is a mobile-friendly, client-side web application that helps users track their daily spending. Users record transactions (item name, amount, category), see the running total at the top of the page, review a scrollable history of transactions, and read a pie chart showing how their spending is distributed across categories. The app requires no backend and no build step: it is built with HTML, CSS, and vanilla JavaScript, stores all data in the browser's Local Storage, and is published as a static site on GitHub Pages.

Beyond the required MVP features, the app implements three optional challenges: sorting transactions, highlighting spending over a user-defined limit, and a dark/light mode toggle.

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **User**: A person interacting with the App through a web browser.
- **Transaction**: A record of one expense with the fields `id`, `name`, `amount`, `category`, and `createdAt`.
- **Category**: One of the fixed values `Food`, `Transport`, or `Fun`.
- **Transaction List**: The scrollable list in the App that shows all Transactions.
- **Total Balance**: The sum of the amounts of all Transactions, displayed in a card at the top of the page.
- **Spending Chart**: The pie chart that shows the share of the Total Balance contributed by each Category.
- **Chart Library**: Chart.js (major version 4), loaded from a CDN, used to draw the Spending Chart.
- **Local Storage**: The browser's `localStorage` API, used as the only data store.
- **Spending Limit**: An optional amount greater than 0 that the User sets to flag high spending.
- **Over-Limit Transaction**: A Transaction whose amount is strictly greater than the Spending Limit.
- **Sort Option**: One of `newest`, `amount-desc`, `amount-asc`, or `category`, controlling the order of the Transaction List.
- **Theme**: Either `light` or `dark`, controlling the color scheme of the App.
- **Form Error**: The inline message shown above the submit button when form validation fails.

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a User, I want a simple form to enter an item name, amount, and category, so that I can record my spending in a few seconds.

#### Acceptance Criteria

1. THE App SHALL render an input form with three fields — Item Name (text input), Amount (number input), and Category (select) — and a submit button labeled "Add Transaction".
2. THE Category field SHALL offer exactly three options: Food, Transport, and Fun, plus a disabled placeholder option "Select category" that is selected by default.
3. WHEN the User submits the form and any field is empty (Item Name empty after trimming whitespace, Amount empty, or no Category selected), THE App SHALL NOT add a Transaction and SHALL display the Form Error "Please fill in all fields."
4. WHEN the User submits the form with an Amount that is not a finite number greater than 0, THE App SHALL NOT add a Transaction and SHALL display the Form Error "Amount must be a number greater than 0."
5. WHEN the User submits the form with an Amount greater than 1,000,000,000, THE App SHALL NOT add a Transaction and SHALL display the Form Error "Amount is too large."
6. WHEN the User submits the form with valid values, THE App SHALL create a Transaction with a unique `id`, the trimmed Item Name, the Amount rounded to two decimal places, the selected Category, and the current time as `createdAt`, and SHALL add it to the Transaction List.
7. WHEN a Transaction is added, THE App SHALL reset all form fields to their initial state, hide any Form Error, and move keyboard focus to the Item Name field.
8. WHEN the User changes the value of any form field while a Form Error is displayed, THE App SHALL hide the Form Error.
9. THE Item Name field SHALL accept at most 60 characters.

---

### Requirement 2: Transaction List

**User Story:** As a User, I want to see all my transactions in a scrollable list and delete the ones I no longer want, so that I can review and correct my spending history.

#### Acceptance Criteria

1. THE App SHALL display all Transactions in a list inside a container with a fixed maximum height of 360 px and vertical scrolling (`overflow-y: auto`).
2. THE App SHALL show, for each Transaction, its name, its amount formatted as US dollar currency with two decimal places (e.g. `$14.94`), and its Category.
3. THE App SHALL render a Delete button on every Transaction in the Transaction List.
4. WHEN the User clicks the Delete button of a Transaction, THE App SHALL remove exactly that Transaction (identified by its `id`) and SHALL update the Transaction List, the Total Balance, the Spending Chart, and Local Storage.
5. WHILE the App holds no Transactions, THE App SHALL display the empty-state message "No transactions yet. Add your first one above."; WHILE it holds one or more Transactions, THE App SHALL hide that message.
6. THE App SHALL render Transaction names as plain text, so that any HTML or script text typed by the User is displayed literally and never interpreted or executed.
7. IF a Transaction name is long or contains no spaces, THEN THE App SHALL wrap it inside its list item without causing horizontal scrolling of the page.

---

### Requirement 3: Total Balance

**User Story:** As a User, I want to see my total spending at the top of the page, so that I always know how much I have spent.

#### Acceptance Criteria

1. THE App SHALL display the Total Balance in a prominent card at the top of the page, above the input form.
2. THE Total Balance SHALL equal the sum of the amounts of all Transactions, formatted as US dollar currency with two decimal places, and SHALL equal `$0.00` when there are no Transactions.
3. THE App SHALL compute the Total Balance using integer cents, so that decimal amounts such as 0.10 and 0.20 sum to exactly 0.30 with no floating-point error.
4. WHEN a Transaction is added or deleted, THE App SHALL update the displayed Total Balance immediately, without a page reload.

---

### Requirement 4: Spending Chart

**User Story:** As a User, I want a pie chart of my spending by category, so that I can see at a glance where my money goes.

#### Acceptance Criteria

1. THE App SHALL display a pie chart titled "Spending by Category", drawn with the Chart Library, that uses the Categories Food, Transport, and Fun as its labels.
2. THE Spending Chart SHALL size each slice to the sum of the amounts of all Transactions in that Category, and SHALL use the fixed colors green `#2ecc71` for Food, blue `#3498db` for Transport, and orange `#e67e22` for Fun.
3. WHEN a Transaction is added or deleted, THE App SHALL update the Spending Chart immediately, without a page reload.
4. WHILE the App holds no Transactions, THE App SHALL hide the Spending Chart and display the message "Add a transaction to see your spending chart."
5. WHEN the User hovers over or taps a slice, THE Spending Chart SHALL show a tooltip containing the Category name and the Category total formatted as US dollar currency.
6. IF the Chart Library fails to load, THEN THE App SHALL display the message "The chart could not be loaded. Check your internet connection and refresh." in place of the chart, and every other feature of the App SHALL continue to work without throwing a JavaScript exception.
7. THE Spending Chart SHALL be responsive, resizing with its container, with a container height of 300 px.

---

### Requirement 5: Local Storage Persistence

**User Story:** As a User, I want my data to still be there when I come back, so that I do not have to re-enter my transactions.

#### Acceptance Criteria

1. THE App SHALL store the Transactions, the Spending Limit, the Sort Option, and the Theme in Local Storage as JSON under the keys `ebv.transactions`, `ebv.limit`, `ebv.sort`, and `ebv.theme` respectively.
2. WHEN the App loads, THE App SHALL read these values from Local Storage and render the Transaction List, Total Balance, Spending Chart, Spending Limit, Sort Option, and Theme from them.
3. THE App SHALL keep all data client-side and SHALL NOT send any data to a server.
4. IF the stored Transactions are missing, are not valid JSON, or are not an array, THEN THE App SHALL start with an empty Transaction List and SHALL NOT throw a JavaScript exception; IF an individual stored entry lacks a name, has a non-finite amount, or has a Category outside Food, Transport, and Fun, THEN THE App SHALL discard that entry and keep the valid ones.
5. IF Local Storage is unavailable or a write to it fails (for example in a private browsing window or when the quota is exceeded), THEN THE App SHALL continue to work for the current page session without throwing a JavaScript exception.
6. WHEN the User reloads the page, THE App SHALL show the same Transactions, Total Balance, Spending Chart, Spending Limit, Sort Option, and Theme as before the reload.

---

### Requirement 6: Sort Transactions (Optional Challenge)

**User Story:** As a User, I want to sort my transactions by amount or category, so that I can find the biggest or most related expenses quickly.

#### Acceptance Criteria

1. THE App SHALL provide a sort control next to the Transaction List heading with four Sort Options labeled "Newest first", "Amount: high to low", "Amount: low to high", and "Category (A–Z)".
2. WHEN no Sort Option has been saved, THE App SHALL use "Newest first".
3. WHEN the User selects a Sort Option, THE App SHALL reorder the Transaction List immediately: by `createdAt` descending, by `amount` descending, by `amount` ascending, or by Category name alphabetically.
4. WHEN two Transactions compare equal under the selected Sort Option, THE App SHALL list the newer Transaction first.
5. THE sorting operation SHALL NOT add, remove, or modify any Transaction, and SHALL NOT change the Total Balance or the Spending Chart.
6. THE App SHALL save the selected Sort Option and SHALL restore it when the page is loaded again.

---

### Requirement 7: Spending Limit Highlight (Optional Challenge)

**User Story:** As a User, I want to set a spending limit and see which items and totals exceed it, so that I can notice overspending.

#### Acceptance Criteria

1. THE App SHALL provide a "Spending limit" number input inside the Total Balance card, empty by default with the placeholder "No limit".
2. WHEN the Spending limit input contains a number greater than 0, THE App SHALL set the Spending Limit to that number; WHEN the input is empty, zero, negative, or not a number, THE App SHALL treat the Spending Limit as not set and SHALL highlight nothing.
3. WHILE a Spending Limit is set, THE App SHALL highlight every Over-Limit Transaction in the Transaction List with a red left border, a tinted background, and a red amount, and SHALL add the tag "Over limit" to it.
4. WHILE a Spending Limit is set and the Total Balance is strictly greater than it, THE App SHALL highlight the Total Balance card with a red border, a tinted background, and a red amount, and SHALL display the message "Over your limit by [difference]", where [difference] is the Total Balance minus the Spending Limit formatted as US dollar currency.
5. WHEN the User changes the Spending Limit, or adds or deletes a Transaction, THE App SHALL update all highlights immediately, on every change of the input value and without a page reload.
6. THE App SHALL save the Spending Limit and SHALL restore it when the page is loaded again.
7. THE App SHALL NOT rely on color alone to signal that a limit is exceeded: the "Over limit" tag and the "Over your limit by" message SHALL accompany the colors.

---

### Requirement 8: Dark/Light Mode Toggle (Optional Challenge)

**User Story:** As a User, I want to switch between a light and a dark theme, so that the app is comfortable to read in any lighting.

#### Acceptance Criteria

1. THE App SHALL provide a theme toggle button in the page header.
2. WHEN no Theme has been saved, THE App SHALL use `dark` if the browser reports the `prefers-color-scheme: dark` media query as matching, and `light` otherwise.
3. WHEN the User clicks the theme toggle button, THE App SHALL switch to the other Theme immediately, set the `data-theme` attribute on the root `<html>` element to the new Theme, and update the button label ("Dark mode" or "Light mode") and its `aria-label` to describe the next switch.
4. THE App SHALL define all Theme colors as CSS custom properties, such that text and controls remain readable against their backgrounds in both Themes.
5. WHEN the Theme changes while the Spending Chart is displayed, THE App SHALL update the chart's legend text color and slice border color to match the new Theme without losing the chart data.
6. THE App SHALL save the selected Theme and SHALL restore it when the page is loaded again.

---

### Requirement 9: Layout and Visual Design

**User Story:** As a User, I want a clean, readable layout that works well on a phone, so that I can log expenses wherever I am.

#### Acceptance Criteria

1. THE App SHALL lay out the page from top to bottom as: the page title, the Total Balance card, the "Add Transaction" card, and then the "Transactions" card together with the "Spending by Category" card.
2. WHILE the viewport width is at least 768 px, THE App SHALL show the Transactions card and the Spending by Category card side by side in two equal columns; WHILE the viewport is narrower, THE App SHALL stack them in a single column.
3. THE App SHALL NOT cause horizontal scrolling of the page at a viewport width of 375 px.
4. THE App SHALL establish a clear visual hierarchy: the Total Balance amount is the largest text on the page, card headings are larger than field labels, and the base font size is 16 px.
5. THE App SHALL present the primary action ("Add Transaction") as a full-width blue button, each Delete button in red, and each Category as a small tag, following the layout of the expected output in the project brief.
6. THE App SHALL make every interactive element keyboard-focusable with a visible focus outline, and SHALL associate every form field with a visible `<label>`.
7. THE App SHALL use no JavaScript framework and no external dependency other than the Chart Library, and SHALL update an existing Spending Chart instance in place instead of recreating it on each change.

---

### Requirement 10: Technology and Project Constraints

**User Story:** As a participant, I want the project to follow the course constraints, so that the submission is valid.

#### Acceptance Criteria

1. THE App SHALL be built with HTML for structure, CSS for styling, and vanilla JavaScript for behavior, with no framework such as React or Vue.
2. THE App SHALL require no backend server, and SHALL work when `index.html` is opened directly in a browser or when the project is served as a static website.
3. THE project SHALL contain exactly one CSS file, `css/style.css`, inside `css/`, and exactly one JavaScript file, `js/script.js`, inside `js/`.
4. THE App SHALL load the Chart Library from a CDN using a classic `<script>` tag placed before the `<script src="js/script.js">` tag, and SHALL reference local files with relative paths and without `type="module"`.
5. THE App SHALL work in current versions of Chrome, Firefox, Edge, and Safari.
6. THE project SHALL require no build step, no package installation, and no test setup.
7. THE source files SHALL be organized in clearly commented sections and use descriptive names, so that the code stays clean and readable.

---

### Requirement 11: Repository, Deployment, and Submission

**User Story:** As a participant, I want the repository, website, and submission to follow the course rules, so that my work is accepted.

#### Acceptance Criteria

1. THE GitHub repository SHALL be named `CodingCamp-[batch date (ddmmyy)]-[participantname]`, where the batch date is the first day the participant takes the course (for example `CodingCamp-9November26-yamaroni`).
2. THE repository SHALL contain the `.kiro` folder, including the spec directory `.kiro/specs/expense-budget-visualizer/`.
3. THE source code SHALL be saved with GitHub Desktop and pushed to the GitHub repository.
4. THE App SHALL be published with GitHub Pages and SHALL load and work at its public URL.
5. THE participant SHALL submit the AWS Builder ID, the GitHub repository URL, and the published website URL through the Paperform submission form before the deadline of Saturday 23:59 WIB; a submission that lacks any of the required links is not valid.
