// app/(dashboard)/profile/ProfileClient.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Edit,
  Save,
  X,
  Crown,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Eye,
  EyeOff,
  Moon,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Switch } from '@components/ui/switch';
import { SubscriptionStatus } from '@components/subscription/SubscriptionStatus';
import { BillingHistory } from '@components/subscription/BillingHistory';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';
import { formatDate } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User } from '@/types/user';

interface ProfileProps {
  user: User;
  subscription: any;
}

type ProfileTab =
  | 'account'
  | 'preferences'
  | 'subscription'
  | 'privacy'
  | 'data';

export default function ProfileClient({ user, subscription }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.fullName,
    email: user.email,
    age: user.age?.toString() || '',
  });
  // Map preferences to emailPreferences (from User type)
  const [preferences, setPreferences] = useState({
    emailNotifications: user.emailPreferences?.notifications ?? true,
    mentorFeedback: user.emailPreferences?.mentorFeedback ?? true,
    achievementAlerts: user.emailPreferences?.achievements ?? true,
    weeklyReports: user.emailPreferences?.weeklyReports ?? true,
    // UI-only fields (darkMode, language) fallback
    darkMode: false,
    language: 'en',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);

        trackEvent(TRACKING_EVENTS.FORM_SUBMIT, {
          userId: user._id,
          fields: ['name', 'age'],
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Preferences updated successfully!');

        trackEvent(TRACKING_EVENTS.FORM_SUBMIT, {
          userId: user._id,
          preferences,
        });
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Preferences update error:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/user/export-data');

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mintoons-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Data exported successfully!');

        trackEvent(TRACKING_EVENTS.DOWNLOAD, {
          userId: user._id,
          format: 'json',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your stories and data.'
      )
    ) {
      return;
    }

    if (
      !confirm(
        'This is your final warning. All your stories, progress, and achievements will be permanently lost. Type "DELETE" to confirm.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Account deleted successfully. You will be logged out.');

        trackEvent(TRACKING_EVENTS.FORM_SUBMIT, {
          userId: user._id,
        });

        // Redirect to logout
        window.location.href = '/api/auth/signout';
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { key: 'account', label: 'Account', icon: UserIcon },
    { key: 'preferences', label: 'Preferences', icon: Settings },
    { key: 'subscription', label: 'Subscription', icon: CreditCard },
    { key: 'privacy', label: 'Privacy', icon: Shield },
    { key: 'data', label: 'Data & Export', icon: Download },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Profile Settings
          </h1>
          <p className="text-xl text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <FadeIn delay={0.1}>
            <Card className="p-6">
              {/* User Info */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <span className="text-2xl font-bold text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{user.fullName}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Badge variant="default" size="sm">
                    {user.subscriptionTier}
                  </Badge>
                  {user.role === 'child' && (
                    <Badge variant="info" size="sm">
                      Age {user.age}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as ProfileTab)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </FadeIn>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Account Information
                  </h2>
                  <Button
                    variant={isEditing ? 'outline' : 'primary'}
                    onClick={() => {
                      if (isEditing) {
                        setFormData({
                          name: user.fullName,
                          email: user.email,
                          age: user.age?.toString() || '',
                        });
                      }
                      setIsEditing(!isEditing);
                    }}
                  >
                    {isEditing ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={e =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter your name"
                      />
                    ) : (
                      <div className="rounded-lg bg-gray-50 p-3">
                        {user.fullName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <span>{user.email}</span>
                      {user.emailVerified ? (
                        <Badge variant="success" size="sm">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Unverified
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="2"
                        max="18"
                        value={formData.age}
                        onChange={e =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        placeholder="Enter your age"
                      />
                    ) : (
                      <div className="rounded-lg bg-gray-50 p-3">
                        {user.age} years old
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Account Type
                    </label>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-purple-600" />
                        <span>{user.subscriptionTier} Member</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Member Since
                    </label>
                    <div className="rounded-lg bg-gray-50 p-3">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Last Active
                    </label>
                    <div className="rounded-lg bg-gray-50 p-3">
                      {formatDate(user.lastActiveDate || user.updatedAt)}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </Card>

              {/* Account Stats */}
              <Card className="p-6">
                <h3 className="mb-6 text-xl font-bold text-gray-900">
                  Account Statistics
                </h3>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold text-blue-600">
                      {user.storyCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Stories Written</div>
                  </div>

                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold text-purple-600">
                      {user.level || 1}
                    </div>
                    <div className="text-sm text-gray-600">Writing Level</div>
                  </div>

                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold text-green-600">
                      {user.totalPoints || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Achievement Points
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Notification Preferences
                  </h2>
                  <Button
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Email Notifications
                        </div>
                        <div className="text-sm text-gray-600">
                          Receive updates about your stories and achievements
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences({
                          ...preferences,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Mentor Feedback Alerts
                        </div>
                        <div className="text-sm text-gray-600">
                          Get notified when mentors comment on your stories
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.mentorFeedback}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences({
                          ...preferences,
                          mentorFeedback: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Achievement Notifications
                        </div>
                        <div className="text-sm text-gray-600">
                          Celebrate when you unlock new achievements
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.achievementAlerts}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences({
                          ...preferences,
                          achievementAlerts: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Weekly Progress Reports
                        </div>
                        <div className="text-sm text-gray-600">
                          Get weekly summaries of your writing progress
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.weeklyReports}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences({
                          ...preferences,
                          weeklyReports: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-6 text-xl font-bold text-gray-900">
                  Display Preferences
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Moon className="h-5 w-5 text-indigo-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Dark Mode
                        </div>
                        <div className="text-sm text-gray-600">
                          Use dark theme for better night reading
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.darkMode}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences({ ...preferences, darkMode: checked })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={e =>
                        setPreferences({
                          ...preferences,
                          language: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {subscription && (
                <SubscriptionStatus
                  currentTier={subscription.tier}
                  status={subscription.status}
                  currentPeriodEnd={subscription.currentPeriodEnd}
                  storiesUsed={subscription.storiesUsed}
                  nextBillingDate={subscription.nextPaymentDate}
                  paymentMethod={subscription.paymentMethod}
                />
              )}
              {subscription && <BillingHistory userId={user._id} />}
            </motion.div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Privacy Settings
                </h2>

                <div className="space-y-6">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-5 w-5 text-green-600" />
                      <div>
                        <div className="mb-1 font-medium text-green-900">
                          Your Privacy is Protected
                        </div>
                        <div className="text-sm text-green-700">
                          MINTOONS is fully COPPA compliant and follows strict
                          privacy guidelines to protect children's data.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Data Collection
                    </h3>

                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        <div>
                          <strong>Stories and Content:</strong> We store your
                          stories to provide the service and show your progress.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        <div>
                          <strong>Usage Analytics:</strong> We collect anonymous
                          usage data to improve the platform.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        <div>
                          <strong>Account Information:</strong> Basic profile
                          information needed for your account.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Data Sharing
                    </h3>

                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                        <div>
                          We <strong>never</strong> sell your personal
                          information to third parties.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                        <div>
                          We <strong>never</strong> share your stories without
                          your explicit permission.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                        <div>
                          Assigned mentors can view your stories to provide
                          feedback (if you have a mentor).
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        variant="outline"
                        onClick={() => window.open('/privacy', '_blank')}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Privacy Policy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open('/terms', '_blank')}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        View Terms of Service
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {user.age && user.age < 13 && (
                <Card className="border-orange-200 bg-orange-50 p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-orange-600" />
                    <div>
                      <div className="mb-2 font-medium text-orange-900">
                        COPPA Protection Active
                      </div>
                      <div className="text-sm text-orange-800">
                        Since you're under 13, special privacy protections are
                        in place for your account. Your parents/guardians have
                        provided consent for your use of this platform.
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* Data & Export Tab */}
          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Data Management
                </h2>

                <div className="space-y-6">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Download className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="mb-2 font-medium text-blue-900">
                          Export Your Data
                        </div>
                        <div className="mb-4 text-sm text-blue-800">
                          Download a copy of all your stories, progress, and
                          account data in JSON format.
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleExportData}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export All Data
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <UserIcon className="mt-0.5 h-5 w-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="mb-2 font-medium text-gray-900">
                          Data Portability
                        </div>
                        <div className="mb-4 text-sm text-gray-600">
                          You have the right to receive your personal data in a
                          portable format and transfer it to another service.
                        </div>
                        <div className="text-xs text-gray-500">
                          Exported data includes: stories, account info,
                          preferences, achievements, and progress data.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <Trash2 className="mt-0.5 h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <div className="mb-2 font-medium text-red-900">
                          Delete Account
                        </div>
                        <div className="mb-4 text-sm text-red-800">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </div>
                        <div className="mb-4 text-xs text-red-700">
                          ⚠️ Warning: This will delete all your stories,
                          progress, achievements, and account information.
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleDeleteAccount}
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-6 text-xl font-bold text-gray-900">
                  Data Retention Policy
                </h3>

                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                    <div>
                      <strong>Active Accounts:</strong> Your data is retained as
                      long as your account is active.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500" />
                    <div>
                      <strong>Inactive Accounts:</strong> After 2 years of
                      inactivity, we may delete inactive accounts.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    <div>
                      <strong>Backup Data:</strong> We keep secure backups for
                      30 days after account deletion.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500" />
                    <div>
                      <strong>Legal Requirements:</strong> Some data may be
                      retained longer if required by law.
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-500">
                    For questions about data retention or deletion, please
                    contact our support team.
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
