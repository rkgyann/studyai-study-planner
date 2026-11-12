// ==========================================
// AI STUDY PLANNER
// Complete Corrected JavaScript
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. DOM ELEMENTS
    // ==========================================

    const themeToggle = document.getElementById("theme-toggle");
    const currentDate = document.getElementById("current-date");

    const chatForm = document.getElementById("ai-chat-form");
    const chatInput = document.getElementById("ai-input");
    const chatMessages = document.getElementById("chat-messages");

    // ==========================================
    // 2. DATE HELPERS
    // ==========================================

    function getDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getDateAfter(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);

        return getDateKey(date);
    }

    function formatDate(dateString) {
        return new Date(dateString + "T00:00:00")
            .toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
            });
    }

    // ==========================================
    // 3. LOCAL STORAGE
    // ==========================================

    function readStorage(key, defaultValue) {
        try {
            const savedValue = localStorage.getItem(key);

            return savedValue
                ? JSON.parse(savedValue)
                : defaultValue;

        } catch (error) {
            console.error("Storage error:", key, error);

            return defaultValue;
        }
    }

    let subjects = readStorage("subjects", [
        {
            id: 1,
            name: "Programming",
            total: 20,
            completed: 15,
            color: "purple",
            icon: "fa-code"
        },
        {
            id: 2,
            name: "Mathematics",
            total: 20,
            completed: 12,
            color: "green",
            icon: "fa-calculator"
        },
        {
            id: 3,
            name: "DBMS",
            total: 20,
            completed: 9,
            color: "orange",
            icon: "fa-database"
        },
        {
            id: 4,
            name: "Web Development",
            total: 20,
            completed: 17,
            color: "blue",
            icon: "fa-globe"
        }
    ]);

    let assignments = readStorage("assignments", [
        {
            id: 1,
            title: "Java Programming",
            description: "Complete practical assignment",
            dueDate: getDateAfter(1),
            priority: "High",
            completed: false
        },
        {
            id: 2,
            title: "Database Project",
            description: "Submit the project report",
            dueDate: getDateAfter(3),
            priority: "Medium",
            completed: false
        },
        {
            id: 3,
            title: "Web Development",
            description: "Build a responsive webpage",
            dueDate: getDateAfter(5),
            priority: "Low",
            completed: false
        }
    ]);

    let schedule = readStorage("schedule", [
        {
            id: 1,
            subject: "Data Structures",
            topic: "Arrays and Linked Lists",
            start: "09:00",
            end: "10:00",
            color: "purple",
            completed: true
        },
        {
            id: 2,
            subject: "Mathematics",
            topic: "Practice Calculus Problems",
            start: "10:30",
            end: "11:30",
            color: "green",
            completed: false
        },
        {
            id: 3,
            subject: "Database Management",
            topic: "SQL Queries and Joins",
            start: "12:00",
            end: "13:00",
            color: "orange",
            completed: false
        }
    ]);

    let studySessions = readStorage("studySessions", []);

    let weeklyGoalHours =
        Number(localStorage.getItem("weeklyGoalHours")) || 15;

    let weeklyGoalProgress =
        Number(localStorage.getItem("weeklyGoalProgress")) || 0;

    let chart = null;

    function saveAllData() {
        localStorage.setItem("subjects", JSON.stringify(subjects));
        localStorage.setItem("assignments", JSON.stringify(assignments));
        localStorage.setItem("schedule", JSON.stringify(schedule));
        localStorage.setItem("studySessions", JSON.stringify(studySessions));

        localStorage.setItem(
            "weeklyGoalHours",
            String(weeklyGoalHours)
        );

        localStorage.setItem(
            "weeklyGoalProgress",
            String(weeklyGoalProgress)
        );
    }

    // ==========================================
    // 4. CURRENT DATE
    // ==========================================

    function updateCurrentDate() {
        if (!currentDate) return;

        currentDate.textContent =
            new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    }

    // ==========================================
    // 5. DARK MODE
    // ==========================================

    function updateThemeIcon() {
        if (!themeToggle) return;

        const icon = themeToggle.querySelector("i");

        if (!icon) return;

        const darkMode =
            document.body.classList.contains("dark-mode");

        icon.className = darkMode
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
    }

    function initializeTheme() {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
        }

        updateThemeIcon();
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");

            const darkMode =
                document.body.classList.contains("dark-mode");

            localStorage.setItem(
                "theme",
                darkMode ? "dark" : "light"
            );

            updateThemeIcon();
            updateChartTheme();
        });
    }

    // ==========================================
    // 6. DASHBOARD STATISTICS
    // ==========================================

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function updateDashboard() {
        const completedAssignments = assignments.filter(
            assignment => assignment.completed
        ).length;

        const completedSessions = schedule.filter(
            session => session.completed
        ).length;

        const totalTasks = assignments.length + schedule.length;

        const completedTasks =
            completedAssignments + completedSessions;

        const todayKey = getDateKey(new Date());

        const todayMinutes = studySessions
            .filter(session => session.date === todayKey)
            .reduce(
                (total, session) =>
                    total + Number(session.minutes || 0),
                0
            );

        setText(
            "study-hours",
            (todayMinutes / 60).toFixed(1) + " hrs"
        );

        setText(
            "completed-tasks",
            `${completedTasks}/${totalTasks}`
        );

        setText(
            "active-subjects",
            String(subjects.length)
        );

        const percentage = weeklyGoalHours > 0
            ? Math.min(
                100,
                Math.round(
                    weeklyGoalProgress / weeklyGoalHours * 100
                )
            )
            : 0;

        setText("weekly-goal", percentage + "%");
    }

    // ==========================================
    // 7. SUBJECT MANAGEMENT
    // ==========================================

    function renderSubjects() {
        const grid = document.getElementById("subjects-grid");

        if (!grid) return;

        grid.innerHTML = "";

        if (subjects.length === 0) {
            grid.textContent =
                "No subjects added yet. Click Add Subject to begin.";

            return;
        }

        subjects.forEach(function (subject) {
            const percentage = subject.total > 0
                ? Math.round(
                    subject.completed / subject.total * 100
                )
                : 0;

            const card = document.createElement("div");
            card.className = "subject-card";

            const top = document.createElement("div");
            top.className = "subject-card-top";

            const iconBox = document.createElement("div");
            iconBox.className = "subject-icon " + subject.color;

            const icon = document.createElement("i");
            icon.className = "fa-solid " + subject.icon;

            iconBox.appendChild(icon);

            const percent = document.createElement("span");
            percent.className = "subject-percentage";
            percent.textContent = percentage + "%";

            top.append(iconBox, percent);

            const title = document.createElement("h3");
            title.textContent = subject.name;

            const details = document.createElement("p");

            details.textContent =
                `${subject.completed} of ${subject.total} topics completed`;

            const progressBar = document.createElement("div");
            progressBar.className = "progress-bar";

            const progressFill = document.createElement("div");

            progressFill.className =
                "progress-fill " + subject.color + "-fill";

            progressFill.style.width = percentage + "%";

            progressBar.appendChild(progressFill);

            const updateButton = document.createElement("button");

            updateButton.type = "button";
            updateButton.className = "subject-action";
            updateButton.textContent = "Update Progress";

            updateButton.addEventListener("click", function () {
                updateSubjectProgress(subject.id);
            });

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "text-button";
            deleteButton.textContent = "Remove Subject";

            deleteButton.addEventListener("click", function () {
                deleteSubject(subject.id);
            });

            card.append(
                top,
                title,
                details,
                progressBar,
                updateButton,
                deleteButton
            );

            grid.appendChild(card);
        });
    }

    function updateSubjectProgress(id) {
        const subject = subjects.find(
            item => item.id === id
        );

        if (!subject) return;

        const value = prompt(
            `Topics completed (0-${subject.total}):`,
            subject.completed
        );

        if (value === null || value.trim() === "") return;

        const completed = Number(value);

        if (
            !Number.isInteger(completed) ||
            completed < 0 ||
            completed > subject.total
        ) {
            alert("Please enter a valid topic count.");
            return;
        }

        subject.completed = completed;

        saveAllData();
        renderSubjects();
    }

    function deleteSubject(id) {
        if (!confirm("Are you sure you want to remove this subject?")) {
            return;
        }

        subjects = subjects.filter(
            subject => subject.id !== id
        );

        saveAllData();
        renderSubjects();
        updateDashboard();
    }

    const addSubjectButton =
        document.getElementById("add-subject");

    if (addSubjectButton) {
        addSubjectButton.addEventListener("click", function () {
            const name = prompt("Enter subject name:");

            if (!name || !name.trim()) return;

            const total = Number(
                prompt("Enter total number of topics:", "10")
            );

            if (!Number.isInteger(total) || total < 1) {
                alert("Enter a valid positive number.");
                return;
            }

            const colors = [
                "purple",
                "green",
                "orange",
                "blue"
            ];

            const icons = [
                "fa-book",
                "fa-calculator",
                "fa-code",
                "fa-graduation-cap"
            ];

            subjects.push({
                id: Date.now(),
                name: name.trim(),
                total: total,
                completed: 0,
                color: colors[subjects.length % colors.length],
                icon: icons[subjects.length % icons.length]
            });

            saveAllData();
            renderSubjects();
            updateDashboard();
        });
    }

    // ==========================================
    // 8. ASSIGNMENT MANAGEMENT
    // ==========================================

    function validDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const date = new Date(value + "T00:00:00");

        return !Number.isNaN(date.getTime()) &&
            getDateKey(date) === value;
    }

    function getDeadlineText(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(dateString + "T00:00:00");

        const difference = Math.round(
            (dueDate - today) / 86400000
        );

        if (difference < 0) return "Overdue";
        if (difference === 0) return "Due today";
        if (difference === 1) return "Due tomorrow";

        return "Due in " + difference + " days";
    }

    function renderAssignments() {
        const list = document.getElementById("assignment-list");

        if (!list) return;

        list.innerHTML = "";

        if (assignments.length === 0) {
            list.textContent =
                "No assignments yet. Add your first assignment!";

            return;
        }

        const sorted = [...assignments].sort(
            (a, b) =>
                Number(a.completed) - Number(b.completed) ||
                a.dueDate.localeCompare(b.dueDate)
        );

        sorted.forEach(function (assignment) {
            const item = document.createElement("div");
            item.className = "assignment-item";

            const icon = document.createElement("div");
            icon.className = "assignment-icon purple";
            icon.innerHTML = '<i class="fa-solid fa-book"></i>';

            const details = document.createElement("div");
            details.className = "assignment-details";

            const title = document.createElement("h3");
            title.textContent = assignment.title;

            if (assignment.completed) {
                title.style.textDecoration = "line-through";
            }

            const description = document.createElement("p");
            description.textContent = assignment.description;

            const deadline = document.createElement("span");
            deadline.className = "deadline";

            deadline.textContent =
                getDeadlineText(assignment.dueDate) +
                " (" + formatDate(assignment.dueDate) + ")";

            details.append(title, description, deadline);

            const priority = document.createElement("span");

            priority.className =
                "priority " +
                assignment.priority.toLowerCase() +
                "-priority";

            priority.textContent = assignment.priority;

            const actions = document.createElement("div");

            actions.style.display = "flex";
            actions.style.flexDirection = "column";
            actions.style.gap = "6px";

            const completeButton = document.createElement("button");

            completeButton.type = "button";
            completeButton.className = "text-button";

            completeButton.textContent =
                assignment.completed ? "Undo" : "Complete";

            completeButton.addEventListener("click", function () {
                assignment.completed = !assignment.completed;

                saveAllData();
                renderAssignments();
                updateDashboard();
            });

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "text-button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                assignments = assignments.filter(
                    item => item.id !== assignment.id
                );

                saveAllData();
                renderAssignments();
                updateDashboard();
            });

            actions.append(completeButton, deleteButton);

            item.append(icon, details, priority, actions);

            list.appendChild(item);
        });
    }

    const addAssignmentButton =
        document.getElementById("add-assignment");

    if (addAssignmentButton) {
        addAssignmentButton.addEventListener("click", function () {
            const title = prompt("Enter assignment title:");

            if (!title || !title.trim()) return;

            const description = prompt(
                "Enter assignment description:",
                "Complete the assignment"
            );

            if (description === null) return;

            const dueDate = prompt(
                "Enter deadline (YYYY-MM-DD):",
                getDateAfter(3)
            );

            if (!dueDate || !validDate(dueDate)) {
                alert("Enter a valid date in YYYY-MM-DD format.");
                return;
            }

            const rawPriority = prompt(
                "Priority: High, Medium, or Low",
                "Medium"
            );

            if (rawPriority === null) return;

            const priority = rawPriority.trim().toLowerCase();

            if (!["high", "medium", "low"].includes(priority)) {
                alert("Priority must be High, Medium, or Low.");
                return;
            }

            assignments.push({
                id: Date.now(),
                title: title.trim(),
                description: description.trim(),
                dueDate: dueDate,
                priority:
                    priority.charAt(0).toUpperCase() +
                    priority.slice(1),
                completed: false
            });

            saveAllData();
            renderAssignments();
            updateDashboard();
        });
    }

    const viewAssignments =
        document.getElementById("view-assignments");

    if (viewAssignments) {
        viewAssignments.addEventListener("click", function () {
            document.getElementById("assignments")
                ?.scrollIntoView({ behavior: "smooth" });
        });
    }

    // ==========================================
    // 9. STUDY SCHEDULE
    // ==========================================

    function formatTime(value) {
        const [hours, minutes] = value.split(":").map(Number);

        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;

        return (
            String(formattedHours).padStart(2, "0") +
            ":" + String(minutes).padStart(2, "0") +
            " " + period
        );
    }

    function validTime(value) {
        return typeof value === "string" &&
            /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    }

    function renderSchedule() {
        const list = document.getElementById("schedule-list");

        if (!list) return;

        list.innerHTML = "";

        const sortedSchedule = [...schedule].sort(
            (a, b) => a.start.localeCompare(b.start)
        );

        if (sortedSchedule.length === 0) {
            list.textContent =
                "No study sessions planned. Add a session to begin.";

            return;
        }

        sortedSchedule.forEach(function (session) {
            const item = document.createElement("div");
            item.className = "schedule-item";

            const time = document.createElement("div");
            time.className = "schedule-time";

            const start = document.createElement("span");
            start.textContent = formatTime(session.start);

            const end = document.createElement("small");
            end.textContent = formatTime(session.end);

            time.append(start, end);

            const indicator = document.createElement("div");

            indicator.className =
                "schedule-indicator " + session.color + "-line";

            const details = document.createElement("div");
            details.className = "schedule-details";

            const title = document.createElement("h3");
            title.textContent = session.subject;

            const topic = document.createElement("p");
            topic.textContent = session.topic;

            const tag = document.createElement("span");

            tag.className =
                "subject-tag " + session.color + "-tag";

            tag.textContent = session.subject;

            details.append(title, topic, tag);

            const status = document.createElement("button");

            status.type = "button";

            status.className =
                "schedule-status " +
                (session.completed
                    ? "completed-status"
                    : "pending-status");

            status.innerHTML = session.completed
                ? '<i class="fa-solid fa-check"></i>'
                : '<i class="fa-regular fa-circle"></i>';

            status.addEventListener("click", function () {
                session.completed = !session.completed;

                if (session.completed) {
                    const startParts = session.start.split(":");
                    const endParts = session.end.split(":");

                    const startMinutes =
                        Number(startParts[0]) * 60 +
                        Number(startParts[1]);

                    const endMinutes =
                        Number(endParts[0]) * 60 +
                        Number(endParts[1]);

                    const duration = Math.max(
                        0,
                        endMinutes - startMinutes
                    );

                    studySessions.push({
                        id: Date.now(),
                        scheduleId: session.id,
                        date: getDateKey(new Date()),
                        minutes: duration
                    });

                    weeklyGoalProgress += duration / 60;

                } else {
                    const index = studySessions.findIndex(
                        record => record.scheduleId === session.id
                    );

                    if (index !== -1) {
                        weeklyGoalProgress = Math.max(
                            0,
                            weeklyGoalProgress -
                            studySessions[index].minutes / 60
                        );

                        studySessions.splice(index, 1);
                    }
                }

                saveAllData();
                renderSchedule();
                updateDashboard();
                updateChart();
            });

            item.append(time, indicator, details, status);

            list.appendChild(item);
        });
    }

    const addSessionButton =
        document.getElementById("add-session");

    if (addSessionButton) {
        addSessionButton.addEventListener("click", function () {
            const subject = prompt("Enter subject name:");

            if (!subject || !subject.trim()) return;

            const topic = prompt("Enter study topic:");

            if (!topic || !topic.trim()) return;

            const start = prompt(
                "Enter start time (HH:MM):",
                "14:00"
            );

            const end = prompt(
                "Enter end time (HH:MM):",
                "15:00"
            );

            if (!validTime(start) || !validTime(end) || start >= end) {
                alert("Enter valid times. End time must be after start time.");
                return;
            }

            const colors = ["purple", "green", "orange", "blue"];

            schedule.push({
                id: Date.now(),
                subject: subject.trim(),
                topic: topic.trim(),
                start: start,
                end: end,
                color: colors[schedule.length % colors.length],
                completed: false
            });

            saveAllData();
            renderSchedule();
            updateDashboard();
        });
    }

    // ==========================================
    // 10. POMODORO TIMER
    // ==========================================

    const timerDisplay = document.getElementById("timer-display");
    const timerStatus = document.getElementById("timer-status");
    const timerStart = document.getElementById("timer-start");
    const timerReset = document.getElementById("timer-reset");
    const timerCircle = document.querySelector(".timer-circle");

    let timerInterval = null;
    let remainingSeconds = 25 * 60;
    let selectedMinutes = 25;
    let timerRunning = false;
    let timerEndTime = null;
    let timerMode = "Focus";

    function updateTimerDisplay() {
        if (timerDisplay) {
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;

            timerDisplay.textContent =
                String(minutes).padStart(2, "0") +
                ":" + String(seconds).padStart(2, "0");
        }

        if (timerCircle) {
            const progress =
                remainingSeconds / (selectedMinutes * 60);

            const degrees = progress * 360;

            timerCircle.style.background =
                "conic-gradient(var(--primary) " +
                degrees + "deg, #efedff " +
                degrees + "deg)";
        }
    }

    function stopTimer() {
        clearInterval(timerInterval);

        timerInterval = null;
        timerRunning = false;
    }

    document.querySelectorAll(".timer-mode-button").forEach(
        function (button) {
            button.addEventListener("click", function () {
                stopTimer();

                selectedMinutes =
                    Number(button.dataset.minutes) || 25;

                timerMode = selectedMinutes === 25
                    ? "Focus"
                    : selectedMinutes === 5
                        ? "Short Break"
                        : "Long Break";

                remainingSeconds = selectedMinutes * 60;

                document.querySelectorAll(".timer-mode-button")
                    .forEach(btn => btn.classList.remove("active"));

                button.classList.add("active");

                if (timerStatus) {
                    timerStatus.textContent =
                        "Ready for " + timerMode;
                }

                if (timerStart) {
                    timerStart.innerHTML =
                        '<i class="fa-solid fa-play"></i> Start ' +
                        timerMode;
                }

                updateTimerDisplay();
            });
        }
    );

    if (timerStart) {
        timerStart.addEventListener("click", function () {
            if (timerRunning) {
                stopTimer();

                timerStart.innerHTML =
                    '<i class="fa-solid fa-play"></i> Resume';

                if (timerStatus) {
                    timerStatus.textContent = "Timer Paused";
                }

                return;
            }

            timerRunning = true;

            timerEndTime =
                Date.now() + remainingSeconds * 1000;

            timerStart.innerHTML =
                '<i class="fa-solid fa-pause"></i> Pause';

            if (timerStatus) {
                timerStatus.textContent =
                    timerMode + " in Progress";
            }

            timerInterval = setInterval(function () {
                remainingSeconds = Math.max(
                    0,
                    Math.ceil(
                        (timerEndTime - Date.now()) / 1000
                    )
                );

                updateTimerDisplay();

                if (remainingSeconds <= 0) {
                    stopTimer();

                    if (timerStatus) {
                        timerStatus.textContent =
                            timerMode + " Complete!";
                    }

                    timerStart.innerHTML =
                        '<i class="fa-solid fa-play"></i> Start Again';

                    if (timerMode === "Focus") {
                        studySessions.push({
                            id: Date.now(),
                            date: getDateKey(new Date()),
                            minutes: selectedMinutes
                        });

                        weeklyGoalProgress +=
                            selectedMinutes / 60;

                        saveAllData();
                        updateDashboard();
                        updateChart();
                    }

                    alert(timerMode + " session completed!");
                }
            }, 250);
        });
    }

    if (timerReset) {
        timerReset.addEventListener("click", function () {
            stopTimer();

            remainingSeconds = selectedMinutes * 60;

            if (timerStart) {
                timerStart.innerHTML =
                    '<i class="fa-solid fa-play"></i> Start ' +
                    timerMode;
            }

            if (timerStatus) {
                timerStatus.textContent = "Ready to Focus";
            }

            updateTimerDisplay();
        });
    }

    // ==========================================
    // 11. STUDY PROGRESS CHART
    // ==========================================

    function getChartData(days) {
        const labels = [];
        const values = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();

            date.setDate(date.getDate() - i);

            const key = getDateKey(date);

            labels.push(
                date.toLocaleDateString("en-IN",
                    days === 7
                        ? { weekday: "short" }
                        : { day: "numeric", month: "short" }
                )
            );

            const minutes = studySessions
                .filter(session => session.date === key)
                .reduce(
                    (sum, session) =>
                        sum + Number(session.minutes || 0),
                    0
                );

            values.push(
                Number((minutes / 60).toFixed(2))
            );
        }

        return { labels, values };
    }

    function chartTextColor() {
        return document.body.classList.contains("dark-mode")
            ? "#a5a6bd"
            : "#85869a";
    }

    function chartGridColor() {
        return document.body.classList.contains("dark-mode")
            ? "#35364b"
            : "#ececf4";
    }

    function initializeChart() {
        const canvas = document.getElementById("study-chart");

        if (!canvas || !window.Chart) {
            if (canvas) {
                canvas.parentElement.innerHTML =
                    "<p>Chart.js could not load. Check your internet connection.</p>";
            }

            return;
        }

        const data = getChartData(7);

        chart = new Chart(canvas.getContext("2d"), {
            type: "bar",

            data: {
                labels: data.labels,

                datasets: [{
                    label: "Study Hours",
                    data: data.values,
                    backgroundColor: "#7465f5",
                    borderRadius: 7,
                    maxBarThickness: 32
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: context =>
                                context.parsed.y + " study hours"
                        }
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            color: chartTextColor()
                        },

                        grid: {
                            color: chartGridColor()
                        },

                        title: {
                            display: true,
                            text: "Hours Studied",
                            color: chartTextColor()
                        }
                    },

                    x: {
                        ticks: {
                            color: chartTextColor()
                        },

                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        const filter = document.getElementById("progress-filter");

        if (filter) {
            filter.addEventListener("change", updateChart);
        }
    }

    function updateChartTheme() {
        if (!chart) return;

        chart.options.scales.x.ticks.color = chartTextColor();
        chart.options.scales.y.ticks.color = chartTextColor();
        chart.options.scales.y.title.color = chartTextColor();
        chart.options.scales.y.grid.color = chartGridColor();

        chart.update();
    }

    function updateChart() {
        if (!chart) return;

        const filter = document.getElementById("progress-filter");

        const data = getChartData(
            filter && filter.value === "month" ? 30 : 7
        );

        chart.data.labels = data.labels;
        chart.data.datasets[0].data = data.values;

        chart.update();
    }

    // ==========================================
    // 12. AI STUDY ASSISTANT
    // ==========================================

    function addChatMessage(message, type) {
        const element = document.createElement("div");

        element.className = type === "user"
            ? "chat-message user-message"
            : "chat-message assistant-message";

        element.textContent = message;

        chatMessages.appendChild(element);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        return element;
    }

    async function sendAIMessage(message) {
        const cleanMessage = message.trim();

        if (!cleanMessage || !chatInput || !chatMessages) {
            return;
        }

        // Show the user's message.
        addChatMessage(cleanMessage, "user");

        chatInput.value = "";
        chatInput.disabled = true;

        const sendButton = chatForm.querySelector(
            'button[type="submit"]'
        );

        if (sendButton) {
            sendButton.disabled = true;
        }

        const loadingMessage = addChatMessage(
            "AI is thinking...",
            "assistant"
        );

        try {
            // Send the message to the Express backend.
            const response = await fetch("/api/chat", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: cleanMessage
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "AI request failed."
                );
            }

            loadingMessage.textContent =
                data.reply || "The AI returned an empty response.";

        } catch (error) {
            console.error("AI Assistant Error:", error);

            loadingMessage.textContent =
                "Unable to get an AI response. " +
                error.message;

        } finally {
            chatInput.disabled = false;

            if (sendButton) {
                sendButton.disabled = false;
            }

            chatInput.focus();

            chatMessages.scrollTop =
                chatMessages.scrollHeight;
        }
    }

    // IMPORTANT: preventDefault stops the browser's normal
    // form submission, which otherwise reloads the page.
    if (chatForm && chatInput && chatMessages) {
        chatForm.addEventListener("submit", function (event) {
            event.preventDefault();
            event.stopPropagation();

            sendAIMessage(chatInput.value);
        });

        // Suggested prompts.
        document.querySelectorAll(".suggestion-button").forEach(
            function (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();

                    if (chatInput.disabled) return;

                    const promptText = button.dataset.prompt;

                    if (promptText) {
                        sendAIMessage(promptText);
                    }
                });
            }
        );

    } else {
        console.error(
            "AI chat elements not found. Check the HTML IDs."
        );
    }

    // ==========================================
    // 13. NAVIGATION
    // ==========================================

    document.querySelectorAll(".nav-link").forEach(
        function (link) {
            link.addEventListener("click", function () {
                document.querySelectorAll(".nav-link").forEach(
                    item => item.classList.remove("active")
                );

                link.classList.add("active");
            });
        }
    );

    // ==========================================
    // 14. WELCOME BUTTON
    // ==========================================

    const welcomeButton =
        document.querySelector(".primary-button");

    if (welcomeButton) {
        welcomeButton.addEventListener("click", function (event) {
            event.preventDefault();

            document.getElementById("study-planner")
                ?.scrollIntoView({ behavior: "smooth" });
        });
    }

    // ==========================================
    // 15. INITIALIZE APPLICATION
    // ==========================================

    saveAllData();

    updateCurrentDate();
    initializeTheme();

    renderSubjects();
    renderAssignments();
    renderSchedule();

    updateDashboard();

    initializeChart();
    updateTimerDisplay();

    console.log("AI Study Planner initialized successfully.");

});