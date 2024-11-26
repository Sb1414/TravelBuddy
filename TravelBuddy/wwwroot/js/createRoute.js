$(function () {
    let stopCount = 1;
    const routeStopsData = {}; // объект для хранения данных остановок (включая координаты)
    let cityCodes = {};

    // Загрузка JSON-файла с кодами городов
    function loadCityCodes() {
        $.getJSON('/data/cityCodes.json', function (data) {
            cityCodes = data;
            console.log("Коды городов загружены:", cityCodes);
        }).fail(function () {
            alert("Не удалось загрузить коды городов.");
        });
    }

    // Получение кода города по названию
    function getCityCode(cityName) {
        return cityCodes[cityName] || null;
    }

    // Загрузка кодов при запуске
    $(document).ready(function () {
        loadCityCodes();
    });

    // функция для автозаполнения городов и получения координат
    $(document).on("focus", ".city-autocomplete", function () {
        $(this).autocomplete({
            source: function (request, response) {
                $.ajax({
                    url: "http://api.openweathermap.org/geo/1.0/direct",
                    dataType: "json",
                    data: {
                        q: request.term,
                        limit: 10,
                        appid: "0cf9d3890ebd408a5573cb606afe3d73",
                        lang: "ru"
                    },
                    success: function (data) {
                        response($.map(data, function (item) {
                            const localName = item.local_names && item.local_names.ru ? item.local_names.ru : item.name;
                            return {
                                label: localName + (item.state ? ", " + item.state : "") + ", " + item.country,
                                value: localName,
                                latitude: item.lat,
                                longitude: item.lon
                            };
                        }));
                    }
                });
            },
            minLength: 2,
            select: function (event, ui) {
                const stopIndex = $(this).attr("name").match(/\d+/)[0];
                routeStopsData[stopIndex] = {
                    DestinationCity: ui.item.value,
                    Latitude: ui.item.latitude,
                    Longitude: ui.item.longitude,
                    Transportation: null,
                    Duration: null,
                    DurationType: null
                };
            }
        });
    });

    // Добавление новой остановки
    $('#add-stop-btn').on('click', function () {
        stopCount++;
        $('#stops-container').append(`
        <div class="stop-fields mt-3">
            <label>Город назначения</label>
            <input type="text" name="RouteStops[${stopCount}].DestinationCity" class="form-control city-autocomplete mb-2" />
            <button type="button" class="btn btn-primary choose-transport-btn">Выбрать средство передвижения</button>
            <button type="button" class="btn btn-primary choose-hotel-btn">Выбрать отель</button>
        </div>
        `);
    });

    // Открытие модального окна транспорта
    $(document).on('click', '.choose-transport-btn', function () {
        const stopFields = $(this).closest('.stop-fields');
        const previousStopFields = stopFields.prev('.stop-fields');

        // Город отправления: либо из #initialCity, либо из предыдущей остановки
        const fromCity = previousStopFields.length
            ? previousStopFields.find('input[name*="DestinationCity"]').val()
            : $('#initialCity').val();

        // Город назначения — текущая остановка
        const toCity = stopFields.find('input[name*="DestinationCity"]').val();
        
        console.log("toCity: " + fromCity);
        console.log("toCity: " + toCity);
        if (!fromCity || !toCity) {
            alert('Заполните города отправления и назначения.');
            return;
        }

        $('#transportModalInfo').text(`Откуда: ${fromCity}, Куда: ${toCity}`);
        $('#transportModal').data('from', fromCity).data('to', toCity).show();
    });

    // Открытие модального окна отелей
    $(document).on('click', '.choose-hotel-btn', function () {
        const stopIndex = $(this).closest('.stop-fields').index();
        $('#hotelModalInfo').text(`Для остановки ${stopIndex + 1}`);
        $('#hotelModal').show();
    });

    // Закрытие модальных окон
    $('.modal').on('click', function (e) {
        if ($(e.target).is('.modal')) {
            $(this).hide();
        }
    });

    // Поиск транспорта через API
    $('#searchTransportBtn').on('click', function () {
        const modal = $('#transportModal');
        const fromCity = modal.data('from');
        const toCity = modal.data('to');
        const date = $('#transportDate').val();
        const transportType = $('#transportType').val();

        const fromCode = getCityCode(fromCity);
        const toCode = getCityCode(toCity);

        if (!fromCode || !toCode) {
            alert('Коды для городов не найдены.');
            return;
        }

        if (!date) {
            alert('Введите дату отправления.');
            return;
        }

        // Отправка запроса на сервер
        $.ajax({
            url: `/Transport/Search`,
            method: 'POST',
            data: { from: fromCode, to: toCode, date: date, transportType: transportType },
            success: function (data) {
                console.log("Полученные данные:", data);

                // Проверка типа данных
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                        console.log("Парсинг JSON прошёл успешно:", data);
                    } catch (e) {
                        alert("Ошибка при парсинге JSON: " + e.message);
                        return;
                    }
                }

                if (!Array.isArray(data)) {
                    alert("Неверный формат данных от API");
                    return;
                }

                $('#transportOptions tbody').empty();

                if (data.length === 0) {
                    alert('Транспорт не найден.');
                    return;
                }

                data.forEach(segment => {
                    console.log("Сегмент:", JSON.stringify(segment, null, 2));

                    const carrierTitle = segment?.thread?.carrier?.title || 'Неизвестный перевозчик';
                    const departureTime = segment?.departure ? new Date(segment.departure).toLocaleString('ru-RU') : 'Неизвестно';
                    const arrivalTime = segment?.arrival ? new Date(segment.arrival).toLocaleString('ru-RU') : 'Неизвестно';
                    const fromTitle = segment?.from?.title || 'Неизвестно';
                    const toTitle = segment?.to?.title || 'Неизвестно';

                    $('#transportOptions tbody').append(`
                        <tr>
                            <td>${carrierTitle}</td>
                            <td>${departureTime}</td>
                            <td>${arrivalTime}</td>
                            <td>${fromTitle} - ${toTitle}</td>
                            <td>
                                <button class="btn btn-primary select-transport-btn" 
                                    data-thread-id="${segment?.thread?.uid || ''}" 
                                    data-from="${fromTitle}" 
                                    data-to="${toTitle}" 
                                    data-departure="${departureTime}" 
                                    data-arrival="${arrivalTime}">
                                    Выбрать
                                </button>
                            </td>
                        </tr>
                    `);
                });

                $('#transportOptions').show();
            },
            error: function () {
                alert('Ошибка при получении данных транспорта.');
            }
        });
    });

    // Выбор конкретного транспорта
    $(document).on('click', '.select-transport-btn', function () {
        const selectedTransport = {
            threadId: $(this).data('thread-id'),
            from: $(this).data('from'),
            to: $(this).data('to'),
            departure: $(this).data('departure'),
            arrival: $(this).data('arrival')
        };

        $('#confirmTransportBtn').data('selected-transport', selectedTransport).prop('disabled', false);
    });

    // Подтверждение выбора транспорта
    $('#confirmTransportBtn').on('click', function () {
        const transport = $(this).data('selected-transport');
        alert(`Выбран транспорт: ${transport.threadId} (${transport.from} - ${transport.to})`);
        $('#transportModal').hide();
    });
    
    // Поиск отелей
    $('#searchHotelBtn').on('click', function () {
        // Имитация поиска отелей
        $('#hotelOptions').show().find('tbody').html(`
            <tr>
                <td>Гостиница 1</td>
                <td>Адрес 1</td>
                <td>3000 руб.</td>
                <td><button class="btn btn-primary select-hotel-btn">Выбрать</button></td>
            </tr>
        `);
    });

    // Выбор отеля
    $(document).on('click', '.select-hotel-btn', function () {
        $('#confirmHotelBtn').prop('disabled', false);
    });
});