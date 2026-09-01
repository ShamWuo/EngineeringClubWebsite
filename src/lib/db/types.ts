export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'member' | 'officer' | 'admin';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'withdrawn';
export type CompStatus = 'idea' | 'planned' | 'active' | 'completed' | 'cancelled';
export type WorkshopStatus = 'proposed' | 'scheduled' | 'completed' | 'cancelled';
export type TeamRole = 'lead' | 'member';
export type FundingStatus = 'pending' | 'approved' | 'partially_approved' | 'rejected' | 'reimbursed';
export type LinkTier = 'primary' | 'secondary' | 'resource';
export type WorkLogVisibility = 'team' | 'club';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          grad_year: number | null;
          role: UserRole;
          skills: string[];
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          grad_year?: number | null;
          role?: UserRole;
          skills?: string[];
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          grad_year?: number | null;
          role?: UserRole;
          skills?: string[];
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      competitions: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          organizer: string | null;
          status: CompStatus;
          season: string | null;
          registration_opens_at: string | null;
          registration_closes_at: string | null;
          event_starts_at: string | null;
          event_ends_at: string | null;
          max_teams: number | null;
          max_team_size: number | null;
          entry_fee_cents: number;
          external_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          organizer?: string | null;
          status?: CompStatus;
          season?: string | null;
          registration_opens_at?: string | null;
          registration_closes_at?: string | null;
          event_starts_at?: string | null;
          event_ends_at?: string | null;
          max_teams?: number | null;
          max_team_size?: number | null;
          entry_fee_cents?: number;
          external_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          organizer?: string | null;
          status?: CompStatus;
          season?: string | null;
          registration_opens_at?: string | null;
          registration_closes_at?: string | null;
          event_starts_at?: string | null;
          event_ends_at?: string | null;
          max_teams?: number | null;
          max_team_size?: number | null;
          entry_fee_cents?: number;
          external_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          competition_id: string;
          name: string;
          description: string | null;
          is_recruiting: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_id: string;
          name: string;
          description?: string | null;
          is_recruiting?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string;
          name?: string;
          description?: string | null;
          is_recruiting?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          team_id: string;
          user_id: string;
          role: TeamRole;
          joined_at: string;
        };
        Insert: {
          team_id: string;
          user_id: string;
          role?: TeamRole;
          joined_at?: string;
        };
        Update: {
          team_id?: string;
          user_id?: string;
          role?: TeamRole;
          joined_at?: string;
        };
      };
      competition_signups: {
        Row: {
          id: string;
          competition_id: string;
          user_id: string;
          note: string | null;
          status: RequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_id: string;
          user_id: string;
          note?: string | null;
          status?: RequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string;
          user_id?: string;
          note?: string | null;
          status?: RequestStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_requests: {
        Row: {
          id: string;
          competition_id: string;
          requested_by: string;
          proposed_name: string;
          purpose: string | null;
          proposed_member_ids: string[];
          needs_funding: boolean;
          status: RequestStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_note: string | null;
          created_team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_id: string;
          requested_by: string;
          proposed_name: string;
          purpose?: string | null;
          proposed_member_ids?: string[];
          needs_funding?: boolean;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string;
          requested_by?: string;
          proposed_name?: string;
          purpose?: string | null;
          proposed_member_ids?: string[];
          needs_funding?: boolean;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      competition_requests: {
        Row: {
          id: string;
          requested_by: string;
          name: string;
          organizer: string | null;
          url: string | null;
          why: string | null;
          estimated_cost_cents: number;
          estimated_team_size: number | null;
          deadline: string | null;
          status: RequestStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_note: string | null;
          created_competition_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requested_by: string;
          name: string;
          organizer?: string | null;
          url?: string | null;
          why?: string | null;
          estimated_cost_cents?: number;
          estimated_team_size?: number | null;
          deadline?: string | null;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_competition_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requested_by?: string;
          name?: string;
          organizer?: string | null;
          url?: string | null;
          why?: string | null;
          estimated_cost_cents?: number;
          estimated_team_size?: number | null;
          deadline?: string | null;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_competition_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workshops: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          instructor_id: string | null;
          instructor_name: string | null;
          status: WorkshopStatus;
          starts_at: string | null;
          ends_at: string | null;
          location: string | null;
          capacity: number | null;
          skill_level: string | null;
          materials_url: string | null;
          recording_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          instructor_id?: string | null;
          instructor_name?: string | null;
          status?: WorkshopStatus;
          starts_at?: string | null;
          ends_at?: string | null;
          location?: string | null;
          capacity?: number | null;
          skill_level?: string | null;
          materials_url?: string | null;
          recording_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          instructor_id?: string | null;
          instructor_name?: string | null;
          status?: WorkshopStatus;
          starts_at?: string | null;
          ends_at?: string | null;
          location?: string | null;
          capacity?: number | null;
          skill_level?: string | null;
          materials_url?: string | null;
          recording_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workshop_rsvps: {
        Row: {
          workshop_id: string;
          user_id: string;
          attended: boolean;
          created_at: string;
        };
        Insert: {
          workshop_id: string;
          user_id: string;
          attended?: boolean;
          created_at?: string;
        };
        Update: {
          workshop_id?: string;
          user_id?: string;
          attended?: boolean;
          created_at?: string;
        };
      };
      workshop_requests: {
        Row: {
          id: string;
          requested_by: string;
          topic: string;
          rationale: string | null;
          offering_to_teach: boolean;
          preferred_timeframe: string | null;
          status: RequestStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_note: string | null;
          created_workshop_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requested_by: string;
          topic: string;
          rationale?: string | null;
          offering_to_teach?: boolean;
          preferred_timeframe?: string | null;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_workshop_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requested_by?: string;
          topic?: string;
          rationale?: string | null;
          offering_to_teach?: boolean;
          preferred_timeframe?: string | null;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_workshop_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workshop_request_votes: {
        Row: {
          request_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          request_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          request_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      funding_requests: {
        Row: {
          id: string;
          requested_by: string;
          team_id: string | null;
          competition_id: string | null;
          title: string;
          justification: string | null;
          amount_requested_cents: number;
          amount_approved_cents: number | null;
          status: FundingStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_note: string | null;
          reimbursed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requested_by: string;
          team_id?: string | null;
          competition_id?: string | null;
          title: string;
          justification?: string | null;
          amount_requested_cents: number;
          amount_approved_cents?: number | null;
          status?: FundingStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          reimbursed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requested_by?: string;
          team_id?: string | null;
          competition_id?: string | null;
          title?: string;
          justification?: string | null;
          amount_requested_cents?: number;
          amount_approved_cents?: number | null;
          status?: FundingStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          reimbursed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      funding_line_items: {
        Row: {
          id: string;
          funding_request_id: string;
          description: string;
          vendor: string | null;
          unit_cost_cents: number;
          quantity: number;
          url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          funding_request_id: string;
          description: string;
          vendor?: string | null;
          unit_cost_cents: number;
          quantity?: number;
          url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          funding_request_id?: string;
          description?: string;
          vendor?: string | null;
          unit_cost_cents?: number;
          quantity?: number;
          url?: string | null;
          created_at?: string;
        };
      };
      funding_attachments: {
        Row: {
          id: string;
          funding_request_id: string;
          storage_path: string;
          filename: string;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          funding_request_id: string;
          storage_path: string;
          filename: string;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          funding_request_id?: string;
          storage_path?: string;
          filename?: string;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      work_logs: {
        Row: {
          id: string;
          author_id: string;
          team_id: string | null;
          competition_id: string | null;
          body: string;
          hours_spent: number | null;
          blockers: string | null;
          visibility: WorkLogVisibility;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          team_id?: string | null;
          competition_id?: string | null;
          body: string;
          hours_spent?: number | null;
          blockers?: string | null;
          visibility?: WorkLogVisibility;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          team_id?: string | null;
          competition_id?: string | null;
          body?: string;
          hours_spent?: number | null;
          blockers?: string | null;
          visibility?: WorkLogVisibility;
          created_at?: string;
          updated_at?: string;
        };
      };
      links: {
        Row: {
          id: string;
          label: string;
          url: string;
          description: string | null;
          tier: LinkTier;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          url: string;
          description?: string | null;
          tier?: LinkTier;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          url?: string;
          description?: string | null;
          tier?: LinkTier;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          title: string;
          body: string | null;
          href: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: string;
          title: string;
          body?: string | null;
          href?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: string;
          title?: string;
          body?: string | null;
          href?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          diff: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          diff?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          diff?: Json | null;
          created_at?: string;
        };
      };
      general_requests: {
        Row: {
          id: string;
          requested_by: string;
          title: string;
          category: string;
          description: string;
          urgency: string;
          status: RequestStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requested_by: string;
          title: string;
          category?: string;
          description: string;
          urgency?: string;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requested_by?: string;
          title?: string;
          category?: string;
          description?: string;
          urgency?: string;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_settings: {
        Row: {
          id: string;
          club_name: string;
          allowed_email_domain: string;
          budget_ceiling_cents: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          club_name?: string;
          allowed_email_domain?: string;
          budget_ceiling_cents?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          club_name?: string;
          allowed_email_domain?: string;
          budget_ceiling_cents?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
    };
    Views: {
      pending_requests: {
        Row: {
          kind: 'team' | 'competition' | 'workshop' | 'funding' | 'general';
          id: string;
          requested_by: string;
          created_at: string;
          status: string;
          title: string;
          summary: string | null;
        };
      };
    };
    Functions: {
      current_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      is_officer: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_team_member: {
        Args: { t: string };
        Returns: boolean;
      };
      is_team_lead: {
        Args: { t: string };
        Returns: boolean;
      };
      approve_team_request: {
        Args: { p_request_id: string; p_reviewer_id: string; p_note?: string };
        Returns: string;
      };
      approve_competition_request: {
        Args: { p_request_id: string; p_reviewer_id: string; p_note?: string };
        Returns: string;
      };
      approve_workshop_request: {
        Args: { p_request_id: string; p_reviewer_id: string; p_note?: string };
        Returns: string;
      };
      approve_funding_request: {
        Args: { p_request_id: string; p_reviewer_id: string; p_approved_cents: number; p_note?: string };
        Returns: string;
      };
      decide_request: {
        Args: { p_kind: string; p_request_id: string; p_reviewer_id: string; p_new_status: string; p_note?: string };
        Returns: boolean;
      };
    };
  };
}
