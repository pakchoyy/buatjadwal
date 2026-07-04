/**
 * Schedules Page - Jadwal Umum (matrix semua kelas)
 */

"use client";

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
  DAYS,
  DAY_LABELS,
  Day,
} from "@/lib/types";
import { getDayLabel } from "@/lib/utils";
import { exportAllSchedulesToJson, downloadJson } from "@/lib/export";

export default function SchedulesPage() {
  const router = useRouter();
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day>("monday");

  const handleExport = () => {
    const school = LocalDB.getSchool();
    if (!school) return;

    const jsonData = exportAllSchedulesToJson(school.id, selectedDay);
    const filename = `Jadwal_${getDayLabel(selectedDay)}_${new Date().getTime()}.json`;
    downloadJson(filename, jsonData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const school = LocalDB.getSchool();
    if (!school) return;

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
        <div className="flex justify-end">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport} size="sm">Export JSON</Button>
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
        <div className="mb-6 max-w-xs">
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

        {/* Schedule Matrix */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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

        <div className="mt-4 text-sm text-gray-500">
          Menampilkan jadwal untuk hari {getDayLabel(selectedDay)} - {sortedClasses.length} kelas
        </div>
      </div>
    </>
  );
}