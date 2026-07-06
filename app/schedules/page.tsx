/**
 * Schedules Page - Jadwal Umum (matrix semua kelas)
 */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, FileSpreadsheet, FileText, GraduationCap, Info, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { LocalDB } from "@/lib/db";
import { getAllScheduleEntries } from "@/lib/scheduler";
import {
  ScheduleEntry,
  TimeSlot,
  Class,
  Teacher,
  Subject,
  School,
  DAYS,
  DAY_LABELS,
  Day,
} from "@/lib/types";
import { getDayLabel } from "@/lib/utils";
import { exportAllSchedulesToPdf, exportAllSchedulesToXlsx } from "@/lib/export";

export default function SchedulesPage() {
  const router = useRouter();
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day>("monday");
  const printedAt = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleExportExcel = () => {
    const currentSchool = LocalDB.getSchool();
    if (!currentSchool) return;

    exportAllSchedulesToXlsx(currentSchool.id, selectedDay);
  };

  const handleExportPdf = () => {
    const currentSchool = LocalDB.getSchool();
    if (!currentSchool) return;

    exportAllSchedulesToPdf(currentSchool.id, selectedDay);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const school = LocalDB.getSchool();
    if (!school) return;

    setSchool(school);
    setScheduleEntries(getAllScheduleEntries(school.id));
    setTimeSlots(LocalDB.listTimeSlots(school.id));
    setClasses(LocalDB.listClasses(school.id));
    setTeachers(LocalDB.listTeachers(school.id));
    setSubjects(LocalDB.listSubjects(school.id));
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return "-";
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : "-";
  };

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return "-";
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "-";
  };

  const getScheduleEntry = (timeSlotId: string, classId: string): ScheduleEntry | null => {
    return scheduleEntries.find(
      (entry) =>
        entry.timeSlotId === timeSlotId &&
        entry.classId === classId
    ) || null;
  };

  const daySlots = timeSlots.filter((ts) => ts.day === selectedDay).sort((a, b) => a.slotNumber - b.slotNumber);
  const sortedClasses = [...classes].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {/* Action button */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleExportPdf} size="sm">
              <FileText size={16} />
              Export PDF
            </Button>
            <Button variant="success" onClick={handleExportExcel} size="sm">
              <FileSpreadsheet size={16} />
              Export Excel
            </Button>
            <Button variant="secondary" onClick={() => router.push("/schedules/teacher")} size="sm">
              <Users size={16} />
              Jadwal per Guru
            </Button>
            <Button variant="secondary" onClick={() => router.push("/schedules/class")} size="sm">
              <GraduationCap size={16} />
              Jadwal per Kelas
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500">
            PDF diunduh langsung dalam format A4 landscape untuk hari {getDayLabel(selectedDay)}.
          </p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Usage Info */}
        <div className="mb-6 rounded-lg border border-teal-100 bg-teal-50 p-5 shadow-sm print:hidden">
          <div className="mb-3 flex items-center gap-2 text-teal-800">
            <Info size={18} />
            <h2 className="text-lg font-bold">Cara Pakai Lihat Jadwal</h2>
          </div>
          <div className="grid gap-3 text-sm text-teal-900 md:grid-cols-3">
            <div>
              <p className="font-semibold">1. Pilih hari</p>
              <p className="mt-1 text-teal-700">Gunakan filter hari untuk melihat jadwal Senin sampai Sabtu sesuai slot yang tersedia.</p>
            </div>
            <div>
              <p className="font-semibold">2. Cek bentrok</p>
              <p className="mt-1 text-teal-700">Tabel menampilkan jadwal semua kelas agar mudah mengecek guru dan mapel di jam yang sama.</p>
            </div>
            <div>
              <p className="font-semibold">3. Export jadwal</p>
              <p className="mt-1 text-teal-700">Gunakan tombol PDF atau Excel untuk menyimpan jadwal per hari yang sedang dipilih.</p>
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="mb-6 max-w-xs mx-auto">
          <Select
            label="Pilih Hari"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as Day)}
            options={DAYS.map((day) => ({
              value: day,
              label: DAY_LABELS[day],
            }))}
          />
        </div>

        <div className="hidden print:block mb-4 text-center">
          <div className="print-header">
            <Image src="/guru-cibisd2.png" alt="BGY" width={56} height={56} className="mx-auto mb-3 rounded-lg" />
            <h1 className="text-xl font-bold text-gray-900">Jadwal Umum</h1>
            <p className="text-sm text-gray-700">{school?.name || "-"}</p>
            <p className="text-sm text-gray-700">
              Hari {getDayLabel(selectedDay)} | Tahun Ajaran {school?.academicYear || "-"} | Semester {school?.semester || "-"}
            </p>
            <p className="text-xs text-gray-600">Dicetak: {printedAt}</p>
          </div>
        </div>

        {/* Schedule Matrix */}
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="schedule-table schedule-table-dense min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                  Jam
                </th>
                {sortedClasses.map((cls) => (
                  <th
                    key={cls.id}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {cls.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {daySlots.map((slot, index) => (
                <tr key={slot.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit">
                    <div>
                      <div>Jam {slot.slotNumber}</div>
                      <div className="text-xs text-gray-500">
                        {slot.startTime}-{slot.endTime}
                      </div>
                    </div>
                  </td>
                  {sortedClasses.map((cls) => {
                    const entry = getScheduleEntry(slot.id, cls.id);
                    return (
                      <td
                        key={cls.id}
                        className="px-2 py-2 text-xs text-center border-l border-gray-200"
                      >
                        {entry ? (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2">
                            <div className="font-semibold text-blue-900">
                              {getSubjectName(entry.subjectId)}
                            </div>
                            <div className="text-blue-600 mt-1">
                              {getTeacherName(entry.teacherId)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500 print:hidden">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
            <CalendarRange size={16} />
            Menampilkan jadwal hari {getDayLabel(selectedDay)} untuk {sortedClasses.length} kelas
          </div>
        </div>
      </div>
    </>
  );
}
