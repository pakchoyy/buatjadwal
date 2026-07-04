/**
 * Teacher Schedule Page - Jadwal per Guru
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { LocalDB } from "@/lib/db";
import { getScheduleByTeacher } from "@/lib/scheduler";
import { exportTeacherScheduleToJson, downloadJson } from "@/lib/export";
import {
  ScheduleEntry,
  TimeSlot,
  Teacher,
  Subject,
  Class,
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

  const handleExport = () => {
    const school = LocalDB.getSchool();
    if (!school || !selectedTeacherId) return;

    const jsonData = exportTeacherScheduleToJson(school.id, selectedTeacherId);
    const teacherName = selectedTeacher?.name.replace(/\s+/g, "_") || "teacher";
    const filename = `Jadwal_Guru_${teacherName}_${new Date().getTime()}.json`;
    downloadJson(filename, jsonData);
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
        <div className="flex flex-wrap gap-3 justify-end">
          <Button onClick={handleExport} disabled={!selectedTeacherId} size="sm">
            Export JSON
          </Button>
          <Button variant="secondary" onClick={() => router.push("/schedules")} size="sm">
            Jadwal Umum
          </Button>
          <Button variant="secondary" onClick={() => router.push("/schedules/class")} size="sm">
            Jadwal per Kelas
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Teacher Selector */}
        <div className="mb-6 max-w-md">
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
            {/* Teacher Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedTeacher.name}
              </h3>
              <p className="text-sm text-gray-500">
                Kode: {selectedTeacher.code} | Total mengajar: {scheduleEntries.length} jam
              </p>
            </div>

            {/* Schedule Table */}
            {scheduleEntries.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">Guru ini belum memiliki jadwal mengajar</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
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