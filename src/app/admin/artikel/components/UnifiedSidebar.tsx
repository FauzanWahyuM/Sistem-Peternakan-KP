'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, FileText, LogOut, Newspaper, BookOpen, Group } from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  userType: 'admin' | 'penyuluh' | 'peternak';
}

export default function UnifiedSidebar({ userType }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push('/login');
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

  const getUserGreeting = () => {
    switch (userType) {
      case 'admin': return 'Admin';
      case 'penyuluh': return 'Penyuluh';
      case 'peternak': return 'Peternak';
      default: return 'User';
    }
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
              // For peternak, we use Image components for icons
              const active = isActive(item.href);
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 font-[Judson] text-xl transition-colors ${
                    active
                      ? 'text-black bg-gray-100 px-5 py-2 rounded-l-full -mr-4 -ml-2 shadow-sm'
                      : 'text-white hover:bg-green-700 px-3 py-2 rounded'
                  }`}
                >
                  <Image src={item.icon as string} alt={item.label} width={25} height={25} />
                  <span>{item.label}</span>
                </a>
              );
            } else {
              // For admin and penyuluh, we use Lucide icons
              const Icon = item.icon as React.ElementType;
              const active = isActive(item.href);
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 font-[Judson] text-xl transition-colors ${
                    active
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
        <div className="flex items-center gap-3 mb-6 ml-4">
          <Image src="/Vector.svg" alt="User Icon" width={40} height={40} />
          <p className="font-[Judson] text-xl">Hi, {getUserGreeting()}</p>
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