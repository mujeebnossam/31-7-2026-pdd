// SpendWise AI — API Configuration
// Supports dynamic base URL configuration for Android Emulator, Physical LAN Device, or Production.

class ApiConfig {
  // Default for Android Emulator communicating with host Express server
  static const String defaultEmulatorBaseUrl = 'http://10.0.2.2:3001/api';
  
  // Default for local localhost (Desktop / Web / iOS simulator)
  static const String defaultLocalhostBaseUrl = 'http://localhost:3001/api';

  // Current active API base URL (mutable at runtime in Settings)
  static String activeBaseUrl = defaultEmulatorBaseUrl;

  // Timeout settings
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Setters & Helpers
  static void setBaseUrl(String url) {
    String cleanUrl = url.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1);
    }
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl = '$cleanUrl/api';
    }
    activeBaseUrl = cleanUrl;
  }

  // Endpoints
  static String get authRegister => '$activeBaseUrl/auth/register';
  static String get authLogin => '$activeBaseUrl/auth/login';
  static String get authMe => '$activeBaseUrl/auth/me';
  static String get authAccount => '$activeBaseUrl/auth/account';

  static String get accounts => '$activeBaseUrl/accounts';
  static String accountById(String id) => '$activeBaseUrl/accounts/$id';

  static String get transactions => '$activeBaseUrl/transactions';
  static String transactionById(String id) => '$activeBaseUrl/transactions/$id';

  static String get budgets => '$activeBaseUrl/budgets';
  static String budgetById(String id) => '$activeBaseUrl/budgets/$id';

  static String get goals => '$activeBaseUrl/goals';
  static String goalById(String id) => '$activeBaseUrl/goals/$id';
  static String goalContribute(String id) => '$activeBaseUrl/goals/$id/contribute';

  static String get bills => '$activeBaseUrl/bills';
  static String billById(String id) => '$activeBaseUrl/bills/$id';
  static String billPay(String id) => '$activeBaseUrl/bills/$id/pay';

  static String get aiSummary => '$activeBaseUrl/ai/summary';
  static String get aiInsights => '$activeBaseUrl/ai/insights';
  static String get aiPredictions => '$activeBaseUrl/ai/predictions';
  static String get aiChat => '$activeBaseUrl/ai/chat';
  static String get aiConversations => '$activeBaseUrl/ai/conversations';
  static String get aiSuggestCategory => '$activeBaseUrl/ai/suggest-category';

  static String get ingestionProviders => '$activeBaseUrl/ingestion/providers';
  static String get ingestionCsvParse => '$activeBaseUrl/ingestion/csv/parse';
  static String get ingestionCsvConfirm => '$activeBaseUrl/ingestion/csv/confirm';
  static String get ingestionDemo => '$activeBaseUrl/ingestion/demo';
}
