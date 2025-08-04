'use client';

import React from "react";
import Image from 'next/image';
import Link from 'next/link';

export default function Kontak() {
  // Navigation items
  const navItems = ["Beranda", "Program", "Artikel", "Kontak"];

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
          <h1 className="text-[3.125rem] font-bold text-black font-['Judson'] leading-[1.2]">
            Kontak
          </h1>
        </div>

        {/* Contact Section */}
        <div className="max-w-[75rem] mx-auto">
          <div className="bg-[#60c67a] rounded-[1.5rem] p-[2rem] shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2rem] items-center">
              {/* Map Section - Left Side */}
              <div className="w-full">
                <div className="w-full h-[25rem] relative rounded-[1rem] overflow-hidden shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.715197586618!2d109.2216233153266!3d-7.268036394757247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6fd5c8a9a2a8a5%3A0x4a9a9c1d4a4a4a4a!2sJl.%20Jend.%20Sudirman%20No.57%2C%20Pesayangan%2C%20Kedungwuluh%2C%20Kec.%20Purwokerto%20Bar.%2C%20Kabupaten%20Banyumas%2C%20Jawa%20Tengah%2053131!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    className="rounded-[1rem]"
                  ></iframe>
                </div>
              </div>

              {/* Contact Information - Right Side */}
              <div className="w-full">
                <h2 className="text-[2.5rem] font-bold text-black font-['Judson'] leading-[1.2] mb-[2rem]">
                  Hubungi Kami
                </h2>

                <div className="space-y-[1.5rem]">
                  {/* WhatsApp */}
                  <div className="flex items-center gap-[1rem]">
                    <div className="w-[3rem] h-[3rem] bg-white rounded-[0.5rem] flex items-center justify-center shadow-sm">
                      <Image 
                        src="/img/whatsapp.png" 
                        alt="WhatsApp" 
                        width={24} 
                        height={24} 
                        className="w-[1.5rem] h-[1.5rem] object-contain"
                      />
                    </div>
                    <span className="text-black text-[1.25rem] font-['Judson'] font-medium">
                      +62-82153882102
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-[1rem]">
                    <div className="w-[3rem] h-[3rem] bg-white rounded-[0.5rem] flex items-center justify-center shadow-sm">
                      <Image 
                        src="/img/email.png" 
                        alt="Email" 
                        width={24} 
                        height={24} 
                        className="w-[1.5rem] h-[1.5rem] object-contain"
                      />
                    </div>
                    <span className="text-black text-[1.25rem] font-['Judson'] font-medium">
                      Peternakan@gmail.com
                    </span>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center gap-[1rem]">
                    <div className="w-[3rem] h-[3rem] bg-white rounded-[0.5rem] flex items-center justify-center shadow-sm">
                      <Image 
                        src="/img/linkedin.png" 
                        alt="LinkedIn" 
                        width={24} 
                        height={24} 
                        className="w-[1.5rem] h-[1.5rem] object-contain"
                      />
                    </div>
                    <span className="text-black text-[1.25rem] font-['Judson'] font-medium">
                      Peternakan
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-[1rem] mt-[2rem]">
                    <div className="w-[3rem] h-[3rem] bg-white rounded-[0.5rem] flex items-center justify-center shadow-sm flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#60c67a"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-black text-[1.25rem] font-['Judson'] font-medium leading-[1.4]">
                        Jl. Jend. Sudirman No.57, Pesayangan, Kedungwuluh, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53131
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}