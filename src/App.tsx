/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: Position;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  managerName: string;
  managerPhone?: string;
  managerId?: string; // For role-based filtering
  players: Player[];
  group?: string;
  code?: string; // e.g., A1, B2
}

export interface Goal {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  minute: number;
  type: 'padang' | 'sepakanPercuma' | 'penalti' | 'golSendiri';
}

export interface Card {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  type: 'kuning' | 'merah';
  minute: number;
  reason: string;
}

export type MatchStatus = 'akanDatang' | 'sedangBerlangsung' | 'tamatPerlawanan' | 'ditangguhkan';

export interface Match {
  id: string;
  matchCode: string;
  date: string;
  time: string;
  venue: string;
  stage: 'kumpulan' | 'pusingan16' | 'sukuAkhir' | 'separuhAkhir' | 'penentuanTempat3' | 'akhir';
  group?: string;
  status: MatchStatus;
  team1Id: string;
  team2Id: string;
  score1?: number;
  score2?: number;
  penaltyScore1?: number;
  penaltyScore2?: number;
  isKnockout?: boolean;
  goals: Goal[];
  cards: Card[];
}

export interface BentoItem {
  id: 'organizer' | 'manager' | 'dates' | 'time' | 'venue' | 'location';
  size: 'small' | 'medium' | 'large';
  order: number;
}

export interface TournamentInfo {
  title: string;
  logoUrl: string;
  organizer: string;
  organizerLogoUrl?: string;
  manager: string;
  managerLogoUrl?: string;
  startDate: string;
  endDate: string;
  time: string;
  venue: string;
  mapUrl: string;
  motivationQuote: string;
  isRegistrationOpen: boolean;
  bentoLayout?: BentoItem[];
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
}

export interface AppData {
  tournamentInfo: TournamentInfo;
  teams: Team[];
  matches: Match[];
  groups: string[];
  quickLinks: QuickLink[];
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Info, Calendar, BarChart3, Lock, User, Shield, LogOut, 
  MapPin, Trophy, Users, RefreshCw, AlertCircle, Clock,
  ListOrdered, AlertTriangle, Medal, X, Plus, Edit, Trash2, FileText, Settings, ShieldAlert,
  Globe, Menu, ExternalLink, ChevronRight, Target, Quote,
  Maximize2, LayoutGrid, Map, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const statusPriority: Record<MatchStatus, number> = {
  'sedangBerlangsung': 0,
  'akanDatang': 1,
  'ditangguhkan': 2,
  'tamatPerlawanan': 3
};

const sortMatches = (matches: Match[]) => {
  return [...matches].sort((a, b) => {
    const pA = statusPriority[a.status] ?? 99;
    const pB = statusPriority[b.status] ?? 99;
    if (pA !== pB) return pA - pB;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
};

type UserRole = 'Public' | 'Urusetia' | 'Pengurus';
type Language = 'BM';

const translations = {
  BM: {
    maklumat: "Maklumat",
    jadual: "Jadual & Kedudukan",
    statistik: "Statistik",
    logMasuk: "Log Masuk",
    logout: "Log Keluar",
    panelUrusetia: "Panel Urusetia",
    panelPengurus: "Panel Pengurus",
    countdown: "Kiraan Detik Kejohanan",
    hari: "Hari",
    jam: "Jam",
    minit: "Minit",
    saat: "Saat",
    mula: "Mula",
    tamat: "Tamat",
    hingga: "hingga",
    pautanPantas: "Pautan Pantas",
    tambahPautan: "Tambah Pautan",
    tiadaPautan: "Tiada pautan pantas.",
    simpan: "Simpan",
    kemaskiniBerjaya: "Kemaskini berjaya!",
    bukaPautan: "Buka Pautan",
    padamPautan: "Padam Pautan",
    andaPastiPadamPautan: "Adakah anda pasti mahu memadam pautan ini?",
    bukaPeta: "Buka Peta",
    pengurusanBento: "Pengurusan Bento",
    tetapanKejohanan: "Tetapan Kejohanan",
    bukaPendaftaran: "Buka Pendaftaran Pasukan",
    tutupPendaftaran: "Tutup Pendaftaran Pasukan",
    resetData: "Reset Data Kejohanan",
    andaPastiReset: "ADAKAH ANDA PASTI? Semua data akan dipadamkan!",
    kataLaluanReset: "Kata Laluan Reset",
    tarikhKejohanan: "Tarikh Kejohanan",
    masaKejohanan: "Masa Kejohanan",
    lokasiKejohanan: "Lokasi Kejohanan",
    petaLokasi: "Peta Lokasi (Google Maps)",
    penganjur: "Penganjur",
    pengelola: "Pengelola",
    namaTab: "Nama Tab",
    saiz: "Saiz",
    susunan: "Susunan",
    pilihSaiz: "Pilih Saiz",
    pilihSusunan: "Pilih Susunan",
    pindahAtas: "Pindah ke Atas",
    pindahBawah: "Pindah ke Bawah",
    venue: "Venue",
    lokasi: "Lokasi",
    tarikh: "Tarikh",
    masa: "Masa",
    batal: "Batal",
    padam: "Padam",
    kemaskini: "Kemaskini",
    tajuk: "Tajuk",
    url: "URL",
    pendaftaranPasukan: "Pendaftaran Pasukan",
    agihanKumpulan: "Agihan Kumpulan",
    pengurusanJadual: "Pengurusan Jadual Perlawanan",
    pengurusanPerlawanan: "Perlawanan & Keputusan",
    keputusanPenuh: "Keputusan Penuh",
    tetapan: "Tetapan",
    hakCipta: "Hak Cipta Terpelihara.",
    dikuasakan: "Dikuasakan oleh Sistem Pengurusan Kejohanan MSSD",
    memuatkan: "Memuatkan data...",
    kataSemangat: "Kata-kata Semangat",
    kumpulan: "Kumpulan",
    pusingan16: "Pusingan 16",
    sukuAkhir: "Suku Akhir",
    separuhAkhir: "Separuh Akhir",
    penentuanTempat3: "Penentuan Tempat Ke-3",
    akhir: "Akhir",
    perlu2Pasukan: "Perlukan sekurang-kurangnya 2 pasukan dalam kumpulan.",
    semuaPerlawananWujud: "Semua perlawanan untuk kumpulan ini sudah wujud.",
    matriksPerlawanan: "Matriks Perlawanan Kumpulan",
    wujud: "Wujud",
    janaJadual: "Jana Jadual",
    sedangBerlangsung: "Sedang Berlangsung",
    ditangguhkan: "Ditangguhkan",
    akanDatang: "Akan Datang",
    tiadaPerlawananPeringkatIni: "Tiada perlawanan dijumpai untuk peringkat ini.",
    inputKeputusan: "Input Keputusan",
    masaPerlawanan: "Masa Perlawanan",
    tarikhPerlawanan: "Tarikh Perlawanan",
    venueKejohanan: "Venue Kejohanan",
    padangVenue: "Padang",
    golAutomatik: "Gol Automatik",
    statusPerlawanan: "Status Perlawanan",
    penentuanPenalti: "Penentuan Penalti (Jika Perlu)",
    pasukan: "Pasukan",
    senaraiPenjaringGol: "Senarai Penjaring Gol",
    penjaringGol: "Penjaring Gol",
    tambahGol: "+ Tambah Gol",
    pilihPemain: "Pilih Pemain",
    tiadaGolDirekodkan: "Tiada gol direkodkan.",
    rekodKadDisiplin: "Rekod Kad Disiplin",
    kad: "Kad",
    tambahKad: "+ Tambah Kad",
    tiadaKadDirekodkan: "Tiada kad direkodkan.",
    simpanKeputusan: "Simpan Keputusan",
    padang: "Padang",
    sepakanPercuma: "Sepakan Percuma",
    penalti: "Penalti",
    golSendiri: "Gol Sendiri",
    kuning: "Kuning",
    merah: "Merah",
    kadKuning: "Kad Kuning",
    kadMerah: "Kad Merah",
    tamatPerlawanan: "Tamat",
    layak: "Layak",
    bilanganPasukan: "Bilangan Pasukan",
    bilanganPemain: "Bilangan Pemain",
    bilanganPerlawanan: "Bilangan Perlawanan",
    bilanganGol: "Bilangan Gol",
    bilanganKadKuning: "Bilangan Kad Kuning",
    bilanganKadMerah: "Bilangan Kad Merah",
    penerimaKad: "Penerima Kad",
    jadualSub: "Jadual",
    kedudukanSub: "Kedudukan",
    penjaringTerbanyakSub: "Penjaring Terbanyak",
    kuningMerahSub: "Kuning & Merah",
    keputusanRasmiSub: "Keputusan Rasmi",
    pos: "Pos",
    p: "P",
    m: "M",
    s: "S",
    k: "K",
    jg: "JG",
    gb: "GB",
    pg: "PG",
    mt: "Mt",
    tiadaPerlawanan: "Tiada perlawanan dijumpai.",
    semua: "Semua",
    johan: "Johan",
    naibJohan: "Naib Johan",
    ketiga: "Ketiga",
    keempat: "Keempat",
    senaraiGol: "Senarai Gol",
    rekodKad: "Rekod Kad",
    keputusanRasmiKeseluruhan: "Keputusan Rasmi Keseluruhan",
    vs: "vs",
    minitLabel: "Minit",
    janaSukuAkhir: "Jana Suku Akhir",
    janaSeparuhAkhir: "Jana Separuh Akhir",
    janaFinal: "Jana Final & Tempat Ke-3",
    hanya4Kumpulan: "Penjanaan automatik hanya disokong untuk 4 kumpulan (A, B, C, D) buat masa ini.",
    pastikanTamatKumpulan: "Pastikan semua perlawanan kumpulan telah tamat sebelum menjana pusingan seterusnya.",
    pastikanTamatSukuAkhir: "Pastikan semua perlawanan suku akhir telah tamat sebelum menjana separuh akhir.",
    pastikanTamatSeparuhAkhir: "Pastikan semua perlawanan separuh akhir telah tamat sebelum menjana perlawanan akhir.",
    pengurusanKumpulan: "Pengurusan Kumpulan",
    perlawananKeputusan: "Perlawanan & Keputusan",
    catatan: "Catatan",
    senaraiPasukan: "Senarai Pasukan",
    tambahPasukan: "Tambah Pasukan",
    pendaftaranTutup: "Pendaftaran Ditutup",
    pemain: "Pemain",
    lihatPasukan: "Lihat Pasukan",
    kemaskiniPasukan: "Kemaskini Pasukan",
    pendaftaranPasukanBaru: "Pendaftaran Pasukan Baru",
    pendaftaranTutupInfo: "Pendaftaran pasukan kini ditutup oleh pihak urusetia.",
    namaPasukan: "Nama Pasukan",
    namaPengurus: "Nama Pengurus",
    noTel: "No. Telefon",
    senaraiPemain: "Senarai Pemain",
    hadMaksimum: "Had maksimum 15 pemain.",
    tambahPemain: "Tambah Pemain",
    namaPemain: "Nama Pemain",
    tutup: "Tutup",
    simpanPasukan: "Simpan Pasukan",
    kumpulanSudahWujud: "Semua perlawanan untuk kumpulan ini sudah wujud.",
    silaUndiPasukan: "Sila undi pasukan ke dalam kumpulan.",
    tambahKumpulan: "Tambah Kumpulan",
    pasukanBelumDiundi: "Pasukan belum diundi.",
    semuaPasukanDiundi: "Semua pasukan telah diundi.",
    kosong: "Kosong",
    andaPasti: "Adakah anda pasti?",
    tindakanIniTidakBolehDiundur: "Tindakan ini tidak boleh diundur.",
    yaPadam: "Ya, Padam",
    semakan: "Semakan",
    noPerlawanan: "No",
    kodPerlawanan: "Kod",
    peringkat: "Peringkat",
    kodPasukan: "Kod Pasukan",
    status: "Status",
    tukarPosisi: "Tukar Posisi",
    padamPerlawanan: "Padam Perlawanan",
    andaPastiPadamPerlawanan: "Adakah anda pasti untuk memadam perlawanan ini?",
    padamPasukan: "Padam Pasukan",
    andaPastiPadamPasukan: "Adakah anda pasti untuk memadam pasukan ini?",
    peringkatPerlawanan: "Peringkat Perlawanan",
    semakanPerlawanan: "Semakan Perlawanan",
    pecahanPeringkat: "Pecahan Mengikut Peringkat",
    bilanganGolMengikutPasukan: "Bilangan Gol Mengikut Pasukan",
    kadMengikutPasukan: "Kad Mengikut Pasukan",
    ringkasan: "Ringkasan",
    penjaringTerbanyak: "Penjaring Terbanyak",
    tiadaData: "Tiada Data",
  },
  EN: {
    maklumat: "Information",
    jadual: "Schedule & Standings",
    statistik: "Statistics",
    logMasuk: "Login",
    logout: "Logout",
    panelUrusetia: "Admin Panel",
    panelPengurus: "Manager Panel",
    countdown: "Tournament Countdown",
    hari: "Days",
    jam: "Hours",
    minit: "Minutes",
    saat: "Seconds",
    mula: "Start",
    tamat: "End",
    hingga: "to",
    pautanPantas: "Quick Links",
    tambahPautan: "Add Link",
    tiadaPautan: "No quick links.",
    simpan: "Save",
    batal: "Cancel",
    padam: "Delete",
    kemaskini: "Update",
    tajuk: "Title",
    url: "URL",
    pendaftaranPasukan: "Team Registration",
    agihanKumpulan: "Group Distribution",
    pengurusanJadual: "Match Schedule Management",
    pengurusanPerlawanan: "Matches & Results",
    keputusanPenuh: "Full Results",
    tetapan: "Settings",
    hakCipta: "All Rights Reserved.",
    dikuasakan: "Powered by MSSD Tournament Management System",
    memuatkan: "Loading data...",
    kataSemangat: "Inspirational Words",
    kumpulan: "Group",
    pusingan16: "Round of 16",
    sukuAkhir: "Quarter Finals",
    separuhAkhir: "Semi Finals",
    penentuanTempat3: "3rd Place Playoff",
    akhir: "Final",
    perlu2Pasukan: "Need at least 2 teams in the group.",
    semuaPerlawananWujud: "All matches for this group already exist.",
    matriksPerlawanan: "Group Match Matrix",
    wujud: "Exists",
    janaJadual: "Generate Schedule",
    sedangBerlangsung: "In Progress",
    ditangguhkan: "Postponed",
    akanDatang: "Upcoming",
    tiadaPerlawananPeringkatIni: "No matches found for this stage.",
    inputKeputusan: "Input Result",
    masaPerlawanan: "Match Time",
    tarikhPerlawanan: "Match Date",
    venueKejohanan: "Tournament Venue",
    lokasiKejohanan: "Tournament Location",
    masaKejohanan: "Tournament Time",
    padangVenue: "Field",
    golAutomatik: "Automatic Goals",
    statusPerlawanan: "Match Status",
    penentuanPenalti: "Penalty Shootout (If Needed)",
    pasukan: "Team",
    senaraiPenjaringGol: "Goal Scorers List",
    penjaringGol: "Goal Scorer",
    tambahGol: "+ Add Goal",
    pilihPemain: "Select Player",
    tiadaGolDirekodkan: "No goals recorded.",
    rekodKadDisiplin: "Disciplinary Cards Record",
    kad: "Card",
    tambahKad: "+ Add Card",
    tiadaKadDirekodkan: "No cards recorded.",
    simpanKeputusan: "Save Result",
    padang: "Field",
    sepakanPercuma: "Free Kick",
    penalti: "Penalty",
    golSendiri: "Own Goal",
    kuning: "Yellow",
    merah: "Red",
    kadKuning: "Yellow Card",
    kadMerah: "Red Card",
    tamatPerlawanan: "Full Time",
    layak: "Qualified",
    bilanganPasukan: "Team Count",
    bilanganPemain: "Player Count",
    bilanganPerlawanan: "Match Count",
    bilanganGol: "Goal Count",
    bilanganKadKuning: "Yellow Card Count",
    bilanganKadMerah: "Red Card Count",
    penerimaKad: "Card Recipients",
    kemaskiniBerjaya: "Information updated successfully.",
    jadualSub: "Schedule",
    kedudukanSub: "Standings",
    penjaringTerbanyakSub: "Top Scorers",
    kuningMerahSub: "Yellow & Red Cards",
    keputusanRasmiSub: "Official Results",
    pos: "Pos",
    p: "P",
    m: "W",
    s: "D",
    k: "L",
    jg: "GS",
    gb: "GA",
    pg: "GD",
    mt: "Pts",
    tiadaPerlawanan: "No matches found.",
    semua: "All",
    johan: "Champion",
    naibJohan: "Runner-up",
    ketiga: "Third Place",
    keempat: "Fourth Place",
    senaraiGol: "Goal List",
    rekodKad: "Card Record",
    keputusanRasmiKeseluruhan: "Overall Official Results",
    vs: "vs",
    minitLabel: "Minute",
    janaSukuAkhir: "Generate Quarter Finals",
    janaSeparuhAkhir: "Generate Semi Finals",
    janaFinal: "Generate Final & 3rd Place",
    hanya4Kumpulan: "Automatic generation is only supported for 4 groups (A, B, C, D) at this time.",
    pastikanTamatKumpulan: "Ensure all group matches are completed before generating the next round.",
    pastikanTamatSukuAkhir: "Ensure all quarter final matches are completed before generating semi finals.",
    pastikanTamatSeparuhAkhir: "Ensure all semi final matches are completed before generating the final.",
    pengurusanKumpulan: "Group Management",
    perlawananKeputusan: "Matches & Results",
    catatan: "Notes",
    senaraiPasukan: "Team List",
    tambahPasukan: "Add Team",
    pendaftaranTutup: "Registration Closed",
    pemain: "Players",
    lihatPasukan: "View Team",
    kemaskiniPasukan: "Update Team",
    pendaftaranPasukanBaru: "New Team Registration",
    pendaftaranTutupInfo: "Team registration is currently closed by the admin.",
    namaPasukan: "Team Name",
    namaPengurus: "Manager Name",
    noTel: "Phone No.",
    senaraiPemain: "Player List",
    hadMaksimum: "Maximum limit 15 players.",
    tambahPemain: "Add Player",
    namaPemain: "Player Name",
    tutup: "Close",
    simpanPasukan: "Save Team",
    kumpulanSudahWujud: "All matches for this group already exist.",
    silaUndiPasukan: "Please draw teams into groups.",
    tambahKumpulan: "Add Group",
    pasukanBelumDiundi: "Team not drawn.",
    semuaPasukanDiundi: "All teams drawn.",
    kosong: "Empty",
    penganjur: "Organizer",
    pengelola: "Manager",
    andaPasti: "Are you sure?",
    tindakanIniTidakBolehDiundur: "This action cannot be undone.",
    yaPadam: "Yes, Delete",
    semakan: "Review",
    noPerlawanan: "No",
    kodPerlawanan: "Code",
    peringkat: "Stage",
    tarikh: "Date",
    masa: "Time",
    kodPasukan: "Team Code",
    status: "Status",
    tukarPosisi: "Swap Position",
    tarikhKejohanan: "Tournament Date",
    padamPerlawanan: "Delete Match",
    andaPastiPadamPerlawanan: "Are you sure you want to delete this match?",
    padamPasukan: "Delete Team",
    andaPastiPadamPasukan: "Are you sure you want to delete this team?",
    padamPautan: "Delete Link",
    andaPastiPadamPautan: "Are you sure you want to delete this link?",
    peringkatPerlawanan: "Match Stage",
    semakanPerlawanan: "Match Review",
    pecahanPeringkat: "Breakdown by Stage",
    bilanganGolMengikutPasukan: "Goals by Team",
    kadMengikutPasukan: "Cards by Team",
    pengurusanBento: "Bento Management (Organizer & Manager)",
    ringkasan: "Summary",
    penjaringTerbanyak: "Top Scorers",
    tiadaData: "No Data",
  }
};

const getTeamLogoText = (name: string) => {
  if (!name) return "?";
  const words = name.trim().split(/[\s-]+/);
  if (words[0].toUpperCase() === 'SK') {
    const suffix = words.slice(1).map(w => w[0]).join('');
    return ("SK" + suffix).toUpperCase();
  }
  return words.map(w => w[0]).join('').toUpperCase();
};

const getPlayerDisplayName = (player?: Player) => {
  if (!player) return "TBD";
  return `#${player.jerseyNumber} ${player.name}`;
};

const addMinutesToTime = (timeStr: string, minutes: number) => {
  if (!timeStr) return "08:00";
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h || 8, m || 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatDate = (dateStr: string, lang: Language) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const months = {
    BM: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'],
    EN: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  return `${date.getDate()} ${months[lang][date.getMonth()]} ${date.getFullYear()}`;
};

function Countdown({ targetDate, lang }: { targetDate: string, lang: Language }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const t = translations[lang];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      
      if (isNaN(target)) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {[
        { label: t.hari, value: timeLeft.days },
        { label: t.jam, value: timeLeft.hours },
        { label: t.minit, value: timeLeft.minutes },
        { label: t.saat, value: timeLeft.seconds }
      ].map((item, idx) => (
        <div key={idx} className="bg-white/10 backdrop-blur-md p-2 md:p-4 rounded-2xl border border-white/20 text-center">
          <div className="text-xl md:text-3xl font-black text-white leading-none">{item.value}</div>
          <div className="text-[8px] md:text-[10px] font-bold text-blue-100 uppercase mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

const getWinner = (m: Match | undefined) => {
  if (!m || m.status !== 'tamatPerlawanan') return undefined;
  if (m.score1! > m.score2!) return m.team1Id;
  if (m.score2! > m.score1!) return m.team2Id;
  if (m.penaltyScore1 !== undefined && m.penaltyScore2 !== undefined) {
    if (m.penaltyScore1 > m.penaltyScore2) return m.team1Id;
    if (m.penaltyScore2 > m.penaltyScore1) return m.team2Id;
  }
  return undefined;
};

const getLoser = (m: Match | undefined) => {
  if (!m || m.status !== 'tamatPerlawanan') return undefined;
  const winner = getWinner(m);
  if (!winner) return undefined;
  return winner === m.team1Id ? m.team2Id : m.team1Id;
};

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('Public');
  const [activeTab, setActiveTab] = useState('Maklumat');
  const [adminTab, setAdminTab] = useState('Pendaftaran Pasukan');
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('BM');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[lang];

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const updateData = async (newData: AppData) => {
    setData(newData);
    try {
      await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (err) {
      console.error("Failed to update data", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-accent animate-spin" />
          <p className="text-slate-500 font-medium">{translations[lang].memuatkan}</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    setUserRole('Public');
    setActiveTab('Maklumat');
  };

  const navTabs = [
    { id: 'Maklumat', label: t.maklumat, icon: Info },
    { id: 'Jadual & Kedudukan', label: t.jadual, icon: Calendar },
    { id: 'Statistik', label: t.statistik, icon: BarChart3 },
    ...(userRole !== 'Public' ? [{ id: userRole === 'Urusetia' ? 'Panel Urusetia' : 'Panel Pengurus', label: userRole === 'Urusetia' ? t.panelUrusetia : t.panelPengurus, icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-[#1e3a5f] to-[#326295] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={data.tournamentInfo.logoUrl} 
              alt="Logo MSSD" 
              className="w-10 h-10 md:w-14 md:h-14 object-contain bg-white rounded-lg p-1"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-sm md:text-lg font-bold tracking-wider leading-tight">MSSD TUARAN</h1>
              <h2 className="text-[8px] md:text-xs font-medium text-blue-100 uppercase">KEJOHANAN BOLA SEPAK SEKOLAH RENDAH</h2>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex gap-1">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium",
                    activeTab === tab.id 
                      ? "bg-white text-[#326295] shadow-md" 
                      : "hover:bg-white/10 text-blue-50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-2 border-l border-white/20 pl-4">
              <button 
                onClick={() => {
                  if (userRole === 'Public') setActiveTab('Log Masuk');
                  else handleLogout();
                }}
                className={cn(
                  "p-2 rounded-full transition-all",
                  activeTab === 'Log Masuk' ? "bg-white text-[#326295]" : "hover:bg-white/10 text-blue-50"
                )}
                title={userRole === 'Public' ? t.logMasuk : t.logout}
              >
                {userRole === 'Public' ? <Lock className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#1e3a5f] border-t border-white/10 overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-2">
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold",
                      activeTab === tab.id ? "bg-white text-[#326295]" : "text-blue-50 hover:bg-white/5"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (userRole === 'Public') setActiveTab('Log Masuk');
                    else handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold mt-2 border-t border-white/10 pt-4",
                    activeTab === 'Log Masuk' ? "bg-white text-[#326295]" : "text-blue-50 hover:bg-white/5"
                  )}
                >
                  {userRole === 'Public' ? <Lock className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                  {userRole === 'Public' ? t.logMasuk : t.logout}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'Maklumat' && <InformationTab data={data} lang={lang} />}
          {activeTab === 'Jadual & Kedudukan' && <ScheduleStandingsTab data={data} lang={lang} />}
          {activeTab === 'Log Masuk' && <LoginTab onLogin={setUserRole} setActiveTab={setActiveTab} setAdminTab={setAdminTab} />}
          {activeTab === 'Statistik' && <StatisticsTab data={data} lang={lang} />}
          {(activeTab === 'Panel Urusetia' || activeTab === 'Panel Pengurus') && (
            <AdminPanel 
              data={data} 
              userRole={userRole} 
              activeSubTab={adminTab} 
              setActiveSubTab={setAdminTab} 
              updateData={updateData}
              lang={lang}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-gradient-to-r from-[#1e3a5f] to-[#326295] text-blue-100 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium">© Kejohanan Bola Sepak SR MSSD Tuaran. {t.hakCipta}</p>
          <p className="text-xs mt-2 text-blue-300 italic">{t.dikuasakan}</p>
        </div>
      </footer>
    </div>
  );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, lang }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, lang: Language }) {
  const t = translations[lang];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{title}</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 text-sm font-black text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest"
          >
            {t.batal}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 px-6 py-4 text-sm font-black text-red-500 hover:bg-red-50 transition-colors border-l border-slate-100 uppercase tracking-widest"
          >
            {t.yaPadam}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
function InformationTab({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  
  const bentoLayout = data.tournamentInfo.bentoLayout || [
    { id: 'organizer', size: 'medium', order: 0 },
    { id: 'manager', size: 'medium', order: 1 },
    { id: 'dates', size: 'medium', order: 2 },
    { id: 'time', size: 'medium', order: 3 },
    { id: 'venue', size: 'medium', order: 4 },
    { id: 'location', size: 'large', order: 5 },
  ];

  const sortedBento = [...bentoLayout].sort((a, b) => a.order - b.order);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2a5282] to-[#326295] p-10 md:p-16 text-center text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="relative z-10"
          >
            <img 
              src={data.tournamentInfo.logoUrl} 
              alt="Tournament Logo" 
              className="w-28 h-28 md:w-40 md:h-40 mx-auto mb-8 object-contain bg-white rounded-[2rem] p-4 shadow-2xl border-4 border-white/20"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-6xl font-black mb-8 tracking-tight leading-none relative z-10 uppercase drop-shadow-lg"
          >
            {data.tournamentInfo.title}
          </motion.h2>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto mb-10 relative z-10 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl"
          >
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] mb-4">{t.countdown}</p>
            <Countdown targetDate={data.tournamentInfo.startDate} lang={lang} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-accent text-white font-black tracking-[0.2em] uppercase text-[10px] md:text-xs relative z-10 rounded-full shadow-lg shadow-accent/40"
          >
            <Trophy className="w-4 h-4" />
            MSSD Tuaran
          </motion.div>
        </div>
        
        <div className="p-6 md:p-12 space-y-12 bg-slate-50/50">
          {/* Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBento.map((item, idx) => {
              const commonClasses = cn(
                "p-8 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
                item.size === 'large' ? "md:col-span-2 lg:col-span-3" : "md:col-span-1"
              );

              if (item.id === 'organizer') {
                return (
                  <motion.div 
                    key="organizer" 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={commonClasses}
                  >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                      {data.tournamentInfo.organizerLogoUrl ? (
                        <img src={data.tournamentInfo.organizerLogoUrl} alt="" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <Shield className="w-8 h-8 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.penganjur}</p>
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{data.tournamentInfo.organizer}</p>
                    </div>
                  </motion.div>
                );
              }
              if (item.id === 'manager') {
                return (
                  <motion.div 
                    key="manager" 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={commonClasses}
                  >
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center shadow-inner">
                      {data.tournamentInfo.managerLogoUrl ? (
                        <img src={data.tournamentInfo.managerLogoUrl} alt="" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <Users className="w-8 h-8 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.pengelola}</p>
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{data.tournamentInfo.manager}</p>
                    </div>
                  </motion.div>
                );
              }
              if (item.id === 'dates') {
                return (
                  <motion.div 
                    key="dates" 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={commonClasses}
                  >
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center shadow-inner">
                      <Calendar className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.tarikh}</p>
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tight">
                        {data.tournamentInfo.startDate}
                        {data.tournamentInfo.endDate && data.tournamentInfo.endDate !== data.tournamentInfo.startDate && (
                          <span className="block text-sm text-slate-400 mt-1">Hingga {data.tournamentInfo.endDate}</span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              }
              if (item.id === 'time') {
                return (
                  <motion.div 
                    key="time" 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={commonClasses}
                  >
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center shadow-inner">
                      <Clock className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.masa}</p>
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{data.tournamentInfo.time}</p>
                    </div>
                  </motion.div>
                );
              }
              if (item.id === 'venue') {
                return (
                  <motion.div 
                    key="venue" 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={commonClasses}
                  >
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shadow-inner">
                      <MapPin className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.venue}</p>
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{data.tournamentInfo.venue}</p>
                    </div>
                  </motion.div>
                );
              }
              if (item.id === 'location') {
                return (
                  <motion.div 
                    key="location" 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300",
                      item.size === 'large' ? "md:col-span-2 lg:col-span-3" : "md:col-span-1"
                    )}
                  >
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <Map className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.lokasi}</p>
                      </div>
                      <a 
                        href={data.tournamentInfo.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest flex items-center gap-1"
                      >
                        {t.bukaPeta} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex-1 min-h-[350px] relative">
                      <iframe
                        src={data.tournamentInfo.mapUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </motion.div>
                );
              }
              return null;
            })}
          </div>

          {/* Motivation Quote - Moved to bottom and made more prominent */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 md:p-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <Quote className="w-16 h-16 text-accent/20 mx-auto mb-8" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <p className="text-2xl md:text-4xl font-black text-white italic leading-tight mb-6">
                "{data.tournamentInfo.motivationQuote}"
              </p>
              <div className="w-20 h-1.5 bg-accent mx-auto rounded-full"></div>
            </div>
          </motion.div>


        </div>
      </div>
    </motion.div>
  );
}


function QuickLinksTab({ data, updateData, lang }: { data: AppData, updateData: (d: AppData) => Promise<void>, lang: Language }) {
  const t = translations[lang];
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;
    const updatedLinks = [...(data.quickLinks || []), { ...newLink, id: generateId() }];
    await updateData({ ...data, quickLinks: updatedLinks });
    setNewLink({ title: '', url: '' });
  };

  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setLinkToDelete(id);
  };

  const confirmDeleteLink = async () => {
    if (linkToDelete) {
      const updatedLinks = data.quickLinks.filter(l => l.id !== linkToDelete);
      await updateData({ ...data, quickLinks: updatedLinks });
      setLinkToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.tambahPautan}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            placeholder={t.tajuk}
            value={newLink.title}
            onChange={e => setNewLink({ ...newLink, title: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
          />
          <input 
            placeholder={t.url}
            value={newLink.url}
            onChange={e => setNewLink({ ...newLink, url: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
          />
        </div>
        <button type="submit" className="w-full py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:shadow-xl transition-all">
          {t.tambahPautan}
        </button>
      </form>

      <ConfirmDialog
        isOpen={linkToDelete !== null}
        onClose={() => setLinkToDelete(null)}
        onConfirm={confirmDeleteLink}
        title={t.padamPautan}
        message={t.andaPastiPadamPautan}
        lang={lang}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.quickLinks?.map(link => (
          <div key={link.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">{link.title}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{link.url}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-accent hover:text-white transition-all"
                title={t.bukaPautan}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button 
                onClick={() => handleDelete(link.id)} 
                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                title={t.padam}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {(!data.quickLinks || data.quickLinks.length === 0) && (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-3xl italic">
            {t.tiadaPautan}
          </div>
        )}
      </div>
    </div>
  );
}
function StatCard({ icon: Icon, label, value, logo, color = "text-accent", onClick }: { icon: any, label: string, value: string | number, logo?: string, color?: string, onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all",
        onClick ? "cursor-pointer hover:shadow-md hover:bg-white active:scale-95" : "hover:shadow-md hover:bg-white"
      )}
    >
      {logo ? (
        <img src={logo} alt={label} className="w-16 h-16 object-contain bg-white rounded-xl p-2 shadow-sm" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-accent shadow-sm">
          <Icon className={cn("w-8 h-8", color)} />
        </div>
      )}
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</h4>
        <p className="text-xl font-black text-slate-800 leading-tight">{value}</p>
      </div>
    </motion.div>
  );
}

function LoginTab({ onLogin, setActiveTab, setAdminTab }: { onLogin: (role: UserRole) => void, setActiveTab: (tab: string) => void, setAdminTab: (tab: string) => void }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'Urusetia' && password === 'Urusetia2025') {
      onLogin('Urusetia');
      setActiveTab('Panel Urusetia');
      setAdminTab('Perlawanan & Keputusan');
    } else if (id === 'Pengurus' && password === 'Pengurus2026') {
      onLogin('Pengurus');
      setActiveTab('Panel Pengurus');
      setAdminTab('Pendaftaran Pasukan');
    } else {
      setError('ID atau Kata Laluan salah!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-2xl p-8 border border-slate-100"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Log Masuk Panel</h2>
        <p className="text-slate-500">Sila masukkan kredential anda untuk mengakses panel pengurusan.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">ID Pengguna</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
              placeholder="Contoh: Urusetia"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Kata Laluan</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button 
          type="submit"
          className="w-full py-4 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
        >
          Log Masuk
        </button>
      </form>
    </motion.div>
  );
}

function StatisticsTab({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('Ringkasan');

  const totalPlayers = data.teams.reduce((acc, t) => acc + t.players.length, 0);
  const totalGoals = data.matches.reduce((acc, m) => acc + m.goals.length, 0);
  const totalYellow = data.matches.reduce((acc, m) => acc + m.cards.filter(c => c.type === 'kuning').length, 0);
  const totalRed = data.matches.reduce((acc, m) => acc + m.cards.filter(c => c.type === 'merah').length, 0);

  const subTabs = [
    { id: 'Ringkasan', label: 'Ringkasan', icon: BarChart3 },
    { id: 'Penjaring Terbanyak', label: t.penjaringTerbanyakSub, icon: Trophy },
    { id: 'Penerima Kad', label: t.penerimaKad, icon: AlertTriangle },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit mx-auto md:mx-0">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold",
              activeSubTab === tab.id 
                ? "bg-white text-accent shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'Ringkasan' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                icon={Shield} 
                label={t.bilanganPasukan} 
                value={data.teams.length} 
                onClick={() => setSelectedDetail('pasukan')}
              />
              <StatCard 
                icon={Users} 
                label={t.bilanganPemain} 
                value={totalPlayers} 
                onClick={() => setSelectedDetail('pemain')}
              />
              <StatCard 
                icon={Calendar} 
                label={t.bilanganPerlawanan} 
                value={data.matches.length} 
                onClick={() => setSelectedDetail('perlawanan')}
              />
              <StatCard 
                icon={Trophy} 
                label={t.bilanganGol} 
                value={totalGoals} 
                onClick={() => setSelectedDetail('gol')}
              />
              <StatCard 
                icon={AlertTriangle} 
                label={t.bilanganKadKuning} 
                value={totalYellow} 
                color="text-yellow-500"
                onClick={() => setSelectedDetail('kuning')}
              />
              <StatCard 
                icon={AlertTriangle} 
                label={t.bilanganKadMerah} 
                value={totalRed} 
                color="text-red-500"
                onClick={() => setSelectedDetail('merah')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Pemain Mengikut Posisi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {['GK', 'DF', 'MF', 'FW'].map(pos => {
                    const count = data.teams.reduce((acc, t) => acc + t.players.filter(p => p.position === pos).length, 0);
                    return (
                      <div key={pos} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase">{pos}</p>
                        <p className="text-2xl font-bold text-slate-800">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  Gol Mengikut Pasukan
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {data.teams.map(team => {
                    const goals = data.matches.reduce((acc, m) => acc + m.goals.filter(g => g.teamId === team.id && g.type !== 'golSendiri').length, 0);
                    const ownGoals = data.matches.reduce((acc, m) => acc + m.goals.filter(g => g.teamId === team.id && g.type === 'golSendiri').length, 0);
                    return (
                      <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          {team.logoUrl && <img src={team.logoUrl} alt={team.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />}
                          <span className="font-semibold text-slate-700">{team.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-accent">{goals}</span>
                          {ownGoals > 0 && <span className="text-xs font-bold text-red-400">({ownGoals} OG)</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeSubTab === 'Penjaring Terbanyak' && <TopScorersView data={data} lang={lang} />}
        {activeSubTab === 'Penerima Kad' && <CardRecipientsView data={data} lang={lang} />}
      </AnimatePresence>
    </motion.div>
  );
}

function CardRecipientsView({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  const allCards = data.matches.flatMap(m => m.cards.map(c => ({
    ...c,
    matchId: m.id,
    stage: m.stage
  })));

  const cardRecipients = data.teams.flatMap(team => 
    team.players.map(player => {
      const playerCards = allCards.filter(c => c.playerId === player.id);
      const yellowCount = playerCards.filter(c => c.type === 'kuning').length;
      const redCount = playerCards.filter(c => c.type === 'merah').length;
      return {
        ...player,
        teamName: team.name,
        teamLogo: team.logoUrl,
        yellowCount,
        redCount,
        total: yellowCount + (redCount * 2) // Weight red cards more
      };
    })
  ).filter(p => p.yellowCount > 0 || p.redCount > 0).sort((a, b) => b.total - a.total);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
    >
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-accent" />
        {t.penerimaKad}
      </h3>
      <div className="space-y-3">
        {cardRecipients.map((player, idx) => (
          <div key={player.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="w-6 text-xs font-black text-slate-400">#{idx + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800">{player.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {player.teamLogo && <img src={player.teamLogo} alt="" className="w-3 h-3 object-contain" referrerPolicy="no-referrer" />}
                <p className="text-[10px] font-bold text-slate-400 uppercase">{player.teamName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {player.yellowCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 text-yellow-600 rounded-lg border border-yellow-100">
                  <div className="w-2 h-3 bg-yellow-400 rounded-sm shadow-sm" />
                  <span className="text-xs font-black">{player.yellowCount}</span>
                </div>
              )}
              {player.redCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100">
                  <div className="w-2 h-3 bg-red-500 rounded-sm shadow-sm" />
                  <span className="text-xs font-black">{player.redCount}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {cardRecipients.length === 0 && (
          <div className="py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
            {t.tiadaData}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DetailModal({ type, data, lang, onClose }: { type: string, data: AppData, lang: Language, onClose: () => void }) {
  const t = translations[lang];
  
  const getTitle = () => {
    switch(type) {
      case 'pasukan': return t.bilanganPasukan;
      case 'pemain': return t.bilanganPemain;
      case 'perlawanan': return t.bilanganPerlawanan;
      case 'gol': return t.bilanganGol;
      case 'kuning': return t.bilanganKadKuning;
      case 'merah': return t.bilanganKadMerah;
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{getTitle()}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {type === 'pasukan' && (
            <div className="space-y-3">
              {data.teams.map(team => (
                <div key={team.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    {team.logoUrl && <img src={team.logoUrl} alt="" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />}
                    <div>
                      <p className="font-black text-slate-800">{team.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{team.code} • {team.group}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-3 py-1 bg-white rounded-full border border-slate-200 text-slate-500">
                    {team.players.length} {t.pemain}
                  </span>
                </div>
              ))}
            </div>
          )}

          {type === 'pemain' && (
            <div className="space-y-6">
              {data.teams.map(team => (
                <div key={team.id} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    {team.logoUrl && <img src={team.logoUrl} alt="" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />}
                    <h4 className="font-black text-slate-800 text-sm uppercase">{team.name} ({team.players.length})</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {team.players.map(p => (
                      <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">{getPlayerDisplayName(p)}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{p.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {type === 'perlawanan' && (
            <div className="space-y-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.pecahanPeringkat}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['kumpulan', 'pusingan16', 'sukuAkhir', 'separuhAkhir', 'penentuanTempat3', 'akhir'].map(stage => {
                  const count = data.matches.filter(m => m.stage === stage).length;
                  if (count === 0 && stage !== 'kumpulan') return null;
                  return (
                    <div key={stage} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{t[stage as Match['stage']]}</span>
                      <span className="text-2xl font-black text-accent">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {type === 'gol' && (
            <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.bilanganGolMengikutPasukan}</p>
              <div className="space-y-2">
                {data.teams.map(team => {
                  const goals = data.matches.reduce((acc, m) => {
                    if (m.team1Id !== team.id && m.team2Id !== team.id) return acc;
                    const teamG = m.goals.filter(g => g.teamId === team.id && g.type !== 'golSendiri').length;
                    const ownG = m.goals.filter(g => g.teamId !== team.id && g.type === 'golSendiri' && (m.team1Id === team.id || m.team2Id === team.id)).length;
                    return acc + teamG + ownG;
                  }, 0);
                  return { ...team, goals };
                }).sort((a, b) => b.goals - a.goals).map((team, idx) => (
                  <div key={team.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="w-6 text-xs font-black text-slate-400">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-800">{team.name}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Target className="w-3 h-3" />
                      <span className="text-xs font-black">{team.goals}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'kuning' && (
            <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.kadMengikutPasukan}</p>
              <div className="space-y-2">
                {data.teams.map(team => {
                  const count = data.matches.reduce((acc, m) => acc + m.cards.filter(c => c.teamId === team.id && c.type === 'kuning').length, 0);
                  return { ...team, count };
                }).sort((a, b) => b.count - a.count).map((team, idx) => (
                  <div key={team.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="w-6 text-xs font-black text-slate-400">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-800">{team.name}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg">
                      <ShieldAlert className="w-3 h-3" />
                      <span className="text-xs font-black">{team.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'merah' && (
            <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.kadMengikutPasukan}</p>
              <div className="space-y-2">
                {data.teams.map(team => {
                  const count = data.matches.reduce((acc, m) => acc + m.cards.filter(c => c.teamId === team.id && c.type === 'merah').length, 0);
                  return { ...team, count };
                }).sort((a, b) => b.count - a.count).map((team, idx) => (
                  <div key={team.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="w-6 text-xs font-black text-slate-400">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-800">{team.name}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg">
                      <ShieldAlert className="w-3 h-3" />
                      <span className="text-xs font-black">{team.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'gol' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['kumpulan', 'pusingan16', 'sukuAkhir', 'separuhAkhir', 'penentuanTempat3', 'akhir'].map(stage => {
                const goals = data.matches.filter(m => m.stage === stage).reduce((acc, m) => acc + m.goals.length, 0);
                return (
                  <div key={stage} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{t[stage as Match['stage']]}</span>
                    <span className="text-2xl font-black text-accent">{goals}</span>
                  </div>
                );
              })}
            </div>
          )}

          {type === 'kuning' && (
            <div className="space-y-3">
              {data.teams.map(team => {
                const count = data.matches.reduce((acc, m) => acc + m.cards.filter(c => c.teamId === team.id && c.type === 'kuning').length, 0);
                return (
                  <div key={team.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      {team.logoUrl && <img src={team.logoUrl} alt="" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />}
                      <span className="font-black text-slate-800">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-sm" />
                      <span className="text-2xl font-black text-slate-800">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {type === 'merah' && (
            <div className="space-y-3">
              {data.teams.map(team => {
                const count = data.matches.reduce((acc, m) => acc + m.cards.filter(c => c.teamId === team.id && c.type === 'merah').length, 0);
                return (
                  <div key={team.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      {team.logoUrl && <img src={team.logoUrl} alt="" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />}
                      <span className="font-black text-slate-800">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-6 bg-red-500 rounded-sm shadow-sm" />
                      <span className="text-2xl font-black text-slate-800">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// --- Schedule & Standings Tab ---

function ScheduleStandingsTab({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  const [activeSubTab, setActiveSubTab] = useState('Jadual');
  const isFinalTamat = data.matches.find(m => m.stage === 'akhir')?.status === 'tamatPerlawanan';

  const subTabs = [
    { id: 'Jadual', label: t.jadualSub, icon: Calendar },
    { id: 'Kedudukan', label: t.kedudukanSub, icon: ListOrdered },
    ...(isFinalTamat ? [{ id: 'Keputusan Rasmi', label: t.keputusanRasmiSub, icon: Medal }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit mx-auto md:mx-0">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold",
              activeSubTab === tab.id 
                ? "bg-white text-accent shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'Jadual' && <ScheduleView data={data} lang={lang} />}
        {activeSubTab === 'Kedudukan' && <StandingsView data={data} lang={lang} />}
        {activeSubTab === 'Keputusan Rasmi' && <OfficialResultsView data={data} lang={lang} />}
      </AnimatePresence>
    </motion.div>
  );
}

function ScheduleView({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  const [filter, setFilter] = useState<Match['stage'] | 'Semua'>('Semua');
  const stages: {id: Match['stage'] | 'Semua', label: string}[] = [
    {id: 'Semua', label: t.semua},
    {id: 'kumpulan', label: t.kumpulan},
    {id: 'pusingan16', label: t.pusingan16},
    {id: 'sukuAkhir', label: t.sukuAkhir},
    {id: 'separuhAkhir', label: t.separuhAkhir},
    {id: 'penentuanTempat3', label: t.penentuanTempat3},
    {id: 'akhir', label: t.akhir}
  ];

  const filteredMatches = data.matches.filter(m => filter === 'Semua' || m.stage === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {stages.map(s => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              filter === s.id 
                ? "bg-slate-800 text-white border-slate-800" 
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortMatches(filteredMatches).length > 0 ? (
          sortMatches(filteredMatches).map(match => (
            <MatchCard key={match.id} match={match} teams={data.teams} lang={lang} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">
            {t.tiadaPerlawanan}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MatchCard({ match, teams, lang }: { match: Match, teams: Team[], lang: Language, key?: string }) {
  const t = translations[lang];
  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);

  const sortedGoals = [...match.goals].sort((a, b) => a.minute - b.minute);
  const sortedCards = [...match.cards].sort((a, b) => a.minute - b.minute);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">
          {t[match.stage]} {match.group && `- ${t.kumpulan} ${match.group}`}
        </span>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
          match.status === 'tamatPerlawanan' ? "bg-green-100 text-green-600" : 
          match.status === 'sedangBerlangsung' ? "bg-orange-100 text-orange-600" :
          match.status === 'ditangguhkan' ? "bg-red-100 text-red-600" :
          "bg-blue-100 text-blue-600"
        )}>
          {t[match.status]}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-3 items-start gap-2 md:gap-4">
          {/* Team 1 */}
          <div className="flex flex-col items-center text-center gap-2">
            {team1?.logoUrl ? (
              <img src={team1.logoUrl} alt="" className="w-10 h-10 md:w-14 md:h-14 object-contain flex-shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-[10px] font-bold flex-shrink-0">
                {getTeamLogoText(team1?.name || '')}
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className="text-[7px] md:text-[9px] font-black text-accent uppercase tracking-widest">{team1?.code || '-'}</span>
              <span className="text-[9px] md:text-xs font-bold text-slate-800 line-clamp-3 leading-tight min-h-[3.75em]">{team1?.name || 'TBD'}</span>
            </div>
          </div>

          {/* Score Area */}
          <div className="flex flex-col items-center justify-center gap-2 pt-2 md:pt-4">
            <div className="flex items-center gap-2 md:gap-3 bg-slate-50 px-3 py-2 md:px-5 md:py-3 rounded-2xl border border-slate-100 shadow-inner">
              <span className="text-xl md:text-3xl font-black text-slate-800">{match.score1 ?? '-'}</span>
              <span className="text-[8px] md:text-[10px] font-black text-slate-300 tracking-widest">VS</span>
              <span className="text-xl md:text-3xl font-black text-slate-800">{match.score2 ?? '-'}</span>
            </div>
            {match.isKnockout && match.penaltyScore1 !== undefined && (
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
                PEN: ({match.penaltyScore1}) - ({match.penaltyScore2})
              </span>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center text-center gap-2">
            {team2?.logoUrl ? (
              <img src={team2.logoUrl} alt="" className="w-10 h-10 md:w-14 md:h-14 object-contain flex-shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-[10px] font-bold flex-shrink-0">
                {getTeamLogoText(team2?.name || '')}
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className="text-[7px] md:text-[9px] font-black text-accent uppercase tracking-widest">{team2?.code || '-'}</span>
              <span className="text-[9px] md:text-xs font-bold text-slate-800 line-clamp-3 leading-tight min-h-[3.75em]">{team2?.name || 'TBD'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
          <div className="space-y-1">
            {sortedGoals.filter(g => g.teamId === match.team1Id).map(g => (
              <p key={g.id} className="text-[8px] text-slate-500 font-bold">
                ⚽ {getPlayerDisplayName(teams.find(t => t.id === match.team1Id)?.players.find(p => p.id === g.playerId))} ({g.minute}')
              </p>
            ))}
            {sortedCards.filter(c => c.teamId === match.team1Id || teams.find(t => t.id === match.team1Id)?.players.some(p => p.id === c.playerId)).map(c => (
              <p key={c.id} className="text-[8px] text-slate-500 font-bold flex items-center gap-1">
                <span className={cn("w-1.5 h-2 rounded-sm", c.type === 'kuning' ? "bg-yellow-400" : "bg-red-500")} />
                {getPlayerDisplayName(teams.find(t => t.id === match.team1Id)?.players.find(p => p.id === c.playerId))} ({c.minute}')
              </p>
            ))}
          </div>
          <div className="space-y-1 text-right">
            {sortedGoals.filter(g => g.teamId === match.team2Id).map(g => (
              <p key={g.id} className="text-[8px] text-slate-500 font-bold">
                {getPlayerDisplayName(teams.find(t => t.id === match.team2Id)?.players.find(p => p.id === g.playerId))} ({g.minute}') ⚽
              </p>
            ))}
            {sortedCards.filter(c => c.teamId === match.team2Id || teams.find(t => t.id === match.team2Id)?.players.some(p => p.id === c.playerId)).map(c => (
              <p key={c.id} className="text-[8px] text-slate-500 font-bold flex items-center justify-end gap-1">
                {getPlayerDisplayName(teams.find(t => t.id === match.team2Id)?.players.find(p => p.id === c.playerId))} ({c.minute}')
                <span className={cn("w-1.5 h-2 rounded-sm", c.type === 'kuning' ? "bg-yellow-400" : "bg-red-500")} />
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {match.date}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {match.time}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {match.venue}
        </div>
      </div>
    </div>
  );
}

function StandingsView({ data, lang }: { data: AppData, lang: Language }) {
  const groups = Array.from(new Set(data.teams.map(t => t.group).filter(Boolean))).sort();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {groups.map(group => (
        <GroupTable key={group} group={group!} data={data} lang={lang} />
      ))}
    </motion.div>
  );
}

function GroupTable({ group, data, lang }: { group: string, data: AppData, lang: Language, key?: string }) {
  const t = translations[lang];
  const groupTeams = data.teams.filter(t => t.group === group);
  
  const standings = groupTeams.map(team => {
    const matches = data.matches.filter(m => m.stage === 'kumpulan' && m.status === 'tamatPerlawanan' && (m.team1Id === team.id || m.team2Id === team.id));
    let played = matches.length;
    let won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;

    matches.forEach(m => {
      const isTeam1 = m.team1Id === team.id;
      const teamScore = (isTeam1 ? m.score1 : m.score2) || 0;
      const oppScore = (isTeam1 ? m.score2 : m.score1) || 0;
      
      gf += teamScore;
      ga += oppScore;

      if (teamScore > oppScore) won++;
      else if (teamScore === oppScore) drawn++;
      else lost++;
    });

    return {
      ...team,
      played, won, drawn, lost, gf, ga,
      gd: gf - ga,
      pts: (won * 3) + (drawn * 1)
    };
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-800 p-4 flex items-center justify-between">
        <h3 className="text-white font-black uppercase">{t.kumpulan} {group}</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.kedudukanSub}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
            <tr>
              <th className="px-4 py-3 text-center w-12">{t.pos}</th>
              <th className="px-4 py-3 min-w-[150px]">{t.pasukan}</th>
              <th className="px-2 py-3 text-center w-10">{t.p}</th>
              <th className="px-2 py-3 text-center w-10">{t.m}</th>
              <th className="px-2 py-3 text-center w-10">{t.s}</th>
              <th className="px-2 py-3 text-center w-10">{t.k}</th>
              <th className="px-2 py-3 text-center w-10">{t.jg}</th>
              <th className="px-2 py-3 text-center w-10">{t.gb}</th>
              <th className="px-2 py-3 text-center w-10">{t.pg}</th>
              <th className="px-4 py-3 text-center w-12 bg-slate-100 text-slate-800">{t.mt}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((team, idx) => (
              <tr key={team.id} className={cn(
                "hover:bg-slate-50 transition-colors",
                idx < 2 ? "bg-green-50/30" : ""
              )}>
                <td className="px-4 py-4 text-center">
                  <span className={cn(
                    "w-6 h-6 inline-flex items-center justify-center rounded-full text-[10px] font-black",
                    idx === 0 ? "bg-accent text-white" : idx === 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {team.logoUrl && <img src={team.logoUrl} alt="" className="w-6 h-6 object-contain flex-shrink-0" referrerPolicy="no-referrer" />}
                    <span className="font-bold text-slate-700 whitespace-normal break-words leading-tight">{team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-center font-medium w-10">{team.played}</td>
                <td className="px-2 py-4 text-center font-medium text-green-600 w-10">{team.won}</td>
                <td className="px-2 py-4 text-center font-medium text-slate-400 w-10">{team.drawn}</td>
                <td className="px-2 py-4 text-center font-medium text-red-600 w-10">{team.lost}</td>
                <td className="px-2 py-4 text-center font-medium w-10">{team.gf}</td>
                <td className="px-2 py-4 text-center font-medium w-10">{team.ga}</td>
                <td className="px-2 py-4 text-center font-medium w-10">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                <td className="px-4 py-4 text-center font-black bg-slate-100/50 text-slate-800 w-12">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopScorersView({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  const scorers = data.teams.flatMap(t => t.players).map(p => {
    const goals = data.matches.flatMap(m => m.goals).filter(g => g.playerId === p.id);
    return { ...p, goals: goals.length, goalDetails: goals };
  }).filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals);

  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scorers.map((player, idx) => (
          <motion.div
            key={player.id}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedPlayer(player)}
            className={cn(
              "p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden",
              idx === 0 ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" : "bg-white border-slate-100 text-slate-800 shadow-sm"
            )}
          >
            {idx === 0 && <Trophy className="absolute -right-2 -bottom-2 w-20 h-20 opacity-10 rotate-12" />}
            <div className="flex items-center justify-between mb-3">
              <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase", idx === 0 ? "bg-white/20" : "bg-slate-100 text-slate-500")}>
                #{idx + 1}
              </span>
              <span className="text-2xl font-black">{player.goals} GOL</span>
            </div>
            <h4 className="font-black text-lg leading-tight mb-1">{getPlayerDisplayName(player as any)}</h4>
            <p className={cn("text-xs font-bold uppercase opacity-70", idx === 0 ? "text-white" : "text-slate-400")}>
              {data.teams.find(t => t.id === player.teamId)?.name}
            </p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-accent p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <Trophy className="w-10 h-10" />
                  <button onClick={() => setSelectedPlayer(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <h3 className="text-2xl font-black uppercase">{getPlayerDisplayName(selectedPlayer)}</h3>
                <p className="text-white/70 font-bold">{data.teams.find(t => t.id === selectedPlayer.teamId)?.name}</p>
              </div>
              <div className="p-6">
                <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">{t.senaraiGol}</h4>
                <div className="space-y-3">
                  {selectedPlayer.goalDetails.map((g: any, i: number) => {
                    const match = data.matches.find(m => m.id === g.matchId);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center font-black text-xs">
                            {g.minute}'
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">{t.vs} {data.teams.find(t => t.id === (match?.team1Id === selectedPlayer.teamId ? match?.team2Id : match?.team1Id))?.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{t[match?.stage as Match['stage']]}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full uppercase">{t[g.type as keyof typeof t]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CardsView({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  const playersWithCards = data.teams.flatMap(t => t.players).map(p => {
    const cards = data.matches.flatMap(m => m.cards).filter(c => c.playerId === p.id);
    const yellow = cards.filter(c => c.type === 'kuning').length;
    const red = cards.filter(c => c.type === 'merah').length;
    return { ...p, yellow, red, cardDetails: cards };
  }).filter(p => p.yellow > 0 || p.red > 0).sort((a, b) => b.red - a.red || b.yellow - a.yellow);

  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {playersWithCards.map(player => (
        <div
          key={player.id}
          onClick={() => setSelectedPlayer(player)}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-accent/30 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="font-black text-slate-800 leading-tight">{getPlayerDisplayName(player as any)}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{data.teams.find(t => t.id === player.teamId)?.name}</p>
          </div>
          <div className="flex gap-2">
            {player.yellow > 0 && (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                <div className="w-3 h-4 bg-yellow-400 rounded-sm" />
                <span className="text-sm font-black text-yellow-700">{player.yellow}</span>
              </div>
            )}
            {player.red > 0 && (
              <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                <div className="w-3 h-4 bg-red-500 rounded-sm" />
                <span className="text-sm font-black text-red-700">{player.red}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-slate-800 p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <AlertTriangle className="w-10 h-10 text-yellow-400" />
                  <button onClick={() => setSelectedPlayer(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <h3 className="text-2xl font-black uppercase">{getPlayerDisplayName(selectedPlayer)}</h3>
                <p className="text-white/70 font-bold">{data.teams.find(t => t.id === selectedPlayer.teamId)?.name}</p>
              </div>
              <div className="p-6">
                <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">{t.rekodKad}</h4>
                <div className="space-y-3">
                  {selectedPlayer.cardDetails.map((c: any, i: number) => {
                    const match = data.matches.find(m => m.id === c.matchId);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-4 h-6 rounded-sm", c.type === 'kuning' ? "bg-yellow-400" : "bg-red-500")} />
                          <div>
                            <p className="text-xs font-bold text-slate-700">{t.minit} {c.minute}'</p>
                            <p className="text-[10px] text-slate-400 font-medium">{t[match?.stage as Match['stage']]} {t.vs} {data.teams.find(t => t.id === (match?.team1Id === selectedPlayer.teamId ? match?.team2Id : match?.team1Id))?.name}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{c.reason}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OfficialResultsView({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  // Simple logic to get top 4
  const final = data.matches.find(m => m.stage === 'akhir');
  const thirdPlace = data.matches.find(m => m.stage === 'penentuanTempat3');

  const finalWinner = getWinner(final);
  const finalLoser = getLoser(final);
  const thirdPlaceWinner = getWinner(thirdPlace);
  const thirdPlaceLoser = getLoser(thirdPlace);

  const results = [
    { rank: t.johan, teamId: finalWinner },
    { rank: t.naibJohan, teamId: finalLoser },
    { rank: t.ketiga, teamId: thirdPlaceWinner },
    { rank: t.keempat, teamId: thirdPlaceLoser },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 py-8">
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0">
        <ResultPodium rank={t.naibJohan} team={data.teams.find(t => t.id === results[1].teamId)} height="h-48" color="bg-slate-300" lang={lang} />
        <ResultPodium rank={t.johan} team={data.teams.find(t => t.id === results[0].teamId)} height="h-64" color="bg-yellow-400" isWinner lang={lang} />
        <ResultPodium rank={t.ketiga} team={data.teams.find(t => t.id === results[2].teamId)} height="h-36" color="bg-orange-400" lang={lang} />
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-800 p-4 text-center">
          <h3 className="text-white font-black uppercase tracking-widest">{t.keputusanRasmiKeseluruhan}</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {results.map((res, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-xs font-black text-slate-500">
                  {idx + 1}
                </span>
                <span className="font-black text-slate-800 uppercase text-sm">{res.rank}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">{data.teams.find(t => t.id === res.teamId)?.name || 'TBD'}</span>
                {data.teams.find(t => t.id === res.teamId)?.logoUrl && (
                  <img src={data.teams.find(t => t.id === res.teamId)?.logoUrl} alt="" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ResultPodium({ rank, team, height, color, isWinner, lang }: { rank: string, team?: Team, height: string, color: string, isWinner?: boolean, lang: Language }) {
  const t = translations[lang];
  return (
    <div className="flex flex-col items-center w-full max-w-[200px]">
      <div className="mb-4 text-center">
        {team?.logoUrl ? (
          <img src={team.logoUrl} alt="" className={cn("w-16 h-16 object-contain mx-auto mb-2", isWinner ? "scale-125" : "")} referrerPolicy="no-referrer" />
        ) : (
          <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-2 flex items-center justify-center text-slate-400 font-bold">
            {getTeamLogoText(team?.name || '')}
          </div>
        )}
        <p className="text-xs font-black text-slate-800 uppercase line-clamp-1 px-2">{team?.name || 'TBD'}</p>
      </div>
      <div className={cn("w-full rounded-t-2xl flex flex-col items-center justify-center text-white p-4 shadow-lg", height, color)}>
        <span className="text-4xl font-black mb-1">{rank === t.johan ? '1' : rank === t.naibJohan ? '2' : '3'}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{rank}</span>
      </div>
    </div>
  );
}

// --- Admin Panel ---

function AdminPanel({ data, userRole, activeSubTab, setActiveSubTab, updateData, lang }: { 
  data: AppData, 
  userRole: string, 
  activeSubTab: string, 
  setActiveSubTab: (tab: string) => void,
  updateData: (newData: AppData) => Promise<void>,
  lang: Language
}) {
  const t = translations[lang];
  const menuItems = [
    { id: 'Pendaftaran Pasukan', label: t.pendaftaranPasukan, icon: Users },
    ...(userRole === 'Urusetia' ? [
      { id: 'Pengurusan Kumpulan', label: t.pengurusanKumpulan, icon: ListOrdered },
      { id: 'Pengurusan Jadual Perlawanan', label: t.pengurusanJadual, icon: Calendar },
      { id: 'Perlawanan & Keputusan', label: t.pengurusanPerlawanan, icon: Trophy },
      { id: 'Catatan', label: t.catatan, icon: FileText },
      { id: 'Pautan Pantas', label: t.pautanPantas, icon: Globe },
      { id: 'Tetapan Maklumat', label: "Tetapan Maklumat", icon: LayoutGrid },
      { id: 'Tetapan Kejohanan', label: t.tetapanKejohanan, icon: ShieldAlert },
    ] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full items-start">
      {/* Sidebar for Desktop / Dropdown for Mobile */}
      <aside className="w-full md:w-64 space-y-2 sticky top-24 z-20">
        {/* Mobile Dropdown */}
        <div className="md:hidden w-full relative group">
          <select
            value={activeSubTab}
            onChange={(e) => setActiveSubTab(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-4 pr-10 font-black text-slate-800 uppercase tracking-tight shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          >
            {menuItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col gap-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={cn(
                "w-full flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold",
                activeSubTab === item.id 
                  ? "bg-accent text-white shadow-lg shadow-accent/20" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-6 overflow-y-auto min-h-[600px] w-full">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-3">
          {menuItems.find(i => i.id === activeSubTab)?.icon && React.createElement(menuItems.find(i => i.id === activeSubTab)!.icon, { className: "w-6 h-6 md:w-8 md:h-8 text-accent" })}
          {menuItems.find(i => i.id === activeSubTab)?.label}
        </h2>

        <AnimatePresence mode="wait">
          {activeSubTab === 'Pendaftaran Pasukan' && <TeamRegistration data={data} userRole={userRole} updateData={updateData} lang={lang} />}
          {activeSubTab === 'Pengurusan Kumpulan' && <GroupManagement data={data} updateData={updateData} lang={lang} />}
          {activeSubTab === 'Pengurusan Jadual Perlawanan' && <ScheduleManagement data={data} updateData={updateData} lang={lang} />}
          {activeSubTab === 'Perlawanan & Keputusan' && <MatchManagement data={data} updateData={updateData} lang={lang} />}
          {activeSubTab === 'Catatan' && <NotesTab data={data} lang={lang} />}
          {activeSubTab === 'Pautan Pantas' && <QuickLinksTab data={data} updateData={updateData} lang={lang} />}
          {activeSubTab === 'Tetapan Maklumat' && <SettingsTab data={data} updateData={updateData} lang={lang} />}
          {activeSubTab === 'Tetapan Kejohanan' && <TournamentSettingsTab data={data} updateData={updateData} lang={lang} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Admin Sub-Tabs ---

function TeamRegistration({ data, userRole, updateData, lang }: { data: AppData, userRole: string, updateData: (d: AppData) => Promise<void>, lang: Language }) {
  const t = translations[lang];
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const isRegOpen = data.tournamentInfo.isRegistrationOpen;

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    const newTeams = editingTeam.id 
      ? data.teams.map(t => t.id === editingTeam.id ? editingTeam : t)
      : [...data.teams, { ...editingTeam, id: generateId() }];

    await updateData({ ...data, teams: newTeams });
    setEditingTeam(null);
  };

  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  const handleDeleteTeam = async (id: string) => {
    if (userRole === 'Pengurus' && !isRegOpen) return;
    setTeamToDelete(id);
  };

  const confirmDeleteTeam = async () => {
    if (teamToDelete) {
      await updateData({ ...data, teams: data.teams.filter(t => t.id !== teamToDelete) });
      setTeamToDelete(null);
    }
  };

  const filteredTeams = data.teams;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">{t.senaraiPasukan} ({filteredTeams.length})</h3>
        {isRegOpen && (
          <button 
            onClick={() => setEditingTeam({ id: '', name: '', managerName: '', players: [] })}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            {t.tambahPasukan}
          </button>
        )}
      </div>

      {!isRegOpen && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-bold">{t.pendaftaranTutup}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeams.map(team => (
          <div key={team.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt="" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs">
                  {getTeamLogoText(team.name)}
                </div>
              )}
              <div>
                <h4 className="font-black text-slate-800">{team.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase">{team.players.length} {t.pemain}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setEditingTeam(team)}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
              >
                {(!isRegOpen && userRole !== 'Urusetia') ? <ListOrdered className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </button>
              {userRole === 'Urusetia' && (
                <button 
                  onClick={() => handleDeleteTeam(team.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={teamToDelete !== null}
        onClose={() => setTeamToDelete(null)}
        onConfirm={confirmDeleteTeam}
        title={t.padamPasukan}
        message={t.andaPastiPadamPasukan}
        lang={lang}
      />

      {editingTeam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase">
                {editingTeam.id ? ( (!isRegOpen && userRole !== 'Urusetia') ? t.lihatPasukan : t.kemaskiniPasukan) : t.pendaftaranPasukanBaru}
              </h3>
              <button onClick={() => setEditingTeam(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="p-6 overflow-y-auto space-y-6">
              {(!isRegOpen && userRole !== 'Urusetia') && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-xs font-bold flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {t.pendaftaranTutupInfo}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">{t.namaPasukan}</label>
                  <input 
                    required
                    disabled={!isRegOpen && userRole !== 'Urusetia'}
                    value={editingTeam.name || ''}
                    onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-bold disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">URL Logo</label>
                  <input 
                    disabled={!isRegOpen && userRole !== 'Urusetia'}
                    value={editingTeam.logoUrl || ''}
                    onChange={e => setEditingTeam({ ...editingTeam, logoUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-bold disabled:opacity-50"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">{t.namaPengurus}</label>
                  <input 
                    required
                    disabled={!isRegOpen && userRole !== 'Urusetia'}
                    value={editingTeam.managerName || ''}
                    onChange={e => setEditingTeam({ ...editingTeam, managerName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-bold disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">{t.noTel}</label>
                  <input 
                    disabled={!isRegOpen && userRole !== 'Urusetia'}
                    value={editingTeam.managerPhone || ''}
                    onChange={e => setEditingTeam({ ...editingTeam, managerPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-slate-800 uppercase">{t.senaraiPemain} ({editingTeam.players.length}/15)</h4>
                  {(isRegOpen || userRole === 'Urusetia') && (
                    <button 
                      type="button"
                      disabled={editingTeam.players.length >= 15}
                      onClick={() => setEditingTeam({ 
                        ...editingTeam, 
                        players: [...editingTeam.players, { id: generateId(), name: '', jerseyNumber: 0, position: 'FW', teamId: editingTeam.id }] 
                      })}
                      className="text-accent text-xs font-bold hover:underline disabled:text-slate-300 disabled:no-underline"
                    >
                      {editingTeam.players.length >= 15 ? t.hadMaksimum : '+ ' + t.tambahPemain}
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {editingTeam.players.map((player, idx) => (
                    <div key={player.id} className="flex gap-2 items-center">
                      <input 
                        required
                        disabled={!isRegOpen && userRole !== 'Urusetia'}
                        placeholder={t.namaPemain}
                        value={player.name || ''}
                        onChange={e => {
                          const newPlayers = [...editingTeam.players];
                          newPlayers[idx].name = e.target.value;
                          setEditingTeam({ ...editingTeam, players: newPlayers });
                        }}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold disabled:opacity-50"
                      />
                      <input 
                        required
                        disabled={!isRegOpen && userRole !== 'Urusetia'}
                        type="number"
                        placeholder="No"
                        value={player.jerseyNumber || ''}
                        onChange={e => {
                          const newPlayers = [...editingTeam.players];
                          newPlayers[idx].jerseyNumber = parseInt(e.target.value) || 0;
                          setEditingTeam({ ...editingTeam, players: newPlayers });
                        }}
                        className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold disabled:opacity-50"
                      />
                      <select 
                        disabled={!isRegOpen && userRole !== 'Urusetia'}
                        value={player.position}
                        onChange={e => {
                          const newPlayers = [...editingTeam.players];
                          newPlayers[idx].position = e.target.value as any;
                          setEditingTeam({ ...editingTeam, players: newPlayers });
                        }}
                        className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold disabled:opacity-50"
                      >
                        <option value="GK">GK</option>
                        <option value="DF">DF</option>
                        <option value="MF">MF</option>
                        <option value="FW">FW</option>
                      </select>
                      {(isRegOpen || userRole === 'Urusetia') && (
                        <button 
                          type="button"
                          onClick={() => {
                            const newPlayers = editingTeam.players.filter((_, i) => i !== idx);
                            setEditingTeam({ ...editingTeam, players: newPlayers });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  {(!isRegOpen && userRole !== 'Urusetia') ? t.tutup : t.batal}
                </button>
                {(isRegOpen || userRole === 'Urusetia') && (
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:shadow-xl transition-all"
                  >
                    {t.simpanPasukan}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function GroupManagement({ data, updateData, lang }: { data: AppData, updateData: (d: AppData) => Promise<void>, lang: Language }) {
  const t = translations[lang];
  const handleAddGroup = async () => {
    const currentGroups = data.groups || [];
    const nextChar = String.fromCharCode(65 + currentGroups.length);
    const newGroupName = nextChar;
    
    if (currentGroups.includes(newGroupName)) {
      alert(t.kumpulanSudahWujud);
      return;
    }

    const newGroups = [...currentGroups, newGroupName].sort();
    await updateData({ ...data, groups: newGroups });
  };

  const handleRemoveGroup = async (group: string) => {
    const newGroups = (data.groups || []).filter(g => g !== group);
    const newTeams = data.teams.map(t => t.group === group ? { ...t, group: undefined, code: undefined } : t);
    await updateData({ ...data, groups: newGroups, teams: newTeams });
  };

  const handleAssignTeam = async (teamId: string, group: string | null) => {
    let newTeams = [...data.teams];
    if (group) {
      const groupTeams = newTeams.filter(t => t.group === group);
      const nextNumber = groupTeams.length + 1;
      newTeams = newTeams.map(t => 
        t.id === teamId ? { ...t, group: group, code: `${group}${nextNumber}` } : t
      );
    } else {
      const teamToRemove = newTeams.find(t => t.id === teamId);
      const oldGroup = teamToRemove?.group;
      newTeams = newTeams.map(t => t.id === teamId ? { ...t, group: undefined, code: undefined } : t);
      
      if (oldGroup) {
        let count = 1;
        newTeams = newTeams.map(t => {
          if (t.group === oldGroup) {
            const newCode = `${oldGroup}${count++}`;
            return { ...t, code: newCode };
          }
          return t;
        });
      }
    }
    await updateData({ ...data, teams: newTeams });
  };

  const unassignedTeams = data.teams.filter(t => !t.group);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800">{t.pengurusanKumpulan}</h2>
          <p className="text-sm text-slate-500 font-medium">{t.silaUndiPasukan}</p>
        </div>
        <button 
          onClick={handleAddGroup}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl font-black shadow-lg shadow-accent/20 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          {t.tambahKumpulan}
        </button>
      </div>

      {/* Unassigned Teams Section */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.pasukanBelumDiundi} ({unassignedTeams.length})</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {unassignedTeams.map(team => (
            <div key={team.id} className="bg-white p-3 pr-1 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm group hover:border-accent/30 transition-all">
              <span className="font-bold text-slate-700 pl-2">{team.name}</span>
              <div className="flex gap-1">
                {(data.groups || []).map(g => (
                  <button
                    key={g}
                    onClick={() => handleAssignTeam(team.id, g)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-black text-xs hover:bg-accent hover:text-white transition-all"
                    title={`${t.kumpulan} ${g}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {unassignedTeams.length === 0 && (
            <div className="w-full py-8 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-2xl">
              {t.semuaPasukanDiundi}
            </div>
          )}
        </div>
      </div>

      {/* All Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {(data.groups || []).map(group => {
          const teamsInGroup = data.teams.filter(t => t.group === group).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
          return (
            <div key={group} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                <span className="font-black tracking-tighter uppercase">{t.kumpulan} {group}</span>
                <button 
                  onClick={() => handleRemoveGroup(group)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-1 space-y-2">
                {teamsInGroup.map(team => (
                  <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400">{team.code}</span>
                      <span className="text-sm font-bold text-slate-700">{team.name}</span>
                    </div>
                    <button 
                      onClick={() => handleAssignTeam(team.id, null)}
                      className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {teamsInGroup.length === 0 && (
                  <div className="py-8 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                    {t.kosong}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleManagement({ data, updateData, lang }: { data: AppData, updateData: (d: AppData) => Promise<void>, lang: Language }) {
  const t = translations[lang];
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const handleSwapTeams = async (matchId: string) => {
    const newMatches = data.matches.map(m => {
      if (m.id === matchId) {
        return { ...m, team1Id: m.team2Id, team2Id: m.team1Id, score1: m.score2, score2: m.score1 };
      }
      return m;
    });
    await updateData({ ...data, matches: newMatches });
  };

  const handleInlineUpdate = async (matchId: string, field: string, value: string) => {
    const newMatches = data.matches.map(m => {
      if (m.id === matchId) {
        return { ...m, [field]: value };
      }
      return m;
    });
    await updateData({ ...data, matches: newMatches });
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    // Auto-calculate scores from goals
    const score1 = editingMatch.goals.filter(g => g.teamId === editingMatch.team1Id && g.type !== 'Gol Sendiri').length + 
                   editingMatch.goals.filter(g => g.teamId === editingMatch.team2Id && g.type === 'Gol Sendiri').length;
    const score2 = editingMatch.goals.filter(g => g.teamId === editingMatch.team2Id && g.type !== 'Gol Sendiri').length + 
                   editingMatch.goals.filter(g => g.teamId === editingMatch.team1Id && g.type === 'Gol Sendiri').length;

    const updatedMatch = { 
      ...editingMatch, 
      score1, 
      score2,
      penaltyScore1: editingMatch.penaltyScore1 || 0,
      penaltyScore2: editingMatch.penaltyScore2 || 0
    };
    const newMatches = data.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    await updateData({ ...data, matches: newMatches });
    setEditingMatch(null);
  };

  const handleDeleteMatch = (matchId: string) => {
    setMatchToDelete(matchId);
  };

  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return;
    const newMatches = data.matches.filter(m => m.id !== matchToDelete);
    await updateData({ ...data, matches: newMatches });
    setMatchToDelete(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-800 p-6">
        <h3 className="text-white font-black uppercase tracking-widest text-sm">{t.pengurusanJadual}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noPerlawanan}</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.peringkat}</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.tarikh}</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.masa}</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.padang}</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[250px]">{t.pasukan} 1</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[250px]">{t.pasukan} 2</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.status}</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.semakan}</th>
            </tr>
          </thead>
          <tbody>
            {sortMatches(data.matches).map((m, idx) => {
              const t1 = data.teams.find(t => t.id === m.team1Id);
              const t2 = data.teams.find(t => t.id === m.team2Id);
              const isReady = m.status === 'tamatPerlawanan';
              
              return (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 text-xs font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-3 text-[10px] font-black text-slate-400 uppercase">{m.stage}</td>
                  <td className="p-3">
                    <input 
                      type="date"
                      value={m.date}
                      onChange={e => handleInlineUpdate(m.id, 'date', e.target.value)}
                      className="text-xs font-bold text-slate-600 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-accent outline-none w-24"
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="time"
                      value={m.time}
                      onChange={e => handleInlineUpdate(m.id, 'time', e.target.value)}
                      className="text-xs font-bold text-slate-600 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-accent outline-none w-16"
                    />
                  </td>
                  <td className="p-3">
                    <select 
                      value={m.venue}
                      onChange={e => handleInlineUpdate(m.id, 'venue', e.target.value)}
                      className="text-xs font-bold text-slate-600 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-accent outline-none"
                    >
                      <option value="Padang A">Padang A</option>
                      <option value="Padang B">Padang B</option>
                    </select>
                  </td>
                  <td className="p-3 min-w-[250px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-accent flex-shrink-0">{t1?.code || '-'}</span>
                      <span className="text-xs font-bold text-slate-800 line-clamp-3 leading-tight">{t1?.name || 'TBD'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleSwapTeams(m.id)}
                      className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      title={t.tukarPosisi}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="p-3 min-w-[250px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-accent flex-shrink-0">{t2?.code || '-'}</span>
                      <span className="text-xs font-bold text-slate-800 line-clamp-3 leading-tight">{t2?.name || 'TBD'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase whitespace-nowrap",
                      m.status === 'tamatPerlawanan' ? "bg-green-100 text-green-600" :
                      m.status === 'sedangBerlangsung' ? "bg-blue-100 text-blue-600" :
                      "bg-slate-100 text-slate-400"
                    )}>
                      {t[m.status]}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setEditingMatch(m)}
                        className="p-1.5 bg-blue-50 text-accent rounded-lg hover:bg-blue-100 transition-colors"
                        title={t.inputKeputusan}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-2">
                        {isReady ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <Shield className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase">OK</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-500">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase">PENDING</span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteMatch(m.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                        title={t.padam}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={matchToDelete !== null}
        onClose={() => setMatchToDelete(null)}
        onConfirm={confirmDeleteMatch}
        title={t.padamPerlawanan}
        message={t.andaPastiPadamPerlawanan}
        lang={lang}
      />

      {editingMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase">{t.inputKeputusan}</h3>
              <button onClick={() => setEditingMatch(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="p-6 overflow-y-auto space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.tarikhPerlawanan}</label>
                  <input 
                    type="date"
                    value={editingMatch.date || ''}
                    onChange={e => setEditingMatch({ ...editingMatch, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-accent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.masaPerlawanan}</label>
                    <input 
                      type="time"
                      value={editingMatch.time || ''}
                      onChange={e => setEditingMatch({ ...editingMatch, time: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.padang}</label>
                    <div className="flex gap-2">
                      {['Padang A', 'Padang B'].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setEditingMatch({ ...editingMatch, venue: v })}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-xs font-black transition-all border",
                            editingMatch.venue === v
                              ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4 text-center">
                  <p className="font-black text-slate-800">{data.teams.find(t => t.id === editingMatch.team1Id)?.name || 'TBD'}</p>
                  <div className="w-20 h-20 mx-auto flex items-center justify-center text-4xl font-black bg-slate-100 border-2 border-slate-200 rounded-2xl text-slate-800">
                    {editingMatch.goals.filter(g => g.teamId === editingMatch.team1Id && g.type !== 'Gol Sendiri').length + 
                     editingMatch.goals.filter(g => g.teamId === editingMatch.team2Id && g.type === 'Gol Sendiri').length}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t.golAutomatik}</p>
                </div>
                <div className="space-y-4 text-center">
                  <p className="font-black text-slate-800">{data.teams.find(t => t.id === editingMatch.team2Id)?.name || 'TBD'}</p>
                  <div className="w-20 h-20 mx-auto flex items-center justify-center text-4xl font-black bg-slate-100 border-2 border-slate-200 rounded-2xl text-slate-800">
                    {editingMatch.goals.filter(g => g.teamId === editingMatch.team2Id && g.type !== 'Gol Sendiri').length + 
                     editingMatch.goals.filter(g => g.teamId === editingMatch.team1Id && g.type === 'Gol Sendiri').length}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t.golAutomatik}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.statusPerlawanan}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['akanDatang', 'sedangBerlangsung', 'tamatPerlawanan', 'ditangguhkan'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditingMatch({ ...editingMatch, status })}
                      className={cn(
                        "py-3 rounded-xl text-[10px] font-black uppercase transition-all border",
                        editingMatch.status === status
                          ? "bg-slate-800 text-white border-slate-800 shadow-lg"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {t[status]}
                    </button>
                  ))}
                </div>
              </div>

              {editingMatch.isKnockout && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="text-xs font-black text-blue-600 uppercase mb-3 text-center">{t.penentuanPenalti}</h4>
                  <div className="flex justify-center gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 text-center">{t.pasukan} 1</p>
                      <input 
                        type="number"
                        placeholder="0"
                        value={editingMatch.penaltyScore1 ?? ''}
                        onChange={e => setEditingMatch({ ...editingMatch, penaltyScore1: parseInt(e.target.value) || 0 })}
                        className="w-16 py-2 text-center bg-white border border-blue-200 rounded-lg font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 text-center">{t.pasukan} 2</p>
                      <input 
                        type="number"
                        placeholder="0"
                        value={editingMatch.penaltyScore2 ?? ''}
                        onChange={e => setEditingMatch({ ...editingMatch, penaltyScore2: parseInt(e.target.value) || 0 })}
                        className="w-16 py-2 text-center bg-white border border-blue-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingMatch.isKnockout && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="text-xs font-black text-blue-600 uppercase mb-3 text-center">{t.penentuanPenalti}</h4>
                  <div className="flex justify-center gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 text-center">{t.pasukan} 1</p>
                      <input 
                        type="number"
                        placeholder="0"
                        value={editingMatch.penaltyScore1 ?? ''}
                        onChange={e => setEditingMatch({ ...editingMatch, penaltyScore1: parseInt(e.target.value) || 0 })}
                        className="w-16 py-2 text-center bg-white border border-blue-200 rounded-lg font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 text-center">{t.pasukan} 2</p>
                      <input 
                        type="number"
                        placeholder="0"
                        value={editingMatch.penaltyScore2 ?? ''}
                        onChange={e => setEditingMatch({ ...editingMatch, penaltyScore2: parseInt(e.target.value) || 0 })}
                        className="w-16 py-2 text-center bg-white border border-blue-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Goals Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.penjaringGol}</label>
                  <button 
                    type="button"
                    onClick={() => setEditingMatch({
                      ...editingMatch,
                      goals: [...editingMatch.goals, { id: generateId(), teamId: editingMatch.team1Id, playerId: '', minute: 0, type: 'Gol Padang' }]
                    })}
                    className="text-[10px] font-black text-accent uppercase hover:underline"
                  >
                    + {t.tambahGol}
                  </button>
                </div>
                <div className="space-y-2">
                  {editingMatch.goals.map((goal, idx) => (
                    <div key={goal.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <select 
                        value={goal.teamId}
                        onChange={e => {
                          const newGoals = [...editingMatch.goals];
                          newGoals[idx].teamId = e.target.value;
                          newGoals[idx].playerId = '';
                          setEditingMatch({ ...editingMatch, goals: newGoals });
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                      >
                        <option value={editingMatch.team1Id}>{data.teams.find(t => t.id === editingMatch.team1Id)?.name}</option>
                        <option value={editingMatch.team2Id}>{data.teams.find(t => t.id === editingMatch.team2Id)?.name}</option>
                      </select>
                      <select 
                        value={goal.playerId}
                        onChange={e => {
                          const newGoals = [...editingMatch.goals];
                          newGoals[idx].playerId = e.target.value;
                          setEditingMatch({ ...editingMatch, goals: newGoals });
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                      >
                        <option value="">{t.pilihPemain}</option>
                        {data.teams.find(t => t.id === goal.teamId)?.players.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input 
                        type="number"
                        placeholder="Min"
                        value={goal.minute || ''}
                        onChange={e => {
                          const newGoals = [...editingMatch.goals];
                          newGoals[idx].minute = parseInt(e.target.value) || 0;
                          setEditingMatch({ ...editingMatch, goals: newGoals });
                        }}
                        className="w-14 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                      />
                      <select 
                        value={goal.type}
                        onChange={e => {
                          const newGoals = [...editingMatch.goals];
                          newGoals[idx].type = e.target.value as any;
                          setEditingMatch({ ...editingMatch, goals: newGoals });
                        }}
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                      >
                        <option value="Gol Padang">Gol Padang</option>
                        <option value="Penalti">Penalti</option>
                        <option value="Gol Sendiri">Gol Sendiri</option>
                      </select>
                      <button 
                        type="button"
                        onClick={() => {
                          const newGoals = editingMatch.goals.filter((_, i) => i !== idx);
                          setEditingMatch({ ...editingMatch, goals: newGoals });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editingMatch.goals.length === 0 && (
                    <p className="text-center py-4 text-slate-400 text-[10px] font-medium border border-dashed border-slate-200 rounded-xl">{t.tiadaGolDirekodkan}</p>
                  )}
                </div>
              </div>

              {/* Cards Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.kad}</label>
                  <button 
                    type="button"
                    onClick={() => setEditingMatch({
                      ...editingMatch,
                      cards: [...editingMatch.cards, { id: generateId(), teamId: editingMatch.team1Id, playerId: '', type: 'Kuning', minute: 0 }]
                    })}
                    className="text-[10px] font-black text-accent uppercase hover:underline"
                  >
                    + {t.tambahKad}
                  </button>
                </div>
                <div className="space-y-2">
                  {editingMatch.cards.map((card, idx) => (
                    <div key={card.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <select 
                        value={card.teamId}
                        onChange={e => {
                          const newCards = [...editingMatch.cards];
                          newCards[idx].teamId = e.target.value;
                          newCards[idx].playerId = '';
                          setEditingMatch({ ...editingMatch, cards: newCards });
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                      >
                        <option value={editingMatch.team1Id}>{data.teams.find(t => t.id === editingMatch.team1Id)?.name}</option>
                        <option value={editingMatch.team2Id}>{data.teams.find(t => t.id === editingMatch.team2Id)?.name}</option>
                      </select>
                      <select 
                        value={card.playerId}
                        onChange={e => {
                          const newCards = [...editingMatch.cards];
                          newCards[idx].playerId = e.target.value;
                          setEditingMatch({ ...editingMatch, cards: newCards });
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                      >
                        <option value="">{t.pilihPemain}</option>
                        {data.teams.find(t => t.id === card.teamId)?.players.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <select 
                        value={card.type}
                        onChange={e => {
                          const newCards = [...editingMatch.cards];
                          newCards[idx].type = e.target.value as any;
                          setEditingMatch({ ...editingMatch, cards: newCards });
                        }}
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                      >
                        <option value="Kuning">{t.kadKuning}</option>
                        <option value="Merah">{t.kadMerah}</option>
                      </select>
                      <input 
                        type="number"
                        placeholder="Min"
                        value={card.minute || ''}
                        onChange={e => {
                          const newCards = [...editingMatch.cards];
                          newCards[idx].minute = parseInt(e.target.value) || 0;
                          setEditingMatch({ ...editingMatch, cards: newCards });
                        }}
                        className="w-14 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newCards = editingMatch.cards.filter((_, i) => i !== idx);
                          setEditingMatch({ ...editingMatch, cards: newCards });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editingMatch.cards.length === 0 && (
                  <p className="text-center py-4 text-slate-400 text-[10px] font-medium border border-dashed border-slate-200 rounded-xl">{t.tiadaKadDirekodkan}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setEditingMatch(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                {t.batal}
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:shadow-xl transition-all"
              >
                {t.simpanKeputusan}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </div>
  );
}

function MatchManagement({ data, updateData, lang }: { data: AppData, updateData: (d: AppData) => Promise<void>, lang: Language }) {
  const t = translations[lang];
  const [selectedStage, setSelectedStage] = useState<Match['stage']>('kumpulan');
  const [selectedGroup, setSelectedGroup] = useState((data.groups || [])[0] || '');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!selectedGroup && (data.groups || []).length > 0) {
      setSelectedGroup(data.groups[0]);
    } else if (selectedGroup && !(data.groups || []).includes(selectedGroup)) {
      setSelectedGroup((data.groups || [])[0] || '');
    }
  }, [data.groups, selectedGroup]);

  const stages: {id: Match['stage'], label: string}[] = [
    {id: 'kumpulan', label: t.kumpulan},
    {id: 'pusingan16', label: t.pusingan16},
    {id: 'sukuAkhir', label: t.sukuAkhir},
    {id: 'separuhAkhir', label: t.separuhAkhir},
    {id: 'penentuanTempat3', label: t.penentuanTempat3},
    {id: 'akhir', label: t.akhir}
  ];

  const handleGenerateGroupMatches = async () => {
    const groupTeams = data.teams.filter(t => t.group === selectedGroup).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    if (groupTeams.length < 2) {
      alert(t.perlu2Pasukan);
      return;
    }

    // Round Robin Circle Method
    const teams = [...groupTeams];
    const isOdd = teams.length % 2 !== 0;
    if (isOdd) {
      teams.push({ id: 'BYE', name: 'BYE', managerName: '', players: [] });
    }

    const n = teams.length;
    const rounds = n - 1;
    const matchesPerRound = n / 2;
    const generatedPairings: { t1: string, t2: string }[] = [];

    const circle = [...teams];
    const fixed = circle.shift()!;

    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const t1 = i === 0 ? fixed : circle[i - 1];
        const t2 = circle[circle.length - 1 - i];
        if (t1.id !== 'BYE' && t2.id !== 'BYE') {
          generatedPairings.push({ t1: t1.id, t2: t2.id });
        }
      }
      // Rotate circle
      circle.unshift(circle.pop()!);
    }

    const newMatches: Match[] = [];
    const getNextMatchNumber = () => {
      const existingCodes = data.matches
        .map(m => m.matchCode)
        .filter(code => code?.startsWith('P'))
        .map(code => parseInt(code.substring(1)))
        .filter(num => !isNaN(num));
      const max = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
      return max + 1;
    };

    let currentMatchNumber = getNextMatchNumber();
    
    // Find starting time based on existing matches to avoid overlaps
    const getNextAvailableSlot = () => {
      if (data.matches.length === 0) return { time: data.tournamentInfo.time || '08:00', count: 0 };
      
      const sorted = [...data.matches].sort((a, b) => a.time.localeCompare(b.time));
      const last = sorted[sorted.length - 1];
      const countAtLastTime = sorted.filter(m => m.time === last.time).length;
      
      if (countAtLastTime < 2) {
        return { time: last.time, count: countAtLastTime };
      } else {
        return { time: addMinutesToTime(last.time, 20), count: 0 };
      }
    };

    let { time: currentSlotTime, count: currentSlotCount } = getNextAvailableSlot();

    for (const pairing of generatedPairings) {
      // Check if match already exists
      const exists = data.matches.find(m => 
        m.stage === 'kumpulan' && 
        m.group === selectedGroup && 
        ((m.team1Id === pairing.t1 && m.team2Id === pairing.t2) || 
         (m.team1Id === pairing.t2 && m.team2Id === pairing.t1))
      );

      if (!exists) {
        const venue = currentSlotCount === 0 ? 'Padang A' : 'Padang B';
        
        newMatches.push({
          id: `G-${selectedGroup}-${pairing.t1}-${pairing.t2}-${generateId()}`,
          matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`,
          team1Id: pairing.t1,
          team2Id: pairing.t2,
          stage: 'kumpulan',
          group: selectedGroup,
          status: 'akanDatang',
          date: data.tournamentInfo.startDate,
          time: currentSlotTime,
          venue: venue,
          goals: [],
          cards: []
        });

        currentSlotCount++;
        if (currentSlotCount >= 2) {
          currentSlotCount = 0;
          currentSlotTime = addMinutesToTime(currentSlotTime, 20);
        }
      }
    }

    if (newMatches.length === 0) {
      alert(t.semuaPerlawananWujud);
      return;
    }

    await updateData({ ...data, matches: [...data.matches, ...newMatches] });
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    // Auto-calculate scores from goals
    const score1 = editingMatch.goals.filter(g => g.teamId === editingMatch.team1Id && g.type !== 'Gol Sendiri').length + 
                   editingMatch.goals.filter(g => g.teamId === editingMatch.team2Id && g.type === 'Gol Sendiri').length;
    const score2 = editingMatch.goals.filter(g => g.teamId === editingMatch.team2Id && g.type !== 'Gol Sendiri').length + 
                   editingMatch.goals.filter(g => g.teamId === editingMatch.team1Id && g.type === 'Gol Sendiri').length;

    const updatedMatch = { 
      ...editingMatch, 
      score1, 
      score2,
      penaltyScore1: editingMatch.penaltyScore1 || 0,
      penaltyScore2: editingMatch.penaltyScore2 || 0
    };
    const newMatches = data.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    await updateData({ ...data, matches: newMatches });
    setEditingMatch(null);
  };

  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  const handleDeleteMatch = async (id: string) => {
    setMatchToDelete(id);
  };

  const confirmDeleteMatch = async () => {
    if (matchToDelete) {
      await updateData({ ...data, matches: data.matches.filter(m => m.id !== matchToDelete) });
      setMatchToDelete(null);
    }
  };

  const handleInlineUpdate = async (matchId: string, field: string, value: string) => {
    const newMatches = data.matches.map(m => m.id === matchId ? { ...m, [field]: value } : m);
    await updateData({ ...data, matches: newMatches });
  };

  const getStandingsForGroup = (group: string) => {
    const groupTeams = data.teams.filter(t => t.group === group);
    return groupTeams.map(team => {
      const matches = data.matches.filter(m => m.status === 'tamatPerlawanan' && m.stage === 'kumpulan' && (m.team1Id === team.id || m.team2Id === team.id));
      let won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;

      matches.forEach(m => {
        const isTeam1 = m.team1Id === team.id;
        const teamScore = isTeam1 ? m.score1! : m.score2!;
        const oppScore = isTeam1 ? m.score2! : m.score1!;
        gf += teamScore;
        ga += oppScore;
        if (teamScore > oppScore) won++;
        else if (teamScore === oppScore) drawn++;
        else lost++;
      });

      return {
        id: team.id,
        pts: (won * 3) + (drawn * 1),
        gd: gf - ga,
        gf
      };
    }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  };

  const handleGenerateKnockoutMatches = async () => {
    if (selectedStage === 'kumpulan') {
      const groups = data.groups || [];
      if (groups.length !== 4) {
        alert(t.hanya4Kumpulan);
        return;
      }

      const standings = groups.reduce((acc, g) => ({ ...acc, [g]: getStandingsForGroup(g) }), {} as Record<string, any[]>);
      const unfinishedGroupMatches = data.matches.filter(m => m.stage === 'kumpulan' && m.status !== 'tamatPerlawanan');
      if (unfinishedGroupMatches.length > 0) {
        alert(t.pastikanTamatKumpulan);
        return;
      }

      const getNextMatchNumber = () => {
        const existingCodes = data.matches
          .map(m => m.matchCode)
          .filter(code => code?.startsWith('P'))
          .map(code => parseInt(code.substring(1)))
          .filter(num => !isNaN(num));
        const max = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
        return max + 1;
      };

      let currentMatchNumber = getNextMatchNumber();

      const quarterFinals: Match[] = [
        { id: `QF1-${generateId()}`, matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`, team1Id: standings['A'][0].id, team2Id: standings['B'][1].id, stage: 'sukuAkhir', status: 'akanDatang', date: data.tournamentInfo.startDate, time: '09:00', venue: data.tournamentInfo.venue, goals: [], cards: [], isKnockout: true },
        { id: `QF2-${generateId()}`, matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`, team1Id: standings['B'][0].id, team2Id: standings['A'][1].id, stage: 'sukuAkhir', status: 'akanDatang', date: data.tournamentInfo.startDate, time: '10:00', venue: data.tournamentInfo.venue, goals: [], cards: [], isKnockout: true },
        { id: `QF3-${generateId()}`, matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`, team1Id: standings['C'][0].id, team2Id: standings['D'][1].id, stage: 'sukuAkhir', status: 'akanDatang', date: data.tournamentInfo.startDate, time: '11:00', venue: data.tournamentInfo.venue, goals: [], cards: [], isKnockout: true },
        { id: `QF4-${generateId()}`, matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`, team1Id: standings['D'][0].id, team2Id: standings['C'][1].id, stage: 'sukuAkhir', status: 'akanDatang', date: data.tournamentInfo.startDate, time: '12:00', venue: data.tournamentInfo.venue, goals: [], cards: [], isKnockout: true },
      ];

      await updateData({ ...data, matches: [...data.matches, ...quarterFinals] });
      setSelectedStage('sukuAkhir');
    }
  };

  const handleGenerateSemiFinals = async () => {
    if (selectedStage === 'sukuAkhir') {
      const qfMatches = data.matches.filter(m => m.stage === 'sukuAkhir');
      const unfinishedQF = qfMatches.filter(m => m.status !== 'tamatPerlawanan');
      if (unfinishedQF.length > 0) {
        alert(t.pastikanTamatSukuAkhir);
        return;
      }

      const winners = qfMatches.map(m => getWinner(m));
      if (winners.some(w => !w)) {
        alert(t.pastikanTamatSukuAkhir);
        return;
      }

      const getNextMatchNumber = () => {
        const existingCodes = data.matches
          .map(m => m.matchCode)
          .filter(code => code?.startsWith('P'))
          .map(code => parseInt(code.substring(1)))
          .filter(num => !isNaN(num));
        const max = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
        return max + 1;
      };

      let currentMatchNumber = getNextMatchNumber();

      const semiFinals: Match[] = [
        { id: `SF1-${generateId()}`, matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`, team1Id: winners[0]!, team2Id: winners[2]!, stage: 'separuhAkhir', status: 'akanDatang', date: data.tournamentInfo.startDate, time: '14:00', venue: data.tournamentInfo.venue, goals: [], cards: [], isKnockout: true },
        { id: `SF2-${generateId()}`, matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`, team1Id: winners[1]!, team2Id: winners[3]!, stage: 'separuhAkhir', status: 'akanDatang', date: data.tournamentInfo.startDate, time: '15:00', venue: data.tournamentInfo.venue, goals: [], cards: [], isKnockout: true },
      ];

      await updateData({ ...data, matches: [...data.matches, ...semiFinals] });
      setSelectedStage('separuhAkhir');
    }
  };

  const handleGenerateFinals = async () => {
    if (selectedStage === 'separuhAkhir') {
      const sfMatches = data.matches.filter(m => m.stage === 'separuhAkhir');
      const unfinishedSF = sfMatches.filter(m => m.status !== 'tamatPerlawanan');
      if (unfinishedSF.length > 0) {
        alert(t.pastikanTamatSeparuhAkhir);
        return;
      }

      const winners = sfMatches.map(m => getWinner(m));
      const losers = sfMatches.map(m => getLoser(m));

      if (winners.some(w => !w) || losers.some(l => !l)) {
        alert(t.pastikanTamatSeparuhAkhir);
        return;
      }

      const getNextMatchNumber = () => {
        const existingCodes = data.matches
          .map(m => m.matchCode)
          .filter(code => code?.startsWith('P'))
          .map(code => parseInt(code.substring(1)))
          .filter(num => !isNaN(num));
        const max = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
        return max + 1;
      };

      let currentMatchNumber = getNextMatchNumber();

      const finals: Match[] = [
        { id: `T3-${generateId()}`, matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`, team1Id: losers[0]!, team2Id: losers[1]!, stage: 'penentuanTempat3', status: 'akanDatang', date: data.tournamentInfo.endDate, time: '09:00', venue: data.tournamentInfo.venue, goals: [], cards: [], isKnockout: true },
        { id: `FIN-${generateId()}`, matchCode: `P${String(currentMatchNumber++).padStart(3, '0')}`, team1Id: winners[0]!, team2Id: winners[1]!, stage: 'akhir', status: 'akanDatang', date: data.tournamentInfo.endDate, time: '10:30', venue: data.tournamentInfo.venue, goals: [], cards: [], isKnockout: true },
      ];

      await updateData({ ...data, matches: [...data.matches, ...finals] });
      setSelectedStage('akhir');
    }
  };

  const filteredMatches = sortMatches(data.matches
    .filter(m => m.stage === selectedStage && (selectedStage === 'kumpulan' ? m.group === selectedGroup : true)));

  return (
    <div className="space-y-8">
      {/* Group Match Matrix */}
      {selectedStage === 'kumpulan' && (data.groups || []).length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ListOrdered className="w-32 h-32" />
          </div>
          <h3 className="text-lg font-black mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            {t.matriksPerlawanan} {selectedGroup}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-white/10 bg-white/5"></th>
                  {data.teams.filter(t => t.group === selectedGroup).sort((a,b) => (a.code||'').localeCompare(b.code||'')).map(t => (
                    <th key={t.id} className="p-2 border border-white/10 bg-white/5 font-black min-w-[80px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>{t.code}</span>
                        <span className="text-[8px] font-medium opacity-50 line-clamp-1">{t.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.teams.filter(t => t.group === selectedGroup).sort((a,b) => (a.code||'').localeCompare(b.code||'')).map(t1 => (
                  <tr key={t1.id}>
                    <td className="p-2 border border-white/10 bg-white/5 font-black">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center">{t1.code}</span>
                        <span className="text-[10px] font-medium opacity-70 line-clamp-1">{t1.name}</span>
                      </div>
                    </td>
                    {data.teams.filter(t => t.group === selectedGroup).sort((a,b) => (a.code||'').localeCompare(b.code||'')).map(t2 => {
                      if (t1.id === t2.id) return <td key={t2.id} className="p-2 border border-white/10 bg-slate-700"></td>;
                      const match = data.matches.find(m => 
                        m.stage === 'kumpulan' && m.group === selectedGroup &&
                        ((m.team1Id === t1.id && m.team2Id === t2.id) || (m.team1Id === t2.id && m.team2Id === t1.id))
                      );
                      return (
                        <td key={t2.id} className="p-2 border border-white/10 text-center">
                          {match ? (
                            <span className={cn(
                              "px-2 py-0.5 rounded-full font-black text-[8px] uppercase",
                              match.status === 'tamatPerlawanan' ? "bg-green-500 text-white" : "bg-accent text-white"
                            )}>
                              {match.status === 'tamatPerlawanan' ? `${match.score1}-${match.score2}` : t.wujud}
                            </span>
                          ) : (
                            <span className="text-white/20">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {stages.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStage(s.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                selectedStage === s.id 
                  ? "bg-slate-800 text-white border-slate-800 shadow-md" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {selectedStage === 'kumpulan' && (
            <>
              <div className="flex flex-wrap gap-2">
                {(data.groups || []).map(group => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black transition-all",
                      selectedGroup === group
                        ? "bg-accent text-white shadow-lg shadow-accent/20"
                        : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {t.kumpulan} {group}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleGenerateGroupMatches}
                className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all"
              >
                {t.janaJadual}
              </button>
            </>
          )}
          
          {selectedStage === 'kumpulan' && data.matches.filter(m => m.stage === 'kumpulan').length > 0 && (
            <button 
              onClick={handleGenerateKnockoutMatches}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all"
            >
              {t.janaSukuAkhir}
            </button>
          )}

          {selectedStage === 'sukuAkhir' && data.matches.filter(m => m.stage === 'sukuAkhir').length > 0 && (
            <button 
              onClick={handleGenerateSemiFinals}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all"
            >
              {t.janaSeparuhAkhir}
            </button>
          )}

          {selectedStage === 'separuhAkhir' && data.matches.filter(m => m.stage === 'separuhAkhir').length > 0 && (
            <button 
              onClick={handleGenerateFinals}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all"
            >
              {t.janaFinal}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map(match => {
          const team1 = data.teams.find(t => t.id === match.team1Id);
          const team2 = data.teams.find(t => t.id === match.team2Id);
          const sortedGoals = [...match.goals].sort((a, b) => a.minute - b.minute);
          const sortedCards = [...match.cards].sort((a, b) => a.minute - b.minute);

          return (
            <div key={match.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {match.time} | {match.venue}
                  </span>
                  <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded-full uppercase",
                    match.status === 'tamatPerlawanan' ? "bg-green-100 text-green-600" : 
                    match.status === 'sedangBerlangsung' ? "bg-orange-100 text-orange-600" :
                    match.status === 'ditangguhkan' ? "bg-red-100 text-red-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    {t[match.status]}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setEditingMatch(match)}
                    className="p-2 hover:bg-blue-100 text-accent rounded-lg transition-colors"
                    title={t.kemaskini}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMatch(match.id)}
                    className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                    title={t.padam}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 items-start gap-4 py-2">
                {/* Team 1 */}
                <div className="flex flex-col items-center text-center gap-2">
                  {team1?.logoUrl ? (
                    <img src={team1.logoUrl} alt="" className="w-10 h-10 object-contain flex-shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-[8px] font-bold flex-shrink-0">
                      {getTeamLogoText(team1?.name || '')}
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] font-black text-accent uppercase tracking-widest">{team1?.code || '-'}</span>
                    <span className="text-[9px] font-bold text-slate-800 line-clamp-3 leading-tight min-h-[3.75em]">{team1?.name || 'TBD'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 justify-center">
                    {sortedGoals.filter(g => g.teamId === match.team1Id).map(g => (
                      <span key={g.id} className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded">
                        ⚽ {g.minute}'
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Area */}
                <div className="flex flex-col items-center justify-center gap-2 pt-2">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm min-w-[80px] justify-center">
                    <span className="text-xl font-black text-slate-800">{match.score1 ?? '-'}</span>
                    <span className="text-slate-300 font-black text-xs">VS</span>
                    <span className="text-xl font-black text-slate-800">{match.score2 ?? '-'}</span>
                  </div>
                  {match.isKnockout && match.penaltyScore1 !== undefined && (
                    <span className="text-[8px] font-black text-accent mt-0.5">P: ({match.penaltyScore1}-{match.penaltyScore2})</span>
                  )}
                </div>

                {/* Team 2 */}
                <div className="flex flex-col items-center text-center gap-2">
                  {team2?.logoUrl ? (
                    <img src={team2.logoUrl} alt="" className="w-10 h-10 object-contain flex-shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-[8px] font-bold flex-shrink-0">
                      {getTeamLogoText(team2?.name || '')}
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] font-black text-accent uppercase tracking-widest">{team2?.code || '-'}</span>
                    <span className="text-[9px] font-bold text-slate-800 line-clamp-3 leading-tight min-h-[3.75em]">{team2?.name || 'TBD'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 justify-center">
                    {sortedGoals.filter(g => g.teamId === match.team2Id).map(g => (
                      <span key={g.id} className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded">
                        ⚽ {g.minute}'
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredMatches.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-3xl">
            {t.tiadaPerlawananPeringkatIni}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={matchToDelete !== null}
        onClose={() => setMatchToDelete(null)}
        onConfirm={confirmDeleteMatch}
        title={t.padamPerlawanan}
        message={t.andaPastiPadamPerlawanan}
        lang={lang}
      />

      {editingMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase">{t.inputKeputusan}</h3>
              <button onClick={() => setEditingMatch(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="p-6 overflow-y-auto space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.tarikhPerlawanan}</label>
                  <input 
                    type="date"
                    value={editingMatch.date || ''}
                    onChange={e => setEditingMatch({ ...editingMatch, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-accent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.masaPerlawanan}</label>
                    <input 
                      type="time"
                      value={editingMatch.time || ''}
                      onChange={e => setEditingMatch({ ...editingMatch, time: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.padang}</label>
                    <div className="flex gap-2">
                      {['Padang A', 'Padang B'].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setEditingMatch({ ...editingMatch, venue: v })}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-xs font-black transition-all border",
                            editingMatch.venue === v
                              ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4 text-center">
                  <p className="font-black text-slate-800">{data.teams.find(t => t.id === editingMatch.team1Id)?.name || 'TBD'}</p>
                  <div className="w-20 h-20 mx-auto flex items-center justify-center text-4xl font-black bg-slate-100 border-2 border-slate-200 rounded-2xl text-slate-800">
                    {editingMatch.goals.filter(g => g.teamId === editingMatch.team1Id && g.type !== 'Gol Sendiri').length + 
                     editingMatch.goals.filter(g => g.teamId === editingMatch.team2Id && g.type === 'Gol Sendiri').length}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t.golAutomatik}</p>
                </div>
                <div className="space-y-4 text-center">
                  <p className="font-black text-slate-800">{data.teams.find(t => t.id === editingMatch.team2Id)?.name || 'TBD'}</p>
                  <div className="w-20 h-20 mx-auto flex items-center justify-center text-4xl font-black bg-slate-100 border-2 border-slate-200 rounded-2xl text-slate-800">
                    {editingMatch.goals.filter(g => g.teamId === editingMatch.team2Id && g.type !== 'Gol Sendiri').length + 
                     editingMatch.goals.filter(g => g.teamId === editingMatch.team1Id && g.type === 'Gol Sendiri').length}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t.golAutomatik}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.statusPerlawanan}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['akanDatang', 'sedangBerlangsung', 'tamatPerlawanan', 'ditangguhkan'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditingMatch({ ...editingMatch, status })}
                      className={cn(
                        "py-2 px-1 rounded-lg text-[10px] font-black transition-all border",
                        editingMatch.status === status
                          ? status === 'tamatPerlawanan' ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-200" :
                            status === 'sedangBerlangsung' ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200" :
                            status === 'ditangguhkan' ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-200" :
                            "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                          : "bg-white text-slate-400 border-slate-100 opacity-50 hover:opacity-100"
                      )}
                    >
                      {t[status]}
                    </button>
                  ))}
                </div>
              </div>

              {editingMatch.isKnockout && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="text-xs font-black text-blue-600 uppercase mb-3 text-center">{t.penentuanPenalti}</h4>
                  <div className="flex justify-center gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 text-center">{t.pasukan} 1</p>
                      <input 
                        type="number"
                        placeholder="0"
                        value={editingMatch.penaltyScore1 ?? ''}
                        onChange={e => setEditingMatch({ ...editingMatch, penaltyScore1: parseInt(e.target.value) || 0 })}
                        className="w-16 py-2 text-center bg-white border border-blue-200 rounded-lg font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 text-center">{t.pasukan} 2</p>
                      <input 
                        type="number"
                        placeholder="0"
                        value={editingMatch.penaltyScore2 ?? ''}
                        onChange={e => setEditingMatch({ ...editingMatch, penaltyScore2: parseInt(e.target.value) || 0 })}
                        className="w-16 py-2 text-center bg-white border border-blue-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Goals Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Trophy className="w-3 h-3 text-accent" />
                      {t.senaraiPenjaringGol}
                    </h4>
                    <button 
                      type="button"
                      onClick={() => setEditingMatch({
                        ...editingMatch,
                        goals: [...editingMatch.goals, { id: generateId(), matchId: editingMatch.id, playerId: '', teamId: editingMatch.team1Id, minute: 0, type: 'Padang' }]
                      })}
                      className="text-[10px] font-black px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      {t.tambahGol}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editingMatch.goals.map((goal, idx) => (
                      <div key={goal.id} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <select 
                          value={goal.teamId}
                          onChange={e => {
                            const newGoals = [...editingMatch.goals];
                            newGoals[idx].teamId = e.target.value;
                            newGoals[idx].playerId = ''; // Reset player when team changes
                            setEditingMatch({ ...editingMatch, goals: newGoals });
                          }}
                          className="w-32 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          <option value={editingMatch.team1Id}>{data.teams.find(t => t.id === editingMatch.team1Id)?.name}</option>
                          <option value={editingMatch.team2Id}>{data.teams.find(t => t.id === editingMatch.team2Id)?.name}</option>
                        </select>
                        <select 
                          value={goal.playerId || ''}
                          onChange={e => {
                            const newGoals = [...editingMatch.goals];
                            newGoals[idx].playerId = e.target.value;
                            setEditingMatch({ ...editingMatch, goals: newGoals });
                          }}
                          className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          <option value="">{t.pilihPemain}</option>
                          {data.teams.find(t => t.id === goal.teamId)?.players.map(p => (
                            <option key={p.id} value={p.id}>{getPlayerDisplayName(p)}</option>
                          ))}
                        </select>
                        <input 
                          type="number"
                          placeholder="Min"
                          value={goal.minute || ''}
                          onChange={e => {
                            const newGoals = [...editingMatch.goals];
                            newGoals[idx].minute = parseInt(e.target.value) || 0;
                            setEditingMatch({ ...editingMatch, goals: newGoals });
                          }}
                          className="w-14 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                        />
                        <select 
                          value={goal.type}
                          onChange={e => {
                            const newGoals = [...editingMatch.goals];
                            newGoals[idx].type = e.target.value as any;
                            setEditingMatch({ ...editingMatch, goals: newGoals });
                          }}
                          className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          <option value="padang">{t.padang}</option>
                          <option value="sepakanPercuma">{t.sepakanPercuma}</option>
                          <option value="penalti">{t.penalti}</option>
                          <option value="golSendiri">{t.golSendiri}</option>
                        </select>
                        <button 
                          type="button"
                          onClick={() => {
                            const newGoals = editingMatch.goals.filter((_, i) => i !== idx);
                            setEditingMatch({ ...editingMatch, goals: newGoals });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {editingMatch.goals.length === 0 && (
                      <p className="text-center py-4 text-slate-400 text-[10px] font-medium border border-dashed border-slate-200 rounded-xl">{t.tiadaGolDirekodkan}</p>
                    )}
                  </div>
                </div>

                {/* Cards Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3 text-red-500" />
                      {t.rekodKadDisiplin}
                    </h4>
                    <button 
                      type="button"
                      onClick={() => setEditingMatch({
                        ...editingMatch,
                        cards: [...editingMatch.cards, { id: generateId(), matchId: editingMatch.id, playerId: '', teamId: editingMatch.team1Id, type: 'kuning', minute: 0, reason: '' }]
                      })}
                      className="text-[10px] font-black px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      {t.tambahKad}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editingMatch.cards.map((card, idx) => (
                      <div key={card.id} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <select 
                          value={card.teamId}
                          onChange={e => {
                            const newCards = [...editingMatch.cards];
                            newCards[idx].teamId = e.target.value;
                            newCards[idx].playerId = ''; // Reset player when team changes
                            setEditingMatch({ ...editingMatch, cards: newCards });
                          }}
                          className="w-32 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          <option value={editingMatch.team1Id}>{data.teams.find(t => t.id === editingMatch.team1Id)?.name}</option>
                          <option value={editingMatch.team2Id}>{data.teams.find(t => t.id === editingMatch.team2Id)?.name}</option>
                        </select>
                        <select 
                          value={card.playerId || ''}
                          onChange={e => {
                            const newCards = [...editingMatch.cards];
                            newCards[idx].playerId = e.target.value;
                            setEditingMatch({ ...editingMatch, cards: newCards });
                          }}
                          className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          <option value="">{t.pilihPemain}</option>
                          {data.teams.find(t => t.id === card.teamId)?.players.map(p => (
                            <option key={p.id} value={p.id}>{getPlayerDisplayName(p)}</option>
                          ))}
                        </select>
                          <select 
                            value={card.type}
                            onChange={e => {
                              const newCards = [...editingMatch.cards];
                              newCards[idx].type = e.target.value as any;
                              setEditingMatch({ ...editingMatch, cards: newCards });
                            }}
                            className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                          >
                            <option value="kuning">{t.kuning}</option>
                            <option value="merah">{t.merah}</option>
                          </select>
                          <input 
                            type="number"
                            placeholder="Min"
                            value={card.minute || ''}
                            onChange={e => {
                              const newCards = [...editingMatch.cards];
                              newCards[idx].minute = parseInt(e.target.value) || 0;
                              setEditingMatch({ ...editingMatch, cards: newCards });
                            }}
                            className="w-14 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newCards = editingMatch.cards.filter((_, i) => i !== idx);
                              setEditingMatch({ ...editingMatch, cards: newCards });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {editingMatch.cards.length === 0 && (
                      <p className="text-center py-4 text-slate-400 text-[10px] font-medium border border-dashed border-slate-200 rounded-xl">{t.tiadaKadDirekodkan}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  {t.batal}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:shadow-xl transition-all"
                >
                  {t.simpanKeputusan}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function NotesTab({ data, lang }: { data: AppData, lang: Language }) {
  const t = translations[lang];
  const knockoutStages = [
    { id: 'pusingan16', label: t.pusingan16 },
    { id: 'sukuAkhir', label: t.sukuAkhir },
    { id: 'separuhAkhir', label: t.separuhAkhir },
    { id: 'penentuanTempat3', label: t.penentuanTempat3 },
    { id: 'akhir', label: t.akhir }
  ];

  const getQualifiedTeams = (stage: string) => {
    return data.matches
      .filter(m => m.stage === stage)
      .flatMap(m => [m.team1Id, m.team2Id])
      .filter(Boolean)
      .map(id => data.teams.find(t => t.id === id))
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {knockoutStages.map(stage => {
        const teams = getQualifiedTeams(stage.id);
        return (
          <div key={stage.id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-black uppercase tracking-widest text-sm">{stage.label}</h3>
              <span className="text-[10px] font-bold text-slate-400">{teams.length} {t.pasukan} {t.layak}</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {teams.length > 0 ? (
                teams.map((team: any) => (
                  <div key={team.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    {team.logoUrl && <img src={team.logoUrl} alt="" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />}
                    <span className="text-xs font-bold text-slate-700 truncate">{team.name}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-slate-400 text-xs font-medium italic">
                  Belum ditentukan.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TournamentSettingsTab({ data, updateData, lang }: { data: AppData, updateData: (d: AppData) => Promise<void>, lang: Language }) {
  const t = translations[lang];
  const [resetPass, setResetPass] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleRegistration = async () => {
    await updateData({
      ...data,
      tournamentInfo: {
        ...data.tournamentInfo,
        isRegistrationOpen: !data.tournamentInfo.isRegistrationOpen
      }
    });
  };

  const handleReset = async () => {
    if (resetPass !== 'Adzeem06022023') {
      alert('Kata laluan reset salah.');
      return;
    }
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPass })
      });
      if (res.ok) window.location.reload();
      else alert('Gagal mereset kejohanan.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="RESET DATA"
        message={t.andaPastiReset}
        lang={lang}
      />

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-black text-slate-800 uppercase tracking-tight">Pendaftaran Pasukan</h3>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="space-y-1">
            <p className="font-bold text-slate-700">Status Pendaftaran</p>
            <p className="text-xs text-slate-500">
              {data.tournamentInfo.isRegistrationOpen ? "Pendaftaran pasukan kini dibuka." : "Pendaftaran pasukan kini ditutup."}
            </p>
          </div>
          <button
            onClick={handleToggleRegistration}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg",
              data.tournamentInfo.isRegistrationOpen 
                ? "bg-red-500 text-white shadow-red-200" 
                : "bg-green-500 text-white shadow-green-200"
            )}
          >
            {data.tournamentInfo.isRegistrationOpen ? t.tutupPendaftaran : t.bukaPendaftaran}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-black text-slate-800 uppercase tracking-tight">Zon Bahaya</h3>
        </div>
        
        <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-4">
          <div className="space-y-1">
            <p className="font-bold text-red-700">{t.resetData}</p>
            <p className="text-xs text-red-600/80">Amaran: Ini akan memadamkan semua data pasukan, pemain, dan perlawanan!</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="password"
              placeholder={t.kataLaluanReset}
              value={resetPass}
              onChange={e => setResetPass(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-red-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
            />
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-md shadow-red-200"
            >
              Reset Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ data, updateData, lang }: { data: AppData, updateData: (d: AppData) => Promise<void>, lang: Language }) {
  const t = translations[lang];
  const [info, setInfo] = useState(data.tournamentInfo);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateData({ ...data, tournamentInfo: info });
    setIsSaving(false);
    alert(t.kemaskiniBerjaya);
  };

  const moveBentoItem = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...info.bentoLayout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    const newInfo = { ...info, bentoLayout: newItems };
    setInfo(newInfo);
    await updateData({ ...data, tournamentInfo: newInfo });
  };

  const toggleBentoSize = async (index: number) => {
    const newItems = [...info.bentoLayout];
    newItems[index].size = newItems[index].size === 'small' ? 'large' : 'small';
    const newInfo = { ...info, bentoLayout: newItems };
    setInfo(newInfo);
    await updateData({ ...data, tournamentInfo: newInfo });
  };

  return (
    <div className="space-y-12">
      {/* Tournament Info */}
      <form onSubmit={handleSaveInfo} className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.maklumat}</h3>
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-2 bg-accent text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSaving ? '...' : t.simpan}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.tajuk}</label>
            <input 
              value={info.title}
              onChange={e => setInfo({ ...info, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL Logo</label>
            <input 
              value={info.logoUrl}
              onChange={e => setInfo({ ...info, logoUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.tarikhKejohanan} (Mula)</label>
            <input 
              value={info.startDate}
              onChange={e => setInfo({ ...info, startDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.tarikhKejohanan} (Tamat)</label>
            <input 
              value={info.endDate || ''}
              onChange={e => setInfo({ ...info, endDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.masaKejohanan}</label>
            <input 
              value={info.time || ''}
              onChange={e => setInfo({ ...info, time: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.venue}</label>
            <input 
              value={info.venue || ''}
              onChange={e => setInfo({ ...info, venue: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lokasiKejohanan}</label>
            <input 
              value={info.mapUrl || ''}
              onChange={e => setInfo({ ...info, mapUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="Google Maps Embed URL"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.penganjur}</label>
            <input 
              value={info.organizer}
              onChange={e => setInfo({ ...info, organizer: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL Logo Penganjur</label>
            <input 
              value={info.organizerLogoUrl || ''}
              onChange={e => setInfo({ ...info, organizerLogoUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.pengelola}</label>
            <input 
              value={info.manager}
              onChange={e => setInfo({ ...info, manager: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL Logo Pengelola</label>
            <input 
              value={info.managerLogoUrl || ''}
              onChange={e => setInfo({ ...info, managerLogoUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kata-kata Motivasi</label>
            <textarea 
              value={info.motivationQuote || ''}
              onChange={e => setInfo({ ...info, motivationQuote: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.pengurusanBento}</h3>
          <div className="space-y-3">
            {info.bentoLayout.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-xs font-black text-slate-400 border border-slate-100">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                      {item.id === 'organizer' ? t.penganjur :
                       item.id === 'manager' ? t.pengelola :
                       item.id === 'dates' ? t.tarikh :
                       item.id === 'time' ? t.masa :
                       item.id === 'venue' ? t.venue :
                       item.id === 'location' ? t.lokasi : item.id}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.saiz}: {item.size === 'small' ? '1x1' : '2x1'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => toggleBentoSize(idx)}
                    className="p-2 bg-white text-slate-500 hover:text-accent rounded-lg border border-slate-100 transition-colors"
                    title={t.saiz}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => moveBentoItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 bg-white text-slate-500 hover:text-accent rounded-lg border border-slate-100 transition-colors disabled:opacity-30"
                    title={t.pindahAtas}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => moveBentoItem(idx, 'down')}
                    disabled={idx === info.bentoLayout.length - 1}
                    className="p-2 bg-white text-slate-500 hover:text-accent rounded-lg border border-slate-100 transition-colors disabled:opacity-30"
                    title={t.pindahBawah}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
