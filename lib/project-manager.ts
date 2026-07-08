/**
 * Project Manager
 * Mengelola projects (draft, active, completed)
 * Menggunakan localStorage untuk sementara
 */

import { Project, ProjectStatus } from "./types";
import { LocalDB } from "./db";
import { generateId } from "./utils";
import { getAllScheduleEntries } from "./scheduler";

const PROJECT_KEYS = {
  PROJECTS: "jadwal_projects",
  ACTIVE_PROJECT: "jadwal_active_project",
};

export class ProjectManager {
  /**
   * Get all projects
   */
  static getProjects(): Project[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(PROJECT_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get active project ID
   */
  static getActiveProjectId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(PROJECT_KEYS.ACTIVE_PROJECT);
  }

  /**
   * Get active project
   */
  static getActiveProject(): Project | null {
    const projectId = this.getActiveProjectId();
    if (!projectId) return null;
    return this.getProjectById(projectId);
  }

  /**
   * Get project by ID
   */
  static getProjectById(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  /**
   * Create new project from current data
   */
  static createProject(): Project {
    const school = LocalDB.getSchool();
    const classes = school ? LocalDB.listClasses(school.id) : [];
    const teachers = school ? LocalDB.listTeachers(school.id) : [];
    const subjects = school ? LocalDB.listSubjects(school.id) : [];
    const scheduleEntries = school ? getAllScheduleEntries(school.id) : [];

    const project: Project = {
      id: generateId(),
      schoolName: school?.name || "Sekolah Baru",
      schoolLevel: school?.level,
      academicYear: school?.academicYear || new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
      semester: school?.semester || "Ganjil",
      status: "draft",
      createdAt: Date.now(),
      lastEditedAt: Date.now(),
      dataSnapshot: {
        schoolId: school?.id || "",
        classCount: classes.length,
        teacherCount: teachers.length,
        subjectCount: subjects.length,
        hasSchedule: scheduleEntries.length > 0,
      },
    };

    const projects = this.getProjects();
    projects.push(project);
    localStorage.setItem(PROJECT_KEYS.PROJECTS, JSON.stringify(projects));

    // Set as active
    this.setActiveProject(project.id);

    return project;
  }

  /**
   * Update project metadata
   */
  static updateProject(projectId: string, updates: Partial<Project>): void {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index === -1) return;

    projects[index] = {
      ...projects[index],
      ...updates,
      lastEditedAt: Date.now(),
    };

    localStorage.setItem(PROJECT_KEYS.PROJECTS, JSON.stringify(projects));
  }

  /**
   * Update active project's snapshot
   */
  static updateActiveProjectSnapshot(): void {
    const projectId = this.getActiveProjectId();
    if (!projectId) return;

    const school = LocalDB.getSchool();
    if (!school) return;

    const classes = LocalDB.listClasses(school.id);
    const teachers = LocalDB.listTeachers(school.id);
    const subjects = LocalDB.listSubjects(school.id);
    const scheduleEntries = getAllScheduleEntries(school.id);

    this.updateProject(projectId, {
      schoolName: school.name,
      schoolLevel: school.level,
      academicYear: school.academicYear,
      semester: school.semester,
      dataSnapshot: {
        schoolId: school.id,
        classCount: classes.length,
        teacherCount: teachers.length,
        subjectCount: subjects.length,
        hasSchedule: scheduleEntries.length > 0,
      },
    });
  }

  /**
   * Set active project
   */
  static setActiveProject(projectId: string): void {
    localStorage.setItem(PROJECT_KEYS.ACTIVE_PROJECT, projectId);
  }

  /**
   * Initialize project system (migration dari data lama)
   */
  static initialize(): void {
    const projects = this.getProjects();
    const activeProjectId = this.getActiveProjectId();

    // Jika belum ada project tapi ada data sekolah, buat project otomatis
    const school = LocalDB.getSchool();
    if (projects.length === 0 && school) {
      this.createProject();
    }

    // Jika ada project tapi gak ada active, set yang pertama
    if (projects.length > 0 && !activeProjectId) {
      this.setActiveProject(projects[0].id);
    }
  }

  /**
   * Delete project
   */
  static deleteProject(projectId: string): void {
    const projects = this.getProjects().filter((p) => p.id !== projectId);
    localStorage.setItem(PROJECT_KEYS.PROJECTS, JSON.stringify(projects));

    // Jika yang dihapus adalah active project, clear active
    if (this.getActiveProjectId() === projectId) {
      localStorage.removeItem(PROJECT_KEYS.ACTIVE_PROJECT);
    }
  }

  /**
   * Update status project
   */
  static updateProjectStatus(projectId: string, status: ProjectStatus): void {
    this.updateProject(projectId, { status });
  }
}
