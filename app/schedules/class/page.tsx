/**
 * Class Schedule Page - Jadwal per Kelas
 */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { LocalDB } from "@/lib/db";
import { getScheduleByClass } from "@/lib/scheduler";
import { exportClassScheduleToXlsx, exportScheduleToPdf, printSchedule } from "@/lib/export";
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

export default function ClassSchedulePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const printedAt = formatDateTime(Date.now());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);

  const loadData = () => {
    const school = LocalDB.getSchool();
    if (!school) return;

    setSchool(school);
    const classesList = LocalDB.listClasses(school.id);
    setClasses(classesList);
    setTimeSlots(LocalDB.listTimeSlots(school.id));
    setTeachers(LocalDB.listTeachers(school.id));
    setSubjects(LocalDB.listSubjects(school.id));

    // Auto-select first class
    if (classesList.length > 0) {
      setSelectedClassId(classesList[0].id);
    }
  };

  const loadSchedule = () => {
    const school = LocalDB.getSchool();
    if (!school || !selectedClassId) return;

    const entries = getScheduleByClass(school.id, selectedClassId);
    setScheduleEntries(entries);
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

  const getScheduleForSlot = (day: Day, slotNumber: number): ScheduleEntry | null => {
    const slot = timeSlots.find(
      (s) => s.day === day && s.slotNumber === slotNumber && !s.isBreak
    );
    if (!slot) return null;

    return scheduleEntries.find((e) => e.timeSlotId === slot.id) || null;
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const handleExportExcel = () => {
    const school = LocalDB.getSchool();
    if (!school || !selectedClassId) return;

    exportClassScheduleToXlsx(school.id, selectedClassId);
  };

  // Get unique slot numbers for display
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
      <div className="p-4 md:p-6 pb-0 print:hidden">
        <div className="flex flex-wrap gap-3 justify-end">
          <Button variant="secondary" onClick={() => printSchedule("portrait")} disabled={!selectedClassId} size="sm">
            Print
          </Button>
          <Button onClick={() => exportScheduleToPdf("portrait")} disabled={!selectedClassId} size="sm" title="Buka dialog print lalu pilih Save as PDF">
            Export PDF
          </Button>
          <Button variant="success" onClick={handleExportExcel} disabled={!selectedClassId} size="sm">
            Export Excel
          </Button>
          <Button variant="secondary" onClick={() => router.push("/schedules")} size="sm">
            Jadwal Umum
          </Button>
          <Button variant="secondary" onClick={() => router.push("/schedules/teacher")} size="sm">
            Jadwal per Guru
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Class Selector */}
        <div className="mb-6 max-w-md print:hidden">
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

        {selectedClass && (
          <>
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

            {/* Class Info */}
            <div className="print-title bg-white rounded-lg shadow-sm p-6 mb-6 print:hidden">
              <h3 className="text-lg font-semibold text-gray-900">
                Kelas {selectedClass.name}
              </h3>
              <p className="text-sm text-gray-500">
                Tingkat {selectedClass.grade} | Total jam pelajaran: {scheduleEntries.length} jam
              </p>
            </div>

            {/* Schedule Table */}
            {scheduleEntries.length === 0 ? (
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
                          const slot = timeSlots.find(
                            (s) => s.day === day && s.slotNumber === slotNum
                          );

                          return (
                            <td
                              key={day}
                              className="px-2 py-2 text-xs text-center border-l border-gray-200"
                            >
                              {entry ? (
                                <div className="bg-purple-50 border border-purple-200 rounded p-2">
                                  <div className="font-semibold text-purple-900">
                                    {getSubjectName(entry.subjectId)}
                                  </div>
                                  <div className="text-purple-600 mt-1">
                                    {getTeacherName(entry.teacherId)}
                                  </div>
                                  {slot && (
                                    <div className="text-purple-500 text-xs mt-1">
                                      {slot.startTime}-{slot.endTime}
                                    </div>
                                  )}
                                </div>
                              ) : slot?.isBreak ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                  <div className="text-yellow-800 text-xs font-medium">
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
            )}
          </>
        )}
      </div>
    </>
  );
}
