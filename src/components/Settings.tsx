import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Database,
  Palette,
  Shield,
  Bell,
  Download,
  Upload,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  Crown,
  LogOut,
  Mail,
  Calendar,
  Globe,
  Lock,
  Check,
  AlertTriangle,
} from "lucide-react";
import type { User as UserType } from "../types";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
  onSignOut: () => void;
  onUpgradeAccount: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onClearData: () => void;
  isOfflineMode: boolean;
}

type SettingsTab = "profile" | "account" | "data" | "preferences" | "privacy";

export function Settings({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSignOut,
  onUpgradeAccount,
  onExportData,
  onImportData,
  onClearData,
  isOfflineMode,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email || "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdateUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email || "",
    });
    setIsEditing(false);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  const handleClearData = () => {
    if (showDeleteConfirm) {
      onClearData();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "account" as const, label: "Account", icon: Shield },
    { id: "data" as const, label: "Data", icon: Database },
    { id: "preferences" as const, label: "Preferences", icon: SettingsIcon },
    { id: "privacy" as const, label: "Privacy", icon: Lock },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <p className="text-sm text-gray-500">
                Manage your account and preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Profile Information
                    </h3>
                    
                    {/* User Avatar */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Profile Picture</p>
                        <p className="text-xs text-gray-400">
                          Color-coded avatar based on your name
                        </p>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                            {user.name}
                          </p>
                        )}
                      </div>

                      {!user.isGuest && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({ ...editForm, email: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                              {user.email}
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type
                        </label>
                        <div className="flex items-center space-x-2">
                          {user.isGuest ? (
                            <>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Guest User
                              </span>
                              <button
                                onClick={onUpgradeAccount}
                                className="text-blue-600 hover:text-blue-700 text-sm underline"
                              >
                                Upgrade to save your work
                              </button>
                            </>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
                              <Crown size={12} />
                              <span>Registered User</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3 pt-4">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Save size={16} />
                              <span>Save Changes</span>
                            </button>
                            <button
                              onClick={handleCancel}
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <X size={16} />
                              <span>Cancel</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <User size={16} />
                            <span>Edit Profile</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Account Settings
                    </h3>

                    {user.isGuest ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Crown className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">
                              Upgrade Your Account
                            </h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Create a registered account to save your diagrams across devices
                              and enable collaboration features.
                            </p>
                            <button
                              onClick={onUpgradeAccount}
                              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Create Account
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                Email
                              </span>
                            </div>
                            <p className="text-sm text-gray-900">{user.email}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                Last Seen
                              </span>
                            </div>
                            <p className="text-sm text-gray-900">
                              {new Date(user.lastSeen).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <button
                            onClick={onSignOut}
                            className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Data Management
                    </h3>

                    {/* Connection Status */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Connection Status
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isOfflineMode ? "bg-yellow-500" : "bg-green-500"
                          }`}
                        />
                        <span className="text-sm text-gray-900">
                          {isOfflineMode ? "Offline Mode" : "Connected"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {isOfflineMode
                          ? "Data is stored locally in your browser"
                          : "Data is synced with cloud storage"}
                      </p>
                    </div>

                    {/* Data Actions */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Export Data
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Download all your diagrams as a JSON file for backup or migration.
                        </p>
                        <button
                          onClick={onExportData}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download size={16} />
                          <span>Export All Data</span>
                        </button>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Import Data
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Upload a previously exported JSON file to restore your diagrams.
                        </p>
                        <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <Upload size={16} />
                          <span>Import Data</span>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileImport}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Clear All Data
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Permanently delete all your diagrams and reset the application.
                        </p>
                        <button
                          onClick={handleClearData}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            showDeleteConfirm
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "border border-red-300 text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {showDeleteConfirm ? (
                            <>
                              <AlertTriangle size={16} />
                              <span>Confirm Delete All</span>
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              <span>Clear All Data</span>
                            </>
                          )}
                        </button>
                        {showDeleteConfirm && (
                          <p className="text-xs text-red-600 mt-1">
                            Click again to confirm. This action cannot be undone.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Application Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Theme & Appearance
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Customize the look and feel of the application.
                        </p>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="theme"
                              value="light"
                              defaultChecked
                              className="text-blue-600"
                            />
                            <span className="text-sm">Light Theme</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="theme"
                              value="dark"
                              disabled
                              className="text-blue-600"
                            />
                            <span className="text-sm text-gray-400">
                              Dark Theme (Coming Soon)
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Auto-Save
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Automatically save changes as you work.
                        </p>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="text-blue-600 rounded"
                          />
                          <span className="text-sm">Enable auto-save</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Privacy & Security
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Data Storage
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your diagrams are stored {isOfflineMode ? "locally in your browser" : "securely in the cloud"}.
                          {isOfflineMode && " No data is sent to external servers."}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Sharing & Collaboration
                        </h4>
                        <p className="text-sm text-gray-600">
                          When you share diagrams or collaborate with others, only the diagram content
                          and your display name are shared. Your email and personal information remain private.
                        </p>
                      </div>

                      {!user.isGuest && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Account Security
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Keep your account secure with a strong password.
                          </p>
                          <button className="text-blue-600 hover:text-blue-700 text-sm underline">
                            Change Password
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
