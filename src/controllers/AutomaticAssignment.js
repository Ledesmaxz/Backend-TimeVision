const assignShiftsToEmployees = (employees, shifts, startDate, endDate, options = {}) => {
    const randomizeArray = (arr) => arr.sort(() => Math.random() - 0.5);

    const assignShiftsDailyWithLimit = (employees, shifts, excludedNightEmployees, maxDailyIterations = 100) => {
        const dailyAssignment = Object.fromEntries(shifts.map((shift) => [shift, []]));
        const nightShiftEmployees = new Set();

        let iteration = 0;
        let employeeIndex = 0;

        randomizeArray(employees);

        while (iteration < maxDailyIterations) {
            for (const shift of shifts) {
                if (dailyAssignment[shift].length >= Math.floor(employees.length / shifts.length)) continue;

                const employee = employees[employeeIndex];

                if (shift === "Noche" && excludedNightEmployees.has(employee)) {
                    employeeIndex = (employeeIndex + 1) % employees.length;
                    continue;
                }

                dailyAssignment[shift].push(employee);
                if (shift === "Noche") nightShiftEmployees.add(employee);
                employeeIndex = (employeeIndex + 1) % employees.length;
            }

            const allShiftsFilled = shifts.every(
                (shift) => dailyAssignment[shift].length >= Math.floor(employees.length / shifts.length)
            );

            if (allShiftsFilled) break;
            iteration++;
        }

        if (iteration >= maxDailyIterations) {
            console.error("Límite de iteraciones alcanzado para este día. Turnos incompletos.");
            throw new Error("No se pudo asignar turnos para este día debido a restricciones.");
        }

        return { dailyAssignment, nightShiftEmployees };
    };

    const schedules = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    let excludedNightEmployees = new Set();

    while (currentDate <= end) {
        const dayName = currentDate.toLocaleDateString('es-CO', { weekday: 'long' });

        try {
            const { dailyAssignment, nightShiftEmployees } = assignShiftsDailyWithLimit(
                employees,
                shifts,
                excludedNightEmployees
            );

            schedules.push({
                date: new Date(currentDate),
                shifts: dailyAssignment,
            });

            if (dayName === "domingo") {
                excludedNightEmployees = new Set();
            } else {
                excludedNightEmployees = new Set([...nightShiftEmployees]);
            }

            //console.log(`Turnos asignados para el día ${dayName}:`, dailyAssignment);
        } catch (error) {
            console.error(`Error asignando turnos para el día ${dayName}:`, error.message);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
};

module.exports = { assignShiftsToEmployees };
