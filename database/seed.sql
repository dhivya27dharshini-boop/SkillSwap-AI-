USE skillswap;
INSERT INTO users (name,email,password_hash,bio,location,role) VALUES
('Demo User','demo@skillswap.ai','$2b$10$5k4k0Y2mH4W8W0z1m2mJ9e2Q5p8J8Q4W1K8G7Y4S5P0R3N2T1U6V2','Full-stack learner looking to exchange web development and data skills.','Villupuram','user'),
('Ananya Rao','ananya@example.com','$2b$10$5k4k0Y2mH4W8W0z1m2mJ9e2Q5p8J8Q4W1K8G7Y4S5P0R3N2T1U6V2','Frontend developer and UI enthusiast.','Chennai','user'),
('Karthik S','karthik@example.com','$2b$10$5k4k0Y2mH4W8W0z1m2mJ9e2Q5p8J8Q4W1K8G7Y4S5P0R3N2T1U6V2','Python and analytics learner.','Puducherry','user');

INSERT INTO skills (user_id,name,category,level,type,description) VALUES
(1,'React.js','Web Development','Intermediate','offer','Can teach React fundamentals, routing and API integration.'),
(1,'Python','Programming','Intermediate','learn','Looking for advanced Python and machine learning guidance.'),
(2,'UI/UX Design','Design','Advanced','offer','Figma, design systems and responsive UI.'),
(2,'Node.js','Backend','Intermediate','learn','Want to improve backend API architecture.'),
(3,'Python','Programming','Advanced','offer','Python, pandas and analytics workflows.'),
(3,'SQL','Database','Advanced','offer','SQL queries, joins, aggregation and optimization.');
