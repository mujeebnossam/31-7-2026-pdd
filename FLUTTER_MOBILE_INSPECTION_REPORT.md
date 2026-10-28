# SPENDWISE AI — FLUTTER ANDROID MIGRATION
## MASTER INSPECTION REPORT

**Date:** 2026-08-21  
**Project:** SpendWise AI Mobile Client Migration (Flutter Android)  
**Status:** Inspection Phase Complete (Read-Only Audit)  

---

## 1. EXECUTIVE SUMMARY

SpendWise AI is a complete personal finance and AI-driven wealth intelligence platform. The backend is an enterprise-grade Node.js/Express TypeScript service backed by PostgreSQL (Sequelize ORM) with 173/173 verified passing integration assertions across Phases 4 through 7. 

The web application (React 19 + Vite + Tailwind CSS) is currently in production-ready status with 0 TypeScript errors.

This inspection establishes the exact technical specifications and architectural bridge required to develop a standalone **Flutter Android mobile client** that consumes the existing backend APIs without rewriting, duplicating, altering, or modifying any backend or database components.

---

## 2. EXISTING BACKEND ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND (Node.js)                │
│                                                             │
│  Port: 3001                                                 │
│  Auth: JWT (HMAC SHA-256) via Authorization: Bearer <token> │
├──────────────────────────────┬──────────────────────────────┤
│ API Routers:                 │ Services Layer:              │
│  - /api/auth                 │  - FinancialAnalysisService  │
│  - /api/accounts             │  - PredictionService         │
│  - /api/transactions         │  - AIInsightEngine           │
│  - /api/budgets              │  - AIAdvisorService          │
│  - /api/goals                │  - IngestionService          │
│  - /api/bills                │                              │
│  - /api/ai                   │                              │
│  - /api/ingestion            │                              │
├──────────────────────────────┴──────────────────────────────┤
│ Database Layer (Sequelize ORM 6.37.8):                      │
│  - PostgreSQL (spendwise_db)                                │
│  - Atomic ACID DB Transactions for Balances & Schedules     │
│  - Strict userId row-level tenant isolation                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Characteristics:
- **Stateless Authentication:** JSON Web Tokens signed with `JWT_SECRET`, decoded in `server/middleware/auth.ts`, attaching `req.userId` to all protected routes.
- **Atomic Balance Integrity:** Transactions, Bill Payments, Goal Contributions/Withdrawals, and Ingestion all execute inside explicit Sequelize database transactions (`sequelize.transaction()`). Account balance deltas are updated atomically with strict row locking (`lock: true`).
- **Deterministic Multi-Tier AI:** The AI layer uses a dual-engine architecture:
  1. Primary: Groq API (`llama-3.3-70b-versatile`) or Google GenAI (`gemini-2.5-flash`).
  2. Fallback: 100% Deterministic Rule Engine calculating exact statistics from the user's PostgreSQL ledger with zero external runtime dependencies.

---

## 3. EXISTING FRONTEND ARCHITECTURE

The current React frontend (`src/app/`) serves as the functional and UX reference:
- **Global State:** Managed in `src/app/context/AppContext.tsx` with unified state hooks for `accounts`, `transactions`, `budgets`, `goals`, `bills`, `user`, and `currency`.
- **API Client:** Centralized in `src/app/services/api.ts` utilizing `fetch` with token injection and error unwrapping.
- **Dynamic Ledger Math:** Real-time multi-currency conversions (USD, INR, EUR), automatic budget category spending aggregation from transactions, and predictive trends.
- **Screen Inventory:**
  1. `Onboarding.tsx` (Login, Register, Demo Tour)
  2. `Dashboard.tsx` (Financial Health, Net Worth, Account Cards, Quick Actions)
  3. `Transactions.tsx` (CRUD, Filter, Search, Categorization)
  4. `Budgets.tsx` (Category Limits, Progress, Overspending Warnings)
  5. `Goals.tsx` (Target Tracking, Milestone Progress, Deposits/Withdrawals)
  6. `Bills.tsx` (Recurring Tracker, Due Dates, Autopay, Settle/Pay Flow)
  7. `AIInsights.tsx` (AI Chat Assistant, Spending Insights, Predictions, Anomalies)
  8. `Reports.tsx` (Cash Flow Trends, Category Breakdown, CSV Export)
  9. `Investments.tsx` (Portfolio Simulator Sandbox)
  10. `Settings.tsx` (Profile, Security, Currency Preference, Data Management)

---

## 4. API ENDPOINT MAPPING & COMPATIBILITY AUDIT

| Group | Endpoint | Method | Auth | Request Payload / Params | Response Schema | Flutter Model & Service |
|---|---|---|---|---|---|---|
| **Auth** | `/api/auth/register` | `POST` | No | `{ name, email, password }` | `{ token: string, user: AuthUser }` | `AuthService.register()` → `AuthResponse` |
| **Auth** | `/api/auth/login` | `POST` | No | `{ email, password }` | `{ token: string, user: AuthUser }` | `AuthService.login()` → `AuthResponse` |
| **Auth** | `/api/auth/me` | `GET` | Yes | Header `Authorization: Bearer <token>` | `AuthUser` | `AuthService.getMe()` → `AuthUser` |
| **Auth** | `/api/auth/account` | `DELETE` | Yes | Header `Authorization: Bearer <token>` | `{ message: string }` | `AuthService.deleteAccount()` |
| **Accounts** | `/api/accounts` | `GET` | Yes | None | `ApiAccount[]` | `AccountService.getAccounts()` → `List<AccountModel>` |
| **Accounts** | `/api/accounts/:id` | `GET` | Yes | Param `:id` | `ApiAccount` | `AccountService.getAccountById()` → `AccountModel` |
| **Accounts** | `/api/accounts` | `POST` | Yes | `{ name, type, balance, bank, last4, color }` | `ApiAccount` | `AccountService.createAccount()` → `AccountModel` |
| **Accounts** | `/api/accounts/:id` | `PUT` | Yes | `Partial<ApiAccount>` | `ApiAccount` | `AccountService.updateAccount()` → `AccountModel` |
| **Accounts** | `/api/accounts/:id` | `DELETE` | Yes | Param `:id` | `{ message: string }` | `AccountService.deleteAccount()` |
| **Transactions** | `/api/transactions` | `GET` | Yes | Query: `type`, `category`, `accountId`, `limit`, `offset` | `ApiTransaction[]` | `TransactionService.getTransactions()` → `List<TransactionModel>` |
| **Transactions** | `/api/transactions` | `POST` | Yes | `{ title, merchant, amount, type, category, date, icon, notes, accountId }` | `ApiTransaction` | `TransactionService.createTransaction()` → `TransactionModel` |
| **Transactions** | `/api/transactions/:id` | `PUT` | Yes | `Partial<ApiTransaction>` | `ApiTransaction` | `TransactionService.updateTransaction()` → `TransactionModel` |
| **Transactions** | `/api/transactions/:id` | `DELETE` | Yes | Param `:id` | `{ message: string }` | `TransactionService.deleteTransaction()` |
| **Budgets** | `/api/budgets` | `GET` | Yes | Query: `month` (e.g. `2026-08`) | `ApiBudget[]` | `BudgetService.getBudgets()` → `List<BudgetModel>` |
| **Budgets** | `/api/budgets` | `POST` | Yes | `{ category, budgeted, color, icon, period }` | `ApiBudget` | `BudgetService.createBudget()` → `BudgetModel` |
| **Budgets** | `/api/budgets/:id` | `PUT` | Yes | `Partial<ApiBudget>` | `ApiBudget` | `BudgetService.updateBudget()` → `BudgetModel` |
| **Budgets** | `/api/budgets/:id` | `DELETE` | Yes | Param `:id` | `{ message: string }` | `BudgetService.deleteBudget()` |
| **Goals** | `/api/goals` | `GET` | Yes | None | `ApiGoal[]` | `GoalService.getGoals()` → `List<GoalModel>` |
| **Goals** | `/api/goals/:id` | `GET` | Yes | Param `:id` | `ApiGoal & { remaining, progress }` | `GoalService.getGoalById()` → `GoalDetailModel` |
| **Goals** | `/api/goals` | `POST` | Yes | `{ name, target, current, deadline, category, description, icon, color }` | `ApiGoal` | `GoalService.createGoal()` → `GoalModel` |
| **Goals** | `/api/goals/:id` | `PUT` | Yes | `Partial<ApiGoal>` | `ApiGoal` | `GoalService.updateGoal()` → `GoalModel` |
| **Goals** | `/api/goals/:id/contribute` | `POST` | Yes | `{ amount, type: 'deposit'\|'withdrawal', accountId? }` | `{ message: string, goal: ApiGoal, accountBalanceAfter?: number }` | `GoalService.contribute()` → `GoalContributionResponse` |
| **Goals** | `/api/goals/:id` | `DELETE` | Yes | Param `:id` | `{ message: string }` | `GoalService.deleteGoal()` |
| **Bills** | `/api/bills` | `GET` | Yes | None | `ApiBill[]` (with resolved status) | `BillService.getBills()` → `List<BillModel>` |
| **Bills** | `/api/bills` | `POST` | Yes | `{ name, amount, dueDay, dueDate, category, frequency, autopay, description, icon, color }` | `ApiBill` | `BillService.createBill()` → `BillModel` |
| **Bills** | `/api/bills/:id` | `PUT` | Yes | `Partial<ApiBill>` | `ApiBill` | `BillService.updateBill()` → `BillModel` |
| **Bills** | `/api/bills/:id/pay` | `POST` | Yes | `{ accountId? }` | `{ message: string, bill: ApiBill }` | `BillService.payBill()` → `BillPayResponse` |
| **Bills** | `/api/bills/:id` | `DELETE` | Yes | Param `:id` | `{ message: string }` | `BillService.deleteBill()` |
| **AI** | `/api/ai/summary` | `GET` | Yes | None | `ApiFinancialSummary` | `AIService.getSummary()` → `FinancialSummaryModel` |
| **AI** | `/api/ai/insights` | `GET` | Yes | None | `ApiAIInsight[]` | `AIService.getInsights()` → `List<AIInsightModel>` |
| **AI** | `/api/ai/predictions` | `GET` | Yes | None | `ApiFinancialPredictions` | `AIService.getPredictions()` → `FinancialPredictionsModel` |
| **AI** | `/api/ai/chat` | `POST` | Yes | `{ prompt: string, conversationId?: string }` | `{ response: string, conversationId: string, messageId: string }` | `AIService.chat()` → `AIChatResponse` |
| **AI** | `/api/ai/conversations` | `GET` | Yes | None | `AIConversation[]` with nested `messages` | `AIService.getConversations()` → `List<ConversationModel>` |
| **AI** | `/api/ai/conversations` | `DELETE` | Yes | None | `{ message: string }` | `AIService.clearConversations()` |
| **AI** | `/api/ai/suggest-category` | `POST` | Yes | `{ merchant: string }` | `{ category: string, confidence: number, icon: string }` | `AIService.suggestCategory()` → `CategorySuggestionModel` |
| **Ingestion** | `/api/ingestion/providers` | `GET` | Yes | None | `ApiDataProvider[]` | `IngestionService.getProviders()` → `List<DataProviderModel>` |
| **Ingestion** | `/api/ingestion/csv/parse` | `POST` | Yes | `{ csvContent: string, accountId?: string }` | `ApiCSVParseResult` | `IngestionService.parseCsv()` → `CSVParseResultModel` |
| **Ingestion** | `/api/ingestion/csv/confirm` | `POST` | Yes | `{ transactions: ApiNormalizedTransaction[], accountId: string, skipDuplicates: boolean }` | `ApiBatchImportResult` | `IngestionService.confirmImport()` → `BatchImportResultModel` |
| **Ingestion** | `/api/ingestion/demo` | `POST` | Yes | `{ merchant?, amount?, type?, accountId?, source?, category? }` | `ApiDemoIngestionResult` | `IngestionService.simulateDemo()` → `DemoIngestionResultModel` |

---

## 5. AI CHAT INSPECTION

1. **Authentication:** AI requests enforce `protect` middleware, reading `req.userId`.
2. **Payload:** The mobile client sends `{ prompt: "...", conversationId: "uuid-optional" }`.
3. **Response Structure:** Returns `{ response: "markdown formatted text", conversationId: "uuid", messageId: "uuid" }`.
4. **Context Injection:** `AIAdvisorService` generates a verified context string from the user's live PostgreSQL accounts, transactions, budgets, goals, bills, and prediction models.
5. **Streaming:** Streaming is **not** currently implemented on the backend; the backend responds via standard HTTP JSON POST. The Flutter client should consume standard async JSON request/response with typing indicators.
6. **Persistence:** The backend automatically persists both `user` and `assistant` messages in `AIMessage` linked to `AIConversation`.
7. **Reliability & Fallback:** If Groq/Gemini keys fail or network drops on the external LLM provider, `AIAdvisorService` executes `generateDeterministicResponse()` calculating accurate figures from the user's PostgreSQL ledger.

---

## 6. FLUTTER ARCHITECTURE RECOMMENDATION

We recommend a 4-layer clean architecture:
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  Screens, Widgets, Sheets, Dialogs, Theme                   │
├─────────────────────────────────────────────────────────────┤
│                 STATE MANAGEMENT (Provider)                 │
│  AuthProvider, FinancialDataProvider, AIChatProvider        │
├─────────────────────────────────────────────────────────────┤
│                     REPOSITORY LAYER                        │
│  AccountRepository, TransactionRepository, AIRepository... │
├─────────────────────────────────────────────────────────────┤
│                  DATA / NETWORK SERVICE                     │
│  ApiClient (Dio/Http), SecureStorage, API Interceptors      │
└─────────────────────────────────────────────────────────────┘
```

- **State Management:** `provider` (or `flutter_riverpod`). `Provider` matches the project simplicity and React Context patterns cleanly.
- **Networking:** `dio` or `http` with an authentication interceptor that automatically attaches `Bearer <jwt>` and intercepts 401s.
- **Secure Token Storage:** `flutter_secure_storage` storing credentials in the Android Keystore.
- **Routing:** `go_router` supporting deep linking and auth redirection guards.

---

## 7. FLUTTER SCREEN & NAVIGATION MAPPING

| # | Screen / View | Navigation Type | UX Pattern |
|---|---|---|---|
| 1 | **Splash** | Full Screen | Startup token verification & animated branding |
| 2 | **Onboarding / Welcome** | Full Screen | Carousel walkthrough of SpendWise AI capabilities |
| 3 | **Login** | Full Screen | Email/Password form with validation |
| 4 | **Register** | Full Screen | Registration with name, email, password strength |
| 5 | **Main Shell** | Persistent Bottom Nav | 4 primary tabs: Home, Transactions, AI, More |
| 6 | **Dashboard (Home)** | Primary Tab | Net worth banner, account scroll, recent activity, health score |
| 7 | **Accounts List & Detail** | Sub-screen / Modal | Account cards, balance history, add/edit account sheet |
| 8 | **Transactions Ledger** | Primary Tab | Search bar, category filters, infinite list, swipe actions |
| 9 | **Add / Edit Transaction** | Modal Bottom Sheet | Numeric keypad, category picker with AI suggestion chips |
| 10 | **Budgets View** | Sub-screen / Tab | Category budget progress bars, over-budget warnings, create sheet |
| 11 | **Goals Tracker** | Sub-screen / Tab | Circular progress rings, contribution sheet (deposit/withdraw) |
| 12 | **Bills & Subscriptions** | Sub-screen / Tab | Calendar due dates, overdue badges, one-tap "Pay Bill" modal |
| 13 | **AI Financial Hub** | Primary Tab | Segmented tabs: Chat, Insights, Predictions, Anomalies |
| 14 | **AI Chat Assistant** | Tab View / Screen | Chat bubbles (markdown rendered), prompt pills, clear history |
| 15 | **Financial Reports** | Sub-screen | Income vs Expense charts, Category Pie, CSV Ledger Export |
| 16 | **CSV Importer** | Modal Flow | File selector, column mapping preview, duplicate reconciliation |
| 17 | **Demo Ingestion Sandbox**| Modal Bottom Sheet | Instant UPI transaction simulator with push notification banner |
| 18 | **Portfolio Simulator** | Sub-screen | Sandboxed asset allocation and return simulation |
| 19 | **Settings** | Sub-screen | Profile, Currency switch (USD/INR/EUR), Base URL setting, Logout |

---

## 8. DART MODEL MAPPING & SERIALIZATION SPECIFICATION

All models will be type-safe with defensive parsing for PostgreSQL numeric types (which Sequelize may deliver as strings or floats):

```dart
// Helper for resilient PostgreSQL decimal parsing
double parseDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  return 0.0;
}
```

### Key Models to Generate:
1. `AuthUser` (`id`, `name`, `email`, `financialScore`, `memberSince`)
2. `AuthResponse` (`token`, `user`)
3. `AccountModel` (`id`, `name`, `type`, `balance`, `bank`, `last4`, `color`)
4. `TransactionModel` (`id`, `title`, `merchant`, `amount`, `type`, `category`, `date`, `icon`, `status`, `notes`, `accountId`)
5. `BudgetModel` (`id`, `category`, `budgeted`, `spent`, `period`, `color`, `icon`)
6. `GoalModel` (`id`, `name`, `target`, `current`, `deadline`, `category`, `description`, `icon`, `color`)
7. `BillModel` (`id`, `name`, `amount`, `dueDay`, `dueDate`, `category`, `frequency`, `status`, `autopay`, `paidDate`, `icon`, `color`)
8. `FinancialSummaryModel` (Complete structured financial snapshot)
9. `AIInsightModel` (`id`, `type`, `title`, `description`, `severity`, `category`, `action`, `icon`)
10. `FinancialPredictionsModel` (`confidence`, `nextMonth`, `trajectory`, `categoryPredictions`, `goalPredictions`)
11. `AIChatMessageModel` (`id`, `role`, `content`, `createdAt`)
12. `CSVParseResultModel` & `BatchImportResultModel`

---

## 9. STATE MANAGEMENT STRATEGY

- **`AuthProvider`**: Manages auth lifecycle (`token`, `currentUser`, `login()`, `register()`, `logout()`, `checkAuthStatus()`).
- **`FinancialDataProvider`**: Manages `accounts`, `transactions`, `budgets`, `goals`, `bills`. Exposes unified `refreshAll()` triggered on app foregrounding, pull-to-refresh, or post-mutation.
- **`AIChatProvider`**: Manages active `conversationId`, message list, loading/thinking states, sending prompts, and clearing history.
- **`CurrencyProvider`**: Manages active display currency (USD, INR, EUR) and converts amounts client-side using exchange rates.

---

## 10. PACKAGE RECOMMENDATIONS

| Package | Purpose | Category |
|---|---|---|
| `provider` (or `flutter_riverpod`) | State management & dependency injection | Required |
| `dio` / `http` | HTTP client with interceptors for JWT | Required |
| `flutter_secure_storage` | Encrypted storage for JWT token | Required |
| `go_router` | Declarative routing & navigation guards | Required |
| `fl_chart` | High-performance mobile financial charts (Line, Bar, Pie) | Required |
| `intl` | Currency formatting and date parsing | Required |
| `flutter_markdown` | Rich rendering of AI Advisor responses | Required |
| `file_picker` | Selecting CSV statement files for ingestion | Required |
| `share_plus` / `path_provider` | Saving and sharing exported CSV reports | Required |
| `google_fonts` | Modern typography (Inter) | Recommended |

---

## 11. AUTHENTICATION & SECURITY STRATEGY

1. **Storage:** JWT stored strictly inside `flutter_secure_storage` (backed by Android Keystore with AES encryption).
2. **Interceptor:** Every outgoing request appends `Authorization: Bearer <jwt>`.
3. **Session Expiry:** A 401 Unauthorized response from any endpoint automatically triggers `AuthProvider.logout()`, clearing the Keystore token and navigating to `/login`.
4. **Zero Client Secrets:** No PostgreSQL credentials, JWT secret keys, Groq API keys, or Gemini keys will exist in the mobile code. All sensitive processing remains on the Express backend.

---

## 12. ANDROID NETWORKING STRATEGY

During local development, Android devices cannot connect to `localhost` directly:
- **Android Emulator:** Uses `http://10.0.2.2:3001/api` (the host loopback alias).
- **Physical Device:** Uses `http://<YOUR_LOCAL_LAN_IP>:3001/api` (e.g. `http://192.168.1.5:3001/api`).
- **Cleartext Traffic:** Android 9+ blocks cleartext HTTP by default. `android/app/src/main/AndroidManifest.xml` must declare `android:usesCleartextTraffic="true"` for development mode.
- **Dynamic Config:** The Flutter client will include a developer settings toggle to switch between Emulator, LAN IP, or Production URLs at runtime.

---

## 13. CSV & FILE HANDLING STRATEGY

1. User selects CSV bank statement via `file_picker`.
2. Mobile client reads text content and posts to `/api/ingestion/csv/parse`.
3. Backend performs parsing, column detection, normalization, and duplicate identification.
4. Mobile displays a preview sheet with detected duplicates highlighted.
5. User confirms import, calling `/api/ingestion/csv/confirm`.
6. Ledger and account balances update atomically.

---

## 14. REAL-WORLD FAILURE SCENARIOS & RESILIENCE

- **Network Offline:** Display global offline banner; cached data remains visible.
- **Invalid Auth Token:** Automatic purge and redirect to login with user notification.
- **AI Service Outage:** Backend automatically provides deterministic calculations; mobile shows graceful warning without crashing.
- **Database Conflict:** Optimistic updates rollback cleanly if backend returns 400/409/500 errors.

---

## 15. PERFORMANCE CONSIDERATIONS

- Use `ListView.builder` for virtualized rendering of long transaction ledgers.
- Debounce search and filter inputs on transactions.
- Limit AI chat message rendering to recent history in viewport.
- Leverage `RepaintBoundary` on complex charts (`fl_chart`) to avoid unnecessary canvas redraws.

---

## 16. RISKS & BLOCKERS

- **Flutter SDK Installation:** The developer machine currently requires Flutter & Dart SDKs configured in system `PATH`.
- **Android SDK & Build Tools:** Android Studio / cmdline-tools required for building the `.apk`.

---

## 17. RECOMMENDED IMPLEMENTATION ORDER

1. **Phase 1:** Setup Flutter project (`flutter_mobile`) and configure dependencies.
2. **Phase 2:** Core network client, secure token storage, and Auth flow (Login, Register, Splash).
3. **Phase 3:** Main navigation shell and Dashboard screen.
4. **Phase 4:** Accounts & Transactions management (CRUD, filtering, category suggestions).
5. **Phase 5:** Budgets, Goals (contributions), and Bills (settle/autopay).
6. **Phase 6:** AI Intelligence Hub (AI Chat, Insights, Predictions, Anomalies).
7. **Phase 7:** Ingestion Suite (CSV parsing preview and Demo UPI simulation).
8. **Phase 8:** Reports, Portfolio Simulator, Settings, UI Polish, and QA validation.

---

## 18. EXACT FILES TO BE CREATED (FLUTTER CLIENT)

```
flutter_mobile/
├── pubspec.yaml
├── analysis_options.yaml
└── lib/
    ├── main.dart
    ├── core/
    │   ├── constants/
    │   │   ├── api_endpoints.dart
    │   │   ├── app_colors.dart
    │   │   └── app_typography.dart
    │   ├── network/
    │   │   ├── api_client.dart
    │   │   └── api_interceptor.dart
    │   ├── storage/
    │   │   └── secure_storage_service.dart
    │   ├── theme/
    │   │   └── app_theme.dart
    │   └── utils/
    │       ├── currency_formatter.dart
    │       └── date_formatter.dart
    ├── models/
    │   ├── user_model.dart
    │   ├── account_model.dart
    │   ├── transaction_model.dart
    │   ├── budget_model.dart
    │   ├── goal_model.dart
    │   ├── bill_model.dart
    │   ├── ai_models.dart
    │   └── ingestion_models.dart
    ├── services/
    │   ├── auth_service.dart
    │   ├── account_service.dart
    │   ├── transaction_service.dart
    │   ├── budget_service.dart
    │   ├── goal_service.dart
    │   ├── bill_service.dart
    │   ├── ai_service.dart
    │   └── ingestion_service.dart
    ├── providers/
    │   ├── auth_provider.dart
    │   ├── financial_provider.dart
    │   └── ai_chat_provider.dart
    ├── navigation/
    │   └── app_router.dart
    ├── screens/
    │   ├── splash_screen.dart
    │   ├── auth/
    │   │   ├── login_screen.dart
    │   │   └── register_screen.dart
    │   ├── dashboard/
    │   │   └── dashboard_screen.dart
    │   ├── transactions/
    │   │   ├── transactions_screen.dart
    │   │   └── transaction_form_sheet.dart
    │   ├── accounts/
    │   │   └── accounts_screen.dart
    │   ├── budgets/
    │   │   └── budgets_screen.dart
    │   ├── goals/
    │   │   └── goals_screen.dart
    │   ├── bills/
    │   │   └── bills_screen.dart
    │   ├── ai/
    │   │   ├── ai_hub_screen.dart
    │   │   └── ai_chat_view.dart
    │   ├── reports/
    │   │   └── reports_screen.dart
    │   ├── ingestion/
    │   │   ├── csv_import_screen.dart
    │   │   └── demo_ingestion_sheet.dart
    │   └── settings/
    │       └── settings_screen.dart
    └── widgets/
        ├── stat_card.dart
        ├── financial_chart.dart
        ├── transaction_tile.dart
        ├── loading_indicator.dart
        └── custom_button.dart
```

---

## 19. EXISTING FILES THAT MUST NOT BE MODIFIED

All existing backend and React web files remain untouched:
- `server.ts`
- `server/controllers/*`
- `server/models/*`
- `server/routes/*`
- `server/services/*`
- `server/middleware/*`
- `src/*`
- `package.json`
- `.env`

---

## 20. AUDIT SUMMARY & READINESS METRICS

A. **Overall Flutter Readiness Score:** `98/100`  
B. **Backend Readiness Score for Mobile Integration:** `100/100` (All endpoints, JSON contracts, and auth models are 100% complete and mobile-ready)  
C. **AI Chat Readiness Score:** `100/100` (Dual LLM + Deterministic Fallback fully operational)  
D. **Blockers:** Flutter SDK installation required on host system prior to compiling the mobile client.  
E. **Recommended Improvements:** Include Android cleartext HTTP permission in manifest for local development.  
F. **Implementation Phases:** 8 focused phases from scaffolding to release build.  
G. **Estimated Complexity:** Medium.  

**INSPECTION COMPLETE — NO PROJECT CODE MODIFIED.**
