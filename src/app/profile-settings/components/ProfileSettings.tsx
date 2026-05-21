'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User, Phone, Mail, Bell, MessageSquare, Check, Loader2, LogOut, Camera, Trash2, ImageOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-hot-toast';
import AvatarCropModal from '@/components/AvatarCropModal';
import ConfirmModal from '@/components/ConfirmModal';

interface NotifPrefs {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/30 ${checked ? 'bg-secondary' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function getInitials(name: string, email: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'LD';
}

export default function ProfileSettings() {
  const [profileData, setProfileData] = useState({ fullName: '', phone: '', email: '', avatarUrl: '' });
  const [notifs, setNotifs] = useState<NotifPrefs>({ email: true, sms: true, whatsapp: false });
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  // Confirm modals state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Cleanup raw image blob URL on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    };
  }, [rawImageSrc]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }
        setUserId(user.id);
        const email = user.email || '';

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url')
          .eq('id', user.id)
          .single();

        setProfileData({
          fullName: profile?.full_name || '',
          phone: profile?.phone || '',
          email: email,
          avatarUrl: profile?.avatar_url || '',
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  // --- Step 1: File select → open crop modal (no upload) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB.');
      return;
    }

    // Revoke previous raw image if any
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);

    // Create blob URL for the raw image and open the crop modal
    const blobUrl = URL.createObjectURL(file);
    setRawImageSrc(blobUrl);
    setCropModalOpen(true);

    // Reset input so re-selecting same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Step 2: Crop confirmed → upload the cropped blob ---
  const handleCropConfirm = async (croppedBlob: Blob) => {
    if (!userId) return;

    setIsUploading(true);
    try {
      const filePath = `${userId}/${Date.now()}.png`;

      // 1. Upload cropped image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Update profiles table
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (dbError) throw dbError;

      // 4. Commit to UI
      setProfileData(prev => ({ ...prev, avatarUrl: publicUrl }));
      closeCropModal();
      toast.success('Profile photo updated!');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- Cancel crop ---
  const closeCropModal = () => {
    setCropModalOpen(false);
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc(null);
  };

  // --- Delete existing avatar ---
  const requestAvatarDelete = () => {
    if (!userId || !profileData.avatarUrl) return;
    setShowDeleteConfirm(true);
  };

  const executeAvatarDelete = async () => {
    if (!userId) return;

    setIsUploading(true);
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (dbError) throw dbError;

      setProfileData(prev => ({ ...prev, avatarUrl: '' }));
      setShowDeleteConfirm(false);
      toast.success('Profile photo removed.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to save changes.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: profileData.fullName,
        phone: profileData.phone,
      });

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestLogout = () => setShowLogoutConfirm(true);

  const executeLogout = async () => {
    setShowLogoutConfirm(false);
    
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      await supabase.auth.signOut();
      
      toast.success("Successfully logged out.");
      
      router.push('/auth');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out properly.");
      setIsLoggingOut(false);
    }
  };

  const toggleNotif = (key: keyof NotifPrefs) => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const initials = getInitials(profileData.fullName, profileData.email);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-extrabold text-primary mb-1">Profile & Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your personal info and notification preferences.</p>
        </div>
        <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl animate-pulse h-24"></div>
        <div className="bg-card border border-border rounded-2xl p-6 h-80 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold text-primary mb-1">Profile & Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your personal info and notification preferences.</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
        id="avatar-upload"
      />

      {/* Crop Modal */}
      {cropModalOpen && rawImageSrc && (
        <AvatarCropModal
          imageSrc={rawImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={closeCropModal}
          isUploading={isUploading}
        />
      )}

      {/* Avatar Card */}
      <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl">
        {/* Avatar circle with hover overlay */}
        <div className="relative group flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-primary flex items-center justify-center">
            {profileData.avatarUrl ? (
              <Image
                src={profileData.avatarUrl}
                alt="Profile"
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-white text-xl font-extrabold">{initials}</span>
            )}
          </div>

          {/* Hover overlay */}
          {!isUploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              aria-label="Change profile photo"
            >
              <Camera size={18} className="text-white drop-shadow-md" />
            </button>
          )}

          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Loader2 size={20} className="text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-base font-extrabold text-foreground">{profileData.fullName || profileData.email.split('@')[0] || 'User'}</div>
          <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
            <span className="flex items-center gap-1.5 truncate">
              <Mail size={12} /> {profileData.email || 'No email provided'}
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1.5">
              <Phone size={12} />
              {profileData.phone ? (
                `+91 ${profileData.phone}`
              ) : (
                <button
                  onClick={() => document.getElementById('phone')?.focus()}
                  className="text-secondary font-semibold hover:underline"
                >
                  Add Phone Number
                </button>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-bold text-secondary hover:underline disabled:opacity-50"
            >
              Change Photo
            </button>
            {profileData.avatarUrl && (
              <>
                <span className="text-border text-xs">•</span>
                <button
                  type="button"
                  onClick={requestAvatarDelete}
                  disabled={isUploading}
                  className="text-xs font-bold text-red-500 hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  <Trash2 size={10} /> Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info Form */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-secondary" />
          <h2 className="text-base font-extrabold text-foreground">Basic Information</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={profileData.fullName}
              onChange={e => setProfileData(f => ({ ...f, fullName: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-background"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block" htmlFor="phone">Phone Number</label>
            <div className="flex">
              <span className="flex items-center px-3 py-2.5 bg-muted border border-r-0 border-border rounded-l-xl text-sm font-semibold text-muted-foreground">
                <Phone size={14} className="mr-1.5" /> +91
              </span>
              <input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={e => setProfileData(f => ({ ...f, phone: e.target.value }))}
                className="flex-1 px-4 py-2.5 rounded-r-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-background"
                placeholder="98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={profileData.email}
                readOnly
                disabled
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-muted text-muted-foreground cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-right">Email cannot be changed.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'bg-secondary text-secondary-foreground hover:opacity-90'}`}
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
            {saved ? <><Check size={15} /> Saved Successfully!</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={16} className="text-secondary" />
          <h2 className="text-base font-extrabold text-foreground">Notification Preferences</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Choose how you'd like to receive order updates and promotions.</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Mail size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Order updates, receipts & offers</div>
              </div>
            </div>
            <Toggle checked={notifs.email} onChange={() => toggleNotif('email')} label="Toggle email notifications" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <Phone size={16} className="text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">SMS Notifications</div>
                <div className="text-xs text-muted-foreground">Pickup reminders & delivery alerts</div>
              </div>
            </div>
            <Toggle checked={notifs.sms} onChange={() => toggleNotif('sms')} label="Toggle SMS notifications" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <MessageSquare size={16} className="text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">WhatsApp Notifications</div>
                <div className="text-xs text-muted-foreground">Real-time updates on WhatsApp</div>
              </div>
            </div>
            <Toggle checked={notifs.whatsapp} onChange={() => toggleNotif('whatsapp')} label="Toggle WhatsApp notifications" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <LogOut size={16} className="text-red-600" />
          <h2 className="text-base font-extrabold text-red-900">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-700/80 mb-5">Sign out of your Linedry account on this device.</p>
        
        <button
          onClick={requestLogout}
          disabled={isLoggingOut}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>

      {/* Remove Photo Confirmation Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Remove Profile Photo?"
        message="Your profile picture will be removed and replaced with your initials. You can always upload a new one later."
        confirmLabel="Remove Photo"
        cancelLabel="Keep Photo"
        variant="danger"
        icon={<ImageOff size={26} className="text-red-500" />}
        isLoading={isUploading}
        onConfirm={executeAvatarDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutConfirm}
        title="Log Out of Linedry?"
        message="You'll need to sign in again to access your dashboard, orders, and subscriptions."
        confirmLabel="Log Out"
        cancelLabel="Stay Signed In"
        variant="warning"
        icon={<LogOut size={26} className="text-amber-500" />}
        isLoading={isLoggingOut}
        onConfirm={executeLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
