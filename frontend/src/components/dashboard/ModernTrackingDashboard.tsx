import React, { useState } from 'react';
import {
  Package, MapPin, Truck, Calendar, Download, Plus, Phone, MessageSquare,
  MoreHorizontal, ChevronDown, CheckCircle2, Clock, ArrowUpRight, Play,
  Navigation, Box, ShieldCheck, ArrowRight, Sparkles, Filter
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

interface ShipmentItem {
  id: string;
  code: string;
  status: 'In Transit' | 'Delivered' | 'Waiting Courier';
  category: 'Document' | 'Parcel' | 'Heavy Freight';
  date: string;
  time: string;
  location: string;
  address: string;
  courierName: string;
  courierAvatar: string;
  routeFrom: string;
  routeTo: string;
  packagesCount: number;
  weight: string;
  eta: string;
  milestones: {
    title: string;
    location: string;
    time: string;
    completed: boolean;
    current?: boolean;
  }[];
}

const INITIAL_SHIPMENTS: ShipmentItem[] = [
  {
    id: '1',
    code: '#26277887-ID-YK',
    status: 'In Transit',
    category: 'Document',
    date: '06.10.2026',
    time: '08:00 AM',
    location: 'Celina, Delaware 10299',
    address: '6391 Elgin St.',
    courierName: 'Guy Hawkins',
    courierAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    routeFrom: 'New York',
    routeTo: 'Delaware',
    packagesCount: 230,
    weight: '2,415 lbs',
    eta: 'Thu, 14 October, 2026',
    milestones: [
      { title: 'Package Left Courier Facility', location: 'Naperville, United State', time: '04 October, 2026, 06:00', completed: true },
      { title: 'Departure Point', location: 'Celina, Delaware', time: '05 October, 2026, 08:00', completed: true, current: true },
      { title: 'Arrival Point', location: 'Delaware, United State', time: '10 October, 2026, 10:00', completed: false },
    ],
  },
  {
    id: '2',
    code: '#26277886-ID-KL',
    status: 'Delivered',
    category: 'Parcel',
    date: '04.10.2026',
    time: '07:00 AM',
    location: 'Inglewood, Maine 98380',
    address: '8502 Preston Rd.',
    courierName: 'Jerome Bell',
    courierAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    routeFrom: 'Boston',
    routeTo: 'Maine',
    packagesCount: 145,
    weight: '1,120 lbs',
    eta: 'Delivered on 04 October',
    milestones: [
      { title: 'Order Dispatched', location: 'Boston Central Hub', time: '02 October, 2026, 09:30', completed: true },
      { title: 'In Transit Hub', location: 'Portland Transfer Station', time: '03 October, 2026, 14:15', completed: true },
      { title: 'Delivered to Recipient', location: 'Inglewood, Maine', time: '04 October, 2026, 07:00', completed: true },
    ],
  },
  {
    id: '3',
    code: '#26277885-ID-YK',
    status: 'Waiting Courier',
    category: 'Document',
    date: '03.10.2026',
    time: '08:00 AM',
    location: 'Shiloh, Hawaii 81063',
    address: '1901 Thornridge Cir.',
    courierName: 'Esther Howard',
    courierAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    routeFrom: 'Honolulu',
    routeTo: 'Shiloh',
    packagesCount: 68,
    weight: '450 lbs',
    eta: 'Mon, 18 October, 2026',
    milestones: [
      { title: 'Shipping Label Created', location: 'Honolulu Port', time: '03 October, 2026, 08:00', completed: true },
      { title: 'Waiting for Carrier Pickup', location: 'Distribution Bay 4', time: 'Pending Assignment', completed: false, current: true },
      { title: 'Final Destination Arrival', location: 'Shiloh, Hawaii', time: 'Estimated 18 October', completed: false },
    ],
  },
];

const WORKING_HOURS_DATA: Record<string, { day: string; hours: number; avg: number }[]> = {
  W: [
    { day: 'Mon', hours: 6.8, avg: 6.0 },
    { day: 'Tue', hours: 7.4, avg: 6.2 },
    { day: 'Wed', hours: 8.1, avg: 6.5 },
    { day: 'Thu', hours: 7.2, avg: 6.3 },
    { day: 'Fri', hours: 8.5, avg: 6.7 },
    { day: 'Sat', hours: 5.4, avg: 5.0 },
    { day: 'Sun', hours: 4.8, avg: 4.5 },
  ],
  M: [
    { day: 'W1', hours: 42, avg: 38 },
    { day: 'W2', hours: 45, avg: 40 },
    { day: 'W3', hours: 49, avg: 41 },
    { day: 'W4', hours: 44, avg: 39 },
  ],
  '6M': [
    { day: 'May', hours: 168, avg: 160 },
    { day: 'Jun', hours: 182, avg: 165 },
    { day: 'Jul', hours: 195, avg: 170 },
    { day: 'Aug', hours: 174, avg: 168 },
    { day: 'Sep', hours: 188, avg: 172 },
    { day: 'Oct', hours: 192, avg: 175 },
  ],
  Y: [
    { day: 'Q1', hours: 520, avg: 490 },
    { day: 'Q2', hours: 545, avg: 510 },
    { day: 'Q3', hours: 580, avg: 530 },
    { day: 'Q4', hours: 560, avg: 520 },
  ],
};

export function ModernTrackingDashboard() {
  const navigate = useNavigate();
  const [selectedShipment, setSelectedShipment] = useState<ShipmentItem>(INITIAL_SHIPMENTS[0]);
  const [timePeriod, setTimePeriod] = useState<'W' | 'M' | '6M' | 'Y'>('W');
  const [contactFeedback, setContactFeedback] = useState<string | null>(null);

  const handleContact = (type: 'chat' | 'call', courier: string) => {
    setContactFeedback(`${type === 'chat' ? 'Opening chat with' : 'Initiating call to'} ${courier}...`);
    setTimeout(() => setContactFeedback(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      {/* Toast Feedback Notification */}
      {contactFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1628] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#e89b1a]" />
          <span className="text-xs font-medium">{contactFeedback}</span>
        </div>
      )}

      {/* ── TOP SECTION: Header & 3 KPI Metric Cards ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        {/* Title + Date Pill */}
        <div className="flex flex-col gap-2.5 shrink-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1628] tracking-tight">
            Tracking Order Summary
          </h1>
          <div className="inline-flex items-center gap-2 bg-[#0B1628] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e89b1a]" />
            Tue, 10 October 2026
          </div>
        </div>

        {/* 3 KPI Metric Cards matching inspiration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {/* Total Shipments */}
          <div className="bg-white rounded-[24px] p-4.5 border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Box className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Shipments</p>
                <p className="text-2xl font-black text-[#0B1628] mt-0.5">876</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              +3.45% ↗
            </span>
          </div>

          {/* Package Tracking */}
          <div className="bg-white rounded-[24px] p-4.5 border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#e89b1a]/5 border border-[#e89b1a]/20 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#e89b1a]" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Package Tracking</p>
                <p className="text-2xl font-black text-[#0B1628] mt-0.5">241</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#e89b1a] bg-[#e89b1a]/5 border border-[#e89b1a]/20 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              -2.95% ↘
            </span>
          </div>

          {/* Total Delivered */}
          <div className="bg-white rounded-[24px] p-4.5 border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Delivered</p>
                <p className="text-2xl font-black text-[#0B1628] mt-0.5">1,245</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              +1.47% ↗
            </span>
          </div>
        </div>
      </div>

      {/* ── SUB-ACTION TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Database Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0B1628] text-white flex items-center justify-center shadow-xs">
            <Box size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0B1628] leading-tight">Order List Database</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar size={11} /> Tuesday, 10 October 2026
            </p>
          </div>
        </div>

        {/* Action Buttons: Status pill, Download, Create */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Pending Status Filter Pill */}
          <button className="inline-flex items-center gap-1.5 bg-[#FFF0EB] text-[#E06045] hover:bg-[#FFE5DC] px-4 py-2 rounded-full text-xs font-bold transition-all">
            Pending Shipment (5)
            <ChevronDown size={14} />
          </button>

          {/* Download Report Button */}
          <button
            onClick={() => handleContact('chat', 'Reports Export')}
            className="inline-flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full text-xs font-bold shadow-xs transition-all"
          >
            <Download size={14} className="text-slate-500" />
            Download Report
          </button>

          {/* Create Shipment / Task Button */}
          <button
            onClick={() => navigate('/tasks/new')}
            className="inline-flex items-center gap-1.5 bg-[#e89b1a] text-white hover:bg-[#f4b728] px-5 py-2 rounded-full text-xs font-bold shadow-md shadow-[#e89b1a]/25 transition-all active:scale-[0.98]"
          >
            <Plus size={15} />
            Create Shipment
          </button>
        </div>
      </div>

      {/* ── 3-COLUMN MODERN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── COLUMN 1: Shipment / Task Card List (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {INITIAL_SHIPMENTS.map((item) => {
            const isSelected = selectedShipment.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedShipment(item)}
                className={`p-5 rounded-[24px] cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-white border-2 border-[#e89b1a] shadow-lg shadow-[#e89b1a]/5 ring-4 ring-[#e89b1a]/5'
                    : 'bg-white border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.02)] hover:border-slate-300'
                }`}
              >
                {/* ID Header & Badge Pills */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-base font-extrabold text-[#0B1628] tracking-tight">
                    ID: {item.code}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.status === 'In Transit'
                          ? 'bg-sky-50 text-sky-600 border-sky-150'
                          : item.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-150'
                          : 'bg-[#e89b1a]/5 text-[#e89b1a] border-[#e89b1a]/20'
                      }`}
                    >
                      {item.status}
                    </span>
                    {/* Category Pill */}
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-150">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Date and Address bullet point */}
                <div className="flex items-start gap-2 text-xs text-slate-600 mb-4 pl-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#e89b1a] shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-800">{item.date} · {item.time}</p>
                    <p className="text-slate-500 mt-0.5">{item.location}</p>
                    <p className="text-slate-400 text-[11px]">{item.address}</p>
                  </div>
                </div>

                {/* Courier / Assignee snippet with chat & call pills */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.courierAvatar}
                      alt={item.courierName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
                    />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courier</p>
                      <p className="text-xs font-bold text-slate-800">{item.courierName}</p>
                    </div>
                  </div>

                  {/* Micro action contact pills */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleContact('chat', item.courierName); }}
                      className="w-8 h-8 rounded-full bg-[#e89b1a]/5 text-[#e89b1a] hover:bg-[#e89b1a]/10 flex items-center justify-center transition-colors"
                      title="Send message"
                    >
                      <MessageSquare size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleContact('call', item.courierName); }}
                      className="w-8 h-8 rounded-full bg-[#e89b1a]/5 text-[#e89b1a] hover:bg-[#e89b1a]/10 flex items-center justify-center transition-colors"
                      title="Call courier"
                    >
                      <Phone size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── COLUMN 2: GPS Vector Route Map & Package Milestone Status (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Interactive GPS Map Card */}
          <div className="bg-white rounded-[26px] p-5 border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Map Canvas with SVG Vector City Map */}
            <div className="relative w-full h-64 rounded-2xl bg-[#EFF3F6] overflow-hidden border border-slate-200/50 shadow-inner">
              <svg className="w-full h-full" viewBox="0 0 400 260" preserveAspectRatio="none">
                {/* Background Land */}
                <rect width="400" height="260" fill="#E8EDF2" />

                {/* Parks / Green Zones */}
                <path d="M 10 10 Q 80 40 120 20 T 180 80 L 160 140 L 40 120 Z" fill="#D5E8C8" opacity="0.9" />
                <path d="M 260 30 Q 320 20 370 70 L 390 160 L 300 130 Z" fill="#D5E8C8" opacity="0.85" />
                <path d="M 220 180 Q 280 170 340 240 L 250 255 Z" fill="#D5E8C8" opacity="0.9" />

                {/* City Road Network */}
                <path d="M 0 50 L 400 70 M 0 130 L 400 120 M 0 200 L 400 210" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
                <path d="M 70 0 L 90 260 M 180 0 L 160 260 M 270 0 L 290 260 M 350 0 L 340 260" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
                
                {/* Secondary Streets */}
                <path d="M 40 70 L 160 120 M 180 120 L 270 200 M 120 200 L 220 260" stroke="#F6F8FA" strokeWidth="4" />

                {/* Active Transit Curve Line */}
                <path
                  d="M 60 190 C 80 120, 160 140, 190 100 S 260 70, 310 90"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray="6 3"
                  className="animate-pulse"
                />

                {/* Route Start Point */}
                <circle cx="60" cy="190" r="7" fill="#2563EB" stroke="#FFFFFF" strokeWidth="3" />
                
                {/* Mid Waypoint Indicator */}
                <circle cx="190" cy="100" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />

                {/* Route End Point - Vibrant Red Pin */}
                <circle cx="310" cy="90" r="9" fill="#e89b1a" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="310" cy="90" r="16" fill="#e89b1a" opacity="0.25" className="animate-ping" />
              </svg>

              {/* Floating Package Tracking Popover matching mockup */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-lg max-w-[210px] animate-fade-in">
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className="text-[11px] font-extrabold text-slate-800 truncate">
                    {selectedShipment.code}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-150">
                    In Transit
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
                  <div className="bg-[#e89b1a] h-full rounded-full w-2/3" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>04 Oct, 2026</span>
                  <span>10 Oct, 2026</span>
                  <button className="w-5 h-5 rounded-full bg-[#0B1628] text-white flex items-center justify-center hover:scale-105 transition-transform">
                    <Play size={8} className="fill-white translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Route Summary specs */}
            <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0B1628] text-white flex items-center justify-center shrink-0">
                  <Navigation size={13} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Package Route</p>
                  <p className="text-xs font-bold text-slate-800">{selectedShipment.routeFrom} - {selectedShipment.routeTo}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Packages</p>
                <p className="text-base font-extrabold text-[#0B1628]">{selectedShipment.packagesCount}</p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0B1628] text-white flex items-center justify-center shrink-0">
                  <Clock size={13} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Delivery Date</p>
                  <p className="text-xs font-bold text-slate-800">{selectedShipment.eta}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                <p className="text-base font-extrabold text-[#0B1628]">{selectedShipment.weight}</p>
              </div>
            </div>
          </div>

          {/* Package Status Milestone Stepper Card */}
          <div className="bg-white rounded-[26px] p-6 border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-[#0B1628]">Package Status</h3>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="relative pl-6 space-y-6">
              {/* Stepper Vertical Dashed Line */}
              <div className="absolute left-[7px] top-2.5 bottom-2.5 w-0.5 border-l-2 border-dashed border-slate-200" />

              {selectedShipment.milestones.map((step, idx) => (
                <div key={idx} className="relative flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                      step.completed
                        ? 'bg-[#e89b1a] ring-2 ring-[#e89b1a]/20'
                        : 'bg-slate-300'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.location}</p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap sm:text-right">
                    {step.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: Fleet/Asset Showcase & Performance Analytics (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Deigo Transportation / Asset Container Showcase Card */}
          <div className="bg-white rounded-[26px] p-6 border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#e89b1a] text-white flex items-center justify-center">
                  <Box size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628]">Deigo Transportation</h3>
              </div>
              <button className="w-6 h-6 rounded-full bg-[#e89b1a]/5 text-[#e89b1a] hover:bg-[#e89b1a]/10 flex items-center justify-center transition-colors">
                <Plus size={14} />
              </button>
            </div>

            {/* Container Specs & Visual */}
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Payload</p>
                  <p className="text-base font-black text-[#0B1628]">2,415 lbs</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Load Volume</p>
                  <p className="text-base font-black text-[#0B1628]">312 in</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Load Length</p>
                  <p className="text-base font-black text-[#0B1628]">217 in</p>
                </div>
              </div>

              {/* Stylized 3D Cargo Container Illustration */}
              <div className="relative w-44 h-32 flex items-center justify-center">
                <div className="w-full h-24 bg-gradient-to-tr from-slate-900 via-neutral-900 to-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700 relative transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  {/* Container Ridges Pattern */}
                  <div className="absolute inset-0 flex divide-x divide-white/10">
                    <div className="flex-1 bg-red-600/30" />
                    <div className="flex-1" />
                    <div className="flex-1 bg-red-600/40" />
                    <div className="flex-1" />
                    <div className="flex-1 bg-red-600/30" />
                    <div className="flex-1" />
                  </div>
                  {/* Container Logo Branding */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-white font-black text-sm tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-[#e89b1a]" />
                    <span>DEIGO</span>
                  </div>
                  {/* Accent Stripes */}
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-[#e89b1a]/20 blur-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Driver / Team Statistic Segmented Bar Card */}
          <div className="bg-white rounded-[26px] p-6 border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#0B1628]">Driver Statistic</h3>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 h-10 sm:h-11 w-full overflow-hidden">
                {/* 67.86% Black Segment */}
                <div
                  style={{ flex: 68 }}
                  className="h-full bg-slate-950 text-white rounded-l-xl px-2 sm:px-3 flex items-center justify-start text-[11px] sm:text-xs font-black min-w-0"
                >
                  <span className="truncate">67.8%</span>
                </div>
                {/* 22.32% Coral Pink Segment */}
                <div
                  style={{ flex: 22 }}
                  className="h-full bg-[#e89b1a]/10 text-[#e89b1a] px-1.5 sm:px-2.5 flex items-center justify-start text-[11px] sm:text-xs font-black min-w-0"
                >
                  <span className="truncate">22.3%</span>
                </div>
                {/* 9.82% Soft Gray Segment */}
                <div
                  style={{ flex: 10 }}
                  className="h-full bg-slate-100 text-slate-600 rounded-r-xl px-1 sm:px-2 flex items-center justify-center text-[10px] sm:text-xs font-black min-w-0"
                >
                  <span className="truncate">9.9%</span>
                </div>
              </div>

              {/* Legend labels */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-950" />
                  On The way
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e89b1a]/50" />
                  Unloading
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  Waiting
                </span>
              </div>
            </div>
          </div>

          {/* Working Time Per Day Bar Chart Card */}
          <div className="bg-white rounded-[26px] p-6 border border-slate-200/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#0B1628]">Working Time Per Day</h3>
              {/* Period selector pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-bold">
                {(['W', 'M', '6M', 'Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-2.5 py-0.5 rounded-full transition-all ${
                      timePeriod === period
                        ? 'bg-[#0B1628] text-white shadow-xs'
                        : 'text-slate-500 hover:text-[#0B1628]'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Coral Bar Chart */}
            <div className="w-full h-44 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WORKING_HOURS_DATA[timePeriod]} barSize={14}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="hours" fill="#e89b1a" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#e89b1a]" />
                Working Time
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Average working time
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
