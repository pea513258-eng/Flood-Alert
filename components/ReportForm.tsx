import React, { useState, useRef } from 'react';
import { Camera, MapPin, Upload, X, Loader2, AlertTriangle, CheckCircle2, Minus, Plus } from 'lucide-react';
import { GeoLocation, AnalysisResult, ReportStatus } from '../types';
import { analyzeFloodImage } from '../services/geminiService';
import { URGENCY_COLORS, URGENCY_LABELS } from '../constants';

const ReportForm: React.FC = () => {
  const [status, setStatus] = useState<ReportStatus>(ReportStatus.DRAFT);
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [peopleCount, setPeopleCount] = useState<number>(0);
  const [animalCount, setAnimalCount] = useState<number>(0);
  const [userNote, setUserNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setLocationError("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      return;
    }
    
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (err) => {
        setLocationError("ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาเปิด GPS");
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setAnalysis(null);
    setStatus(ReportStatus.DRAFT);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startAnalysis = async () => {
    if (!image) {
      setErrorMsg("กรุณาอัปโหลดรูปภาพก่อน");
      return;
    }
    if (!location) {
        // Optional: Can proceed without location but warn user
        const confirm = window.confirm("ยังไม่ได้ระบุตำแหน่ง GPS ดำเนินการต่อหรือไม่?");
        if (!confirm) return;
    }

    setStatus(ReportStatus.ANALYZING);
    setErrorMsg(null);

    try {
      const result = await analyzeFloodImage(image);
      setAnalysis(result);
      setPeopleCount(result.peopleCount);
      setAnimalCount(result.animalCount);
      setStatus(ReportStatus.CONFIRMING);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการวิเคราะห์");
      setStatus(ReportStatus.DRAFT);
    }
  };

  const handleSubmit = async () => {
    // In a real app, this would send data to a backend DB (Postgres/Supabase)
    // We would send peopleCount and animalCount instead of analysis.peopleCount/animalCount
    setStatus(ReportStatus.SUBMITTED);
  };

  const resetForm = () => {
    setImage(null);
    setAnalysis(null);
    setLocation(null);
    setUserNote('');
    setPeopleCount(0);
    setAnimalCount(0);
    setStatus(ReportStatus.DRAFT);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (status === ReportStatus.SUBMITTED) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-green-100 mt-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">ส่งข้อมูลสำเร็จ!</h2>
        <p className="text-gray-600 mb-6">ระบบได้รับข้อมูลและพิกัดของคุณแล้ว หน่วยงานกู้ภัยกำลังประเมินสถานการณ์</p>
        <button 
          onClick={resetForm}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
        >
          แจ้งเหตุใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      
      {/* Header Image/State */}
      <div className="relative h-64 bg-gray-100 flex items-center justify-center border-b border-gray-200">
        {image ? (
          <>
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
            {status === ReportStatus.DRAFT && (
               <button 
               onClick={removeImage}
               className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
             >
               <X className="w-5 h-5" />
             </button>
            )}
          </>
        ) : (
          <div className="text-center p-6">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-gray-500 text-sm">ถ่ายภาพหรืออัปโหลดรูปสถานการณ์น้ำท่วม</p>
          </div>
        )}
        
        {/* Loading Overlay */}
        {status === ReportStatus.ANALYZING && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <p className="text-blue-800 font-semibold animate-pulse">AI กำลังวิเคราะห์สถานการณ์...</p>
            <p className="text-xs text-blue-600 mt-1">กำลังนับจำนวนผู้ประสบภัยและประเมินความเร่งด่วน</p>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        
        {/* 1. Location Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">1. ระบุตำแหน่งของคุณ (GPS)</label>
          {location ? (
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center text-green-700">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </span>
              </div>
              <button 
                onClick={() => setLocation(null)}
                className="text-xs text-green-600 underline hover:text-green-800"
              >
                รีเซ็ต
              </button>
            </div>
          ) : (
            <button
              onClick={handleLocationClick}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span>กดเพื่อระบุตำแหน่งปัจจุบัน</span>
            </button>
          )}
          {locationError && <p className="text-red-500 text-xs mt-1">{locationError}</p>}
        </div>

        {/* 2. Upload/Input Section */}
        {status === ReportStatus.DRAFT && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">2. อัปโหลดรูปภาพเหตุการณ์</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
        )}

        {/* Analysis Results (Only visible after analysis) */}
        {analysis && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">AI</span>
                  ผลการวิเคราะห์โดยระบบ (แก้ไขได้)
                </h3>
                
                <div className={`p-4 rounded-lg border mb-4 ${URGENCY_COLORS[analysis.urgency]}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold opacity-70">ระดับความเร่งด่วน</p>
                      <p className="text-xl font-bold">{URGENCY_LABELS[analysis.urgency]}</p>
                    </div>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="text-sm mt-2 opacity-90">{analysis.reasoning}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* People Count Edit */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">คน (ระบุเพิ่มได้)</p>
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => setPeopleCount(Math.max(0, peopleCount - 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input 
                        type="number" 
                        value={peopleCount}
                        onChange={(e) => setPeopleCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center font-bold text-xl border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                      <button 
                        onClick={() => setPeopleCount(peopleCount + 1)}
                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Animal Count Edit */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">สัตว์เลี้ยง (ระบุเพิ่มได้)</p>
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => setAnimalCount(Math.max(0, animalCount - 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input 
                        type="number" 
                        value={animalCount}
                        onChange={(e) => setAnimalCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center font-bold text-xl border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                      <button 
                        onClick={() => setAnimalCount(animalCount + 1)}
                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {analysis.hasVulnerable && (
                  <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-100 flex items-center mb-3">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    พบกลุ่มเปราะบาง (คนชรา/เด็ก/ผู้ป่วย)
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic border border-gray-200">
                  "{analysis.description}"
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="เช่น เบอร์ติดต่อกลับ, สิ่งที่ต้องการเป็นพิเศษ..."
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                />
              </div>
            </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {errorMsg}
            </div>
          )}

          {status === ReportStatus.DRAFT ? (
            <button
              onClick={startAnalysis}
              disabled={!image}
              className={`w-full py-3 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center space-x-2
                ${image 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Upload className="w-5 h-5" />
              <span>เริ่มวิเคราะห์ข้อมูล</span>
            </button>
          ) : status === ReportStatus.CONFIRMING ? (
            <button
              onClick={handleSubmit}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-red-700 transition-all animate-bounce-slight flex items-center justify-center"
            >
              ยืนยันการแจ้งเหตุ
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default ReportForm;