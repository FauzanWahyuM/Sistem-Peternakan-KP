'use client';

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans bg-gray-100 text-gray-800">
      {/* Navbar */}
      <nav className="bg-green-500 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Image src="/img/logo.png" alt="Logo" width={40} height={40} />
        </div>
        <ul className="hidden md:flex gap-6 text-sm font-medium">
          <li className="cursor-pointer hover:underline">Beranda</li>
          <li className="cursor-pointer hover:underline">Tentang</li>
          <li className="cursor-pointer hover:underline">Program</li>
          <li className="cursor-pointer hover:underline">Artikel</li>
          <li className="cursor-pointer hover:underline">Kontak</li>
        </ul>
        <Link href="/login">
          <button className="bg-white text-green-600 font-semibold px-4 py-1 rounded hover:bg-gray-100 transition">
            Login
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Sistem Informasi Peternakan</h2>
        <p className="mb-6 text-gray-600">
          Pada website ini berisikan seluruh informasi mengenai pelatihan kelompok peternak kambing sapi.
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <Image src="/img/Peternakan1.png" alt="Sapi 1" width={350} height={200} className="rounded shadow" />
          <Image src="/img/Peternakan2.png" alt="Sapi 2" width={350} height={200} className="rounded shadow" />
        </div>
      </section>

      {/* Visi Misi */}
      <section className="px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50">
        <div>
          <h3 className="text-2xl font-semibold mb-3 text-green-600">Visi</h3>
          <p className="text-gray-700">
            Menjadi wadah utama informasi dan pelatihan peternakan yang terintegrasi dan berkelanjutan.
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-3 text-green-600">Misi</h3>
          <p className="text-gray-700">
            Meningkatkan pengetahuan peternak, menyediakan data kelompok, serta menjembatani komunikasi antar kelompok peternakan.
          </p>
        </div>
      </section>

      {/* Pelatihan */}
      <section className="px-8 py-12">
        <h3 className="text-2xl font-bold mb-4 text-center">Pelatihan Kelompok Peternakan</h3>
        <p className="text-center mb-8 text-gray-600">Kelompok Peternakan yang terdaftar</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-green-100 rounded-lg p-4 shadow">
              <Image src={`/kelompok${i + 1}.jpg`} alt={`Kelompok ${i + 1}`} width={300} height={200} className="rounded mb-3" />
              <h4 className="font-semibold text-lg">Nama Kelompok Peternakan</h4>
              <p>Alamat: Jalan Contoh No. {i + 1}</p>
              <p>Kecamatan: Kecamatan A</p>
              <p>Ketua: Pak Budi</p>
            </div>
          ))}
        </div>
      </section>

      {/* Artikel */}
      <section className="px-8 py-12 bg-white">
        <h3 className="text-2xl font-bold mb-6 text-center">Artikel</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-green-100 rounded-lg p-4 shadow">
              <Image src={`/artikel${i + 1}.jpg`} alt={`Artikel ${i + 1}`} width={300} height={200} className="rounded mb-3" />
              <h4 className="font-semibold text-lg mb-2">Judul Artikel {i + 1}</h4>
              <button className="bg-white text-green-600 border border-green-600 px-4 py-1 rounded hover:bg-green-50">
                Selengkapnya
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 bg-green-500 text-white grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <h4 className="font-semibold mb-2">Lokasi</h4>
          <Image src="/map.png" alt="Map" width={300} height={200} className="rounded shadow" />
        </div>
        <div>
          <h4 className="font-semibold mb-2">Tempat Peternakan</h4>
          <p>Desa Sukamaju</p>
          <p>Kabupaten Contoh</p>
          <p>Jawa Barat</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Kontak</h4>
          <p>📞 08123456789</p>
          <p>✉️ info@peternakan.id</p>
          <p>🌐 www.peternakan.id</p>
        </div>
      </footer>
    </div>
  );
}
