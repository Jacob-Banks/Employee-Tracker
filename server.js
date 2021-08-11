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
  //addEmployee();
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
      } else if (menu === "Add Employee") {
        return addEmployee();
      } else if (menu === "Add Role") {
        return addRole();
      } else if (menu === "Add Department") {
        return addDepartment();
      } else if (menu === "Update Employee Role") {
        return updateEmployee();
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
const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first",
        message: "Please enter employee's first name",
        validate: (first) => {
          if (first) {
            return true;
          } else {
            console.log("Enter the employee's first name");
          }
        },
      },
      {
        type: "input",
        name: "last",
        message: "Please enter employee's last name",
        validate: (last) => {
          if (last) {
            return true;
          } else {
            console.log("Enter employee's last name");
          }
        },
      },
    ])
    .then((answers) => {
      const tempHolder = [answers.first, answers.last];
      db.query(`SELECT role.id, role.title FROM role`, (err, res) => {
        if (err) {
          console.log(err);
        }
        const roleChoices = res.map(({ id, title }) => ({
          name: title,
          value: id,
        }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "Select a role ",
              choices: roleChoices,
            },
          ])
          .then((answer) => {
            const role = answer.role;
            tempHolder.push(role);
            console.log(tempHolder);
            db.query(`SELECT * FROM employee`, (err, res) => {
              if (err) {
                console.log(err);
              }
              const managerChoices = res.map(
                ({ id, first_name, last_name }) => ({
                  name: first_name + " " + last_name,
                  value: id,
                })
              );

              inquirer
                .prompt([
                  {
                    //check on manager
                    type: "confirm",
                    name: "confirm",
                    message: "Would you like to add a Manager?",
                    default: false,
                  },
                  {
                    type: "list",
                    name: "manager",
                    message: "Select a manager ",
                    choices: managerChoices,
                    when: function (answers) {
                      return answers.confirm !== false;
                    },
                  },
                ])
                .then((answer) => {
                  let manager;
                  if (answers.manager) {
                    manager = answer.manager;
                  } else {
                    manager = null;
                  }
                  tempHolder.push(manager);
                  console.log(tempHolder);
                  db.query(
                    `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                  Values (?, ?, ?, ?)`,
                    tempHolder,
                    (err, res) => {
                      if (err) {
                        console.log(err);
                      }

                      console.log("Employee successfully added!");

                      menu();
                    }
                  );
                });
            });
          });
      });
    });
};
const addRole = () => {
  db.query(
    `SELECT department.id, department.name FROM department`,
    (err, res) => {
      if (err) {
        console.log(err);
      }
      const roleChoices = res.map(({ id, name }) => ({
        name: name,
        value: id,
      }));

      inquirer
        .prompt([
          {
            type: "list",
            name: "department",
            message: "Select a Department ",
            choices: roleChoices,
          },
          { type: "input", name: "role", message: "Enter new role" },
          { type: "number", name: "salary", message: "Enter salary" },
        ])
        .then((answer) => {
          const tempHolder = [answer.department, answer.role, answer.salary];
          db.query(
            `INSERT INTO role (department_id, title, salary) 
          Values (?, ?, ?)`,
            tempHolder,
            (err, res) => {
              if (err) {
                console.log(err);
              }

              console.log("Role successfully added!");

              menu();
            }
          );
        });
    }
  );
};

const addDepartment = () => {
  inquirer
    .prompt([
      { type: "input", name: "department", message: "Enter new Department" },
    ])
    .then((answer) => {
      const tempHolder = [answer.department];
      db.query(
        `INSERT INTO department (name) 
          Values (?)`,
        tempHolder,
        (err, res) => {
          if (err) {
            console.log(err);
          }

          console.log("Department successfully added!");

          menu();
        }
      );
    });
};
const updateEmployee = () => {
  db.query(`SELECT * FROM employee`, (err, res) => {
    if (err) {
      console.log(err);
    }
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));
    inquirer
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "select which employee to update",
          choices: employeeChoices,
        },
      ])
      .then((answer) => {
        const tempHolder = [answer.employee];
        db.query(`SELECT * FROM role`, (err, res) => {
          if (err) {
            console.log(err);
          }
          const roleChoices = res.map(({ id, title }) => ({
            name: title,
            value: id,
          }));

          inquirer
            .prompt({
              type: "list",
              name: "role",
              message: "Select new role",
              choices: roleChoices,
            })
            .then((answer) => {
              tempHolder.unshift(answer.role);
              db.query(
                `UPDATE employee SET role_id = ? WHERE id = ?`,
                tempHolder,
                (err, res) => {
                  if (err) {
                    console.log(err);
                  }

                  console.log("Employee role successfully updated!");
                  console.log(tempHolder);

                  menu();
                }
              );
            });
        });
      });
  });
};
