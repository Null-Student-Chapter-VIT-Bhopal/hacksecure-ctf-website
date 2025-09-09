'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

const StrangerThings404 = () => {
  const [glitchText, setGlitchText] = useState('404');

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const glitchChars = ['4', '0', '4', '█', '▓', '?', '#'];
      const glitched = Array.from('404').map(() => 
        glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join('');
      
      setGlitchText(glitched);
      setTimeout(() => setGlitchText('404'), 100);
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <>
      <Head>
        <title>404 - Lost in the Upside Down</title>
        <meta name="description" content="Page not found - You've entered the Upside Down" />
      </Head>

      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-2xl px-6">
          
          {/* Simple 404 */}
          <h1 className="text-8xl md:text-9xl font-bold text-gray-800 dark:text-gray-200 mb-6 tracking-wider">
            {glitchText}
          </h1>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            LOST IN THE UPSIDE DOWN
          </h2>

          {/* Simple divider */}
          <div className="w-16 h-0.5 bg-gray-400 mx-auto mb-6" />

          {/* Message */}
          <div className="space-y-3 text-gray-600 dark:text-gray-400 mb-8">
            <p className="text-lg">The page you're looking for has been consumed by the darkness.</p>
            <p>Don't panic! Even Eleven gets lost sometimes.</p>
            <p>The Demogorgon might have taken this page, but we can get you back to safety.</p>
          </div>

          {/* Simple home button */}
          <Link 
            href="/"
            className="inline-block px-6 py-3 text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 font-medium"
          >
            ESCAPE TO HOMEPAGE
          </Link>

          {/* Simple quote */}
          <div className="mt-12 text-sm italic text-gray-500 dark:text-gray-500">
            <p>"Friends don't lie... but sometimes pages disappear."</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default StrangerThings404;