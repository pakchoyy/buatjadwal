"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistance } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  BarChart3,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = useQuery(api.analytics.getPaymentStats);
  const exportTypes = useQuery(api.analytics.getExportTypeStats);
  const recentTransactions = useQuery(api.analytics.getRecentTransactions);
  const dailyRevenue = useQuery(api.analytics.getDailyRevenue);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-600 border-t-transparent" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      expired: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const getExportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "pdf-all": "PDF Jadwal Umum",
      "pdf-teacher": "PDF per Guru",
      "pdf-class": "PDF per Kelas",
      "excel-single": "Excel Single Day",
      "excel-multi": "Excel Multi-Sheet",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor payment statistics and transactions
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        {stats && (
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Transactions */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Transactions
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {stats.paid} paid • {stats.pending} pending
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Conversion Rate
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.conversionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Average Donation */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Donation
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.averageAmount)}
                  </p>
                </div>
                <div className="rounded-full bg-teal-100 p-3">
                  <BarChart3 className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Export Type Distribution */}
          {exportTypes && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-teal-600" />
                Export Type Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(exportTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {getExportTypeLabel(type)}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-teal-600"
                          style={{
                            width: `${(count / Math.max(...Object.values(exportTypes))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {recentTransactions && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Calendar className="h-5 w-5 text-teal-600" />
                Recent Transactions
              </h2>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {getExportTypeLabel(transaction.exportType)} •{" "}
                        {formatDistance(transaction.createdAt, Date.now(), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily Revenue Chart */}
        {dailyRevenue && Object.keys(dailyRevenue).length > 0 && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Daily Revenue (Last 30 Days)
            </h2>
            <div className="space-y-2">
              {Object.entries(dailyRevenue)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 10)
                .map(([date, revenue]) => (
                  <div key={date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{date}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
