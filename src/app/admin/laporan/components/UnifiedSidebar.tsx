'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface SidebarProps {
  userType: 'admin' | 'penyuluh' | 'peternak';
  onCollapseChange?: (isCollapsed: boolean) => void;
}

interface UserProfile {
  _id: string;
  nama: string;
  username: string;
  email: string;
  kelompok: string;
  role: string;
  status: string;
  profileImage?: string;
  isHardcode?: boolean;
}

interface NavItem {
  href: string;
  icon: string | React.ElementType;
  label: string;
}

export default function UnifiedSidebar({ userType, onCollapseChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImageError, setProfileImageError] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  // Deteksi ukuran layar
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Fungsi untuk mendapatkan URL gambar profil yang valid - DIPERBAIKI
  const getProfileImageUrl = () => {
    // 1. Jika admin hardcode, SELALU gunakan Vector.svg
    if (userProfile?.isHardcode) {
      return '/Vector.svg';
    }

    // 2. Jika ada error, gunakan Vector.svg
    if (profileImageError) {
      return '/Vector.svg';
    }

    // 3. Jika userProfile ada dan punya profileImage yang valid
    if (userProfile?.profileImage && userProfile.profileImage.trim() !== '') {
      const profileImage = userProfile.profileImage;

      // Jika sudah URL lengkap (http, https, atau path absolute)
      if (profileImage.startsWith('http') || profileImage.startsWith('/')) {
        return profileImage;
      }

      // Jika object ID MongoDB (24 karakter hex), gunakan API
      if (profileImage.length === 24 && /^[0-9a-fA-F]{24}$/.test(profileImage)) {
        return `/api/auth/profile/image/${profileImage}`;
      }
    }

    // 4. Default fallback ke Vector.svg
    return '/Vector.svg';
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching user profile...');

        // Cek jika ini admin hardcode dari sessionStorage
        const isHardcodeAdmin = sessionStorage.getItem('isHardcodeAdmin');
        if (isHardcodeAdmin === 'true') {
          console.log('🔐 Using hardcode admin profile');
          setUserProfile({
            _id: 'admin-hardcode-id',
            nama: 'Administrator System',
            username: 'admin',
            email: 'admin@sistem-peternakan.com',
            kelompok: 'Administrator',
            role: 'admin',
            status: 'Aktif',
            isHardcode: true
          });
          setLoading(false);
          return;
        }

        // Untuk user biasa, ambil data dari API /api/auth/me
        console.log('🌐 Fetching from API...');
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ API response received:', data);

          if (data.user) {
            console.log('👤 User data from API:', data.user);
            console.log('📸 Profile image from API:', data.user.profileImage);

            setUserProfile(data.user);
            localStorage.setItem('userData', JSON.stringify(data.user));
          } else {
            console.error('❌ No user data in response');
            // Fallback ke data dari localStorage
            const savedUserData = localStorage.getItem('userData');
            if (savedUserData) {
              const userData = JSON.parse(savedUserData);
              console.log('📦 Fallback to cached user data:', userData);
              setUserProfile(userData);
            }
          }
        } else {
          console.error('❌ API failed, status:', response.status);
          // Fallback ke data dari localStorage
          const savedUserData = localStorage.getItem('userData');
          if (savedUserData) {
            const userData = JSON.parse(savedUserData);
            console.log('📦 Fallback to cached user data:', userData);
            setUserProfile(userData);
          } else {
            // Ultimate fallback
            setUserProfile({
              _id: 'fallback-id',
              nama: userType,
              username: userType,
              email: `${userType}@example.com`,
              kelompok: 'A',
              role: userType,
              status: 'Aktif'
            } as UserProfile);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        // Fallback ke data dari localStorage
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          console.log('📦 Fallback to cached user data after error:', userData);
          setUserProfile(userData);
        } else {
          setUserProfile({
            _id: 'fallback-id',
            nama: userType,
            username: userType,
            email: `${userType}@example.com`,
            kelompok: 'A',
            role: userType,
            status: 'Aktif'
          } as UserProfile);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userType]);

  const handleLogout = () => {
    // Hapus semua session dan local storage
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('isHardcodeAdmin');
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  // Handle profile click berdasarkan user type
  const handleProfileClick = () => {
    if (userType === 'admin') {
      router.push('/profile/profile-admin');
    } else {
      router.push('/profile');
    }
    setIsMobileOpen(false);
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setIsMobileOpen(false);
  };

  const getNavItems = (): NavItem[] => {
    switch (userType) {
      case 'admin':
        return [
          { href: '/dashboard/admin', icon: '/group-white.svg', label: 'Dashboard' },
          { href: '/admin/user', icon: '/user-white.svg', label: 'User' },
          { href: '/admin/artikel', icon: '/task-square-white.svg', label: 'Artikel' },
          { href: '/admin/laporan', icon: '/clipboard-text.svg', label: 'Laporan' },
        ];
      case 'penyuluh':
        return [
          { href: '/dashboard/penyuluh', icon: '/group.svg', label: 'Dashboard' },
          { href: '/dashboard/penyuluh/data-kelompok', icon: '/task-square-white.svg', label: 'Data kelompok' },
          { href: '/dashboard/penyuluh/hasil-evaluasi', icon: '/folder-2-white.svg', label: 'Hasil evaluasi' },
          { href: '/dashboard/penyuluh/pelatihan', icon: '/book-white.svg', label: 'Pelatihan' },
        ];
      case 'peternak':
        return [
          { href: '/dashboard/peternak', icon: '/group.svg', label: 'Dashboard' },
          { href: '/peternak/kuesioner', icon: '/task-square-white.svg', label: 'Kuesioner' },
          { href: '/peternak/ternak', icon: '/folder-2-white.svg', label: 'Data Ternak' },
          { href: '/peternak/pelatihan', icon: '/book-white.svg', label: 'Pelatihan' },
          { href: '/peternak/hasil', icon: '/clipboard-text-white.svg', label: 'Hasil Evaluasi' },
        ];
      default:
        return [];
    }
  };

  const isActive = (href: string) => {
    if (href === `/dashboard/${userType}` || href === `/dashboard/${userType}/`) {
      return pathname === `/dashboard/${userType}` || pathname === `/dashboard/${userType}/`;
    }
    return pathname.startsWith(href);
  };

  const navItems = getNavItems();

  // Komponen sidebar utama
  const SidebarContent = ({ isCollapsed = false }) => (
    <>
      {!isCollapsed ? (
        <Image
          src="/img/Logo Sistem.png"
          alt="Logo Sistem Peternakan"
          width={200}
          height={200}
          className="mx-auto mb-5 w-40 md:w-48"
        />
      ) : (
        <div className="flex justify-center mb-5">
          <Image
            src="/img/Logo Sistem.png"
            alt="Logo Sistem Peternakan"
            width={50}
            height={50}
            className="rounded-md"
          />
        </div>
      )}

      <nav className="space-y-2 sm:space-y-3 md:space-y-4">
        {navItems.map((item: NavItem, index: number) => {
          const active = isActive(item.href);
          return (
            <a
              key={index}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
              className={`flex items-center gap-3 font-[Judson] text-lg md:text-xl transition-colors ${active
                ? 'text-black bg-white px-4 py-2 md:px-5 md:py-2 rounded-l-full -mr-4 -ml-2 shadow-sm'
                : 'text-white hover:bg-green-700 px-2 py-1 md:px-3 md:py-2 rounded'
                } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <Image
                src={item.icon as string}
                alt={item.label}
                width={20}
                height={20}
                className="w-5 h-5 md:w-6 md:h-6"
              />
              {!isCollapsed && <span className="text-sm md:text-base">{item.label}</span>}
            </a>
          );
        })}
      </nav>
    </>
  );

  // Komponen profil dan logout
  const ProfileSection = ({ isCollapsed = false }) => {
    const profileImageUrl = getProfileImageUrl();

    return (
      <div className="mt-auto pt-4 border-t border-green-500">
        <div
          onClick={handleProfileClick}
          className={`flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center' : 'ml-2 md:ml-4'}`}
        >
          <div className="relative">
            <Image
              src={profileImageUrl}
              alt="Foto Profil"
              width={32}
              height={32}
              className="w-8 h-8 md:w-10 md:h-10 object-cover border-2 cursor-pointer"
              style={{ borderRadius: '50%' }}
              onError={() => {
                console.log('🚨 Image load error for URL:', profileImageUrl);
                console.log('👤 User profile:', userProfile);
                setProfileImageError(true);
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', profileImageUrl);
              }}
              unoptimized
            />
            {/* Badge untuk admin hardcode */}
            {userProfile?.isHardcode && (
              <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                ★
              </div>
            )}
          </div>
          {!isCollapsed && (
            loading ? (
              <p className="font-[Judson] text-sm md:text-base">Loading...</p>
            ) : (
              <div>
                <p className="font-[Judson] text-sm md:text-base truncate max-w-[120px]">
                  Hi, {userProfile?.nama || userType}
                </p>
                {userProfile?.isHardcode && (
                  <p className="text-xs text-yellow-300">Hardcode Admin</p>
                )}
              </div>
            )
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`bg-red-500 hover:bg-red-800 w-full text-white py-1.5 md:py-2 rounded flex items-center justify-center space-x-2 ${isCollapsed ? 'px-2' : ''}`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {!isCollapsed && <span className="text-sm md:text-base">Logout</span>}
        </button>

        {/* Tombol collapse untuk desktop */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-3 md:mt-4 w-full bg-green-700 hover:bg-green-800 text-white py-1.5 md:py-2 rounded flex items-center justify-center"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ChevronLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Tombol hamburger untuk mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-3 left-3 z-50 p-2 bg-green-600 rounded-md text-white md:hidden"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Overlay untuk mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar untuk desktop */}
      <aside className={`hidden md:flex bg-green-600 text-white flex-col min-h-screen py-4 md:py-6 px-3 md:px-4 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56 md:w-64'}`}>
        <div className="flex-1">
          <SidebarContent isCollapsed={isCollapsed} />
        </div>
        <ProfileSection isCollapsed={isCollapsed} />
      </aside>

      {/* Sidebar untuk mobile */}
      <aside
        className={`fixed top-0 left-0 h-full bg-green-600 text-white w-64 flex flex-col py-4 px-3 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
        <ProfileSection />
      </aside>

      {/* Padding untuk konten utama ketika sidebar collapsed di desktop */}
      {!isMobile && (
        <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-56 md:ml-64'}`}></div>
      )}
    </>
  );
}