# Implementation Plan for Full Frontend ↔ Backend Integration

## Goal Description
Replace all mock-data usage in the existing React + Vite SpendWise application with real data fetched from the PostgreSQL‑backed Node.js/Express API. Preserve the current UI, navigation, styling, and component interfaces.

## User Review Required
- **Base URL**: The API client will use `import.meta.env.VITE_API_BASE_URL` (or fallback to `http://localhost:5000`). Confirm this matches the dev server URL.
- **Auth storage**: We will store the JWT in `localStorage` under the key `spendwise_token`. If you prefer `sessionStorage` or a different key, let us know.
- **Error UI**: Loading spinners and error alerts will be added using existing UI components (`<Card>`, `<Badge>`, etc.). Confirm acceptance.

## Open Questions
[IMPORTANT] Do you want the JWT to be refreshed automatically (refresh token) or just cleared on 401?
[IMPORTANT] Should the API client include the Authorization header for **all** requests after login, or only for protected endpoints?

## Proposed Changes
---
### API Service (`src/app/services/api.ts`)
- Create a singleton Axios instance with base URL from env.
- Interceptor to attach `Authorization: Bearer <token>` from `localStorage`.
- Export functions: `register`, `login`, `getCurrentUser`, `logout`, `fetchAccounts`, `createAccount`, `deleteAccount`, `fetchTransactions`, `createTransaction`, `deleteTransaction`, `fetchBudgets`, `createBudget`, `updateBudget`, `deleteBudget`, `fetchGoals`, `createGoal`, `deleteGoal`, `fetchBills`, `createBill`, `deleteBill`, `chat`.

---
### Auth Flow (`src/app/screens/Onboarding.tsx`)
- Replace inline registration/login handlers with calls to `api.register` and `api.login`.
- On success, store token, call `api.getCurrentUser` to load user profile, and update `AppContext` state (`setUser`).
- Add logout function in `AppContext` that clears token and resets context to initial mock data.

---
### AppContext (`src/app/context/AppContext.tsx`)
- Initialize state from mock data **only** when not authenticated (no token).
- On mount, if a token exists, fetch user, accounts, transactions, budgets, goals, bills via API and replace the mock arrays.
- Add context methods that call API service and update state (`addAccount`, `removeAccount`, `addTransaction`, `removeTransaction`, `addBudget`, `updateBudget`, `addGoal`, `removeGoal`, `addBill`, `removeBill`).
- Keep utility functions (`convertAndFormat`, `convertRaw`).

---
### Screens
- **Dashboard**: Replace `monthIncome`/`monthExpenses` with computed values from fetched `transactions`. Replace `accounts` and `transactions` rendering to use live state (already done).
- **Transactions** (`src/app/screens/Transactions.tsx`): Fetch via context; on add/delete call corresponding API methods.
- **Budgets** (`src/app/screens/Budgets.tsx`): Use API for CRUD; compute `spent` from real transactions (already handled by context effect).
- **Goals** (`src/app/screens/Goals.tsx`): Use API for CRUD.
- **Bills** (`src/app/screens/Bills.tsx`): Use API for CRUD.
- **Reports** (`src/app/screens/Reports.tsx`): Replace mock chart data with derived data from `transactions` (group by month/category).
- **AIInsights** (`src/app/screens/AIInsights.tsx`): Send user prompt to `api.chat` and display response; keep fallback mock data as backup.

---
### Error & Loading States
- Add `loading` boolean flags in context for each resource.
- Add simple UI placeholders (`<p>Loading…</p>` or spinner component) where data is awaited.
- Catch API errors; if 401, trigger logout.
- Display error alerts using `<Alert>` component when requests fail.

---
### Miscellaneous
- Ensure `.env.example` contains `VITE_API_BASE_URL`.
- Do not delete `mockData.ts`; keep it as fallback for unauthenticated preview.
- Update `package.json` (if needed) to include `axios`.

## Verification Plan
- Run `npm run dev` for backend and `npm run dev` for Vite frontend.
- Perform the end‑to‑end flow listed by the user and verify data appears in PostgreSQL tables via `psql` queries.
- Verify JWT is stored and sent with requests (inspect network tab).
- Ensure UI remains visually identical.

### Automated Tests
- No unit tests are present; manual verification as described.

---
**User approval needed** before modifying any files.
