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
