import { Users, Star, TrendingUp } from 'lucide-react';

export function SocialProof() {
  const stats = [
    {
      icon: Users,
      value: "5000+",
      label: "Healthcare Professionals"
    },
    {
      icon: Star,
      value: "4.8/5",
      label: "Average Rating"
    },
    {
      icon: TrendingUp,
      value: "20",
      label: "Clinical Calculators"
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 my-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Trusted by Healthcare Professionals</h3>
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
