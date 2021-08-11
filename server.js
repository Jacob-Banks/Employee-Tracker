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
          "Update Employee's manager",
          "View Employee's by manager",
          "View Employee's by department",
          "Delete Employee",
          "Delete Role",
          "Delete Department",
          "Budget by Department",
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
      } else if (menu === "Update Employee's manager") {
        return updateManager();
      } else if (menu === "View Employee's by manager") {
        return viewByManager();
      } else if (menu === "View Employee's by department") {
        return viewByDepartment();
      } else if (menu === "Delete Employee") {
        return deleteEmployee();
      } else if (menu === "Delete Role") {
        return deleteRole();
      } else if (menu === "Delete Department") {
        return deleteDepartment();
      } else if (menu === "Budget by Department") {
        return departmentBudget();
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
            //console.log(tempHolder);
            db.query(
              `SELECT * FROM employee WHERE manager_id is NULL `,
              (err, res) => {
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
                    console.log(answer.manager);
                    let manager;
                    if (answer.manager) {
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
              }
            );
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
const updateManager = () => {
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
        db.query(
          `SELECT * FROM employee WHERE manager_id is NULL `,
          (err, res) => {
            if (err) {
              console.log(err);
            }
            const managerChoices = res.map(({ id, first_name, last_name }) => ({
              name: first_name + " " + last_name,
              value: id,
            }));

            inquirer
              .prompt({
                type: "list",
                name: "manager",
                message: "Select new manager",
                choices: managerChoices,
              })
              .then((answer) => {
                tempHolder.unshift(answer.manager);
                db.query(
                  `UPDATE employee SET manager_id = ? WHERE id = ?`,
                  tempHolder,
                  (err, res) => {
                    if (err) {
                      console.log(err);
                    }

                    console.log("Employee manager successfully updated!");
                    console.log(tempHolder);

                    menu();
                  }
                );
              });
          }
        );
      });
  });
};
viewByManager = () => {
  db.query(`SELECT * FROM employee WHERE manager_id is NULL `, (err, res) => {
    if (err) {
      console.log(err);
    }
    const managerChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt({
        type: "list",
        name: "manager",
        message: "Select which manager",
        choices: managerChoices,
      })
      .then((answer) => {
        const manager = answer.manager;
        db.query(
          `SELECT CONCAT(first_name," ",last_name)AS name FROM employee WHERE manager_id=?`,
          manager,
          (err, res) => {
            if (err) {
              console.log(err);
            }

            console.table(res);
            menu();
          }
        );
      });
  });
};
viewByDepartment = () => {
  db.query(`SELECT * FROM department `, (err, res) => {
    if (err) {
      console.log(err);
    }
    const departmentChoices = res.map(({ id, name }) => ({
      name: name,
      value: id,
    }));

    inquirer
      .prompt({
        type: "list",
        name: "department",
        message: "Select which department",
        choices: departmentChoices,
      })
      .then((answer) => {
        const department = answer.department;
        db.query(
          `SELECT CONCAT(first_name," ",last_name)AS name 
          FROM employee 
          LEFT JOIN role ON role.id = employee.role_id
          LEFT JOIN department ON department.id = role.department_id
          WHERE department_id=?`,
          department,
          (err, res) => {
            if (err) {
              console.log(err);
            }

            console.table(res);
            menu();
          }
        );
      });
  });
};
deleteEmployee = () => {
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
          message: "select which employee to delete",
          choices: employeeChoices,
        },
      ])
      .then((answer) => {
        const employee = answer.employee;
        db.query(`DELETE FROM employee WHERE id = ?`, employee, (err, res) => {
          if (err) {
            console.log(err);
          }
          console.log("crusher of hope");
          menu();
        });
      });
  });
};
const deleteRole = () => {
  db.query(`SELECT * FROM role`, (err, res) => {
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
          message: "Select role to delete",
          choices: roleChoices,
        },
      ])
      .then((answer) => {
        const role = answer.role;
        db.query(`DELETE FROM role WHERE id = ?`, role, (err, res) => {
          if (err) {
            console.log(err);
          }
          console.log("crusher of hope");
          menu();
        });
      });
  });
};
const deleteDepartment = () => {
  db.query(`SELECT * FROM department`, (err, res) => {
    if (err) {
      console.log(err);
    }
    const departmentChoices = res.map(({ id, name }) => ({
      name: name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          message: "Select department to delete",
          choices: departmentChoices,
        },
      ])
      .then((answer) => {
        const department = answer.department;
        db.query(
          `DELETE FROM department WHERE id = ?`,
          department,
          (err, res) => {
            if (err) {
              console.log(err);
            }
            console.log("crusher of hope");
            menu();
          }
        );
      });
  });
};
const departmentBudget = () => {
  db.query(`SELECT * FROM department`, (err, res) => {
    if (err) {
      console.log(err);
    }
    const departmentChoices = res.map(({ id, name }) => ({
      name: name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          message: "Select which department budget",
          choices: departmentChoices,
        },
      ])
      .then((answer) => {
        const deptartment = answer.department;

        db.query(
          `SELECT SUM(salary) AS budget FROM role WHERE department_id = ?`,
          deptartment,
          (err, res) => {
            if (err) {
              console.log(err);
            }

            console.table(res);

            menu();
          }
        );
      });
  });
};
