// components/UnifiedSidebar.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, FileText, LogOut, Newspaper, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface SidebarProps {
  userType: 'admin' | 'penyuluh' | 'peternak';
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
}

export default function UnifiedSidebar({ userType }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        console.log('🔄 Fetching user profile...');

        // 1. Coba ambil dari localStorage dulu
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          console.log('📦 Using cached user data:', userData);
          setUserProfile(userData);
          setLoading(false);
          return;
        }

        // 2. Jika tidak ada cached data, coba ambil dari API
        console.log('🌐 Fetching from API...');
        const response = await fetch('/api/auth/me');

        if (response.ok) {
          const data = await response.json();
          console.log('✅ API response:', data);
          setUserProfile(data.user);
          localStorage.setItem('userData', JSON.stringify(data.user));
        } else {
          console.error('❌ API failed, using fallback');
          // Fallback ke data basic
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

      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        // Fallback ke data basic
        setUserProfile({
          _id: 'fallback-id',
          nama: userType,
          username: userType,
          email: `${userType}@example.com`,
          kelompok: 'A',
          role: userType,
          status: 'Aktif'
        } as UserProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userType]);

  const handleLogout = () => {
    // Hapus data user dari semua storage
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const getNavItems = () => {
    switch (userType) {
      case 'admin':
        return [
          { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
          { href: '/admin/user', icon: Users, label: 'User' },
          { href: '/admin/artikel', icon: Newspaper, label: 'Artikel' },
          { href: '/admin/laporan', icon: FileText, label: 'Laporan' },
        ];
      case 'penyuluh':
        return [
          { href: '/dashboard/penyuluh', icon: Home, label: 'Dashboard' },
          { href: '/dashboard/penyuluh/data-kelompok', icon: Users, label: 'Data kelompok' },
          { href: '/dashboard/penyuluh/hasil-evaluasi', icon: FileText, label: 'Hasil evaluasi' },
          { href: '/dashboard/penyuluh/pelatihan', icon: BookOpen, label: 'Pelatihan' },
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

  return (
    <aside className="bg-green-600 text-white w-64 flex flex-col justify-between min-h-screen py-6 px-4">
      <div>
        <Image
          src="/img/Logo Sistem.png"
          alt="Logo Sistem Peternakan"
          width={200}
          height={200}
          className="mx-auto mb-5"
        />
        <nav className="space-y-4">
          {navItems.map((item, index) => {
            if (userType === 'peternak') {
              const active = isActive(item.href);
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 font-[Judson] text-xl transition-colors ${active
                    ? 'text-black bg-gray-100 px-5 py-2 rounded-l-full -mr-4 -ml-2 shadow-sm'
                    : 'text-white hover:bg-green-700 px-3 py-2 rounded'
                    }`}
                >
                  <Image src={item.icon as string} alt={item.label} width={25} height={25} />
                  <span>{item.label}</span>
                </a>
              );
            } else {
              const Icon = item.icon as React.ElementType;
              const active = isActive(item.href);
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 font-[Judson] text-xl transition-colors ${active
                    ? 'text-black bg-gray-100 px-5 py-2 rounded-l-full -mr-4 -ml-2 shadow-sm'
                    : 'text-white hover:bg-green-700 px-3 py-2 rounded'
                    }`}
                >
                  <Icon size={25} />
                  <span>{item.label}</span>
                </a>
              );
            }
          })}
        </nav>
      </div>
      <div className="mt-8 px-3">
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-3 mb-6 ml-4 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src={userProfile?.profileImage || '/Vector.svg'}
            alt="User Icon"
            width={40}
            height={40}
            className="rounded-full object-cover border-2 border-white"
          />
          {loading ? (
            <p className="font-[Judson] text-xl">Loading...</p>
          ) : (
            <p className="font-[Judson] text-xl">Hi, {userProfile?.nama || userType}</p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-800 w-full text-white py-2 rounded flex items-center justify-center space-x-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}