/**
 * Schedules Page - Jadwal Umum (matrix semua kelas)
 */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { exportAllSchedulesToXlsx, exportScheduleToPdf, printSchedule } from "@/lib/export";

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
      <div className="p-4 md:p-6 pb-0 print:hidden">
        <div className="flex justify-end">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => printSchedule("landscape")} size="sm">Print</Button>
            <Button onClick={() => exportScheduleToPdf("landscape")} size="sm">Export PDF</Button>
            <Button variant="success" onClick={handleExportExcel} size="sm">Export Excel</Button>
            <Button variant="secondary" onClick={() => router.push("/schedules/teacher")} size="sm">
              Jadwal per Guru
            </Button>
            <Button variant="secondary" onClick={() => router.push("/schedules/class")} size="sm">
              Jadwal per Kelas
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Day Selector */}
        <div className="mb-6 max-w-xs print:hidden">
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
          Menampilkan jadwal untuk hari {getDayLabel(selectedDay)} - {sortedClasses.length} kelas
        </div>
      </div>
    </>
  );
}
