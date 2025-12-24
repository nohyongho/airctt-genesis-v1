
'use client';

import { Radio } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <Radio className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">AIRCTT</span>
        </div>
        <p>위치기반 AR 쿠폰 플랫폼 | airctt.com</p>
        <p className="mt-1">© 2024 AIRCTT. All rights reserved.</p>
      </div>
    </footer>
  );
}
