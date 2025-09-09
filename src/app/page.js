import React from "react";
import { Shield, Clock, Users, Flag, Award, Lock } from "lucide-react";
import { FaGlobe, FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";
import Link from "next/link";

const HackSecureHome = () => {
  return (
    <div className=" text-red-500 font-mono min-h-screen px-6 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">HackSecure 2025</h1>
        <h2 className="text-2xl md:text-3xl mb-2">Capture The Flag Event</h2>
        <p className="max-w-2xl mx-auto text-red-300">
          Enter the Upside Down of cybersecurity. 48 hours of mind-bending
          challenges where only the strongest hackers survive.
        </p>
      </section>

      {/* Event Details */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
        <div className="border border-red-600 rounded-xl p-6">
          <Clock className="mx-auto mb-2" size={32} />
          <h3 className="text-xl font-semibold">Duration</h3>
          <p>48 hours</p>
        </div>
        <div className="border border-red-600 rounded-xl p-6">
          <Users className="mx-auto mb-2" size={32} />
          <h3 className="text-xl font-semibold">Team Size</h3>
          <p>1-5 members</p>
        </div>
        <div className="border border-red-600 rounded-xl p-6">
          <Flag className="mx-auto mb-2" size={32} />
          <h3 className="text-xl font-semibold">Flag Format</h3>
          <p>0x00{"{fl4g_f0rm4t}"}</p>
        </div>
      </section>

      {/* Rules Section */}
      <section className="mb-16 max-w-3xl mx-auto">
        <h3 className="text-3xl font-bold mb-6 text-center">
          Rules & Guidelines
        </h3>
        <ol className="list-decimal list-inside space-y-3 text-red-300">
          <li>
            Everyone is welcome regardless of background or experience level.
          </li>
          <li>Team size: 1-5 members (solo or team participation).</li>
          <li>
            Each team will be provided with a single set of access credentials, and all members must use the same credentials for participation.
          </li>
          <li>Event duration: 48 hours starting September 10th, 2025.</li>
          <li>Flag format: 0x00{"{fl4g_f0rm4t}"}</li>
          <li>No flag sharing or collaboration between teams.</li>
          <li>No attacks on event infrastructure or brute forcing.</li>
          <li>Use tickets channel for all queries - no DMs.</li>
          <li>Maintain respectful and inclusive communication.</li>
          <li>NULL VITB reserves right to disqualify for rule violations.</li>
        </ol>
      </section>

      {/* Footer */}

      <footer className="border-t border-red-600 pt-8 pb-6 text-red-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="text-3xl font-bold mb-1">n|u</div>
            <span className="font-medium text-sm">Student Chapter</span>
            <span className="text-sm">VIT Bhopal</span>
          </div>

       
          <div className="flex space-x-6">
            <div className="text-center md:text-right text-md">
              <span className="font-medium">Connect with us :</span>
            </div>
            <Link
              href="https://null-vit-bhopal.onrender.com/"
              className="hover:text-blue-400 transition-colors"
            >
              <FaGlobe size={22} />
            </Link>
            <Link
              href="https://in.linkedin.com/company/nullvitb"
              className="hover:text-blue-500 transition-colors"
            >
              <FaLinkedin size={22} />
            </Link>
            <Link
              href="https://www.instagram.com/null_vitb_student_chapter/"
              className="hover:text-pink-600 transition-colors"
            >
              <FaInstagram size={22} />
            </Link>
            <Link
              href="https://github.com/Null-Student-Chapter-VIT-Bhopal"
              className="hover:text-gray-400 transition-colors"
            >
              <FaGithub size={22} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HackSecureHome;
