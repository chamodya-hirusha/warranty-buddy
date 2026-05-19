"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, FileText, PieChart, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReportCard title="Daily Sales Report" description="Summary of sales for today." icon={<BarChart3 className="h-6 w-6" />} />
        <ReportCard title="Monthly Profit/Loss" description="Detailed profit and loss statement." icon={<TrendingUp className="h-6 w-6" />} />
        <ReportCard title="Best Selling Products" description="Top products by sales volume." icon={<PieChart className="h-6 w-6" />} />
        <ReportCard title="Expense Summary" description="Breakdown of expenses by category." icon={<FileText className="h-6 w-6" />} />
        <ReportCard title="Repair Income" description="Income generated from repairs." icon={<FileText className="h-6 w-6" />} />
      </div>
    </div>
  );
}

function ReportCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="card-elevated p-5 flex flex-col justify-between h-40">
      <div className="flex items-start justify-between">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <Button variant="ghost" size="sm">Generate</Button>
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
