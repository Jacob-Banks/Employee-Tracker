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
('Sales Lead',100000.0,1),
('Salesperson',800000.0,1),
('Lead Engineer',150000.0,2),
('Engineer',100000.0,2),
('Leagal Lead',123123.0,4),
('Lawyer',111123.0,4),
('Accountant',75000.0,3);

INSERT INTO employee
  (first_name,last_name,role_id,manager_id)
VALUES
('ee','ee',3,NULL),
('dd','dd',2,3),
('aa','aa',1,NULL),
('bb','bb',4,1),
('cc','cc',5,NULL),
('ff','ff',7,NULL),
('gg','gg',6,5);
