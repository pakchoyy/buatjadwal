/**
 * Unified Schedules Page - Jadwal Umum, per Guru, per Kelas dalam 1 halaman
 */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { CalendarRange, FileSpreadsheet, FileText, GraduationCap, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { LocalDB } from "@/lib/db";
import { getAllScheduleEntries, getScheduleByClass, getScheduleByTeacher } from "@/lib/scheduler";
import {
  exportAllSchedulesToPdf,
  exportAllSchedulesToXlsx,
  exportAllSchedulesToXlsxMultiSheet,
  exportClassScheduleToPdf,
  exportClassScheduleToXlsx,
  exportTeacherScheduleToPdf,
  exportTeacherScheduleToXlsx,
} from "@/lib/export";
import { getDayLabel, formatDateTime } from "@/lib/utils";
import PaymentModal from "@/components/payment/PaymentModal";
import { hasUserPaid } from "@/lib/payment-storage";
import {
  setPendingExport,
  executePendingExport,
  getPendingExportInfo,
} from "@/lib/export-wrapper";
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

type ViewMode = "all" | "teacher" | "class";

export default function UnifiedSchedulesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedDay, setSelectedDay] = useState<Day>("monday");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDonationBanner, setShowDonationBanner] = useState(true);
  const [printedAt, setPrintedAt] = useState("");

  useEffect(() => {
    loadData();
    setPrintedAt(formatDateTime(Date.now()));
    setShowDonationBanner(!hasUserPaid());
  }, []);

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedDay, selectedTeacherId, selectedClassId]);

  const loadData = () => {
    const school = LocalDB.getSchool();
    if (!school) return;

    setSchool(school);
    const classesList = LocalDB.listClasses(school.id);
    const teachersList = LocalDB.listTeachers(school.id);
    
    setClasses(classesList);
    setTeachers(teachersList);
    setTimeSlots(LocalDB.listTimeSlots(school.id));
    setSubjects(LocalDB.listSubjects(school.id));

    // Auto-select first teacher/class
    if (teachersList.length > 0) {
      setSelectedTeacherId(teachersList[0].id);
    }
    if (classesList.length > 0) {
      setSelectedClassId(classesList[0].id);
    }
  };

  const loadSchedule = () => {
    const school = LocalDB.getSchool();
    if (!school) return;

    if (viewMode === "all") {
      setScheduleEntries(getAllScheduleEntries(school.id));
    } else if (viewMode === "teacher" && selectedTeacherId) {
      setScheduleEntries(getScheduleByTeacher(school.id, selectedTeacherId));
    } else if (viewMode === "class" && selectedClassId) {
      setScheduleEntries(getScheduleByClass(school.id, selectedClassId));
    }
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

  const handleExportPdf = () => {
    if (!school) return;

    const executeExport = () => {
      if (viewMode === "all") {
        exportAllSchedulesToPdf(school.id, selectedDay);
      } else if (viewMode === "teacher" && selectedTeacherId) {
        exportTeacherScheduleToPdf(school.id, selectedTeacherId);
      } else if (viewMode === "class" && selectedClassId) {
        exportClassScheduleToPdf(school.id, selectedClassId);
      }
    };

    if (hasUserPaid()) {
      executeExport();
    } else {
      const exportType =
        viewMode === "all"
          ? "pdf-all"
          : viewMode === "teacher"
          ? "pdf-teacher"
          : "pdf-class";
      const metadata =
        viewMode === "all"
          ? { day: selectedDay }
          : viewMode === "teacher"
          ? { teacherId: selectedTeacherId }
          : { classId: selectedClassId };

      setPendingExport(executeExport, exportType as any, metadata);
      setShowPaymentModal(true);
    }
  };

  const handleExportExcel = () => {
    if (!school) return;

    const executeExport = () => {
      if (viewMode === "all") {
        exportAllSchedulesToXlsx(school.id, selectedDay);
      } else if (viewMode === "teacher" && selectedTeacherId) {
        exportTeacherScheduleToXlsx(school.id, selectedTeacherId);
      } else if (viewMode === "class" && selectedClassId) {
        exportClassScheduleToXlsx(school.id, selectedClassId);
      }
    };

    if (hasUserPaid()) {
      executeExport();
    } else {
      const exportType =
        viewMode === "all"
          ? "excel-single"
          : viewMode === "teacher"
          ? "excel-single"
          : "excel-single";
      const metadata =
        viewMode === "all"
          ? { day: selectedDay }
          : viewMode === "teacher"
          ? { teacherId: selectedTeacherId }
          : { classId: selectedClassId };

      setPendingExport(executeExport, exportType, metadata);
      setShowPaymentModal(true);
    }
  };

  const handleExportAllDaysExcel = () => {
    if (!school) return;

    const executeExport = () => {
      exportAllSchedulesToXlsxMultiSheet(school.id);
    };

    if (hasUserPaid()) {
      executeExport();
    } else {
      setPendingExport(executeExport, "excel-multi", {});
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    executePendingExport();
    setShowPaymentModal(false);
  };

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // For "all" view
  const daySlots = timeSlots.filter((ts) => ts.day === selectedDay).sort((a, b) => a.slotNumber - b.slotNumber);
  const sortedClasses = [...classes].sort((a, b) => a.name.localeCompare(b.name));

  const getScheduleEntry = (timeSlotId: string, classId: string): ScheduleEntry | null => {
    return scheduleEntries.find(
      (entry) => entry.timeSlotId === timeSlotId && entry.classId === classId
    ) || null;
  };

  // For "teacher" and "class" view
  const getScheduleForSlot = (day: Day, slotNumber: number): ScheduleEntry | null => {
    const slot = timeSlots.find(
      (s) => s.day === day && s.slotNumber === slotNumber && !s.isBreak
    );
    if (!slot) return null;
    return scheduleEntries.find((e) => e.timeSlotId === slot.id) || null;
  };

  const allSlotNumbers = Array.from(
    new Set(timeSlots.filter((s) => !s.isBreak).map((s) => s.slotNumber))
  ).sort((a, b) => a - b);

  const activeDays = Array.from(
    new Set(timeSlots.filter((s) => !s.isBreak).map((s) => s.day))
  ).sort((a, b) => DAYS.indexOf(a as Day) - DAYS.indexOf(b as Day)) as Day[];

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : "-";
  };

  return (
    <>
      <div className="p-4 md:p-6">
        {/* Sticky Header: Export + Hint + Cards */}
        <div className="sticky top-0 z-40 bg-white pb-4 shadow-sm print:static print:shadow-none">
          {/* Donation Banner */}
          {showDonationBanner && (
            <div className="mb-3 rounded-lg border border-teal-100 bg-teal-50 px-4 py-2.5 text-center print:hidden">
              <p className="text-sm text-teal-800">
                💚 Dukung aplikasi ini dengan donasi untuk mendapatkan akses export
              </p>
            </div>
          )}

          {/* Export Buttons */}
          <div className="mb-4 flex flex-col items-center gap-3">
            {/* Batch Export Button (only for "all" view) */}
            {viewMode === "all" && (
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="success" onClick={handleExportAllDaysExcel} size="sm">
                  <FileSpreadsheet size={16} />
                  Export Semua Hari (Excel Multi-Sheet)
                </Button>
              </div>
            )}
            
            {/* Regular Export Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={handleExportPdf} size="sm">
                <FileText size={16} />
                Export PDF
              </Button>
              <Button variant="success" onClick={handleExportExcel} size="sm">
                <FileSpreadsheet size={16} />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Hint */}
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-center text-xs text-blue-800 print:hidden">
            📋 <strong>Pilih card di bawah untuk melihat jenis jadwal lain</strong>, lalu klik Export PDF/Excel untuk mencetak.
          </div>

          {/* Navigation Cards */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 print:hidden">
            {/* Card Jadwal Umum */}
            <button
              onClick={() => setViewMode("all")}
              className={`rounded-lg border-2 p-4 shadow-sm transition-all ${
                viewMode === "all"
                  ? "border-teal-600 bg-teal-50"
                  : "border-gray-300 bg-white hover:border-teal-400 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <CalendarRange size={24} className={viewMode === "all" ? "text-teal-600" : "text-gray-600"} />
                <h3 className={`mt-2 text-base font-bold ${viewMode === "all" ? "text-teal-900" : "text-gray-900"}`}>
                  Jadwal Umum
                </h3>
                <p className={`mt-1 text-xs ${viewMode === "all" ? "text-teal-700" : "text-gray-600"}`}>
                  Semua kelas dalam satu tabel
                </p>
              </div>
            </button>

            {/* Card Jadwal per Guru */}
            <button
              onClick={() => setViewMode("teacher")}
              className={`rounded-lg border-2 p-4 shadow-sm transition-all ${
                viewMode === "teacher"
                  ? "border-teal-600 bg-teal-50"
                  : "border-gray-300 bg-white hover:border-teal-400 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <Users size={24} className={viewMode === "teacher" ? "text-teal-600" : "text-gray-600"} />
                <h3 className={`mt-2 text-base font-bold ${viewMode === "teacher" ? "text-teal-900" : "text-gray-900"}`}>
                  Jadwal per Guru
                </h3>
                <p className={`mt-1 text-xs ${viewMode === "teacher" ? "text-teal-700" : "text-gray-600"}`}>
                  Jadwal mengajar satu guru
                </p>
              </div>
            </button>

            {/* Card Jadwal per Kelas */}
            <button
              onClick={() => setViewMode("class")}
              className={`rounded-lg border-2 p-4 shadow-sm transition-all ${
                viewMode === "class"
                  ? "border-teal-600 bg-teal-50"
                  : "border-gray-300 bg-white hover:border-teal-400 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <GraduationCap size={24} className={viewMode === "class" ? "text-teal-600" : "text-gray-600"} />
                <h3 className={`mt-2 text-base font-bold ${viewMode === "class" ? "text-teal-900" : "text-gray-900"}`}>
                  Jadwal per Kelas
                </h3>
                <p className={`mt-1 text-xs ${viewMode === "class" ? "text-teal-700" : "text-gray-600"}`}>
                  Jadwal lengkap satu kelas
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          {viewMode === "all" && (
            <div className="w-full max-w-xs">
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
          )}

          {viewMode === "teacher" && (
            <div className="w-full max-w-xs">
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
          )}

          {viewMode === "class" && (
            <div className="w-full max-w-xs">
              <Select
                label="Pilih Kelas"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={classes.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </div>
          )}
        </div>

        {/* Print Headers (hidden on screen) */}
        {viewMode === "all" && (
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
        )}

        {viewMode === "teacher" && selectedTeacher && (
          <div className="hidden print:block mb-4 text-center">
            <div className="print-header">
              <Image src="/guru-cibisd2.png" alt="BGY" width={56} height={56} className="mx-auto mb-3 rounded-lg" />
              <h1 className="text-xl font-bold text-gray-900">Jadwal per Guru</h1>
              <p className="text-sm text-gray-700">{school?.name || "-"}</p>
              <p className="text-sm text-gray-700">
                {selectedTeacher.code} - {selectedTeacher.name} | Tahun Ajaran {school?.academicYear || "-"} | Semester {school?.semester || "-"}
              </p>
              <p className="text-xs text-gray-600">Dicetak: {printedAt}</p>
            </div>
          </div>
        )}

        {viewMode === "class" && selectedClass && (
          <div className="hidden print:block mb-4 text-center">
            <div className="print-header">
              <Image src="/guru-cibisd2.png" alt="BGY" width={56} height={56} className="mx-auto mb-3 rounded-lg" />
              <h1 className="text-xl font-bold text-gray-900">Jadwal per Kelas</h1>
              <p className="text-sm text-gray-700">{school?.name || "-"}</p>
              <p className="text-sm text-gray-700">
                Kelas {selectedClass.name} | Tingkat {selectedClass.grade} | Tahun Ajaran {school?.academicYear || "-"} | Semester {school?.semester || "-"}
              </p>
              <p className="text-xs text-gray-600">Dicetak: {printedAt}</p>
            </div>
          </div>
        )}

        {/* Schedule Tables */}
        {viewMode === "all" && (
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
        )}

        {viewMode === "teacher" && selectedTeacher && (
          scheduleEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">Guru ini belum memiliki jadwal</p>
            </div>
          ) : (
            <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="schedule-table schedule-table-portrait min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jam
                    </th>
                    {activeDays.map((day) => (
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
                      {activeDays.map((day) => {
                        const entry = getScheduleForSlot(day, slotNum);
                        const slot = timeSlots.find(
                          (s) => s.day === day && s.slotNumber === slotNum
                        );

                        return (
                          <td
                            key={day}
                            className="px-2 py-2 text-xs text-center border-l border-gray-200"
                          >
                            {entry ? (
                              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                <div className="font-semibold text-blue-900">
                                  {getSubjectName(entry.subjectId)}
                                </div>
                                <div className="text-blue-600 mt-1">
                                  Kelas {getClassName(entry.classId)}
                                </div>
                                {slot && (
                                  <div className="text-blue-500 text-xs mt-1">
                                    {slot.startTime}-{slot.endTime}
                                  </div>
                                )}
                              </div>
                            ) : slot?.isBreak ? (
                              <div className="bg-amber-50 border border-amber-200 rounded p-2">
                                <div className="text-amber-800 text-xs font-medium">
                                  Istirahat
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
          )
        )}

        {viewMode === "class" && selectedClass && (
          scheduleEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">Kelas ini belum memiliki jadwal</p>
            </div>
          ) : (
            <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="schedule-table schedule-table-portrait min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jam
                    </th>
                    {activeDays.map((day) => (
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
                      {activeDays.map((day) => {
                        const entry = getScheduleForSlot(day, slotNum);
                        const slot = timeSlots.find(
                          (s) => s.day === day && s.slotNumber === slotNum
                        );

                        return (
                          <td
                            key={day}
                            className="px-2 py-2 text-xs text-center border-l border-gray-200"
                          >
                            {entry ? (
                              <div className="bg-violet-50 border border-violet-200 rounded p-2">
                                <div className="font-semibold text-violet-900">
                                  {getSubjectName(entry.subjectId)}
                                </div>
                                <div className="text-violet-600 mt-1">
                                  {getTeacherName(entry.teacherId)}
                                </div>
                                {slot && (
                                  <div className="text-violet-500 text-xs mt-1">
                                    {slot.startTime}-{slot.endTime}
                                  </div>
                                )}
                              </div>
                            ) : slot?.isBreak ? (
                              <div className="bg-amber-50 border border-amber-200 rounded p-2">
                                <div className="text-amber-800 text-xs font-medium">
                                  Istirahat
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
          )
        )}

        {/* Summary */}
        {viewMode === "all" && (
          <div className="mt-4 text-sm text-gray-500 print:hidden">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
              <CalendarRange size={16} />
              Menampilkan jadwal hari {getDayLabel(selectedDay)} untuk {sortedClasses.length} kelas
            </div>
          </div>
        )}

        {viewMode === "teacher" && selectedTeacher && (
          <div className="mt-4 text-sm text-gray-500 print:hidden">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
              <Users size={16} />
              Total jam mengajar: {scheduleEntries.length} jam
            </div>
          </div>
        )}

        {viewMode === "class" && selectedClass && (
          <div className="mt-4 text-sm text-gray-500 print:hidden">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
              <GraduationCap size={16} />
              Total jam pelajaran: {scheduleEntries.length} jam
            </div>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          exportType={getPendingExportInfo().exportType || "pdf-all"}
          exportMetadata={getPendingExportInfo().metadata || {}}
        />
      )}
    </>
  );
}
