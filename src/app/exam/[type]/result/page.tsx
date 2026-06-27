'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, FileText, ArrowRight } from 'lucide-react';

export default function ResultPage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const { type } = use(params);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('examResult');
    if (saved) {
      setResult(JSON.parse(saved));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!result) return <div className="min-h-screen bg-gray-50"></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center">
        <div className={`p-8 ${result.isPassed ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          <div className="flex justify-center mb-4">
            {result.isPassed ? (
              <CheckCircle className="w-20 h-20 text-green-200" />
            ) : (
              <XCircle className="w-20 h-20 text-red-200" />
            )}
          </div>
          <h1 className="text-4xl font-extrabold mb-2">
            {result.isPassed ? 'คุณสอบผ่าน!' : 'คุณสอบไม่ผ่าน'}
          </h1>
          <p className="text-lg opacity-90">
            {type === 'pretest' ? 'ผลการทดสอบก่อนเรียน (Pretest)' : 'ผลการทดสอบหลังเรียน (Posttest)'}
          </p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-2">คะแนนของคุณ</p>
            <div className="text-5xl font-black text-gray-900">
              {result.correctCount} <span className="text-2xl text-gray-400 font-medium">/ {result.total}</span>
            </div>
            <p className="mt-2 text-emerald-600 font-semibold">{Number(result.score).toFixed(0)}%</p>
          </div>

          {result.pdfUrl && (
            <div className="bg-emerald-50 rounded-xl p-6 mb-8 border border-emerald-100">
              <div className="flex items-center justify-center text-emerald-600 mb-3">
                <FileText className="w-8 h-8 mr-2" />
                <h3 className="text-lg font-bold">เกียรติบัตรของคุณพร้อมแล้ว!</h3>
              </div>
              <p className="text-sm text-emerald-800 mb-4">
                คุณทำคะแนนได้ตามเกณฑ์ สามารถดาวน์โหลดเกียรติบัตรได้ทันที
              </p>
              <a 
                href={result.pdfUrl} 
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 w-full"
              >
                ดาวน์โหลดเกียรติบัตร
              </a>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => router.push('/user/dashboard')}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700"
            >
              กลับสู่หน้าแดชบอร์ดของคุณ <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
