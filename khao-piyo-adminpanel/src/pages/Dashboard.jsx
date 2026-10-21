export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back to your Khao-Piyo management center.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Quick Status</h3>
          <p className="text-2xl font-bold mt-2 text-orange-500">System Online</p>
          <p className="text-xs text-gray-400 mt-1">Connected with Spring Boot backend</p>
        </div>
      </div>
    </div>
  );
}