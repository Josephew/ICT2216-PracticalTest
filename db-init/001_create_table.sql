-- Q4(i): table named after student ID, logging each validated search
-- query together with the time it was made.
-- Quoted because the identifier starts with a digit.
CREATE TABLE IF NOT EXISTS "2402195" (
    id SERIAL PRIMARY KEY,
    search_query TEXT NOT NULL,
    search_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
