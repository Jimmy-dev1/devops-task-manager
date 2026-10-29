UPDATE tasks
SET status = 'pending'
WHERE status IS NULL OR status NOT IN ('pending', 'completed');

ALTER TABLE tasks
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'completed'));
