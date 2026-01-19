import { Smartphone, Zap, Lock, Users } from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: Smartphone,
      title: "App-Like Experience",
      description: "Fast, responsive interface that feels like a native app"
    },
    {
      icon: Zap,
      title: "Offline Access",
      description: "Access all 20 calculators even without internet connection"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your data stays on your device - no cloud uploads or tracking"
    },
    {
      icon: Users,
      title: "Trusted by Professionals",
      description: "Used by healthcare professionals across multiple specialties"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 md:p-8 border border-blue-100 my-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Why Install the App?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{benefit.title}</h4>
                <p className="text-gray-600 text-xs mt-1">{benefit.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
