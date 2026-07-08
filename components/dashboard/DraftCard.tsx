"use client";

import { useRouter } from "next/navigation";
import { Clock, FileText, Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Project, SCHOOL_LEVEL_LABELS, PROJECT_STATUS_LABELS } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface DraftCardProps {
  project: Project | null;
  onCreateNew: () => void;
}

export default function DraftCard({ project, onCreateNew }: DraftCardProps) {
  const router = useRouter();

  if (!project) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FileText size={32} className="text-gray-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Belum ada draft</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Mulai buat jadwal pelajaran baru untuk sekolah Anda
            </p>
          </div>
          <Button onClick={onCreateNew} size="lg">
            Buat Jadwal Baru
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-800 flex items-center justify-center flex-shrink-0">
            <Building2 size={24} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Lanjutkan Pekerjaan Terakhir
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Proyek Jadwal</p>
          </div>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {project.schoolName}
          </h4>
          {project.schoolLevel && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {SCHOOL_LEVEL_LABELS[project.schoolLevel]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tahun Ajaran:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
              {project.academicYear}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Semester:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
              {project.semester}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock size={14} className="mt-0.5 flex-shrink-0" />
          <div>
            <span className="block">Terakhir diedit</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatDateTime(project.lastEditedAt)}
            </span>
          </div>
        </div>

        {project.dataSnapshot.hasSchedule && (
          <div className="pt-2 border-t border-teal-200 dark:border-teal-800">
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Kelas:</span>
                <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                  {project.dataSnapshot.classCount}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Guru:</span>
                <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                  {project.dataSnapshot.teacherCount}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Mapel:</span>
                <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                  {project.dataSnapshot.subjectCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={() => router.push("/schools")}
        variant="primary"
        size="md"
        className="w-full"
      >
        Lanjutkan
      </Button>
    </div>
  );
}
