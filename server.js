//  Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

const db = mysql.createConnection({
  host: "localhost",
  // Your MySQL username,
  user: "root",
  // Your MySQL password
  password: "4me2database",
  database: "employees",
});
db.connect((err) => {
  if (err) throw err;
  console.log("Database connected.");
  menu();
});
const menu = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Roles",
          "View All Departments",
          "Add Employee",
          "Add Role",
          "Add Department",
          "Update Employee Role",
        ],
      },
    ])
    .then((data) => {
      const { menu } = data;

      if (menu === "View All Employees") {
        return viewAllEmployees();
      } else if (menu === "View All Roles") {
        return viewAllRoles();
      } else if (menu === "View All Departments") {
        return viewAllDepartments();
      }
    });
};

const viewAllEmployees = () => {
  const sql = `SELECT employee.id AS ID, 
                      employee.first_name AS First_Name,  
                      employee.last_name AS Last_Name,
                      role.title AS Role, 
                      department.name AS Department, 
                      role.salary AS Salary,
                      CONCAT (manager.first_name, " ",manager.last_name) AS Manager
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id
                      LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  db.query(sql, (err, res) => {
    if (err) {
      console.log(err);
    }

    console.table(res);
    menu();
  });
};
const viewAllRoles = () => {
  const sql = `SELECT * FROM role`;
  db.query(sql, (err, res) => {
    if (err) {
      console.log(err);
    }
    console.table(res);
    menu();
  });
};
const viewAllDepartments = () => {
  const sql = `SELECT * FROM department`;
  db.query(sql, (err, res) => {
    if (err) {
      console.log(err);
    }
    console.table(res);
    menu();
  });
};
