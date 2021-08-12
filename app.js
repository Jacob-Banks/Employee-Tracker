//  Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

// connect to database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "4me2database",
  database: "employees",
});
db.connect((err) => {
  if (err) throw err;
  console.log("Database connected.");
  menu();
});
// options menu
const menu = () => {
  inquirer
    // prmpt to select action option
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Roles",
          "View All Departments",
          "View Employee's by manager",
          "View Employee's by department",
          "Add Employee",
          "Add Role",
          "Add Department",
          "Update Employee Role",
          "Update Employee's manager",
          "Delete Employee",
          "Delete Role",
          "Delete Department",
          "Budget by Department",
        ],
      },
    ]) //function calls for selected option
    .then((data) => {
      const { menu } = data;
      switch (menu) {
        case "View All Employees":
          viewAllEmployees();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "View All Departments":
          viewAllDepartments();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Update Employee Role":
          updateEmployee();
          break;
        case "Update Employee's manager":
          updateManager();
          break;
        case "View Employee's by manager":
          viewByManager();
          break;
        case "View Employee's by department":
          viewByDepartment();
          break;
        case "Delete Employee":
          deleteEmployee();
          break;
        case "Delete Role":
          deleteRole();
          break;
        case "Delete Department":
          deleteDepartment();
          break;
        case "Budget by Department":
          departmentBudget();
          break;
      }
    });
};
////////////////////fuctions
//the final quuery for view functions
const viewQuerry = (sql) => {
  db.query(sql, (err, res) => {
    if (err) {
      console.log(err);
    }
    console.table(res);
    menu();
  });
};
//make table containig all employees
viewAllEmployees = () => {
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
  viewQuerry(sql);
};
//make table containig all roles
viewAllRoles = () => {
  const sql = `SELECT * FROM role`;
  viewQuerry(sql);
};
//make table containig all departments
viewAllDepartments = () => {
  const sql = `SELECT * FROM department`;
  viewQuerry(sql);
};
//create new employee
const addEmployee = () => {
  inquirer //get name
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
      //place awnsers in array
      const tempHolder = [answers.first, answers.last];
      //get all roles
      db.query(`SELECT role.id, role.title FROM role`, (err, res) => {
        if (err) {
          console.log(err);
        } // make array with each role having a value of its id and display the role name
        const roleChoices = res.map(({ id, title }) => ({
          name: title,
          value: id,
        }));
        inquirer
          //get user to select which role new employee
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
            //place role data in temp array
            tempHolder.push(role);
            //get all managers
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
                // ask if the employee has a manager then ask which manager
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
                    let manager; //set a var for manager make it the selection if no selecetion make null
                    if (answer.manager) {
                      manager = answer.manager;
                    } else {
                      manager = null;
                    }
                    // place manager into array
                    tempHolder.push(manager);
                    //use temp holder to insert new employee into db
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
  //get all departments
  db.query(
    `SELECT department.id, department.name FROM department`,
    (err, res) => {
      if (err) {
        console.log(err);
      }
      // array of depos
      const roleChoices = res.map(({ id, name }) => ({
        name: name,
        value: id,
      }));
      //user selects depo enters role and salary
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
          //place answer into tempholder use array to insert new role
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
    // get new depo
    .prompt([
      { type: "input", name: "department", message: "Enter new Department" },
    ])
    .then((answer) => {
      const tempHolder = [answer.department];
      //place into db
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
  //get employees
  db.query(`SELECT * FROM employee`, (err, res) => {
    if (err) {
      console.log(err);
    }
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));
    inquirer
      //select which employee
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "select which employee to update",
          choices: employeeChoices,
        },
      ])
      .then((answer) => {
        //save into insertion array
        const tempHolder = [answer.employee];
        //get all roles
        db.query(`SELECT * FROM role`, (err, res) => {
          if (err) {
            console.log(err);
          }
          const roleChoices = res.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          //get which is new role
          inquirer
            .prompt({
              type: "list",
              name: "role",
              message: "Select new role",
              choices: roleChoices,
            })
            .then((answer) => {
              tempHolder.unshift(answer.role);
              //update employee with new role
              db.query(
                `UPDATE employee SET role_id = ? WHERE id = ?`,
                tempHolder,
                (err, res) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log("Employee role successfully updated!");

                  menu();
                }
              );
            });
        });
      });
  });
};

const updateManager = () => {
  //get employes
  db.query(`SELECT * FROM employee`, (err, res) => {
    if (err) {
      console.log(err);
    }
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));
    inquirer
      //select which employee
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
        // get managers
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
            //select which manger
            inquirer
              .prompt({
                type: "list",
                name: "manager",
                message: "Select new manager",
                choices: managerChoices,
              })
              .then((answer) => {
                //ensure proper order of temparr so that update works
                tempHolder.unshift(answer.manager);
                // update employee with new manage
                db.query(
                  `UPDATE employee SET manager_id = ? WHERE id = ?`,
                  tempHolder,
                  (err, res) => {
                    if (err) {
                      console.log(err);
                    }
                    console.log("Employee manager successfully updated!");
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
  //get managers
  db.query(`SELECT * FROM employee WHERE manager_id is NULL `, (err, res) => {
    if (err) {
      console.log(err);
    }
    //assign managers
    const managerChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));
    //select manager
    inquirer
      .prompt({
        type: "list",
        name: "manager",
        message: "Select which manager",
        choices: managerChoices,
      })
      .then((answer) => {
        const manager = answer.manager;
        //show employees by manager
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
  //get depos
  db.query(`SELECT * FROM department `, (err, res) => {
    if (err) {
      console.log(err);
    }
    //assign depos
    const departmentChoices = res.map(({ id, name }) => ({
      name: name,
      value: id,
    }));
    //select depos
    inquirer
      .prompt({
        type: "list",
        name: "department",
        message: "Select which department",
        choices: departmentChoices,
      })
      .then((answer) => {
        const department = answer.department;
        //show employees by selected depo
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
// same query used 3times
deleteQuery = (a, b) => {
  db.query(`DELETE FROM ${a} WHERE id = ?`, b, (err, res) => {
    if (err) {
      console.log(err);
    }
    console.log("crusher of hope");
    menu();
  });
};

deleteEmployee = () => {
  //get employees
  db.query(`SELECT * FROM employee`, (err, res) => {
    if (err) {
      console.log(err);
    }
    //assigin emplyoees
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));
    inquirer
      //selected employee
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
        //boot employee
        deleteQuery("employee", employee);
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
        deleteQuery("role", role);
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
        deleteQuery("department", department);
      });
  });
};
const departmentBudget = () => {
  //get depos
  db.query(`SELECT * FROM department`, (err, res) => {
    if (err) {
      console.log(err);
    }
    const departmentChoices = res.map(({ id, name }) => ({
      name: name,
      value: id,
    }));
    inquirer
      //select depo
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
        //add salaries in depo call that a budget...
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
