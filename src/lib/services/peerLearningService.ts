import { SupabaseClient } from '@supabase/supabase-js';

export interface LearningPod {
  id: string;
  name: string;
  description?: string;
  teacher_id: string;
  is_public: boolean;
  created_at: string;
}

export interface MentorshipLog {
  id: string;
  mentor_id: string;
  student_id: string;
  pod_id?: string;
  subject: string;
  duration_minutes: number;
  notes?: string;
  verified_by_teacher: boolean;
  created_at: string;
}

export interface PeerReview {
  id: string;
  reviewer_id: string;
  portfolio_item_id: string;
  feedback: string;
  rating?: number;
  teacher_approved: boolean;
  created_at: string;
}

export class PeerLearningService {
  /**
   * Get all pods for a student
   */
  static async getStudentPods(studentId: string, supabase: SupabaseClient): Promise<LearningPod[]> {
    const { data, error } = await supabase
      .from('pod_members')
      .select('learning_pods (*)')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student pods:', error);
      return [];
    }

    return (data || []).map(row => row.learning_pods) as unknown as LearningPod[];
  }

  /**
   * Log a mentorship session
   */
  static async logMentorship(
    log: Omit<MentorshipLog, 'id' | 'verified_by_teacher' | 'created_at'>,
    supabase: SupabaseClient
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from('mentorship_logs').insert(log);

    if (error) {
      console.error('Error logging mentorship:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Submit a peer review
   */
  static async submitPeerReview(
    review: Omit<PeerReview, 'id' | 'teacher_approved' | 'created_at'>,
    supabase: SupabaseClient
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from('peer_reviews').insert(review);

    if (error) {
      console.error('Error submitting peer review:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Get unapproved peer reviews for a teacher
   */
  static async getPendingReviewsForTeacher(teacherId: string, supabase: SupabaseClient): Promise<PeerReview[]> {
    // This assumes teacher_students mapping is used to find students under this teacher
    const { data: students } = await supabase
      .from('teacher_students')
      .select('student_id')
      .eq('teacher_id', teacherId);

    if (!students || students.length === 0) return [];

    const studentIds = students.map(s => s.student_id);

    const { data, error } = await supabase
      .from('peer_reviews')
      .select('*')
      .in('reviewer_id', studentIds)
      .eq('teacher_approved', false);

    if (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Approve a peer review
   */
  static async approveReview(reviewId: string, supabase: SupabaseClient): Promise<boolean> {
    const { error } = await supabase
      .from('peer_reviews')
      .update({ teacher_approved: true })
      .eq('id', reviewId);

    if (error) {
      console.error('Error approving review:', error);
      return false;
    }

    return true;
  }

  /**
   * Get mentoring hours for a student
   */
  static async getMentoringHours(studentId: string, supabase: SupabaseClient): Promise<number> {
    const { data, error } = await supabase
      .from('mentorship_logs')
      .select('duration_minutes')
      .eq('mentor_id', studentId)
      .eq('verified_by_teacher', true);

    if (error) {
      console.error('Error fetching mentoring hours:', error);
      return 0;
    }

    const totalMinutes = (data || []).reduce((sum, log) => sum + log.duration_minutes, 0);
    return Math.round((totalMinutes / 60) * 10) / 10; // Return hours rounded to 1 decimal
  }
}
