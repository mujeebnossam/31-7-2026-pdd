import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_typography.dart';
import '../core/utils/date_formatter.dart';
import '../models/bill_model.dart';
import '../providers/currency_provider.dart';

class BillTile extends StatelessWidget {
  final BillModel bill;
  final VoidCallback? onPay;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const BillTile({
    super.key,
    required this.bill,
    this.onPay,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final currency = context.watch<CurrencyProvider>();
    final formattedAmount = currency.format(bill.amount);

    Color statusColor;
    String statusLabel;

    if (bill.isPaid) {
      statusColor = AppColors.income;
      statusLabel = 'PAID';
    } else if (bill.isOverdue) {
      statusColor = AppColors.expense;
      statusLabel = 'OVERDUE';
    } else if (bill.isDueSoon) {
      statusColor = AppColors.warning;
      statusLabel = 'DUE SOON';
    } else {
      statusColor = AppColors.primary;
      statusLabel = 'UPCOMING';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Text(bill.icon.isNotEmpty ? bill.icon : '📄', style: const TextStyle(fontSize: 20)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          bill.name,
                          style: AppTypography.bodyMedium(fontWeight: FontWeight.w700),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          statusLabel,
                          style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Due: ${DateFormatter.formatDisplay(bill.dueDate)} • ${bill.frequency.toUpperCase()}',
                    style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formattedAmount,
                  style: AppTypography.monoNumber(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                if (!bill.isPaid)
                  InkWell(
                    onTap: onPay,
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('Pay', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                    ),
                  ),
              ],
            ),
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, size: 18),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onSelected: (val) {
                if (val == 'pay') onPay?.call();
                if (val == 'edit') onEdit?.call();
                if (val == 'delete') onDelete?.call();
              },
              itemBuilder: (ctx) => [
                if (!bill.isPaid) const PopupMenuItem(value: 'pay', child: Text('Mark as Paid')),
                const PopupMenuItem(value: 'edit', child: Text('Edit Bill')),
                const PopupMenuItem(value: 'delete', child: Text('Delete Bill', style: TextStyle(color: AppColors.expense))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
