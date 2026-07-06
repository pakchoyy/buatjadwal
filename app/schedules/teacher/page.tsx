/**
 * Teacher Schedule Page - Jadwal per Guru
 */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileSpreadsheet, FileText, GraduationCap, LayoutGrid, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { LocalDB } from "@/lib/db";
import { getScheduleByTeacher } from "@/lib/scheduler";
import { exportTeacherScheduleToPdf, exportTeacherScheduleToXlsx } from "@/lib/export";
import { formatDateTime } from "@/lib/utils";
import {
  ScheduleEntry,
  TimeSlot,
  Teacher,
  Subject,
  Class,
  School,
  DAYS,
  DAY_LABELS,
  Day,
} from "@/lib/types";


export default function TeacherSchedulePage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const printedAt = formatDateTime(Date.now());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacherId]);

  const loadData = () => {
    const school = LocalDB.getSchool();
    if (!school) return;

    setSchool(school);
    const teachersList = LocalDB.listTeachers(school.id);
    setTeachers(teachersList);
    setTimeSlots(LocalDB.listTimeSlots(school.id));
    setSubjects(LocalDB.listSubjects(school.id));
    setClasses(LocalDB.listClasses(school.id));

    // Auto-select first teacher
    if (teachersList.length > 0) {
      setSelectedTeacherId(teachersList[0].id);
    }
  };

  const loadSchedule = () => {
    const school = LocalDB.getSchool();
    if (!school || !selectedTeacherId) return;

    const entries = getScheduleByTeacher(school.id, selectedTeacherId);
    setScheduleEntries(entries);
  };

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return "-";
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "-";
  };

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : "-";
  };

  const getScheduleForSlot = (day: Day, slotNumber: number): ScheduleEntry | null => {
    const slot = timeSlots.find(
      (s) => s.day === day && s.slotNumber === slotNumber && !s.isBreak
    );
    if (!slot) return null;

    return scheduleEntries.find((e) => e.timeSlotId === slot.id) || null;
  };

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  const handleExportExcel = () => {
    const school = LocalDB.getSchool();
    if (!school || !selectedTeacherId) return;

    exportTeacherScheduleToXlsx(school.id, selectedTeacherId);
  };

  const handleExportPdf = () => {
    const school = LocalDB.getSchool();
    if (!school || !selectedTeacherId) return;

    exportTeacherScheduleToPdf(school.id, selectedTeacherId);
  };

  // Get unique slot numbers for display (across all days)
  const allSlotNumbers = Array.from(
    new Set(
      timeSlots
        .filter((s) => !s.isBreak)
        .map((s) => s.slotNumber)
    )
  ).sort((a, b) => a - b);

  return (
    <>
      {/* Action buttons */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleExportPdf} disabled={!selectedTeacherId} size="sm">
              <FileText size={16} />
              Export PDF
            </Button>
            <Button variant="success" onClick={handleExportExcel} disabled={!selectedTeacherId} size="sm">
              <FileSpreadsheet size={16} />
              Export Excel
            </Button>
            <Button variant="secondary" onClick={() => router.push("/schedules")} size="sm">
              <LayoutGrid size={16} />
              Jadwal Umum
            </Button>
            <Button variant="secondary" onClick={() => router.push("/schedules/class")} size="sm">
              <GraduationCap size={16} />
              Jadwal per Kelas
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500">
            PDF diunduh langsung dalam format A4 portrait untuk jadwal per guru.
          </p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Teacher Selector */}
        <div className="mb-6 max-w-md mx-auto">
          <Select
            label="Pilih Guru"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            options={teachers.map((t) => ({
              value: t.id,
              label: `${t.code} - ${t.name}`,
            }))}
          />
        </div>

        {selectedTeacher && (
          <>
            <div className="hidden print:block mb-4 text-center">
              <div className="print-header">
                <Image src="/guru-cibisd2.png" alt="BGY" width={56} height={56} className="mx-auto mb-3 rounded-lg" />
                <h1 className="text-xl font-bold text-gray-900">Jadwal per Guru</h1>
                <p className="text-sm text-gray-700">{school?.name || "-"}</p>
                <p className="text-sm text-gray-700">
                  {selectedTeacher.name} ({selectedTeacher.code}) | Tahun Ajaran {school?.academicYear || "-"} | Semester {school?.semester || "-"}
                </p>
                <p className="text-xs text-gray-600">Dicetak: {printedAt}</p>
              </div>
            </div>

            {/* Teacher Info */}
            <div className="print-title bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Users size={14} />
                    Jadwal per Guru
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">
                    {selectedTeacher.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Kode: {selectedTeacher.code} | Total mengajar: {scheduleEntries.length} jam
                  </p>
                </div>
                <Button variant="secondary" onClick={() => router.push("/schedules")} size="sm">
                  <Eye size={16} />
                  Lihat Semua Jadwal
                </Button>
              </div>
            </div>

            {/* Schedule Table */}
            {scheduleEntries.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">Guru ini belum memiliki jadwal mengajar</p>
              </div>
            ) : (
              <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="schedule-table schedule-table-portrait min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jam
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {DAY_LABELS[day]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allSlotNumbers.map((slotNum, index) => (
                      <tr key={slotNum} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          Jam {slotNum}
                        </td>
                        {DAYS.map((day) => {
                          const entry = getScheduleForSlot(day, slotNum);
                          return (
                            <td
                              key={day}
                              className="px-2 py-2 text-xs text-center border-l border-gray-200"
                            >
                              {entry ? (
                                <div className="bg-green-50 border border-green-200 rounded p-2">
                                  <div className="font-semibold text-green-900">
                                    {getSubjectName(entry.subjectId)}
                                  </div>
                                  <div className="text-green-600 mt-1">
                                    {getClassName(entry.classId)}
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
            )}
          </>
        )}
      </div>
    </>
  );
}
