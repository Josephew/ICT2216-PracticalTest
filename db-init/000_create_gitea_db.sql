-- Separate database for Gitea's own metadata (users, repos index, etc.),
-- distinct from "searchapp" which holds the Q4 application's search log.
CREATE DATABASE giteadb;
