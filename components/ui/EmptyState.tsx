import { Search, Users, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'users' | 'file';
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  const icons = {
    search: Search,
    users: Users,
    file: FileText,
  };

  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-indigo-50 dark:bg-indigo-900/20 p-6 mb-4">
        <Icon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
