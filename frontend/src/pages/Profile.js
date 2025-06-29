import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getUserStats } from '../services/userService';
import './Profile.css';
import { toast } from 'react-toastify';

const defaultAvatar = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    async function fetchStats() {
      const s = await getUserStats();
      setStats(s);
    }
    fetchStats();
  }, []);

  if (!user) {
    return <div className="profile-container"><h2>Bạn chưa đăng nhập.</h2></div>;
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target.result);
      };
      reader.readAsDataURL(file);
      try {
        const updated = await updateProfile({ avatar: file });
        setUser(updated.user);
        setAvatar(updated.user.avatarUrl);
        toast.success('Cập nhật ảnh thành công!');
      } catch (err) {
        toast.error('Cập nhật ảnh thất bại!');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdate = async (field) => {
    setLoading(true);
    try {
      const updated = await updateProfile(
        field === 'phone' ? { phone } : { address }
      );
      setUser(updated.user);
      if (field === 'phone') setShowPhoneForm(false);
      if (field === 'address') setShowAddressForm(false);
      toast.success('Cập nhật thành công!');
    } catch (err) {
      toast.error('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          {avatar ? (
            <img src={avatar} alt="avatar" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-default">{defaultAvatar(user.name || user.username)}</div>
          )}
          <button
            className="profile-avatar-edit-btn"
            onClick={() => fileInputRef.current.click()}
            title="Đổi ảnh đại diện"
          >
            <span className="profile-avatar-edit-icon">✎</span>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>
        <div className="profile-username">{user.name || user.username}</div>
      </div>
      <div className="profile-section">
        <div className="profile-section-title">Thông tin cá nhân</div>
        <div className="profile-info-row">
          <div className="profile-info-box">
            <div className="profile-info-label">EMAIL</div>
            <div className="profile-info-value">{user.email}</div>
          </div>
          <div className="profile-info-box">
            <div className="profile-info-label">SỐ ĐIỆN THOẠI</div>
            {user.phone ? (
              <div className="profile-info-value">{user.phone}</div>
            ) : showPhoneForm ? (
              <div className="profile-info-edit-form">
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="profile-info-input"
                />
                <button onClick={() => handleUpdate('phone')} disabled={loading} className="profile-info-save-btn">Lưu</button>
              </div>
            ) : (
              <div className="profile-info-value profile-info-update" onClick={() => setShowPhoneForm(true)}>
                Chưa cập nhật
              </div>
            )}
          </div>
        </div>
        <div className="profile-info-row">
          <div className="profile-info-box">
            <div className="profile-info-label">ĐỊA CHỈ</div>
            {user.address ? (
              <div className="profile-info-value">{user.address}</div>
            ) : showAddressForm ? (
              <div className="profile-info-edit-form">
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="profile-info-input"
                />
                <button onClick={() => handleUpdate('address')} disabled={loading} className="profile-info-save-btn">Lưu</button>
              </div>
            ) : (
              <div className="profile-info-value profile-info-update" onClick={() => setShowAddressForm(true)}>
                Chưa cập nhật
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="profile-section">
        <div className="profile-section-title">Thống kê hoạt động</div>
        <div className="profile-stats-row">
          <div className="profile-stats-box">
            <div className="profile-stats-value">{stats ? stats.totalSpent.toLocaleString() : '...'}</div>
            <div className="profile-stats-label">TỔNG TIỀN ĐÃ CHI (VND)</div>
          </div>
          <div className="profile-stats-box">
            <div className="profile-stats-value">{stats ? stats.totalBookings : '...'}</div>
            <div className="profile-stats-label">SỐ LƯỢNG ĐẶT PHÒNG</div>
          </div>
          <div className="profile-stats-box">
            <div className="profile-stats-value">{stats ? stats.avgSpent.toLocaleString() : '...'}</div>
            <div className="profile-stats-label">CHI TIÊU TRUNG BÌNH (VND)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 