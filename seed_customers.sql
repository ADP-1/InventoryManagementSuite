BEGIN;

-- 1. DELETE EXISTING CUSTOMERS (and their related invoices/items due to foreign keys)
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM customers;

-- 2. INSERT NEW CUSTOMERS
INSERT INTO customers (name, email, phone, created_at, updated_at) VALUES
('Aarav Sharma', 'aarav.sharma@example.com', '9876500001', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Vivaan Gupta', 'vivaan.gupta@example.com', '9876500002', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Aditya Verma', 'aditya.verma@example.com', '9876500003', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Arjun Mehta', 'arjun.mehta@example.com', '9876500004', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Reyansh Singh', 'reyansh.singh@example.com', '9876500005', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Krishna Patel', 'krishna.patel@example.com', '9876500006', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Ishaan Nair', 'ishaan.nair@example.com', '9876500007', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Shaurya Reddy', 'shaurya.reddy@example.com', '9876500008', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Atharv Joshi', 'atharv.joshi@example.com', '9876500009', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Rohan Das', 'rohan.das@example.com', '9876500010', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),

('Ananya Sharma', 'ananya.sharma@example.com', '9876500011', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Diya Gupta', 'diya.gupta@example.com', '9876500012', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Ira Verma', 'ira.verma@example.com', '9876500013', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Saanvi Mehta', 'saanvi.mehta@example.com', '9876500014', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Aadhya Singh', 'aadhya.singh@example.com', '9876500015', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Myra Patel', 'myra.patel@example.com', '9876500016', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Navya Nair', 'navya.nair@example.com', '9876500017', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Riya Reddy', 'riya.reddy@example.com', '9876500018', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Pari Joshi', 'pari.joshi@example.com', '9876500019', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Kavya Das', 'kavya.das@example.com', '9876500020', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),

('Rahul Yadav', 'rahul.yadav@example.com', '9876500021', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Amit Mishra', 'amit.mishra@example.com', '9876500022', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Deepak Tiwari', 'deepak.tiwari@example.com', '9876500023', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Sandeep Chauhan', 'sandeep.chauhan@example.com', '9876500024', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Vikas Pandey', 'vikas.pandey@example.com', '9876500025', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Pooja Yadav', 'pooja.yadav@example.com', '9876500026', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Neha Mishra', 'neha.mishra@example.com', '9876500027', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Sneha Tiwari', 'sneha.tiwari@example.com', '9876500028', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Ritu Chauhan', 'ritu.chauhan@example.com', '9876500029', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Anjali Pandey', 'anjali.pandey@example.com', '9876500030', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),

('Kunal Jain', 'kunal.jain@example.com', '9876500031', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Nikhil Agarwal', 'nikhil.agarwal@example.com', '9876500032', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Manish Bansal', 'manish.bansal@example.com', '9876500033', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Suresh Goel', 'suresh.goel@example.com', '9876500034', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Rakesh Singhal', 'rakesh.singhal@example.com', '9876500035', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Priya Jain', 'priya.jain@example.com', '9876500036', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Komal Agarwal', 'komal.agarwal@example.com', '9876500037', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Shweta Bansal', 'shweta.bansal@example.com', '9876500038', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Preeti Goel', 'preeti.goel@example.com', '9876500039', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Nisha Singhal', 'nisha.singhal@example.com', '9876500040', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),

('Farhan Khan', 'farhan.khan@example.com', '9876500041', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Imran Sheikh', 'imran.sheikh@example.com', '9876500042', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Zaid Ansari', 'zaid.ansari@example.com', '9876500043', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Ayaan Qureshi', 'ayaan.qureshi@example.com', '9876500044', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Sameer Pathan', 'sameer.pathan@example.com', '9876500045', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Sara Khan', 'sara.khan@example.com', '9876500046', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Alina Sheikh', 'alina.sheikh@example.com', '9876500047', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Zoya Ansari', 'zoya.ansari@example.com', '9876500048', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Hina Qureshi', 'hina.qureshi@example.com', '9876500049', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Nazia Pathan', 'nazia.pathan@example.com', '9876500050', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),

('Rajesh Pillai', 'rajesh.pillai@example.com', '9876500051', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Anil Menon', 'anil.menon@example.com', '9876500052', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Sanjay Iyer', 'sanjay.iyer@example.com', '9876500053', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Lakshmi Nair', 'lakshmi.nair@example.com', '9876500054', NOW() - (RANDOM()*150 || ' days')::interval, NOW()),
('Meera Pillai', 'meera.pillai@example.com', '9876500055', NOW() - (RANDOM()*150 || ' days')::interval, NOW());

COMMIT;