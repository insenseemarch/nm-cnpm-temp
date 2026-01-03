import { useState, useRef } from 'react';
import { User, Award, Settings, ArrowLeft, Camera, Lock, LogOut, Save, Mail, Upload, AlertCircle } from 'lucide-react';
// Import hook Auth thật của bạn (sửa đường dẫn nếu cần)
import { useAuth } from '../../contexts/AuthContext'; 

export default function UserProfile() {
  
  const { user, updateProfileImage, logout } = useAuth(); 
  
  const [tab, setTab] = useState('overview');
  const fileInputRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);


  const safeUser = {
    name: user?.name || 'Người dùng',
    email: user?.email || 'Chưa cập nhật',
    avatar: user?.avatar || 'https://via.placeholder.com/150', 
    role: user?.role || 'Thành viên',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia',
    provider: user?.provider || 'email', 
    personalInfo: {
      birthDate: user?.personalInfo?.birthDate || 'Chưa cập nhật',
      gender: user?.personalInfo?.gender || 'Chưa cập nhật',
      phone: user?.phone || user?.personalInfo?.phone || 'Chưa cập nhật',
      address: user?.personalInfo?.address || 'Chưa cập nhật',
      job: user?.personalInfo?.job || 'Chưa cập nhật',
    }
  };

  
  const isGoogleAccount = safeUser.provider === 'google'; 

  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      
      const previewUrl = URL.createObjectURL(file);
      updateProfileImage(previewUrl); 
    }
  };

 
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) return alert("Mật khẩu không khớp!");
    
    setIsLoading(true);
    try {
      // await changePasswordApi(passwordForm);
      alert("Đổi mật khẩu thành công!");
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      alert("Lỗi đổi mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleLogout = () => {
    if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
      logout && logout();
    }
  };

  return (
    <div className="min-h-screen bg-[#07060D] text-white p-6 flex justify-center">
      <div className="w-full max-w-5xl rounded-3xl bg-white/2 border border-white/10 p-8 backdrop-blur-xl relative">
        
        {/* Background Effects */}
        <div className="absolute top-10 right-20 w-40 h-40 bg-purple-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-52 h-52 bg-blue-500/20 blur-[150px] rounded-full" />

        <button onClick={() => window.history.back()} className="fixed top-6 right-6 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition">
          <ArrowLeft size={20} />
        </button>

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <img src={safeUser.avatar} alt="avatar" className="w-28 h-28 rounded-full object-cover border-2 border-purple-400 group-hover:opacity-80 transition" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
              <Camera size={24} className="text-white" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
          </div>

          <div className="text-center md:text-left mt-2">
            <h1 className="text-3xl font-semibold">{safeUser.name}</h1>
            <p className="text-white/60 flex items-center justify-center md:justify-start gap-2 mt-1 text-sm">
              <Mail size={14} /> {safeUser.email}
            </p>
            <div className="flex gap-3 mt-3 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-medium">
                {safeUser.role}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
                Tham gia: {safeUser.joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex items-center gap-8 mt-10 border-b border-white/10 pb-4 text-sm overflow-x-auto">
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={User} label="Hồ sơ" />
          <TabButton active={tab === 'achievement'} onClick={() => setTab('achievement')} icon={Award} label="Thành tựu" />
          <TabButton active={tab === 'settings'} onClick={() => setTab('settings')} icon={Settings} label="Cài đặt tài khoản" />
        </div>

        {/* --- CONTENT --- */}
        {tab === 'overview' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="md:col-span-3 p-5 rounded-xl bg-white/2 border border-white/10">
               <h2 className="font-medium text-[#F9A9D4] mb-2">Giới thiệu</h2>
               <p className="text-white/80 leading-relaxed text-sm">Thành viên dòng họ.</p>
            </div>
            <div className="md:col-span-2 p-6 rounded-xl bg-white/2 border border-white/10">
              <h3 className="font-medium mb-4 text-[#F9A9D4]">Thông tin cá nhân</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Họ và tên" value={safeUser.name} />
                <InfoRow label="Ngày sinh" value={safeUser.personalInfo.birthDate} />
                <InfoRow label="Giới tính" value={safeUser.personalInfo.gender} />
                <InfoRow label="Số điện thoại" value={safeUser.personalInfo.phone} />
                <InfoRow label="Nghề nghiệp" value={safeUser.personalInfo.job} />
                <InfoRow label="Địa chỉ" value={safeUser.personalInfo.address} />
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            
            {/* Password change */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/2 backdrop-blur-md h-fit">
              <div className="flex items-center gap-2 mb-6 text-[#F9A9D4]">
                <Lock size={20} />
                <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
              </div>
              
              {isGoogleAccount ? (
                
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 opacity-70">
                   <AlertCircle size={40} className="text-yellow-500" />
                   <p className="text-sm text-white/80">Bạn đang đăng nhập bằng Google.<br/>Vui lòng quản lý mật khẩu tại cài đặt Google.</p>
                </div>
              ) : (
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <FormInput label="Mật khẩu hiện tại" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} />
                  <FormInput label="Mật khẩu mới" type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} />
                  <FormInput label="Nhập lại mật khẩu" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} />
                  <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={isLoading} className="flex items-center gap-2 bg-[#F9A9D4] hover:bg-[#f472b6] text-black font-medium px-4 py-2 rounded-lg text-sm transition">
                      {isLoading ? '...' : <><Save size={16} /> Lưu thay đổi</>}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="space-y-6">
               <div className="p-6 rounded-2xl border border-white/10 bg-white/2 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-4 text-[#F9A9D4]">
                    <Camera size={20} />
                    <h2 className="text-lg font-semibold">Ảnh đại diện</h2>
                  </div>
                  <button onClick={() => fileInputRef.current.click()} className="w-full py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white text-sm transition flex justify-center items-center gap-2">
                    <Upload size={16} /> Chọn ảnh mới từ máy
                  </button>
               </div>

               <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md">
                  <h2 className="text-lg font-semibold text-red-400 mb-2">Vùng nguy hiểm</h2>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition mt-2">
                    <LogOut size={16} /> Đăng xuất
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function TabButton({ active, onClick, icon: Icon, label }) { return <button onClick={onClick} className={`flex items-center gap-2 pb-1 transition-all ${active ? 'text-[#F9A9D4] font-medium' : 'text-white/60 hover:text-white/90'}`}><Icon size={20} /> {label}</button>; }
function InfoRow({ label, value }) { return <div className="flex justify-between border-b border-white/5 pb-2 last:border-0"><span className="text-white/50">{label}</span><span className="text-white font-medium text-right">{value}</span></div>; }
function FormInput({ label, type = "text", value, onChange }) { return <div className="space-y-1.5"><label className="text-white/70 text-xs font-medium uppercase tracking-wider">{label}</label><input type={type} value={value} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F9A9D4]/50 focus:bg-white/10 transition" /></div>; }