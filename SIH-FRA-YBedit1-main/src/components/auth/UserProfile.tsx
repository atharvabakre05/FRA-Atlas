import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Edit3, 
  Shield, 
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';

interface UserProfileProps {
  onLogout?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { user, authUser, logout } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await AuthService.updateProfile({
        name: profileData.name,
        phone: profileData.phone
      });

      setSuccess('Profile updated successfully!');
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      onLogout?.();
    } catch (err: any) {
      showToast('Logout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-forest-gradient rounded-lg"><User className="h-4 w-4 text-white" /></div>
            <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Profile Picture */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-forest-gradient rounded-full flex items-center justify-center">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 p-2 bg-forest-sage text-white rounded-full border border-white hover:bg-forest-medium transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user?.name || 'User'}
            </h3>
            <p className="text-gray-600">
              {user?.is_admin ? 'Administrator' : 'Citizen'}
            </p>
            {user?.provider && (
              <p className="text-sm text-gray-600">
                Signed in with {user.provider === 'google' ? 'Google' : 'Email'}
              </p>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="forest-form-label">Full Name</label>
            {isEditing ? (
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                <input
                  name="name"
                  type="text"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="forest-input pl-12"
                  placeholder="Enter your full name"
                />
              </div>
            ) : (
              <p className="text-gray-900 py-2">{user?.name || 'Not provided'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="forest-form-label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
              <input
                name="email"
                type="email"
                value={profileData.email}
                disabled
                className="forest-input pl-12 bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <p className="forest-form-help">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="forest-form-label">Phone Number</label>
            {isEditing ? (
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                <input
                  name="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="forest-input pl-12"
                  placeholder="Enter your phone number"
                />
              </div>
            ) : (
              <p className="text-gray-900 py-2">{user?.phone || 'Not provided'}</p>
            )}
          </div>

          {/* Role Information */}
          <div>
            <label className="forest-form-label">Role & Access</label>
            <div className="flex items-center space-x-2 py-2">
              <Shield className={`h-5 w-5 ${user?.is_admin ? 'text-forest-accent' : 'text-forest-medium'}`} />
              <span className="text-gray-900">
                {user?.is_admin ? 'Administrator Access' : 'Citizen Access'}
              </span>
            </div>
            <p className="forest-form-help">
              {user?.is_admin 
                ? 'You have administrative privileges to manage the FRA Atlas system.'
                : 'You can submit and track FRA claims as a citizen.'
              }
            </p>
          </div>

          {/* Account Information */}
          <div>
            <label className="forest-form-label">Account Information</label>
            <div className="space-y-2 py-2">
              <p className="text-sm text-forest-medium">
                <strong>Member since:</strong> {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
              <p className="text-sm text-forest-medium">
                <strong>User ID:</strong> {user?.id}
              </p>
              {user?.department && (
                <p className="text-sm text-forest-medium">
                  <strong>Department:</strong> {user.department}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="forest-alert-error mt-4">
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-3" />
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="forest-alert-success mt-4">
            <p className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-3" />
              {success}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing ? (
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="forest-button-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="forest-button-secondary disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-red-200 text-red-600 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
