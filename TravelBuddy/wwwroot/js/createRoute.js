$(function () {
    let stopCount = 1;
    const routeStopsData = {}; // Объект для хранения данных остановок (включая координаты и транспорт)
    let cityCodes = {};
    let currentStop = null; // Текущая остановка для выбора транспорта

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

    // Функция для автозаполнения городов и получения координат
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
                if (!routeStopsData[stopIndex]) {
                    routeStopsData[stopIndex] = {
                        DestinationCity: ui.item.value,
                        Latitude: ui.item.latitude,
                        Longitude: ui.item.longitude,
                        Transportation: null,
                        Duration: null,
                        DurationType: null
                    };
                } else {
                    routeStopsData[stopIndex].DestinationCity = ui.item.value;
                    routeStopsData[stopIndex].Latitude = ui.item.latitude;
                    routeStopsData[stopIndex].Longitude = ui.item.longitude;
                }
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
            <div class="selected-transport mt-2" style="display: none;">
                <strong>Выбранный транспорт:</strong> <span class="transport-info"></span>
            </div>
        </div>
        `);
    });

    // Открытие модального окна транспорта
    $(document).on('click', '.choose-transport-btn', function () {
        currentStop = $(this).closest('.stop-fields');
        const previousStopFields = currentStop.prev('.stop-fields');

        // Город отправления: либо из #initialCity, либо из предыдущей остановки
        const fromCity = previousStopFields.length
            ? previousStopFields.find('input[name*="DestinationCity"]').val()
            : $('#initialCity').val();

        // Город назначения — текущая остановка
        const toCity = currentStop.find('input[name*="DestinationCity"]').val();

        console.log("fromCity: " + fromCity);
        console.log("toCity: " + toCity);
        if (!fromCity || !toCity) {
            alert('Заполните города отправления и назначения.');
            return;
        }

        $('#transportModalInfo').text(`Откуда: ${fromCity}, Куда: ${toCity}`);
        $('#transportModal').data('from', fromCity).data('to', toCity).show();

        // Очистка предыдущих опций транспорта
        $('#transportOptions tbody').empty();
        $('#transportOptions').hide();
        $('#confirmTransportBtn').prop('disabled', true);
    });

    // Открытие модального окна отелей
    $(document).on('click', '.choose-hotel-btn', function () {
        const stopIndex = $(this).closest('.stop-fields').index();
        $('#hotelModalInfo').text(`Для остановки ${stopIndex + 1}`);
        $('#hotelModal').show();
    });

    // Закрытие модальных окон при клике вне контента
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

                let currentTransportOptions = data; // Сохраняем текущие опции транспорта

                data.forEach((segment, index) => {
                    console.log("Сегмент:", JSON.stringify(segment, null, 2));

                    const carrierTitle = segment?.thread?.carrier?.title || 'Неизвестный перевозчик';
                    const departureTime = segment?.departure ? new Date(segment.departure).toLocaleString('ru-RU') : 'Неизвестно';
                    const arrivalTime = segment?.arrival ? new Date(segment.arrival).toLocaleString('ru-RU') : 'Неизвестно';
                    const fromTitle = segment?.from?.title || 'Неизвестно';
                    const toTitle = segment?.to?.title || 'Неизвестно';

                    // Предполагаем, что цена находится в tickets_info.places[0].price, иначе "Неизвестно"
                    let price = 'Неизвестно';
                    if (segment.tickets_info && segment.tickets_info.places && segment.tickets_info.places.length > 0) {
                        // Предполагаем, что 'price' есть в объекте place
                        price = segment.tickets_info.places[0].price || 'Неизвестно';
                    }

                    $('#transportOptions tbody').append(`
                        <tr>
                            <td>${carrierTitle}</td>
                            <td>${departureTime}</td>
                            <td>${arrivalTime}</td>
                            <td>
                                <input type="radio" name="selectedTransport" value="${index}">
                            </td>
                        </tr>
                    `);

                    // Добавляем обработчик события для радиокнопок
                    $('#transportOptions tbody').on('change', `input[name="selectedTransport"][value="${index}"]`, function () {
                        $('#confirmTransportBtn').prop('disabled', false);
                    });
                });

                // Отобразить таблицу с опциями транспорта
                $('#transportOptions').show();

                // Сохраняем опции транспорта в данных модального окна
                $('#transportModal').data('transportOptions', currentTransportOptions);
            },
            error: function () {
                alert('Ошибка при получении данных транспорта.');
            }
        });
    });

    // Подтверждение выбора транспорта
    $('#confirmTransportBtn').on('click', function () {
        const modal = $('#transportModal');
        const transportOptions = modal.data('transportOptions');
        const selectedTransportIndex = modal.find('input[name="selectedTransport"]:checked').val(); // Скоупинг внутри модала

        if (selectedTransportIndex === undefined || selectedTransportIndex === null) {
            alert('Выберите транспорт.');
            return;
        }

        const selectedTransport = transportOptions[selectedTransportIndex];

        if (!selectedTransport) {
            alert('Некорректный выбор транспорта.');
            return;
        }

        // Извлечение деталей транспорта
        const carrierTitle = selectedTransport?.thread?.carrier?.title || 'Неизвестный перевозчик';
        const departureTime = selectedTransport?.departure ? new Date(selectedTransport.departure).toLocaleString('ru-RU') : 'Неизвестно';
        const arrivalTime = selectedTransport?.arrival ? new Date(selectedTransport.arrival).toLocaleString('ru-RU') : 'Неизвестно';
        const fromTitle = selectedTransport?.from?.title || 'Неизвестно';
        const toTitle = selectedTransport?.to?.title || 'Неизвестно';

        // Извлечение стоимости, если доступна
        let price = 'Неизвестно';
        if (selectedTransport.tickets_info && selectedTransport.tickets_info.places && selectedTransport.tickets_info.places.length > 0) {
            // Предполагаем, что 'price' есть в объекте place
            price = selectedTransport.tickets_info.places[0].price || 'Неизвестно';
        }

        // Формирование строки с информацией о транспорте
        const transportInfo = `
            <div class="transport-details">
                <p><strong>Перевозчик:</strong> ${carrierTitle}</p>
                <p><strong>Откуда:</strong> ${fromTitle}</p>
                <p><strong>Куда:</strong> ${toTitle}</p>
                <p><strong>Время отправления:</strong> ${departureTime}</p>
                <p><strong>Время прибытия:</strong> ${arrivalTime}</p>
                <p><strong>Цена:</strong> ${price}</p>
            </div>
        `;

        // Сохранение выбранного транспорта в routeStopsData
        const stopInput = currentStop.find('input[name*="DestinationCity"], input[name*="FromCity"]');
        const stopIndex = stopInput.attr('name').match(/\d+/)[0];
        if (!routeStopsData[stopIndex]) {
            routeStopsData[stopIndex] = {};
        }
        routeStopsData[stopIndex].Transportation = selectedTransport;
        routeStopsData[stopIndex].Duration = selectedTransport?.duration || null;
        routeStopsData[stopIndex].DurationType = null; // по необходимости

        // Обновление UI: отображение выбранного транспорта под остановкой
        currentStop.find('.selected-transport .transport-info').html(transportInfo);
        currentStop.find('.selected-transport').show();

        // Закрытие модального окна
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

    // Подтверждение выбора отеля (можно добавить аналогично транспорту)
    $('#confirmHotelBtn').on('click', function () {
        // Логика для подтверждения выбора отеля
        alert('Отель выбран.');
        $('#hotelModal').hide();
    });
});
