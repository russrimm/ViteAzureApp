import {
    KeyIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/Card';

const Dashboard: React.FC = () => {
  const quickActions = [
    {
      title: 'Generate TAP',
      description: 'Issue a temporary access password for users',
      icon: KeyIcon,
      href: '/tap',
      color: 'bg-orange-500',
    },
    {
      title: 'Update Profile',
      description: 'Manage user profile information',
      icon: UserCircleIcon,
      href: '/profile',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to IT Support Portal</h1>
        <p className="mt-2 text-gray-600">
          Your one-stop solution for IT support needs. Select an option below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="group hover:shadow-lg transition-shadow"
            >
              <Card>
                <CardContent>
                  <div className="flex items-start">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your recent activity will appear here once you start using the portal.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
