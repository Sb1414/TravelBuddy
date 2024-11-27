$(function () {
    let stopCount = 1; // Начинаем с 1, так как 0 уже используется для initialCity
    const routeStopsData = {}; // Объект для хранения данных остановок (включая координаты, транспорт и отель)
    let cityCodes = {};
    let currentStop = null; // Текущая остановка для выбора транспорта или отеля

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
                const stopElement = $(this).closest('.stop-fields');
                const stopIndex = stopElement.data('stop-index');
                if (!routeStopsData[stopIndex]) {
                    routeStopsData[stopIndex] = {
                        DestinationCity: ui.item.value,
                        Latitude: ui.item.latitude,
                        Longitude: ui.item.longitude,
                        Transportation: null,
                        Hotel: null
                    };
                } else {
                    routeStopsData[stopIndex].DestinationCity = ui.item.value;
                    routeStopsData[stopIndex].Latitude = ui.item.latitude;
                    routeStopsData[stopIndex].Longitude = ui.item.longitude;
                }
                console.log(`Остановка ${stopIndex} обновлена:`, routeStopsData[stopIndex]);
            }
        });
    });

    // Добавление новой остановки
    $('#add-stop-btn').on('click', function () {
        const newStopIndex = stopCount;
        stopCount++;
        $('#stops-container').append(`
            <div class="stop-fields mt-3" data-stop-index="${newStopIndex}">
                <label>Город назначения</label>
                <input type="text" name="RouteStops[${newStopIndex}].DestinationCity" class="form-control city-autocomplete mb-2" />
                <button type="button" class="btn btn-primary choose-transport-btn">Выбрать средство передвижения</button>
                <button type="button" class="btn btn-primary choose-hotel-btn">Выбрать отель</button>
                <div class="selected-info">
                    <div class="selected-transport mt-2" style="display: none;">
                        <strong>Выбранный транспорт:</strong> <span class="transport-info"></span>
                    </div>
                    <div class="selected-hotel mt-2" style="display: none;">
                        <strong>Выбранный отель:</strong> <span class="hotel-info"></span>
                    </div>
                </div>
            </div>
        `);
    });

    // Открытие модального окна транспорта
    $(document).on('click', '.choose-transport-btn', function () {
        currentStop = $(this).closest('.stop-fields');
        const stopIndex = currentStop.data('stop-index');

        const previousStopFields = currentStop.prevAll('.stop-fields').first();
        let fromCity;

        if (previousStopFields.length) {
            const previousStopIndex = previousStopFields.data('stop-index');
            if (previousStopIndex === 0) {
                fromCity = previousStopFields.find('input[name="RouteStops[0].FromCity"]').val();
            } else {
                fromCity = previousStopFields.find('input[name*="DestinationCity"]').val();
            }
        } else {
            fromCity = $('#initialCity').val();
        }

        const toCity = currentStop.find('input[name*="DestinationCity"]').val();

        console.log("fromCity: " + fromCity);
        console.log("toCity: " + toCity);
        console.log("stopIndex: " + stopIndex);
        if (!fromCity || !toCity) {
            alert('Заполните города отправления и назначения.');
            return;
        }

        $('#transportModalInfo').text(`Откуда: ${fromCity}, Куда: ${toCity}`);
        // Устанавливаем stopIndex в модальное окно транспорта
        $('#transportModal').data('from', fromCity).data('to', toCity).data('stopIndex', stopIndex).show();

        // Очистка предыдущих опций транспорта
        $('#transportOptions tbody').empty();
        $('#transportOptions').hide();
        $('#confirmTransportBtn').prop('disabled', true);

        // Очистим предыдущие данные транспорта, если необходимо
        currentStop.find('.selected-transport .transport-info').empty().hide();
    });

    // Открытие модального окна отелей
    $(document).on('click', '.choose-hotel-btn', function () {
        currentStop = $(this).closest('.stop-fields');
        const stopIndex = currentStop.data('stop-index');

        // Проверка, выбран ли транспорт для этой остановки
        if (!routeStopsData[stopIndex] || !routeStopsData[stopIndex].Transportation) {
            alert('Пожалуйста, сначала выберите транспорт.');
            return;
        }

        // Получаем город назначения
        const cityInput = currentStop.find('input[name*="DestinationCity"]');
        const city = cityInput.val();

        if (!city) {
            alert('Заполните город назначения перед выбором отеля.');
            return;
        }

        // Получаем дату прибытия транспорта и устанавливаем ее как дату заезда
        const arrivalDate = new Date(routeStopsData[stopIndex].Transportation.arrival);
        const checkInDate = arrivalDate.toISOString().split('T')[0];
        $('#hotelCheckIn').val(checkInDate);
        console.log(`Дата заезда для остановки ${stopIndex}: ${checkInDate}`);

        $('#hotelModalInfo').text(`Выбор отеля для ${city}`);
        $('#hotelModal').data('stopIndex', stopIndex).data('city', city).show();

        // Очистка предыдущих опций отелей
        $('#hotelOptions tbody').empty();
        $('#hotelOptions').hide();
        $('#confirmHotelBtn').prop('disabled', true);

        // Очистим предыдущие данные отеля, если необходимо
        currentStop.find('.selected-hotel .hotel-info').empty().hide();
    });

    // Закрытие модальных окон при клике вне содержимого
    $('.modal').on('click', function (e) {
        if ($(e.target).is('.modal')) {
            $(this).hide();
        }
    });

    // Обработчик кнопки "Отмена" в модальных окнах
    $(document).on('click', '.cancel-modal-btn', function () {
        $(this).closest('.modal').hide();
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

        console.log('Transport Info HTML:', transportInfo);

        // Получаем stopIndex из модального окна
        const stopIndex = modal.data('stopIndex');
        console.log('Stop Index для обновления UI:', stopIndex);

        // Сохранение выбранного транспорта в routeStopsData
        if (!routeStopsData[stopIndex]) {
            routeStopsData[stopIndex] = {};
        }
        routeStopsData[stopIndex].Transportation = selectedTransport;

        // Обновление UI: отображение выбранного транспорта под остановкой
        const stopFields = $('#stops-container .stop-fields[data-stop-index="' + stopIndex + '"]');
        console.log('Selected stopFields:', stopFields);

        const transportInfoElement = stopFields.find('.selected-transport .transport-info');
        console.log('Found transport-info:', transportInfoElement.length > 0 ? 'Yes' : 'No');

        if (transportInfoElement.length > 0) {
            transportInfoElement.html(transportInfo);
            stopFields.find('.selected-transport').show(); // Показываем блок
            stopFields.find('.transport-info').css('display', 'block');
            console.log('UI обновлено для остановки:', stopIndex);
        } else {
            console.log('transport-info элемент не найден для stopIndex:', stopIndex);
        }

        // Закрытие модального окна
        $('#transportModal').hide();
    });

    // Поиск отелей
    $('#searchHotelBtn').on('click', function () {
        const modal = $('#hotelModal');
        const city = modal.data('city');
        const checkIn = $('#hotelCheckIn').val(); // Автоматически установлено
        const checkOut = $('#hotelCheckOut').val();
        const adults = parseInt($('#hotelAdults').val()) || 1;
        const children = parseInt($('#hotelChildren').val()) || 0;

        if (!checkOut) {
            alert('Пожалуйста, укажите дату выезда.');
            return;
        }

        // Проверка, что дата выезда позже даты заезда
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            alert('Дата выезда должна быть позже даты заезда.');
            return;
        }

        // Отправка AJAX-запроса на поиск отелей
        $.ajax({
            url: `/Hotels/Search`,
            method: 'POST',
            data: { city: city, checkIn: checkIn, checkOut: checkOut, adults: adults, children: children },
            success: function (data) {
                console.log("Полученные данные отелей:", data);

                if (!Array.isArray(data)) {
                    alert("Неверный формат данных от API отелей.");
                    return;
                }

                $('#hotelOptions tbody').empty();

                if (data.length === 0) {
                    alert('Отели не найдены.');
                    return;
                }

                let currentHotelOptions = data; // Сохраняем текущие опции отелей

                data.forEach((hotel, index) => {
                    console.log("Отель:", JSON.stringify(hotel, null, 2));

                    const hotelName = hotel.name || 'Неизвестно';
                    const hotelAddress = hotel.address || 'Адрес не указан';
                    const hotelPrice = hotel.price ? `${hotel.price} руб.` : 'Неизвестно';
                    const hotelRating = hotel.rating ? `${hotel.rating} / 5` : 'Нет рейтинга';

                    $('#hotelOptions tbody').append(`
                        <tr>
                            <td>${hotelName}</td>
                            <td>${hotelAddress}</td>
                            <td>${hotelPrice}</td>
                            <td>
                                <input type="radio" name="selectedHotel" value="${index}">
                            </td>
                        </tr>
                    `);
                });

                // Отобразить таблицу с опциями отелей
                $('#hotelOptions').show();

                // Сохраняем опции отелей в данных модального окна
                $('#hotelModal').data('hotelOptions', currentHotelOptions);
            },
            error: function () {
                alert('Ошибка при получении данных отелей.');
            }
        });
    });

    // Подтверждение выбора отеля
    $('#confirmHotelBtn').on('click', function () {
        const modal = $('#hotelModal');
        const hotelOptions = modal.data('hotelOptions');
        const selectedHotelIndex = modal.find('input[name="selectedHotel"]:checked').val(); // Скоупинг внутри модала

        if (selectedHotelIndex === undefined || selectedHotelIndex === null) {
            alert('Выберите отель.');
            return;
        }

        const selectedHotel = hotelOptions[selectedHotelIndex];

        if (!selectedHotel) {
            alert('Некорректный выбор отеля.');
            return;
        }

        // Извлечение деталей отеля с правильным регистром
        const hotelName = selectedHotel?.name || 'Неизвестно';
        const hotelAddress = selectedHotel?.address || 'Адрес не указан';
        const hotelPrice = selectedHotel?.price ? `${selectedHotel.price} руб.` : 'Неизвестно';
        const hotelRating = selectedHotel?.rating ? `${selectedHotel.rating} / 5` : 'Нет рейтинга';
        const hotelImageUrl = selectedHotel?.imageUrl || '/images/no-image.png';

        // Формирование строки с информацией об отеле
        const hotelInfo = `
        <div class="hotel-details">
            <p><strong>Название:</strong> ${hotelName}</p>
            <p><strong>Адрес:</strong> ${hotelAddress}</p>
            <p><strong>Цена:</strong> ${hotelPrice}</p>
            <p><strong>Рейтинг:</strong> ${hotelRating}</p>
            <img src="${hotelImageUrl}" alt="${hotelName}" style="max-width: 100px; height: auto; margin-top: 10px;" />
        </div>
    `;

        console.log('Hotel Info HTML:', hotelInfo);

        // Получаем stopIndex из данных модального окна
        const stopIndex = modal.data('stopIndex');
        console.log('Stop Index для обновления UI:', stopIndex);

        // Сохранение выбранного отеля в routeStopsData
        if (!routeStopsData[stopIndex]) {
            routeStopsData[stopIndex] = {};
        }
        routeStopsData[stopIndex].Hotel = selectedHotel;

        // Обновление UI: отображение выбранного отеля под остановкой
        const stopFields = $('#stops-container .stop-fields[data-stop-index="' + stopIndex + '"]');
        console.log('Selected stopFields for hotel:', stopFields);

        const hotelInfoElement = stopFields.find('.selected-hotel .hotel-info');
        console.log('Found hotel-info:', hotelInfoElement.length > 0 ? 'Yes' : 'No');

        if (hotelInfoElement.length > 0) {
            hotelInfoElement.html(hotelInfo);
            stopFields.find('.selected-hotel').show(); // Показываем блок
            stopFields.find('.hotel-info').css('display', 'block');
            console.log('UI обновлено для остановки:', stopIndex);
        } else {
            console.log('hotel-info элемент не найден для stopIndex:', stopIndex);
        }

        // Закрытие модального окна
        $('#hotelModal').hide();
    });


    // Общий обработчик для активации кнопок подтверждения при выборе опции
    // Для транспорта
    $('#transportOptions tbody').on('change', 'input[name="selectedTransport"]', function () {
        $('#confirmTransportBtn').prop('disabled', false);
    });

    // Для отелей
    $('#hotelOptions tbody').on('change', 'input[name="selectedHotel"]', function () {
        $('#confirmHotelBtn').prop('disabled', false);
    });
});
