// src/pages/Dashboard.tsx

import { KpiCard } from '@/components/ui/dashboard/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns-jalali';

// یک تابع برای دریافت داده‌ها از API جدید
const fetchDashboardStats = async () => {
  const response = await fetch('http://localhost:3001/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('خطا در دریافت اطلاعات داشبورد');
  }
  return response.json();
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // استفاده از useQuery برای دریافت و مدیریت داده‌ها، کش و وضعیت لودینگ
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  // نمایش وضعیت لودینگ تا زمان دریافت داده‌ها
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // نمایش خطا در صورت بروز مشکل
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold">خطا در بارگذاری داشبورد</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  // داده‌های واقعی برای کارت‌های KPI
  const kpiData = [
    { title: "کل کارکنان", value: data?.totalEmployees ?? 0, icon: Users },
    { title: "وظایف تکمیل شده", value: data?.totalCompletedTasks ?? 0, icon: CheckCircle },
    { title: "وظایف در انتظار", value: data?.totalPendingTasks ?? 0, icon: Clock },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* بخش خوش‌آمدگویی پویا */}
      <div className="p-6 md:p-8 text-white bg-indigo-600 rounded-2xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">خوش آمدید، {user?.fullName || 'کاربر'}!</h1>
        <p className="text-indigo-100 text-base md:text-lg">
          سیستم مدیریت هوشمند وش‌نیا در خدمت شماست.
        </p>
      </div>

      {/* کارت‌های KPI با داده‌های واقعی */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>

      {/* فعالیت‌های اخیر و اقدامات سریع */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              فعالیت‌های اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.recentActivities?.length > 0 ? (
              data.recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Activity className="w-5 h-5 mt-1 text-indigo-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">فعالیت اخیری ثبت نشده است.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>عملیات سریع</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            <Button onClick={() => navigate('/employees/add')}><Users className="w-4 h-4 ml-2" /> افزودن کارمند</Button>
            <Button onClick={() => navigate('/tasks')} variant="secondary"><CheckCircle className="w-4 h-4 ml-2" /> مدیریت وظایف</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// کامپوننت اسکلت برای نمایش در زمان لودینگ
const DashboardSkeleton = () => (
  <div className="p-4 md:p-6 space-y-6">
    <Skeleton className="h-32 w-full rounded-2xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="lg:col-span-2 h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  </div>
);