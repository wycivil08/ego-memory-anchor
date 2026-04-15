-- Prevent source_label from being updated (trust architecture requirement)
CREATE OR REPLACE FUNCTION prevent_source_label_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source_label IS DISTINCT FROM OLD.source_label THEN
    RAISE EXCEPTION 'source_label is immutable and cannot be changed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_source_label_immutable
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION prevent_source_label_update();
