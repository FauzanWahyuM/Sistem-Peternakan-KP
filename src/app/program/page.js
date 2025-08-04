'use client';

import React from "react";
import Image from 'next/image';
import Link from 'next/link';

export default function Program() {
  // Navigation items
  const navItems = ["Beranda", "Program", "Artikel", "Kontak"];

  // Livestock groups data with more detailed information
  const livestockGroups = [
    {
      id: 1,
      image: "/img/ptk.jpg",
      title: "Nama Kelompok Peternakan",
      address: "Alamat",
      livestockType: "Jenis Ternak Utama",
      livestockCount: "Jumlah Ternak",
      establishedYear: "Tahun Berdiri"
    },
    {
      id: 2,
      image: "/img/ptk 2.png",
      title: "Nama Kelompok Peternakan",
      address: "Alamat",
      livestockType: "Jenis Ternak Utama",
      livestockCount: "Jumlah Ternak",
      establishedYear: "Tahun Berdiri"
    },
    {
      id: 3,
      image: "/img/ptk 3.jpg",
      title: "Nama Kelompok Peternakan",
      address: "Alamat",
      livestockType: "Jenis Ternak Utama",
      livestockCount: "Jumlah Ternak",
      establishedYear: "Tahun Berdiri"
    },
    {
      id: 4,
      image: "/img/ptk 4.jpg",
      title: "Nama Kelompok Peternakan",
      address: "Alamat",
      livestockType: "Jenis Ternak Utama",
      livestockCount: "Jumlah Ternak",
      establishedYear: "Tahun Berdiri"
    }
  ];

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Header/Navigation */}
      <nav className="w-full h-[6.25rem] bg-[#60c67a] px-[2rem] py-[1rem] flex justify-between items-center shadow-md">
        <div className="flex items-center gap-[0.5rem]">
          <Image
            src="/img/Logo Sistem.png"
            alt="Logo Sistem"
            width={85}
            height={85}
            className="w-[5.3125rem] h-[5.3125rem] object-contain"
          />
        </div>

        <ul className="hidden md:flex gap-[1.5rem] text-sm font-medium">
          {navItems.map((item, index) => (
            <li key={index} className="cursor-pointer hover:underline">
                  <Link href={item === "Beranda" ? "/" : item === "Program" ? "/program" : item === "Artikel" ? "/artikel" : item === "Kontak" ? "/kontak" : "#"}
                    className="font-['Judson'] font-bold text-black text-[1.5rem] leading-[1.2]">
                {item}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/login">
          <button className="bg-white text-[1.25rem] text-[#4bb565] hover:bg-gray-100 rounded-[1.5rem] border border-solid 
          border-white font-['Judson'] font-bold px-[1.75rem] py-[0.5rem] transition-colors duration-200">
            Login
          </button>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="w-full py-[3rem] px-[2rem]">
        {/* Page Title */}
        <div className="text-center mb-[3rem]">
          <h1 className="text-[3.125rem] font-bold text-black font-['Judson'] leading-[1.2] mb-[1rem]">
            Pelatihan Kelompok Peternakan
          </h1>
          <p className="text-[1.5rem] text-black font-['Judson'] leading-[1.4]">
            Kelompok Peternakan yang terdaftar
          </p>
        </div>

        {/* Livestock Groups Grid */}
        <div className="max-w-[75rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[2rem]">
            {livestockGroups.map((group) => (
              <div key={group.id} className="bg-[#60c67a] rounded-[1.25rem] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex">
                  {/* Image Section */}
                  <div className="w-[12.5rem] h-[15.625rem] relative flex-shrink-0">
                    <Image
                      src={group.image}
                      alt={`Livestock group ${group.id}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 p-[1.5rem] flex flex-col justify-center">
                    <h3 className="font-['Judson'] font-bold text-black text-[1.875rem] leading-[1.2] mb-[1rem]">
                      {group.title}
                    </h3>
                    <div className="space-y-[0.5rem]">
                      <p className="font-['Judson'] font-bold text-black text-[1.125rem] leading-[1.3]">
                        {group.address}
                      </p>
                      <p className="font-['Judson'] font-bold text-black text-[1.125rem] leading-[1.3]">
                        {group.livestockType}
                      </p>
                      <p className="font-['Judson'] font-bold text-black text-[1.125rem] leading-[1.3]">
                        {group.livestockCount}
                      </p>
                      <p className="font-['Judson'] font-bold text-black text-[1.125rem] leading-[1.3]">
                        {group.establishedYear}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="min-h-[31.25rem] px-[5rem] py-[3rem] bg-[#60c67a] text-white grid grid-cols-1 md:grid-cols-3 gap-[5rem] text-sm mt-[3rem]">
        <div>
          <h4 className="text-black text-[2.5rem] font-semibold mb-[0.5rem] font-['Judson'] leading-[1.2]">Lokasi</h4>
          <div className="w-full h-[21.875rem] relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.715197586618!2d109.2216233153266!3d-7.268036394757247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6fd5c8a9a2a8a5%3A0x4a9a9c1d4a4a4a4a!2sJl.%20Jend.%20Sudirman%20No.57%2C%20Pesayangan%2C%20Kedungwuluh%2C%20Kec.%20Purwokerto%20Bar.%2C%20Kabupaten%20Banyumas%2C%20Jawa%20Tengah%2053131!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              className="rounded shadow"
            ></iframe>
          </div>
        </div>

        <div>
          <h4 className="text-black text-[2.5rem] font-semibold mb-[1.25rem] font-['Judson'] leading-[1.2]">Tempat Peternakan</h4>
          <p className="text-black text-[1.25rem] font-['Judson'] leading-[1.4]">
            Jl. Jend. Sudirman No.57, Pesayangan, Kedungwuluh, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53131
          </p>
        </div>

        <div>
          <h4 className="text-black text-[2.5rem] font-semibold mb-[1.25rem] font-['Judson'] leading-[1.2]">Kontak</h4>
          <div className="text-black text-[1.25rem] flex items-center gap-[1rem] mb-[1.25rem]">
            <Image src="/img/whatsapp.png" alt="WhatsApp" width={30} height={30} className="w-[1.875rem] h-[1.875rem] object-contain" />
            <span className="font-['Judson'] leading-[1.4]">+62-82153882102</span>
          </div>
          <div className="text-black text-[1.25rem] flex items-center gap-[1rem] mb-[1.25rem]">
            <Image src="/img/email.png" alt="Email" width={30} height={30} className="w-[1.875rem] h-[1.875rem] object-contain" />
            <span className="font-['Judson'] leading-[1.4]">Peternakan@gmail.com</span>
          </div>
          <div className="text-black text-[1.25rem] flex items-center gap-[1rem]">
            <Image src="/img/linkedin.png" alt="LinkedIn" width={30} height={30} className="w-[1.875rem] h-[1.875rem] object-contain" />
            <span className="font-['Judson'] leading-[1.4]">Peternakan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}