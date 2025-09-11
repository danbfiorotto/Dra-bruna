-- Dashboard SQL Functions for app-bruna
-- These functions provide the data needed for the dashboard components

-- Function to get appointments statistics
CREATE OR REPLACE FUNCTION get_appointments_stats(
  start_date DATE,
  end_date DATE,
  clinic_filter TEXT DEFAULT ''
)
RETURNS TABLE (
  appointments_done INTEGER,
  confirmation_rate DECIMAL,
  unique_patients INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH appointment_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
      COUNT(*) as total_count,
      COUNT(DISTINCT patient_id) as unique_patients_count
    FROM appointments
    WHERE appointment_date >= start_date 
      AND appointment_date <= end_date
      AND (clinic_filter = '' OR clinic_id::TEXT = ANY(string_to_array(clinic_filter, ',')))
  )
  SELECT 
    COALESCE(completed_count, 0)::INTEGER as appointments_done,
    CASE 
      WHEN total_count > 0 THEN COALESCE(confirmed_count::DECIMAL / total_count, 0)
      ELSE 0 
    END as confirmation_rate,
    COALESCE(unique_patients_count, 0)::INTEGER as unique_patients
  FROM appointment_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly productivity data
CREATE OR REPLACE FUNCTION get_weekly_productivity(
  start_date DATE,
  end_date DATE,
  clinic_filter TEXT DEFAULT ''
)
RETURNS TABLE (
  date DATE,
  appointments INTEGER,
  revenue DECIMAL,
  occupancy DECIMAL,
  cancellations INTEGER,
  no_shows INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT 
      a.appointment_date,
      COUNT(*) FILTER (WHERE a.status = 'completed') as appointments_count,
      COUNT(*) FILTER (WHERE a.status = 'cancelled') as cancellations_count,
      COUNT(*) FILTER (WHERE a.status = 'no_show') as no_shows_count,
      COALESCE(SUM(b.total_value), 0) as revenue_amount,
      -- Calculate occupancy as percentage of completed appointments vs total slots (assuming 8 slots per day)
      CASE 
        WHEN COUNT(*) FILTER (WHERE a.status = 'completed') > 0 
        THEN LEAST(COUNT(*) FILTER (WHERE a.status = 'completed')::DECIMAL / 8.0, 1.0)
        ELSE 0 
      END as occupancy_rate
    FROM appointments a
    LEFT JOIN medical_records mr ON a.id = mr.appointment_id
    LEFT JOIN budgets b ON mr.id = b.medical_record_id AND b.status = 'approved'
    WHERE a.appointment_date >= start_date 
      AND a.appointment_date <= end_date
      AND (clinic_filter = '' OR a.clinic_id::TEXT = ANY(string_to_array(clinic_filter, ',')))
    GROUP BY a.appointment_date
  )
  SELECT 
    ds.appointment_date as date,
    COALESCE(ds.appointments_count, 0)::INTEGER as appointments,
    COALESCE(ds.revenue_amount, 0) as revenue,
    COALESCE(ds.occupancy_rate, 0) as occupancy,
    COALESCE(ds.cancellations_count, 0)::INTEGER as cancellations,
    COALESCE(ds.no_shows_count, 0)::INTEGER as no_shows
  FROM daily_stats ds
  ORDER BY ds.appointment_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get clinics ranking
CREATE OR REPLACE FUNCTION get_clinics_ranking(
  start_date DATE,
  end_date DATE,
  clinic_filter TEXT DEFAULT ''
)
RETURNS TABLE (
  clinic_id UUID,
  name TEXT,
  revenue DECIMAL,
  avg_ticket DECIMAL,
  appointments INTEGER,
  delta DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH clinic_stats AS (
    SELECT 
      c.id as clinic_id,
      c.name,
      COALESCE(SUM(b.total_value), 0) as total_revenue,
      COUNT(a.id) FILTER (WHERE a.status = 'completed') as completed_appointments,
      CASE 
        WHEN COUNT(a.id) FILTER (WHERE a.status = 'completed') > 0 
        THEN COALESCE(SUM(b.total_value), 0) / COUNT(a.id) FILTER (WHERE a.status = 'completed')
        ELSE 0 
      END as avg_ticket_value
    FROM clinics c
    LEFT JOIN appointments a ON c.id = a.clinic_id 
      AND a.appointment_date >= start_date 
      AND a.appointment_date <= end_date
    LEFT JOIN medical_records mr ON a.id = mr.appointment_id
    LEFT JOIN budgets b ON mr.id = b.medical_record_id AND b.status = 'approved'
    WHERE (clinic_filter = '' OR c.id::TEXT = ANY(string_to_array(clinic_filter, ',')))
    GROUP BY c.id, c.name
  ),
  previous_stats AS (
    SELECT 
      c.id as clinic_id,
      COALESCE(SUM(b.total_value), 0) as prev_revenue
    FROM clinics c
    LEFT JOIN appointments a ON c.id = a.clinic_id 
      AND a.appointment_date >= (start_date - INTERVAL '1 month')
      AND a.appointment_date < start_date
    LEFT JOIN medical_records mr ON a.id = mr.appointment_id
    LEFT JOIN budgets b ON mr.id = b.medical_record_id AND b.status = 'approved'
    WHERE (clinic_filter = '' OR c.id::TEXT = ANY(string_to_array(clinic_filter, ',')))
    GROUP BY c.id
  )
  SELECT 
    cs.clinic_id,
    cs.name,
    cs.total_revenue as revenue,
    cs.avg_ticket_value as avg_ticket,
    cs.completed_appointments::INTEGER as appointments,
    CASE 
      WHEN ps.prev_revenue > 0 
      THEN (cs.total_revenue - ps.prev_revenue) / ps.prev_revenue
      ELSE 0 
    END as delta
  FROM clinic_stats cs
  LEFT JOIN previous_stats ps ON cs.clinic_id = ps.clinic_id
  WHERE cs.total_revenue > 0 AND cs.completed_appointments > 0
  ORDER BY cs.total_revenue DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to get clinic distribution
CREATE OR REPLACE FUNCTION get_clinic_distribution(
  start_date DATE,
  end_date DATE,
  clinic_filter TEXT DEFAULT ''
)
RETURNS TABLE (
  clinic TEXT,
  revenue DECIMAL,
  share DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH clinic_revenue AS (
    SELECT 
      c.name as clinic_name,
      COALESCE(SUM(b.total_value), 0) as total_revenue
    FROM clinics c
    LEFT JOIN appointments a ON c.id = a.clinic_id 
      AND a.appointment_date >= start_date 
      AND a.appointment_date <= end_date
    LEFT JOIN medical_records mr ON a.id = mr.appointment_id
    LEFT JOIN budgets b ON mr.id = b.medical_record_id AND b.status = 'approved'
    WHERE (clinic_filter = '' OR c.id::TEXT = ANY(string_to_array(clinic_filter, ',')))
    GROUP BY c.id, c.name
  ),
  total_revenue AS (
    SELECT SUM(total_revenue) as grand_total
    FROM clinic_revenue
  )
  SELECT 
    cr.clinic_name as clinic,
    cr.total_revenue as revenue,
    CASE 
      WHEN tr.grand_total > 0 
      THEN cr.total_revenue / tr.grand_total
      ELSE 0 
    END as share
  FROM clinic_revenue cr
  CROSS JOIN total_revenue tr
  WHERE cr.total_revenue > 0 AND tr.grand_total > 0
  ORDER BY cr.total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get today's appointments with details
CREATE OR REPLACE FUNCTION get_today_appointments(
  target_date DATE DEFAULT CURRENT_DATE,
  clinic_filter TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID,
  start_time TIME,
  patient_name TEXT,
  clinic_name TEXT,
  procedure_name TEXT,
  status TEXT,
  amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.start_time,
    p.name as patient_name,
    c.name as clinic_name,
    a.title as procedure_name,
    a.status,
    COALESCE(b.total_value, 0) as amount
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN clinics c ON a.clinic_id = c.id
  LEFT JOIN medical_records mr ON a.id = mr.appointment_id
  LEFT JOIN budgets b ON mr.id = b.medical_record_id AND b.status = 'approved'
  WHERE a.appointment_date = target_date
    AND (clinic_filter = '' OR a.clinic_id::TEXT = ANY(string_to_array(clinic_filter, ',')))
  ORDER BY a.start_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent activities
CREATE OR REPLACE FUNCTION get_recent_activities(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  action TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.action,
    al.created_at,
    al.user_id
  FROM audit_logs al
  ORDER BY al.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_appointments_stats(DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_productivity(DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_clinics_ranking(DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_clinic_distribution(DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_appointments(DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activities(INTEGER) TO authenticated;
