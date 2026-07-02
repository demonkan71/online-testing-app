'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamPage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const { type } = use(params);
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/exam/${type}`);
        if (res.ok) {
          const data = await res.json();
          setExam(data);
        } else {
          const errorData = await res.json().catch(() => null);
          alert(errorData?.error || 'ไม่พบแบบทดสอบ');
          router.push('/');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [type, router]);

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exam.questions.length) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }
    setSubmitting(true);
    try {
      const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
      if (!userId) {
        alert('ไม่พบข้อมูลผู้ใช้ กรุณาลงทะเบียนใหม่');
        router.push('/');
        return;
      }

      const res = await fetch(`/api/exam/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, answers }),
      });

      if (res.ok) {
        const result = await res.json();
        // Save result to localStorage to show on result page
        localStorage.setItem('examResult', JSON.stringify(result));
        router.push(`/exam/${type}/result`);
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || 'เกิดข้อผิดพลาดในการส่งคำตอบ');
        if (res.status === 403) {
          router.push('/user/dashboard');
        } else {
          setSubmitting(false);
        }
      }
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">กำลังโหลดข้อสอบ...</div>;
  if (!exam) return <div className="min-h-screen flex items-center justify-center bg-gray-50">ไม่พบข้อสอบ</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-emerald-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <p className="mt-2 text-emerald-100">โปรดเลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว</p>
          </div>
          
          <div className="p-6 sm:p-10 space-y-12">
            {exam.questions.map((q: any, index: number) => (
              <div key={q.id} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {index + 1}. {q.content}
                </h3>
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <label 
                      key={opt}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        answers[q.id] === opt 
                          ? 'border-emerald-600 bg-emerald-50 shadow-sm' 
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`question-${q.id}`} 
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleOptionSelect(q.id, opt)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-700">
                        {opt === 'A' && q.optionA}
                        {opt === 'B' && q.optionB}
                        {opt === 'C' && q.optionC}
                        {opt === 'D' && q.optionD}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 px-6 py-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-8 py-3 rounded-lg text-white font-medium bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all ${submitting ? 'opacity-70' : ''}`}
            >
              {submitting ? 'กำลังส่งคำตอบ...' : 'ส่งคำตอบ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
