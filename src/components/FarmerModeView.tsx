import React, { useState, useMemo } from 'react';
import { 
  Sprout, 
  CloudRain, 
  Sun, 
  Droplets, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Calendar, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Layers,
  Thermometer,
  Compass,
  ChevronDown,
  ShieldAlert,
  Clock,
  Send,
  RefreshCw,
  Bot
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';
import { PRESET_LOCATIONS } from '../data/presetLocations';
import { queryAgronomicAi } from '../services/agronomicAiService';

interface FarmerModeViewProps {
  currentLocation: StudyLocation;
  data: any[];
  statistics: any;
  onSelectLocation: (loc: StudyLocation) => void;
  onSwitchToResearcher: () => void;
  onOpenReportModal: () => void;
}

type SupportedLanguage = 'en' | 'hi' | 'mr' | 'es';

const TRANSLATIONS: Record<SupportedLanguage, {
  tagline: string;
  fiveQuestionsTitle: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  todayAction: string;
  tomorrowAction: string;
  waterNeed: string;
  watchOut: string;
  listenAudio: string;
  speaking: string;
  farmSetup: string;
  cropLabel: string;
  areaLabel: string;
  irrigationMethodLabel: string;
  actionPlanTitle: string;
  todayLabel: string;
  tomorrowLabel: string;
  threeDaysLabel: string;
  sevenDaysLabel: string;
}> = {
  en: {
    tagline: 'Simple, direct farming advice powered by NASA satellite observations.',
    fiveQuestionsTitle: '5 Key Questions Answered for Your Farm Today',
    q1: 'What is the weather today?',
    q2: 'Will it rain?',
    q3: 'What should I do on my farm today?',
    q4: 'How much water do my crops need?',
    q5: 'What problems should I watch out for?',
    todayAction: 'Safe for field operations. Avoid spraying chemicals if wind exceeds 15 km/h.',
    tomorrowAction: 'Warm and mostly dry conditions. Check soil moisture before turning on pumps.',
    waterNeed: 'Approximately 4.5 mm of water (45,000 Litres per hectare or 18 Litres per sugarcane clump).',
    watchOut: 'Moderate daytime heat. Water seedlings in the early morning or evening to prevent evaporation.',
    listenAudio: 'Listen to Advice (Voice)',
    speaking: 'Playing Advice...',
    farmSetup: 'Your Farm Profile',
    cropLabel: 'Cultivated Crop',
    areaLabel: 'Farm Size',
    irrigationMethodLabel: 'Irrigation Type',
    actionPlanTitle: 'Farm Action Calendar',
    todayLabel: 'Today',
    tomorrowLabel: 'Tomorrow',
    threeDaysLabel: 'Next 3 Days',
    sevenDaysLabel: 'Next 7 Days',
  },
  hi: {
    tagline: 'नासा उपग्रह डेटा द्वारा संचालित आपके खेत के लिए सरल और प्रत्यक्ष सलाह।',
    fiveQuestionsTitle: 'आज आपके खेत के लिए 5 मुख्य सवाल और जवाब',
    q1: 'आज मौसम कैसा रहेगा?',
    q2: 'क्या आज बारिश होगी?',
    q3: 'आज मुझे अपने खेत में क्या करना चाहिए?',
    q4: 'मेरी फसल को कितने पानी की आवश्यकता है?',
    q5: 'मुझे किन समस्याओं से सावधान रहना चाहिए?',
    todayAction: 'खेत के काम के लिए अनुकूल। यदि हवा 15 किमी/घंटा से तेज हो तो छिड़काव न करें।',
    tomorrowAction: 'मौसम गर्म और सूखा रहेगा। पानी देने से पहले मिट्टी की नमी जांचें।',
    waterNeed: 'लगभग 4.5 मिमी पानी (प्रति हेक्टेयर 45,000 लीटर या प्रति गन्ना पौधा 18 लीटर)।',
    watchOut: 'दोपहर की गर्मी से बचें। वाष्पीकरण रोकने के लिए सुबह या शाम को सिंचाई करें।',
    listenAudio: 'सलाह सुनें (आवाज़)',
    speaking: 'सलाह पढ़ रहे हैं...',
    farmSetup: 'आपके खेत का विवरण',
    cropLabel: 'फसल का प्रकार',
    areaLabel: 'खेत का आकार',
    irrigationMethodLabel: 'सिंचाई का प्रकार',
    actionPlanTitle: 'खेत कार्य योजना',
    todayLabel: 'आज',
    tomorrowLabel: 'कल',
    threeDaysLabel: 'अगले 3 दिन',
    sevenDaysLabel: 'अगले 7 दिन',
  },
  mr: {
    tagline: 'नासा उपग्रह माहितीवर आधारित तुमच्या शेतासाठी सोपा आणि थेट कृषी सल्ला.',
    fiveQuestionsTitle: 'आज तुमच्या शेतासाठी ५ महत्त्वाची उत्तरे',
    q1: 'आज हवामान कसे आहे?',
    q2: 'आज पाऊस पडेल का?',
    q3: 'आज शेतात काय काम करावे?',
    q4: 'माझ्या पिकाला किती पाणी लागेल?',
    q5: 'कोणत्या रोगांवर किंवा किडीवर लक्ष ठेवावे?',
    todayAction: 'शेतातील कामासाठी दिवस चांगला आहे. वारा १५ किमीपेक्षा जास्त असल्यास फवारणी टाळा.',
    tomorrowAction: 'हवामान उबदार आणि कोरडे राहील. पाणी देण्यापूर्वी जमिनीतील ओलावा तपासा.',
    waterNeed: 'साधारण ४.५ मिमी पाणी (हेक्टरी ४५,००० लिटर किंवा प्रति उसाच्या खोडास १८ लिटर).',
    watchOut: 'दुपारचे कडक ऊन. बाष्पीभवन टाळण्यासाठी सकाळी लवकर किंवा संध्याकाळी पाणी द्या.',
    listenAudio: 'सल्ला ऐका (आवाज)',
    speaking: 'सल्ला ऐकवत आहे...',
    farmSetup: 'तुमच्या शेताची माहिती',
    cropLabel: 'निवडलेले पीक',
    areaLabel: 'शेताचे क्षेत्रफळ',
    irrigationMethodLabel: 'पाणी देण्याची पद्धत',
    actionPlanTitle: 'शेती कामाचे वेळापत्रक',
    todayLabel: 'आज',
    tomorrowLabel: 'उद्या',
    threeDaysLabel: 'पुढील ३ दिवस',
    sevenDaysLabel: 'पुढील ७ दिवस',
  },
  es: {
    tagline: 'Asesoramiento agrícola simple respaldado por observaciones satelitales de la NASA.',
    fiveQuestionsTitle: '5 Preguntas Clave Respondidas Para Su Parcela',
    q1: '¿Cómo está el clima hoy?',
    q2: '¿Va a llover?',
    q3: '¿Qué debo hacer en mi campo hoy?',
    q4: '¿Cuánta agua necesitan mis cultivos?',
    q5: '¿De qué problemas debo cuidarme?',
    todayAction: 'Seguro para labores de campo. Evite fumigar si el viento supera los 15 km/h.',
    tomorrowAction: 'Condiciones secas y cálidas. Compruebe la humedad del suelo antes de regar.',
    waterNeed: 'Aproximadamente 4.5 mm de agua (45,000 Litros por hectárea).',
    watchOut: 'Calor diurno moderado. Riegue temprano en la mañana o al atardecer para evitar la evaporación.',
    listenAudio: 'Escuchar Consejo (Voz)',
    speaking: 'Reproduciendo...',
    farmSetup: 'Perfil de su Parcela',
    cropLabel: 'Cultivo',
    areaLabel: 'Superficie',
    irrigationMethodLabel: 'Método de Riego',
    actionPlanTitle: 'Calendario Agrícola',
    todayLabel: 'Hoy',
    tomorrowLabel: 'Mañana',
    threeDaysLabel: 'Próximos 3 Días',
    sevenDaysLabel: 'Próximos 7 Días',
  },
};

export const FarmerModeView: React.FC<FarmerModeViewProps> = ({
  currentLocation,
  data,
  statistics,
  onSelectLocation,
  onSwitchToResearcher,
  onOpenReportModal,
}) => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [selectedCrop, setSelectedCrop] = useState<string>('Sugarcane');
  const [farmAcres, setFarmAcres] = useState<number>(2.5);
  const [irrigationType, setIrrigationType] = useState<string>('Drip Irrigation');
  const [soilType, setSoilType] = useState<string>('Black Vertisol Clay');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // AI Farm Advisor State
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isAskingAi, setIsAskingAi] = useState<boolean>(false);
  const [aiAdviceResponse, setAiAdviceResponse] = useState<{
    question: string;
    answer: string;
    model: string;
  } | null>(null);

  const t = TRANSLATIONS[lang];

  // Weather data derivatives
  const tempMean = statistics?.t2m?.mean ? Math.round(statistics.t2m.mean) : 29;
  const tempMax = statistics?.t2m_max?.max ? Math.round(statistics.t2m_max.max) : 36;
  const totalRain = statistics?.precip?.sum ? Math.round(statistics.precip.sum) : 480;

  // Simple water volume calculations for farmers
  const litersPerDay = Math.round(farmAcres * 4046.86 * 4.5); // 4.5 mm/day over field
  const litersPerPlant = selectedCrop === 'Sugarcane' ? 18 : selectedCrop === 'Cotton' ? 8 : selectedCrop === 'Pomegranate' ? 45 : 12;

  // Text to Speech Handler
  const handlePlayVoice = (textOverride?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speechText = textOverride || `${t.q1}: ${tempMean} degrees. ${t.q2}: Low chance today. ${t.q3}: ${t.todayAction} ${t.q4}: ${t.waterNeed} ${t.q5}: ${t.watchOut}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'mr') utterance.lang = 'mr-IN';
    else if (lang === 'es') utterance.lang = 'es-ES';
    else utterance.lang = 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleAskFarmerAi = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const query = presetQuery || customQuestion;
    if (!query.trim() || isAskingAi) return;

    setIsAskingAi(true);
    try {
      const res = await queryAgronomicAi({
        prompt: query,
        location: currentLocation,
        agronomicContext: {
          crop: selectedCrop,
          soilType: soilType,
          irrigationType: irrigationType,
          farmAcres: farmAcres,
        },
        recentTelemetry: {
          tempMean: tempMean,
          tempMax: tempMax,
          precipitation: 0,
        },
        mode: 'farmer',
        language: lang,
      });

      setAiAdviceResponse({
        question: query,
        answer: res.answer,
        model: `${res.provider} (${res.model})`,
      });
      setCustomQuestion('');
    } catch (err) {
      console.error('Farmer AI query error:', err);
    } finally {
      setIsAskingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Top Banner: Mode Indicator & Voice / Language Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
              <Sprout className="w-4 h-4" />
              <span>FARMER ADVISORY MODE</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">NASA Space Apps Challenge 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Farm Weather & Crop Guide: <span className="text-emerald-700">{currentLocation.name}</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">{t.tagline}</p>
        </div>

        {/* Audio Button & Language Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => handlePlayVoice()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isSpeaking
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? t.speaking : t.listenAudio}</span>
          </button>

          {/* Language selector */}
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-100 p-0.5 text-xs font-semibold">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिन्दी' },
              { id: 'mr', label: 'मराठी' },
              { id: 'es', label: 'Español' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setLang(item.id as SupportedLanguage)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  lang === item.id
                    ? 'bg-white text-emerald-800 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={onSwitchToResearcher}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Switch to Researcher Mode →
          </button>
        </div>
      </div>

      {/* 5 Core Questions Grid (The centerpiece of Farmer Mode) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{t.fiveQuestionsTitle}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Question 1: Weather today */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Question 1</span>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t.q1}</h3>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {tempMean}°C <span className="text-xs font-normal text-slate-500 font-sans">(Max {tempMax}°C)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Warm sunshine with mild wind. Good conditions for weeding, harvesting, and field work.
            </p>
          </div>

          {/* Question 2: Will it rain? */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Question 2</span>
              <CloudRain className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t.q2}</h3>
            <div className="text-lg font-extrabold text-blue-700">
              Low Chance of Rain (15%)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clear to partly cloudy. No heavy downpours expected in the next 48 hours.
            </p>
          </div>

          {/* Question 3: What should I do on my farm? */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Question 3</span>
              <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t.q3}</h3>
            <div className="text-xs font-bold text-emerald-800">
              {t.todayAction}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintain weed-free ridges and ensure drip lines are unclogged before scheduled watering.
            </p>
          </div>

          {/* Question 4: How much water? */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Question 4</span>
              <Droplets className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t.q4}</h3>
            <div className="text-base font-extrabold text-teal-800 font-mono">
              ~{litersPerPlant} Litres / plant
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Total demand for your {farmAcres} acres: approximately {litersPerDay.toLocaleString()} Litres today.
            </p>
          </div>

          {/* Question 5: What problems to watch out for? */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Question 5</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t.q5}</h3>
            <div className="text-xs font-bold text-amber-900">
              {t.watchOut}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mt-1">
              • <strong>Pest Watch</strong>: Dry warm spells favor sucking pests (thrips & aphids). Inspect leaf undersides.<br />
              • <strong>Heat Protection</strong>: If temperatures rise above 38°C, apply straw mulching to conserve root zone moisture.
            </p>
          </div>
        </div>
      </div>

      {/* AI Farm Advisory Assistant (Powered by Groq Cloud Llama 3.3 70B) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-700" />
              <span>
                {lang === 'hi'
                  ? 'एआई कृषि सलाहकार से कोई भी सवाल पूछें'
                  : lang === 'mr'
                  ? 'एआय कृषी सल्लागारास प्रश्न विचारा'
                  : lang === 'es'
                  ? 'Consulte al Asesor Agrícola Inteligente'
                  : 'Ask AI Farm Advisor (Direct Question)'}
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === 'hi'
                ? 'नासा मौसम डेटा और ग्रोक एलएलएम द्वारा संचालित तुरंत सटीक सलाह'
                : lang === 'mr'
                ? 'नासा उपग्रह निरीक्षणे आणि ग्रोक तंत्रज्ञानावर आधारित तात्काळ मार्गदर्शन'
                : lang === 'es'
                ? 'Consejo inmediato respaldado por datos satelitales de la NASA y Groq Llama-3.3-70B'
                : 'Instant advice grounded in NASA POWER telemetry and tailored for your selected crop.'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-900 shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Groq Llama-3.3-70B Active</span>
          </div>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {lang === 'hi' ? 'सुझाए गए प्रश्न:' : lang === 'mr' ? 'सुचवलेले प्रश्न:' : lang === 'es' ? 'Preguntas rápidas:' : 'Quick Questions:'}
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              lang === 'hi'
                ? 'उर्वरक देने का सबसे अच्छा समय कब है?'
                : lang === 'mr'
                ? 'खते देण्याची सर्वोत्तम वेळ कोणती?'
                : lang === 'es'
                ? '¿Cuál es el mejor momento para regar?'
                : `What is the optimal watering time for ${selectedCrop}?`,
              lang === 'hi'
                ? 'गर्मियों में वाष्पीकरण कैसे कम करें?'
                : lang === 'mr'
                ? 'उन्हाळ्यात बाष्पीभवन कसे रोखावे?'
                : lang === 'es'
                ? '¿Cómo proteger el suelo de la evaporación?'
                : 'How can I prevent soil moisture evaporation in clay?',
              lang === 'hi'
                ? 'कीटों से बचाव के प्राकृतिक उपाय क्या हैं?'
                : lang === 'mr'
                ? 'किडीपासून संरक्षणासाठी सेंद्रिय उपाय काय आहेत?'
                : lang === 'es'
                ? '¿Cómo prevenir plagas con métodos orgánicos?'
                : 'What organic treatment protects against sucking pests?',
            ].map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskFarmerAi(undefined, promptText)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200 text-left font-medium"
              >
                "{promptText}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => handleAskFarmerAi(e)} className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            disabled={isAskingAi}
            placeholder={
              lang === 'hi'
                ? 'जैसे: क्या मुझे कल कीटनाशक छिड़कना चाहिए? या पानी कितने घंटे चलाऊं?'
                : lang === 'mr'
                ? 'उदा: उद्या फवारणी करणे योग्य आहे का? किंवा ठिबक किती तास चालवावे?'
                : lang === 'es'
                ? 'p. ej. ¿Debo fertilizar hoy o esperar al fin de semana?'
                : `Ask any farm question for ${selectedCrop} (${farmAcres} acres in ${currentLocation.name})...`
            }
            className="flex-1 p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={isAskingAi || !customQuestion.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isAskingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {lang === 'hi' ? 'सलाह तैयार हो रही है...' : lang === 'mr' ? 'माहिती शोधत आहे...' : 'Analyzing...'}
                </span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>
                  {lang === 'hi' ? 'सलाह लें' : lang === 'mr' ? 'सल्ला विचारा' : lang === 'es' ? 'Consultar' : 'Ask Advisor'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Display Active AI Advice */}
        {aiAdviceResponse && (
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                {lang === 'hi' ? 'सवाल:' : lang === 'mr' ? 'प्रश्न:' : 'Question:'} "{aiAdviceResponse.question}"
              </span>
              <button
                type="button"
                onClick={() => handlePlayVoice(aiAdviceResponse.answer)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
              >
                <Volume2 className="w-3 h-3" />
                <span>{lang === 'hi' ? 'जवाब सुनें' : lang === 'mr' ? 'उत्तर ऐका' : 'Listen'}</span>
              </button>
            </div>
            <p className="text-slate-800 leading-relaxed bg-white p-3.5 rounded-lg border border-emerald-200 whitespace-pre-line font-medium">
              {aiAdviceResponse.answer}
            </p>
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Grounded in NASA POWER Satellite Telemetry</span>
              <span>{aiAdviceResponse.model}</span>
            </div>
          </div>
        )}
      </div>

      {/* Farm Profile Configuration & Action Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Farm Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>{t.farmSetup}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">{t.cropLabel}</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
              >
                <option value="Sugarcane">Sugarcane (ऊस / गन्ना)</option>
                <option value="Cotton">Cotton (कापूस / कपास)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Wheat">Wheat (गहू / गेहूं)</option>
                <option value="Maize">Maize / Corn (मका / मक्का)</option>
                <option value="Onion">Onion (कांदा / प्याज)</option>
                <option value="Pomegranate">Pomegranate (डाळिंब / अनार)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t.areaLabel}: <span className="text-emerald-700 font-bold">{farmAcres} Acres</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={farmAcres}
                onChange={(e) => setFarmAcres(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">{t.irrigationMethodLabel}</label>
              <select
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
              >
                <option value="Drip Irrigation">Drip Irrigation (ठिबक सिंचन - 90% Saving)</option>
                <option value="Sprinkler">Sprinkler (तुषार सिंचन)</option>
                <option value="Flood / Furrow">Flood / Furrow (पाट पाणी / खुला प्रवाह)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Soil Type</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
              >
                <option value="Black Vertisol Clay">Heavy Black Clay (काळी / भारी जमीन)</option>
                <option value="Medium Loam">Medium Loam (मध्यम जमीन)</option>
                <option value="Sandy Soil">Light Sandy Soil (हलकी / वालुकामय जमीन)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={onOpenReportModal}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Export Printed Farm Guide (PDF)
            </button>
          </div>
        </div>

        {/* Right Columns: Farm Action Calendar (Today, Tomorrow, 3 Days, 7 Days) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{t.actionPlanTitle} ({selectedCrop})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Location: {currentLocation.name}</span>
          </div>

          <div className="space-y-3">
            {/* Today */}
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/40 flex items-start gap-3">
              <div className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-bold text-xs shrink-0 mt-0.5">
                {t.todayLabel}
              </div>
              <div className="text-xs text-slate-800 space-y-1">
                <div className="font-bold text-slate-900">Normal Drip Irrigation Cycle</div>
                <p>Run drip system for 2.5 hours in the morning. Check soil wetness 10 cm below surface before starting.</p>
              </div>
            </div>

            {/* Tomorrow */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <div className="px-2.5 py-1 rounded-md bg-slate-800 text-white font-bold text-xs shrink-0 mt-0.5">
                {t.tomorrowLabel}
              </div>
              <div className="text-xs text-slate-800 space-y-1">
                <div className="font-bold text-slate-900">Foliar Nutrition / Organic Spray Window</div>
                <p>Early morning winds will be calm (&lt;8 km/h). Suitable window for micronutrient or neem oil spray if required.</p>
              </div>
            </div>

            {/* Next 3 Days */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <div className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-bold text-xs shrink-0 mt-0.5">
                {t.threeDaysLabel}
              </div>
              <div className="text-xs text-slate-800 space-y-1">
                <div className="font-bold text-slate-900">Rising Daytime Temperatures</div>
                <p>Expect highs up to {tempMax + 1}°C. Keep furrows covered with trash mulch to retain root moisture.</p>
              </div>
            </div>

            {/* Next 7 Days */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <div className="px-2.5 py-1 rounded-md bg-blue-700 text-white font-bold text-xs shrink-0 mt-0.5">
                {t.sevenDaysLabel}
              </div>
              <div className="text-xs text-slate-800 space-y-1">
                <div className="font-bold text-slate-900">Weekly Fertilizer & Root Health Check</div>
                <p>Fertigate with split Nitrogen dose through drip venturi. Inspect field borders for pest migration.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
