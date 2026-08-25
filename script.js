/* =========================================================
   HORA CERTA
   JAVASCRIPT PURO
   SEM VITE / REACT / TYPESCRIPT
========================================================= */

"use strict";


/* =========================================================
   ESTADO
========================================================= */

let currentDate = new Date(2026, 7, 11);

let selectedDate = new Date(2026, 7, 11);

let currentView = "month";

let searchTerm = "";

let activeCategories = new Set([
    "Aulas",
    "Provas",
    "Feriados",
    "Reuniões",
    "Atividades"
]);


/* =========================================================
   DADOS INICIAIS
========================================================= */

const defaultEvents = [];


/* =========================================================
   CARREGAR / SALVAR
========================================================= */

function loadEvents() {

    try {

        const saved =
            localStorage.getItem("horacerta_events");

        if (saved) {

            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        }

    } catch (error) {

        console.warn(
            "Não foi possível carregar os eventos.",
            error
        );
    }

    return [...defaultEvents];
}


let events = loadEvents();


function saveEvents() {

    try {

        localStorage.setItem(
            "horacerta_events",
            JSON.stringify(events)
        );

    } catch (error) {

        console.warn(
            "Não foi possível salvar os eventos.",
            error
        );
    }
}


/* =========================================================
   ELEMENTOS
========================================================= */

const calendarGrid =
    document.getElementById("calendarGrid");

const currentMonthTitle =
    document.getElementById("currentMonth");

const miniDays =
    document.getElementById("miniDays");

const miniMonthName =
    document.getElementById("miniMonthName");

const eventModal =
    document.getElementById("eventModal");

const eventForm =
    document.getElementById("eventForm");

const eventDate =
    document.getElementById("eventDate");

const searchInput =
    document.getElementById("searchInput");

const themeToggle =
    document.getElementById("themeToggle");


/* =========================================================
   NOMES
========================================================= */

const monthNames = [

    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"

];

const shortMonthNames = [

    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ"

];


/* =========================================================
   UTILITÁRIOS
========================================================= */

function pad(number) {

    return String(number).padStart(2, "0");

}


function dateKey(date) {

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate())
    );

}


function sameDate(a, b) {

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );

}


function isToday(date) {

    return sameDate(
        date,
        new Date()
    );

}


function categoryClass(category) {

    const map = {

        "Aulas": "aulas",

        "Provas": "provas",

        "Feriados": "feriados",

        "Reuniões": "reunioes",

        "Atividades": "atividades"

    };

    return map[category] || "aulas";
}


/* =========================================================
   EVENTOS FILTRADOS
========================================================= */

function getVisibleEvents() {

    return events.filter(event => {

        if (!activeCategories.has(event.category)) {
            return false;
        }

        if (!searchTerm) {
            return true;
        }

        const text = (

            event.title +
            " " +
            event.category +
            " " +
            event.description

        ).toLowerCase();

        return text.includes(
            searchTerm.toLowerCase()
        );

    });

}


/* =========================================================
   CALENDÁRIO PRINCIPAL
========================================================= */

function renderCalendar() {

    if (!calendarGrid) return;

    calendarGrid.innerHTML = "";

    currentMonthTitle.textContent =
        monthNames[currentDate.getMonth()] +
        " " +
        currentDate.getFullYear();


    /*
       Domingo = 0
       Segunda = 1
       ...
       Sábado = 6
    */

    const firstDay =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );

    const firstWeekDay =
        firstDay.getDay();

    const daysInMonth =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        ).getDate();


    const previousMonthDays =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            0
        ).getDate();


    const visibleEvents =
        getVisibleEvents();


    for (let i = 0; i < 42; i++) {

        let dayNumber;

        let monthOffset = 0;

        if (i < firstWeekDay) {

            dayNumber =
                previousMonthDays -
                firstWeekDay +
                i +
                1;

            monthOffset = -1;

        } else if (
            i >= firstWeekDay + daysInMonth
        ) {

            dayNumber =
                i -
                firstWeekDay -
                daysInMonth +
                1;

            monthOffset = 1;

        } else {

            dayNumber =
                i -
                firstWeekDay +
                1;

        }


        const cellDate =
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + monthOffset,
                dayNumber
            );


        const cell =
            document.createElement("div");

        cell.className = "calendar-cell";


        if (monthOffset !== 0) {
            cell.classList.add("other-month");
        }


        cell.dataset.date =
            dateKey(cellDate);


        /* DATA */

        const number =
            document.createElement("div");

        number.className = "day-number";

        number.textContent =
            dayNumber;


        if (isToday(cellDate)) {

            number.classList.add(
                "today-number"
            );

        }


        cell.appendChild(number);


        /* EVENTOS */

        const eventContainer =
            document.createElement("div");

        eventContainer.className =
            "events-container";


        const dayEvents =
            visibleEvents.filter(event =>
                event.date === dateKey(cellDate)
            );


        dayEvents.forEach(event => {

            const eventElement =
                document.createElement("div");

            eventElement.className =
                "event " +
                categoryClass(event.category);


            const timeText =
                event.time
                    ? event.time + " "
                    : "";


            eventElement.textContent =
                timeText +
                event.title;


            eventElement.title =
                event.description ||
                event.title;


            eventElement.addEventListener(
                "click",
                function(e) {

                    e.stopPropagation();

                    showEventDetails(event);

                }
            );


            eventContainer.appendChild(
                eventElement
            );

        });


        cell.appendChild(
            eventContainer
        );


        /*
           Clicar em um dia abre
           o formulário com aquela data.
        */

        cell.addEventListener(
            "click",
            function() {

                selectedDate =
                    new Date(cellDate);

                openNewEventModal(
                    cellDate
                );

            }
        );


        calendarGrid.appendChild(cell);

    }

}


/* =========================================================
   MINI CALENDÁRIO
========================================================= */

function renderMiniCalendar() {

    miniDays.innerHTML = "";

    miniMonthName.textContent =
        shortMonthNames[
            currentDate.getMonth()
        ] +
        " " +
        currentDate.getFullYear();


    const firstDay =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );


    const startDay =
        firstDay.getDay();


    const daysInMonth =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        ).getDate();


    const previousDays =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            0
        ).getDate();


    for (let i = 0; i < 42; i++) {

        let day;

        let offset = 0;

        if (i < startDay) {

            day =
                previousDays -
                startDay +
                i +
                1;

            offset = -1;

        } else if (
            i >= startDay + daysInMonth
        ) {

            day =
                i -
                startDay -
                daysInMonth +
                1;

            offset = 1;

        } else {

            day =
                i -
                startDay +
                1;

        }


        const date =
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + offset,
                day
            );


        const element =
            document.createElement("div");

        element.className =
            "mini-day";


        if (offset !== 0) {
            element.classList.add(
                "other-month"
            );
        }


        if (isToday(date)) {
            element.classList.add("today");
        }


        const hasEvent =
            events.some(
                event =>
                    event.date === dateKey(date)
            );


        if (hasEvent) {
            element.classList.add(
                "has-event"
            );
        }


        element.textContent =
            day;


        element.addEventListener(
            "click",
            function() {

                currentDate =
                    new Date(date);

                selectedDate =
                    new Date(date);

                renderAll();

            }
        );


        miniDays.appendChild(element);

    }

}


/* =========================================================
   RENDERIZA TUDO
========================================================= */

function renderAll() {

    renderCalendar();

    renderMiniCalendar();

}


/* =========================================================
   MUDAR MÊS
========================================================= */

function changeMonth(amount) {

    currentDate.setMonth(
        currentDate.getMonth() + amount
    );

    renderAll();

}


/* =========================================================
   HOJE
========================================================= */

function goToToday() {

    const today =
        new Date();

    currentDate =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

    selectedDate =
        new Date(today);

    renderAll();

}


/* =========================================================
   MODAL
========================================================= */

function openModal() {

    eventModal.classList.remove(
        "hidden"
    );

    document
        .getElementById("eventTitle")
        .focus();

}


function closeModal() {

    eventModal.classList.add(
        "hidden"
    );

    eventForm.reset();

}


function openNewEventModal(date) {

    const dateToUse =
        date ||
        selectedDate ||
        currentDate;


    eventDate.value =
        dateKey(dateToUse);


    document
        .getElementById("eventTime")
        .value = "07:30";


    document
        .getElementById("eventCategory")
        .value = "Aulas";


    openModal();

}


/* =========================================================
   SALVAR EVENTO
========================================================= */

function handleEventSubmit(event) {

    event.preventDefault();


    const title =
        document
            .getElementById("eventTitle")
            .value
            .trim();


    const date =
        document
            .getElementById("eventDate")
            .value;


    const time =
        document
            .getElementById("eventTime")
            .value;


    const category =
        document
            .getElementById("eventCategory")
            .value;


    const description =
        document
            .getElementById("eventDescription")
            .value
            .trim();


    if (!title || !date) {

        alert(
            "Preencha pelo menos o título e a data."
        );

        return;
    }


    const newEvent = {

        id:
            Date.now(),

        title,

        date,

        time,

        category,

        description

    };


    events.push(newEvent);

    saveEvents();

    closeModal();

    renderAll();

}


/* =========================================================
   DETALHES DO EVENTO
========================================================= */

function showEventDetails(event) {

    const time =
        event.time
            ? "\nHorário: " + event.time
            : "";


    const message =
        event.title +
        "\n\n" +

        "Categoria: " +
        event.category +

        time +

        "\n\n" +

        (
            event.description ||
            "Sem descrição."
        );


    const remove =
        confirm(
            message +
            "\n\nClique em OK para excluir este evento ou Cancelar para mantê-lo."
        );


    if (remove) {

        events =
            events.filter(
                item =>
                    item.id !== event.id
            );

        saveEvents();

        renderAll();

    }

}


/* =========================================================
   MODO NOTURNO
========================================================= */

function applyTheme(isDark) {

    if (isDark) {

        document.body.classList.add("dark-mode");

        if (themeToggle) {
            themeToggle.textContent = "☀";
            themeToggle.title = "Modo Claro";
        }

    } else {

        document.body.classList.remove("dark-mode");

        if (themeToggle) {
            themeToggle.textContent = "☾";
            themeToggle.title = "Modo Noturno";
        }

    }

}


function initTheme() {

    const savedTheme =
        localStorage.getItem("horacerta_theme");

    const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;


    const isDark =
        savedTheme !== null
            ? savedTheme === "dark"
            : prefersDark;


    applyTheme(isDark);

}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function() {

            const isDark =
                !document.body.classList.contains("dark-mode");

            applyTheme(isDark);

            localStorage.setItem(
                "horacerta_theme",
                isDark ? "dark" : "light"
            );

        }
    );

}


/* =========================================================
   PESQUISA
========================================================= */

searchInput.addEventListener(
    "input",
    function() {

        searchTerm =
            this.value.trim();

        renderCalendar();

    }
);


/* =========================================================
   BOTÕES DE NAVEGAÇÃO
========================================================= */

document
    .getElementById("previousMonth")
    .addEventListener(
        "click",
        function() {

            changeMonth(-1);

        }
    );


document
    .getElementById("nextMonth")
    .addEventListener(
        "click",
        function() {

            changeMonth(1);

        }
    );


document
    .getElementById("miniPrev")
    .addEventListener(
        "click",
        function() {

            changeMonth(-1);

        }
    );


document
    .getElementById("miniNext")
    .addEventListener(
        "click",
        function() {

            changeMonth(1);

        }
    );


document
    .getElementById("todayButton")
    .addEventListener(
        "click",
        goToToday
    );


/* =========================================================
   NOVO EVENTO
========================================================= */

document
    .getElementById("newEventButton")
    .addEventListener(
        "click",
        function() {

            openNewEventModal(
                selectedDate
            );

        }
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("cancelModal")
    .addEventListener(
        "click",
        closeModal
    );


eventForm.addEventListener(
    "submit",
    handleEventSubmit
);


/* =========================================================
   CLICAR FORA DO MODAL
========================================================= */

eventModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === eventModal
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   FILTROS DE CATEGORIA
========================================================= */

document
    .querySelectorAll(".category-filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const category =
                    this.dataset.category;


                if (
                    activeCategories.has(
                        category
                    )
                ) {

                    activeCategories.delete(
                        category
                    );

                    this.classList.remove(
                        "active"
                    );

                } else {

                    activeCategories.add(
                        category
                    );

                    this.classList.add(
                        "active"
                    );

                }


                renderCalendar();

            }
        );

    });


/* =========================================================
   VISUALIZAÇÕES
========================================================= */

document
    .querySelectorAll(".view-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(
                        ".view-button"
                    )
                    .forEach(
                        btn =>
                            btn.classList.remove(
                                "selected"
                            )
                    );


                this.classList.add(
                    "selected"
                );


                currentView =
                    this.dataset.view;


                /*
                   A versão principal é mensal.
                   Para não gerar uma tela branca,
                   Dia e Semana continuam exibindo
                   o calendário de forma segura.
                */

                if (
                    currentView === "day"
                ) {

                    showViewMessage(
                        "Visualização diária",
                        selectedDate
                    );

                } else if (
                    currentView === "week"
                ) {

                    showViewMessage(
                        "Visualização semanal",
                        selectedDate
                    );

                } else {

                    renderCalendar();

                }

            }
        );

    });


/* =========================================================
   VISUALIZAÇÃO SEGURA
========================================================= */

function showViewMessage(title, date) {

    /*
       Mantém a grade funcional em vez de
       deixar uma página vazia.
    */

    renderCalendar();

}


/* =========================================================
   MENU MOBILE
========================================================= */

document
    .getElementById("menuButton")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById("sidebar")
                .classList.toggle("open");

        }
    );


/* =========================================================
   ESC FECHA MODAL
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            !eventModal.classList.contains(
                "hidden"
            )
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function initializeApp() {

    initTheme();

    renderAll();

}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}
