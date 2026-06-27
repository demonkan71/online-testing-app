'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function QuestionManagementPage() {
  const [examType, setExamType] = useState('PRETEST');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit & Add State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    content: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A'
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions?type=${examType}`);
      setQuestions(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [examType]);

  const handleAddNew = () => {
    setEditingId('NEW');
    setFormData({
      content: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A'
    });
  };

  const handleEdit = (q: any) => {
    setEditingId(q.id);
    setFormData({
      content: q.content, optionA: q.optionA, optionB: q.optionB, 
      optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption
    });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.content || !formData.optionA || !formData.optionB) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const method = editingId === 'NEW' ? 'POST' : 'PUT';
    const url = editingId === 'NEW' ? '/api/questions' : `/api/questions/${editingId}`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, examType })
      });
      if (res.ok) {
        setEditingId(null);
        fetchQuestions();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบข้อสอบนี้? ข้อมูลการตอบของผู้ใช้สำหรับข้อนี้จะถูกลบด้วย')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuestions();
      } else {
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">จัดการข้อสอบ</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setExamType('PRETEST')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${examType === 'PRETEST' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Pretest
          </button>
          <button 
            onClick={() => setExamType('POSTTEST')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${examType === 'POSTTEST' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Posttest
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">รายการข้อสอบ ({examType})</h2>
          {editingId !== 'NEW' && (
            <button 
              onClick={handleAddNew}
              className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มข้อสอบใหม่</span>
            </button>
          )}
        </div>

        {editingId === 'NEW' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 animate-in fade-in">
            <h3 className="font-bold text-emerald-800 mb-4">เพิ่มข้อสอบใหม่</h3>
            <QuestionForm formData={formData} setFormData={setFormData} onSave={handleSave} onCancel={handleCancel} />
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                {editingId === q.id ? (
                  <QuestionForm formData={formData} setFormData={setFormData} onSave={handleSave} onCancel={handleCancel} />
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        <span className="text-emerald-600 mr-2">{index + 1}.</span> 
                        {q.content}
                      </h3>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-sm">
                      <div className={`p-3 rounded-lg border ${q.correctOption === 'A' ? 'bg-emerald-100 border-emerald-300 font-medium' : 'bg-gray-50 border-gray-100'}`}>
                        A. {q.optionA}
                      </div>
                      <div className={`p-3 rounded-lg border ${q.correctOption === 'B' ? 'bg-emerald-100 border-emerald-300 font-medium' : 'bg-gray-50 border-gray-100'}`}>
                        B. {q.optionB}
                      </div>
                      <div className={`p-3 rounded-lg border ${q.correctOption === 'C' ? 'bg-emerald-100 border-emerald-300 font-medium' : 'bg-gray-50 border-gray-100'}`}>
                        C. {q.optionC}
                      </div>
                      <div className={`p-3 rounded-lg border ${q.correctOption === 'D' ? 'bg-emerald-100 border-emerald-300 font-medium' : 'bg-gray-50 border-gray-100'}`}>
                        D. {q.optionD}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {questions.length === 0 && !editingId && (
              <div className="text-center py-12 text-gray-500">
                ยังไม่มีข้อสอบในระบบสำหรับหมวดหมู่นี้
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for the form
function QuestionForm({ formData, setFormData, onSave, onCancel }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">คำถาม</label>
        <textarea 
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          className="w-full border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500"
          rows={3}
          placeholder="พิมพ์คำถามที่นี่..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['A', 'B', 'C', 'D'].map((opt) => (
          <div key={opt}>
            <label className="block text-sm font-medium text-gray-700 mb-1">ตัวเลือก {opt}</label>
            <input 
              type="text"
              value={formData[`option${opt}`]}
              onChange={(e) => setFormData({...formData, [`option${opt}`]: e.target.value})}
              className="w-full border-gray-300 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        ))}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">เฉลย (ข้อที่ถูกต้อง)</label>
        <select 
          value={formData.correctOption}
          onChange={(e) => setFormData({...formData, correctOption: e.target.value})}
          className="w-full md:w-1/3 border-gray-300 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <X className="w-4 h-4 mr-2" /> ยกเลิก
        </button>
        <button onClick={onSave} className="flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm">
          <Save className="w-4 h-4 mr-2" /> บันทึกข้อสอบ
        </button>
      </div>
    </div>
  );
}
