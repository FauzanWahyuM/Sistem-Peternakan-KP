'use client';

import React from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DetailArtikel() {
  const params = useParams();
  const articleId = params.id;

  // Navigation items
  const navItems = ["Beranda", "Program", "Artikel", "Kontak"];

  // Sample article data - in real app this would come from API/database
  const articleData = {
    id: articleId,
    title: "Judul Artikel",
    date: "12 Juli 2025",
    image: "/img/ptk 6.jpg",
    content: [
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu semper sed diam urna tempor. Pulvinar vivamus rhoncus lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
      
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu semper sed diam urna tempor. Pulvinar vivamus rhoncus lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
      
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu semper sed diam urna tempor. Pulvinar vivamus rhoncus lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos."
    ]
  };

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

      {/* Hero Image Section */}
      <section className="relative w-full h-[25rem] overflow-hidden">
        <Image
          src={articleData.image}
          alt={articleData.title}
          fill
          className="object-cover"
        />
        {/* Date Overlay */}
        <div className="absolute top-[2rem] left-[2rem] bg-[#60c67a] text-white px-[1.5rem] py-[0.75rem] rounded-[1.5rem]">
          <span className="font-['Judson'] font-bold text-[1.125rem]">
            {articleData.date}
          </span>
        </div>
      </section>

      {/* Main Content */}
      <main className="w-full py-[3rem] px-[2rem]">
        <div className="max-w-[50rem] mx-auto">
          {/* Article Title */}
          <h1 className="text-[3.125rem] font-bold text-black font-['Judson'] leading-[1.2] text-center mb-[3rem]">
            {articleData.title}
          </h1>

          {/* Article Content */}
          <div className="space-y-[2rem]">
            {articleData.content.map((paragraph, index) => (
              <p key={index} className="text-[1.125rem] text-black font-['Judson'] leading-[1.6] text-justify">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Back Button */}
          <div className="flex justify-center mt-[3rem]">
            <Link href="/artikel">
              <button className="bg-[#60c67a] text-white hover:bg-[#4bb565] rounded-[1.5rem] px-[2rem] py-[0.75rem] font-['Judson'] font-bold text-[1.125rem] transition-colors duration-200">
                Kembali ke Artikel
              </button>
            </Link>
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