$(head -n $(grep -n "CREATE TABLE projects (" init-db.sql | cut -d: -f1) init-db.sql)
  archive_note text,
  archived_at timestamp without time zone,
  archived_by uuid,
$(tail -n +$(grep -n "CREATE TABLE projects (" init-db.sql | cut -d: -f1 | awk '{print $1+1}') init-db.sql)
