import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/config/api_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/auth_provider.dart';
import '../../providers/currency_provider.dart';
import '../../providers/theme_provider.dart';
import '../auth/login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _baseUrlController;

  @override
  void initState() {
    super.initState();
    _baseUrlController = TextEditingController(text: ApiConfig.activeBaseUrl);
  }

  @override
  void dispose() {
    _baseUrlController.dispose();
    super.dispose();
  }

  void _handleSaveBaseUrl() {
    final url = _baseUrlController.text.trim();
    if (url.isNotEmpty) {
      ApiConfig.setBaseUrl(url);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('API Base URL updated: ${ApiConfig.activeBaseUrl}'), backgroundColor: AppColors.income),
      );
    }
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out of SpendWise AI?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<AuthProvider>().logout();
              if (mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: const Text('Sign Out', style: TextStyle(color: AppColors.expense)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final currencyProvider = context.watch<CurrencyProvider>();
    final user = auth.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings & Security'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // User Profile Card
          if (user != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AppColors.primary,
                      child: Text(
                        user.name.isNotEmpty ? user.name.substring(0, 1).toUpperCase() : 'U',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user.name, style: AppTypography.heading3()),
                          const SizedBox(height: 2),
                          Text(user.email, style: const TextStyle(color: AppColors.textDarkSecondary, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text('Financial Health: ${user.financialScore}/850', style: const TextStyle(color: AppColors.income, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Preferences Section
          Text('Preferences', style: AppTypography.heading3()),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                // Currency Switcher
                ListTile(
                  leading: const Icon(Icons.currency_exchange, color: AppColors.primary),
                  title: const Text('Display Currency', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  trailing: DropdownButton<CurrencyType>(
                    value: currencyProvider.currency,
                    underline: const SizedBox(),
                    items: const [
                      DropdownMenuItem(value: CurrencyType.usd, child: Text('USD (\$)')),
                      DropdownMenuItem(value: CurrencyType.inr, child: Text('INR (₹)')),
                      DropdownMenuItem(value: CurrencyType.eur, child: Text('EUR (€)')),
                    ],
                    onChanged: (v) {
                      if (v != null) currencyProvider.setCurrency(v);
                    },
                  ),
                ),
                const Divider(height: 1),

                // Theme Mode
                SwitchListTile(
                  secondary: Icon(themeProvider.isDarkMode ? Icons.dark_mode : Icons.light_mode, color: AppColors.secondary),
                  title: const Text('Dark Mode', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  value: themeProvider.isDarkMode,
                  onChanged: (_) => themeProvider.toggleTheme(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // API & Network Configuration
          Text('Network & Host Configuration', style: AppTypography.heading3()),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Backend API Base URL', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _baseUrlController,
                    decoration: InputDecoration(
                      hintText: 'http://10.0.2.2:3001/api',
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.check, color: AppColors.income),
                        onPressed: _handleSaveBaseUrl,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ActionChip(
                        label: const Text('Emulator (10.0.2.2)', style: TextStyle(fontSize: 11)),
                        onPressed: () {
                          _baseUrlController.text = ApiConfig.defaultEmulatorBaseUrl;
                          _handleSaveBaseUrl();
                        },
                      ),
                      const SizedBox(width: 8),
                      ActionChip(
                        label: const Text('Localhost (Web/iOS)', style: TextStyle(fontSize: 11)),
                        onPressed: () {
                          _baseUrlController.text = ApiConfig.defaultLocalhostBaseUrl;
                          _handleSaveBaseUrl();
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Account Actions
          Text('Account & Security', style: AppTypography.heading3()),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.logout, color: AppColors.warning),
                  title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Clears local encrypted credentials', style: TextStyle(fontSize: 11, color: AppColors.textDarkSecondary)),
                  onTap: _handleLogout,
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.delete_forever, color: AppColors.expense),
                  title: const Text('Delete Account', style: TextStyle(color: AppColors.expense, fontWeight: FontWeight.w600)),
                  subtitle: const Text('Permanently erases user account and ledgers', style: TextStyle(fontSize: 11, color: AppColors.textDarkSecondary)),
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Delete Account?'),
                        content: const Text('This will permanently delete your account and all associated financial records. This action cannot be undone.'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                          TextButton(
                            onPressed: () async {
                              Navigator.pop(ctx);
                              await context.read<AuthProvider>().deleteAccount();
                              if (mounted) {
                                Navigator.of(context).pushAndRemoveUntil(
                                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                                  (route) => false,
                                );
                              }
                            },
                            child: const Text('Delete Permanently', style: TextStyle(color: AppColors.expense)),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: Text(
              'SpendWise AI Mobile v1.0.0 (Build 1)\nConnected to PostgreSQL & Express Backend',
              style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
