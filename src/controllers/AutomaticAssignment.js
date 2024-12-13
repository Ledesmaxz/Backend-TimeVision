// simulated_annealing_assignment.js

const assignShiftsToEmployees = (employees, shifts, numWeeks, options = {}) => {
    const randomizeArray = (arr) => arr.sort(() => Math.random() - 0.5);
  
    // Helper functions
    const assignShiftsWeekly = (employees, shifts, excludedNightEmployees, weekendShiftCount, nightShiftEmployees) => {
      const weeklyAssignment = Object.fromEntries(shifts.map((shift) => [shift, []]));
  
      let employeeIndex = 0;
      randomizeArray(employees);
  
      const numEmployeesPerShift = Math.floor(employees.length / shifts.length);
      let extraEmployees = employees.length % shifts.length;
  
      for (const shift of shifts) {
        const count = numEmployeesPerShift + (extraEmployees > 0 ? 1 : 0);
        extraEmployees--;
  
        while (weeklyAssignment[shift].length < count) {
          const employee = employees[employeeIndex];
          if (shift === "Noche" && excludedNightEmployees.has(employee)) {
            employeeIndex = (employeeIndex + 1) % employees.length;
            continue;
          }
          weeklyAssignment[shift].push(employee);
          if (shift === "Noche") nightShiftEmployees.add(employee);
          employeeIndex = (employeeIndex + 1) % employees.length;
        }
      }
  
      // Weekend assignment
      const weekendAssignment = { Sábado: {}, Domingo: {} };
      for (const day of ["Sábado", "Domingo"]) {
        weekendAssignment[day] = Object.fromEntries(shifts.map((shift) => [shift, []]));
        const weekendEmployees = new Set();
        for (const shift of shifts) {
          while (weekendAssignment[day][shift].length < weekendShiftCount) {
            const employee = employees[employeeIndex];
  
            // Restriction: Skip employees who worked night shifts during the week
            if (options.restrictWeekendAfterNightShift && nightShiftEmployees.has(employee)) {
              employeeIndex = (employeeIndex + 1) % employees.length;
              continue;
            }
  
            if (weekendEmployees.has(employee)) {
              employeeIndex = (employeeIndex + 1) % employees.length;
              continue;
            }
            weekendAssignment[day][shift].push(employee);
            weekendEmployees.add(employee);
            employeeIndex = (employeeIndex + 1) % employees.length;
          }
        }
      }
  
      return { weeklyAssignment, weekendAssignment };
    };
  
    const evaluateSchedule = (schedule, excludedNightEmployees, lastWeekNightEmployees) => {
      let penalty = 0;
  
      const weekendEmployees = { Mañana: new Set(), Tarde: new Set(), Noche: new Set() };
      for (const day of ["Sábado", "Domingo"]) {
        for (const shift of shifts) {
          for (const employee of schedule[day][shift]) {
            if (weekendEmployees[shift].has(employee)) {
              penalty++;
            }
            weekendEmployees[shift].add(employee);
          }
        }
      }
  
      for (const employee of lastWeekNightEmployees) {
        if (schedule["Lunes"].Noche.includes(employee)) {
          penalty += 5;
        }
      }
  
      return penalty;
    };
  
    const simulatedAnnealing = (
      employees,
      shifts,
      excludedNightEmployees,
      weekendShiftCount,
      lastWeekNightEmployees,
      numIterations = 1000,
      initialTemperature = 1000,
      coolingRate = 0.99
    ) => {
      let currentSchedule = {};
      for (const day of ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]) {
        currentSchedule[day] = Object.fromEntries(shifts.map((shift) => [shift, []]));
      }
  
      let bestSchedule = currentSchedule;
      let bestPenalty = Infinity;
      let temperature = initialTemperature;
  
      for (let iteration = 0; iteration < numIterations; iteration++) {
        const nightShiftEmployees = new Set();
        const { weeklyAssignment, weekendAssignment } = assignShiftsWeekly(
          employees,
          shifts,
          excludedNightEmployees,
          weekendShiftCount,
          nightShiftEmployees
        );
  
        const newSchedule = { ...currentSchedule };
        for (const day of ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]) {
          for (const shift of shifts) {
            newSchedule[day][shift] = [...weeklyAssignment[shift]];
          }
        }
        for (const day of ["Sábado", "Domingo"]) {
          newSchedule[day] = { ...weekendAssignment[day] };
        }
  
        const penalty = evaluateSchedule(newSchedule, excludedNightEmployees, lastWeekNightEmployees);
        if (penalty < bestPenalty || Math.random() < Math.exp((bestPenalty - penalty) / temperature)) {
          bestSchedule = newSchedule;
          bestPenalty = penalty;
        }
        temperature *= coolingRate;
      }
  
      return bestSchedule;
    };
  
    const schedules = [];
    let excludedNightEmployees = new Set();
    let lastWeekNightEmployees = new Set();
    const weekendShiftCount = 1;
  
    for (let week = 0; week < numWeeks; week++) {
      const bestSchedule = simulatedAnnealing(
        employees,
        shifts,
        excludedNightEmployees,
        weekendShiftCount,
        lastWeekNightEmployees
      );
  
      // Update excluded employees to prevent night shifts two weeks in a row
      excludedNightEmployees = new Set([...
        new Set(bestSchedule["Lunes"].Noche)]);
      lastWeekNightEmployees = new Set(bestSchedule["Lunes"].Noche);
  
      schedules.push(bestSchedule);
    }
  
    return schedules;
  };
  
  module.exports = { assignShiftsToEmployees };
  