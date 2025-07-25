'use client';

import React from "react";
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  // Navigation items
  const navItems = ["Beranda", "Tentang", "Program", "Artikel", "Kontak"];

  // Livestock groups data
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

  // Articles data
  const articles = [
    {
      id: 1,
      image: "/img/ptk 5.jpeg",
      title: "Judul",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt..."
    },
    {
      id: 2,
      image: "/img/ptk 6.jpg",
      title: "Judul",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt..."
    },
    {
      id: 3,
      image: "/img/ptk 7.jpg",
      title: "Judul",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt..."
    }
  ];

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Header/Navigation */}
      <nav className="w-full h-[100px] bg-[#60c67a] px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Image
            src="/img/Logo Sistem.png"
            alt="Logo Sistem"
            width={85}
            height={85}
          />
        </div>

        <ul className="hidden md:flex gap-6 text-sm font-medium">
          {navItems.map((item, index) => (
            <li key={index} className="cursor-pointer hover:underline">
              <a href="#" className="font-['Judson'] font-bold text-black text-[24px]">
                {item}
              </a>
            </li>
          ))}
        </ul>

        <Link href="/login">
          <button className="bg-white text-[20px] text-[#4bb565] hover:bg-gray-100 rounded-[24px] border border-solid 
          border-white font-['Judson'] font-bold px-7 py-2 transition-colors duration-200">
            Login
          </button>
        </Link>
      </nav>

      {/* Hero Section - Updated to match reference image */}
      <section className="w-full py-16 px-8 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Text Content - Left Side */}
          <div className="md:w-1/2">
            <h1 className="text-7xl font-bold font-['Judson'] leading-tight text-black mb-6">
              Sistem Informasi
              <br />
              Peternakan
            </h1>
            <p className="text-2xl font-['Judson'] italic text-black">
              Pada website ini berisikan seluruh informasi mengenai pelatihan kelompok peternak kambing sapi.
            </p>
          </div>

          {/* Images - Right Side - Stacked */}
          <div className="md:w-1/2 relative">
            {/* Bottom Image */}
            <div className="relative w-full h-110 z-0">
              <Image
                src="/img/Peternakan2.png"
                alt="Peternakan2"
                fill
                className="object-cover rounded-[24px] shadow-lg"
              />
            </div>

            {/* Top Image - Overlapping */}
            <div className="relative w-full h-110 -mt-50 ml-20 z-10">
              <Image
                src="/img/Peternakan1.png"
                alt="Peternakan1"
                fill
                className="object-cover rounded-[24px] shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision and Mission Section - Centered */}
      <section className="px-10 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-100">
        <div className="text-center">
          <h3 className="text-5xl font-semibold mb-6 text-[#60c67a] font-['Judson']">Visi</h3>
          <p className="text-black font-['Judson'] text-2xl mx-auto max-w-md">
            Menjadi wadah utama informasi dan pelatihan peternakan yang terintegrasi dan berkelanjutan.
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-5xl font-semibold mb-6 text-[#60c67a] font-['Judson']">Misi</h3>
          <p className="text-black font-['Judson'] text-2xl mx-auto max-w-md">
            Meningkatkan pengetahuan peternak, menyediakan data kelompok, serta menjembatani komunikasi antar kelompok peternakan.
          </p>
        </div>
      </section>

      {/* Livestock Groups Section */}
      <section className="px-8 py-12">
        <h3 className="text-5xl font-bold mb-4 text-[#60c67a] text-center font-['Judson']">Pelatihan Kelompok Peternakan</h3>
        <p className="text-center text-2xl mb-8 text-black font-['Judson']">Kelompok Peternakan yang terdaftar</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {livestockGroups.map((group) => (
            <div key={group.id} className="bg-[#60c67a] rounded-[20px] overflow-hidden shadow">
              <div className="p-0 flex">
                <div className="w-[200px] h-[250px] relative">
                  <Image
                    src={group.image}
                    alt={`Livestock group ${group.id}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-6 space-y-3">
                  <h3 className="font-['Judson'] font-bold text-black text-3xl">
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    <p className="font-['Judson'] font-bold text-black text-[20px]">
                      {group.address}
                    </p>
                    <p className="font-['Judson'] font-bold text-black text-[20px]">
                      {group.livestockType}
                    </p>
                    <p className="font-['Judson'] font-bold text-black text-[20px]">
                      {group.livestockCount}
                    </p>
                    <p className="font-['Judson'] font-bold text-black text-[20px]">
                      {group.establishedYear}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Articles Section */}
      <section className="px-20 py-12 bg-white">
        <h3 className="text-5xl text-[#60c67a] font-bold mb-6 text-center font-['Judson']">Artikel</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {articles.map((article) => (
            <div key={article.id} className="bg-[#60c67a] rounded-[20px] overflow-hidden shadow">
              <div className="w-full h-[250px] relative">
                <Image
                  src={article.image}
                  alt={`Article ${article.id}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-['Judson'] font-bold text-black text-4xl mb-4">
                  {article.title}
                </h3>
                <p className="font-['Judson'] font-bold text-black text-xl mb-6">
                  {article.description}
                </p>
                <div className="flex justify-end">
                  <button className="bg-white text-black hover:bg-gray-100 rounded-[20px] border border-solid border-black px-4 py-1 font-['Judson'] font-bold transition-colors duration-200">
                    Selengkapnya
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section with Google Maps */}
      <footer className="h-[500px] px-20 py-12 bg-[#60c67a] text-white grid grid-cols-1 md:grid-cols-3 gap-20 text-sm">
        <div>
          <h4 className="text-black text-4xl font-semibold mb-2 font-['Judson']">Lokasi</h4>
          <div className="w-full h-[350px] relative">
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
          <h4 className="text-black text-4xl font-semibold mb-5 font-['Judson']">Tempat Peternakan</h4>
          <p className="text-black text-xl font-['Judson']">
            Jl. Jend. Sudirman No.57, Pesayangan, Kedungwuluh, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53131
          </p>
        </div>

        <div>
          <h4 className="text-black text-4xl font-semibold mb-5 font-['Judson']">Kontak</h4>
          <div className="text-black text-xl flex items-center gap-4 mb-5">
            <Image src="/img/whatsapp.png" alt="WhatsApp" width={30} height={30} />
            <span className="font-['Judson']">+62-82153882102</span>
          </div>
          <div className="text-black text-xl flex items-center gap-4 mb-5">
            <Image src="/img/email.png" alt="Email" width={30} height={30} />
            <span className="font-['Judson']">Peternakan@gmail.com</span>
          </div>
          <div className="text-black text-xl flex items-center gap-4">
            <Image src="/img/linkedin.png" alt="LinkedIn" width={30} height={30} />
            <span className="font-['Judson']">Peternakan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}