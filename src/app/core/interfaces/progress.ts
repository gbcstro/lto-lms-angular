export interface Progress {
    completed_lessons: number;
    total_lessons: number;
    module_id: number;
    badge_awarded?: boolean;  // ✅ Add this line to track badge status
  }
  