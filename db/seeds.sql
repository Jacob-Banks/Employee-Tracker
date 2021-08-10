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
('Sales Lead',10000.0,1),
('Salesperson',80000.0,1),
('Lead Engineer',150000.0,2),
('Engineer',100000.0,2),
('Leagal Lead',123123.0,4),
('Lawyer',111123.0,4),
('Accountant',75000.0,3);

INSERT INTO employee
  (first_name,last_name,role_id,manager_id)
VALUES
('ee','allen',3,NULL),
('dd','smith',1,1),
('aa','allen',1,NULL),
('bb','allen',4,5),
('cc','allen',4,NULL);
