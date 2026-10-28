import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../models/account_model.dart';
import '../../providers/account_provider.dart';
import '../../providers/currency_provider.dart';
import '../../widgets/empty_state_view.dart';
import 'account_form_sheet.dart';

class AccountsScreen extends StatelessWidget {
  const AccountsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final accountProvider = context.watch<AccountProvider>();
    final currency = context.watch<CurrencyProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Connected Accounts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const AccountFormSheet(),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => accountProvider.fetchAccounts(),
        child: accountProvider.isLoading && accountProvider.accounts.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : accountProvider.accounts.isEmpty
                ? EmptyStateView(
                    title: 'No Accounts Found',
                    description: 'Add checking, savings, or credit accounts to track balances.',
                    icon: Icons.account_balance_outlined,
                    actionButtonText: 'Add Account',
                    onAction: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) => const AccountFormSheet(),
                      );
                    },
                  )
                : ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.primary.withOpacity(0.25)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Combined Vault Balance',
                              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                            Text(
                              currency.format(accountProvider.totalBalance),
                              style: AppTypography.heading2(color: AppColors.income),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...accountProvider.accounts.map((acc) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            leading: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.account_balance, color: AppColors.primary),
                            ),
                            title: Text(acc.name, style: AppTypography.bodyMedium(fontWeight: FontWeight.w700)),
                            subtitle: Text('${acc.bank} • ${acc.type} •••• ${acc.last4}', style: AppTypography.bodySmall(color: AppColors.textDarkSecondary)),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  currency.format(acc.balance),
                                  style: AppTypography.monoNumber(fontSize: 15, fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                            onTap: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                builder: (_) => AccountFormSheet(accountToEdit: acc),
                              );
                            },
                          ),
                        );
                      }),
                    ],
                  ),
      ),
    );
  }
}
