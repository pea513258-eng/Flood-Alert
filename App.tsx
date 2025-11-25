import React from 'react';
import { NavBar } from './components/NavBar';
import ReportForm from './components/ReportForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <NavBar />
      
      <main className="max-w-md mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">แจ้งขอความช่วยเหลือ</h1>
          <p className="text-gray-500 text-sm mt-1">
            ระบบจะใช้ AI ประเมินความเร่งด่วนจากภาพถ่ายของคุณเพื่อให้เจ้าหน้าที่เข้าถึงจุดวิกฤตได้เร็วที่สุด
          </p>
        </header>

        <ReportForm />

        <footer className="mt-8 text-center text-gray-400 text-xs">
          <p>© 2024 FloodRescueTH. เพื่อการสาธิตเท่านั้น</p>
          <p className="mt-1">ข้อมูลของท่านจะถูกส่งไปยังศูนย์ประสานงานภัยพิบัติ</p>
        </footer>
      </main>
    </div>
  );
}

export default App;