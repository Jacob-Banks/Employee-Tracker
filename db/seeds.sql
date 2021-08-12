INSERT INTO department
  (name)
VALUES
('Sales'),
('Engingeering'),
('finance'),
('legal');

INSERT INTO role
  (title,salary,department_id)
VALUES
('Sales Lead',110000.0,1),
('Salesperson',850000.0,1),
('Lead Engineer',250000.0,2),
('Engineer',125000.0,2),
('Leagal Lead',223123.0,4),
('Lawyer',151123.0,4),
('Accountant',85000.0,3);

INSERT INTO employee
  (first_name,last_name,role_id,manager_id)
VALUES
('Fariq','Abdul',1,NULL),
('Christy','Apple',3,NULL),
('Simone','Achete',5,NULL),
('Bilbo','Baggins',7,NULL),
('Alice','Evegreen',2,1),
('Ally','Fancy',2,1),
('Andre','Dragon',4,2),
('Gorgy','Golf',6,3);
