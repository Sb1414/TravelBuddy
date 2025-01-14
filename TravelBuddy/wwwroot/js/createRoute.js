$(function () {
    let stopCount = 1;
    const routeStopsData = [];
    let cityCodes = {};
    let currentStop = null;
    const coordinatesCache = {};
    const transportTypes = {
        plane: "Самолет",
        train: "Поезд",
        suburban: "Электричка",
        bus: "Автобус",
        water: "Морской транспорт",
        helicopter: "Вертолет"
    };
    function loadCityCodes() {
        $.getJSON('/data/cityCodes.json', function (data) {
            cityCodes = data;
            console.log("Коды городов загружены:", cityCodes);
        }).fail(function () {
            alert("Не удалось загрузить коды городов.");
        });
    }

    function getCityCode(cityName) {
        return cityCodes[cityName] || null;
    }

    // Функция для получения координат станции/аэропорта
    function getStationCoordinates(stationName, cityName) {
        return new Promise((resolve, reject) => {
            const cacheKey = `station_${stationName}`;

            // if (coordinatesCache[cacheKey]) {
            //     console.log(`Координаты станции "${stationName}" получены из кэша.`);
            //     resolve(coordinatesCache[cacheKey]);
            //     return;
            // }

            $.ajax({
                url: "https://nominatim.openstreetmap.org/search",
                dataType: "json",
                data: {
                    q: `${stationName}, ${cityName}`,
                    format: "json",
                    limit: 1
                },
                success: function (data) {
                    if (data && data.length > 0) {
                        const coords = {
                            latitude: data[0].lat,
                            longitude: data[0].lon
                        };
                        coordinatesCache[cacheKey] = coords;
                        console.log(`Координаты станции "${stationName}" найдены:`, coords);
                        resolve(coords);
                    } else {
                        console.log(`Координаты для станции "${stationName}" не найдены. Используем координаты города "${cityName}".`);
                        // Запрашиваем координаты города
                        getCityCoordinates(cityName).then(cityCoords => {
                            coordinatesCache[cacheKey] = cityCoords;
                            resolve(cityCoords);
                        }).catch(err => {
                            console.error(`Ошибка при получении координат города "${cityName}":`, err);
                            resolve({ latitude: null, longitude: null });
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(`Ошибка при запросе координат станции "${stationName}":`, textStatus, errorThrown);
                    // Попытка получить координаты города
                    getCityCoordinates(cityName).then(cityCoords => {
                        coordinatesCache[cacheKey] = cityCoords;
                        resolve(cityCoords);
                    }).catch(err => {
                        console.error(`Ошибка при получении координат города "${cityName}":`, err);
                        resolve({ latitude: null, longitude: null });
                    });
                }
            });
        });
    }

    // Функция для получения координат города
    function getCityCoordinates(cityName) {
        return new Promise((resolve, reject) => {
            const cityCacheKey = `city_${cityName}`;

            if (coordinatesCache[cityCacheKey]) {
                console.log(`Координаты города "${cityName}" получены из кэша.`);
                resolve(coordinatesCache[cityCacheKey]);
                return;
            }

            $.ajax({
                url: "https://nominatim.openstreetmap.org/search",
                dataType: "json",
                data: {
                    q: cityName,
                    format: "json",
                    limit: 1
                },
                success: function (data) {
                    if (data && data.length > 0) {
                        const coords = {
                            latitude: data[0].lat,
                            longitude: data[0].lon
                        };
                        coordinatesCache[cityCacheKey] = coords;
                        console.log(`Координаты города "${cityName}" найдены:`, coords);
                        resolve(coords);
                    } else {
                        console.log(`Координаты для города "${cityName}" не найдены.`);
                        resolve({ latitude: null, longitude: null });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(`Ошибка при запросе координат города "${cityName}":`, textStatus, errorThrown);
                    resolve({ latitude: null, longitude: null });
                }
            });
        });
    }

    // Новая функция для получения координат отеля
    function getHotelCoordinates(hotelName, cityName) {
        return new Promise((resolve, reject) => {
            const cacheKey = `hotel_${hotelName}`;

            if (coordinatesCache[cacheKey]) {
                console.log(`Координаты отеля "${hotelName}" получены из кэша.`);
                resolve(coordinatesCache[cacheKey]);
                return;
            }

            $.ajax({
                url: "https://nominatim.openstreetmap.org/search",
                dataType: "json",
                data: {
                    q: `${hotelName}, ${cityName}`,
                    format: "json",
                    limit: 1
                },
                success: function (data) {
                    if (data && data.length > 0) {
                        const coords = {
                            latitude: data[0].lat,
                            longitude: data[0].lon
                        };
                        coordinatesCache[cacheKey] = coords;
                        console.log(`Координаты отеля "${hotelName}" найдены:`, coords);
                        resolve(coords);
                    } else {
                        console.log(`Координаты для отеля "${hotelName}" не найдены.`);
                        resolve({ latitude: null, longitude: null });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(`Ошибка при запросе координат отеля "${hotelName}":`, textStatus, errorThrown);
                    resolve({ latitude: null, longitude: null });
                }
            });
        });
    }

    $(document).ready(function () {
        loadCityCodes();
        $("#transportDate, #hotelCheckIn, #hotelCheckOut").datepicker({
            dateFormat: 'yy-mm-dd', // Формат даты
            minDate: 0, // Отключение выбора прошедших дат
            showAnim: "slideDown", // Эффект анимации при открытии
            firstDay: 1, // Установка первого дня недели на понедельник
            dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], // Краткие названия дней недели
            monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"], // Названия месяцев
            monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн",
                "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"] // Краткие названия месяцев
        });

        // Установка русской локализации для Datepicker
        $.datepicker.setDefaults($.datepicker.regional["ru"]);
    });

    $(document).on("focus", ".city-autocomplete", function () {
        $(this).autocomplete({
            source: function (request, response) {
                $.ajax({
                    url: "https://api.openweathermap.org/geo/1.0/direct",
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
                    },
                    error: function () {
                        alert("Ошибка при получении данных для автокомплита города.");
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
                        TransportationFromCoords: null,
                        TransportationToCoords: null,
                        Hotel: null
                    };
                } else {
                    routeStopsData[stopIndex].DestinationCity = ui.item.value;
                    routeStopsData[stopIndex].Latitude = ui.item.latitude;
                    routeStopsData[stopIndex].Longitude = ui.item.longitude;
                }
                console.log("Остановка ", stopIndex, " обновлена: ", routeStopsData[stopIndex]);
            }
        });
    });

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

    // Обработка выбора транспорта
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

        // установка даты отправления транспорта
        if (stopIndex > 0) {
            const previousStop = routeStopsData[stopIndex - 1];
            const previousCheckOutDate = previousStop?.HotelCheckOutDate;
            if (previousCheckOutDate) {
                $('#transportDate').val(previousCheckOutDate);
                console.log(`Дата отправления установлена на дату выезда из предыдущего отеля: ${previousCheckOutDate}`);
            }
        }

        $('#transportModalInfo').text(`Откуда: ${fromCity}, Куда: ${toCity}`);
        $('#transportModal').data('from', fromCity).data('to', toCity).data('stopIndex', stopIndex).show();
        $('#transportOptions tbody').empty();
        $('#transportOptions').hide();
        $('#confirmTransportBtn').prop('disabled', true);

        currentStop.find('.selected-transport .transport-info').empty().hide();
    });

    // Обработка выбора отеля
    $(document).on('click', '.choose-hotel-btn', function () {
        currentStop = $(this).closest('.stop-fields');
        const stopIndex = currentStop.data('stop-index');

        if (!routeStopsData[stopIndex] || !routeStopsData[stopIndex].Transportation) {
            alert('Пожалуйста, сначала выберите транспорт.');
            return;
        }

        const cityInput = currentStop.find('input[name*="DestinationCity"]');
        const city = cityInput.val();

        if (!city) {
            alert('Заполните город назначения перед выбором отеля.');
            return;
        }

        const arrivalRaw = routeStopsData[stopIndex].TransportationArrivalTime;
        if (!arrivalRaw) {
            alert('Время прибытия транспорта не установлено.');
            return;
        }

        const arrivalDate = new Date(arrivalRaw);
        if (isNaN(arrivalDate.getTime())) {
            alert('Неверное время прибытия транспорта.');
            return;
        }

        const checkInDate = arrivalDate.toISOString().split('T')[0];
        $('#hotelCheckIn').val(checkInDate);
        console.log(`Дата заезда для остановки ${stopIndex}: ${checkInDate}`);

        $('#hotelModalInfo').text(`Выбор отеля для ${city}`);
        $('#hotelModal').data('stopIndex', stopIndex).data('city', city).show();
        $('#hotelOptions tbody').empty();
        $('#hotelOptions').hide();
        $('#confirmHotelBtn').prop('disabled', true);

        currentStop.find('.selected-hotel .hotel-info').empty().hide();
    });

    // Закрытие модальных окон при клике вне содержимого
    $('.modal').on('click', function (e) {
        if ($(e.target).is('.modal')) {
            $(this).hide();
        }
    });

    // Кнопка отмены модального окна
    $(document).on('click', '.cancel-modal-btn', function () {
        $(this).closest('.modal').hide();
    });
    
    // Поиск транспорта (без изменений)
    $('#searchTransportBtn').on('click', function () {
        const modal = $('#transportModal');
        const fromCity = modal.data('from');
        const toCity = modal.data('to');
        const date = $('#transportDate').val();
        const transportType = $('#transportTypeSelect').val();

        if (!transportType) {
            alert('Пожалуйста, выберите тип транспорта.');
            return;
        }

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

        $.ajax({
            url: `/Transport/Search`,
            method: 'POST',
            data: { from: fromCode, to: toCode, date: date, transportType: transportType },
            success: function (data) {
                console.log("Полученные данные:", data);

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

                let currentTransportOptions = data;

                data.forEach((segment, index) => {
                    console.log("Сегмент:", JSON.stringify(segment, null, 2));

                    const carrierTitle = segment?.thread?.carrier?.title || 'Неизвестный перевозчик';
                    const transportTypeName = transportTypes[segment?.transportType] || 'Неизвестно';
                    const departureTime = segment?.departure ? new Date(segment.departure).toLocaleString('ru-RU') : 'Неизвестно';
                    const arrivalTime = segment?.arrival ? new Date(segment.arrival).toLocaleString('ru-RU') : 'Неизвестно';
                    const fromTitle = segment?.from?.title || 'Неизвестно';
                    const toTitle = segment?.to?.title || 'Неизвестно';

                    let price = 'Неизвестно';
                    if (segment.tickets_info && segment.tickets_info.places && segment.tickets_info.places.length > 0) {
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

                $('#transportOptions').show();

                $('#transportModal').data('transportOptions', currentTransportOptions);
            },
            error: function () {
                alert('Ошибка при получении данных транспорта.');
            }
        });
    });

    // Подтверждение выбора транспорта
    $('#confirmTransportBtn').on('click', async function () {
        const modal = $('#transportModal');
        const transportOptions = modal.data('transportOptions');
        const selectedTransportIndex = modal.find('input[name="selectedTransport"]:checked').val();
        const fromCity = modal.data('from');
        const toCity = modal.data('to');

        if (selectedTransportIndex === undefined || selectedTransportIndex === null) {
            alert('Выберите транспорт.');
            return;
        }

        const selectedTransport = transportOptions[selectedTransportIndex];

        if (!selectedTransport) {
            alert('Некорректный выбор транспорта.');
            return;
        }

        const carrierTitle = selectedTransport?.thread?.carrier?.title || 'Неизвестный перевозчик';
        let transportType = selectedTransport?.transportType || 'Неизвестно'; // Изменено на let для возможности изменения
        let departureTime = selectedTransport?.departure ? new Date(selectedTransport.departure).toLocaleString('ru-RU') : 'Неизвестно';
        let arrivalTime = selectedTransport?.arrival ? new Date(selectedTransport.arrival).toLocaleString('ru-RU') : 'Неизвестно';
        const fromTitleOriginal = selectedTransport?.from?.title || 'Неизвестно';
        const toTitleOriginal = selectedTransport?.to?.title || 'Неизвестно';

        // Проверка типа транспорта и добавление слова "вокзал" при необходимости
        let fromTitle = fromCity;
        let toTitle = toCity;

        if (carrierTitle.toLowerCase().includes('ржд')) {
            if (!fromTitle.toLowerCase().includes('вокзал')) {
                fromTitle += ' железнодорожный вокзал';
            }
            if (!toTitle.toLowerCase().includes('вокзал')) {
                toTitle += ' железнодорожный вокзал';
            }
        }

        if (carrierTitle.toLowerCase().includes('Аэрофлот') || carrierTitle.toLowerCase().includes('S7 Airlines') || 
            carrierTitle.toLowerCase().includes('Победа')  || carrierTitle.toLowerCase().includes('Победа') || 
            carrierTitle.toLowerCase().includes('Аэро') || carrierTitle.toLowerCase().includes('Nordwind') || carrierTitle.toLowerCase().includes('Smartavia')) {
            if (!fromTitle.toLowerCase().includes('аэропорт')) {
                fromTitle += ' аэропорт';
            }
        }
        
        console.log(fromTitle, " ", toTitle);

        let price = 'Неизвестно';
        if (selectedTransport.tickets_info && selectedTransport.tickets_info.places && selectedTransport.tickets_info.places.length > 0) {
            price = selectedTransport.tickets_info.places[0].price || 'Неизвестно';
        }

        try {
            const fromCoords = await getStationCoordinates(fromTitle, fromCity);
            const toCoords = await getStationCoordinates(toTitle, toCity);

            const fromLatitude = parseFloat(fromCoords.latitude);
            const fromLongitude = parseFloat(fromCoords.longitude);
            const toLatitude = parseFloat(toCoords.latitude);
            const toLongitude = parseFloat(toCoords.longitude);

            const transportInfo = `
            <div class="transport-details">
                <p><strong>Перевозчик:</strong> ${carrierTitle}</p>
                <p><strong>Откуда:</strong> ${fromTitleOriginal} (${fromTitle})</p>
                <p><strong>Куда:</strong> ${toTitleOriginal} (${toTitle})</p>
                <p><strong>Время отправления:</strong> ${departureTime}</p>
                <p><strong>Время прибытия:</strong> ${arrivalTime}</p>
                <p><strong>Цена:</strong> ${price}</p>
            </div>
        `;

            console.log('Transport Info HTML:', transportInfo);

            const stopIndex = modal.data('stopIndex');
            console.log('Stop Index для обновления UI:', stopIndex);

            if (!routeStopsData[stopIndex]) {
                routeStopsData[stopIndex] = {};
            }

            routeStopsData[stopIndex].TransportationArrivalTime = selectedTransport.arrival;
            routeStopsData[stopIndex].Transportation = selectedTransport;
            routeStopsData[stopIndex].TransportationType = transportType;

            routeStopsData[stopIndex].TransportationFromCoords = {
                latitude: fromLatitude,
                longitude: fromLongitude
            };
            routeStopsData[stopIndex].TransportationToCoords = {
                latitude: toLatitude,
                longitude: toLongitude
            };

            const stopFields = $('#stops-container .stop-fields[data-stop-index="' + stopIndex + '"]');
            console.log('Selected stopFields:', stopFields);

            const transportInfoElement = stopFields.find('.selected-transport .transport-info');
            console.log('Found transport-info:', transportInfoElement.length > 0 ? 'Yes' : 'No');

            if (transportInfoElement.length > 0) {
                transportInfoElement.html(transportInfo);
                stopFields.find('.selected-transport').show();
                transportInfoElement.css('display', 'block');
                console.log('UI обновлено для остановки:', stopIndex);
            } else {
                console.log('transport-info элемент не найден для stopIndex:', stopIndex);
            }

            $('#transportModal').hide();
        } catch (error) {
            console.error('Ошибка при подтверждении транспорта:', error);
            alert('Произошла ошибка при подтверждении транспорта. Пожалуйста, попробуйте еще раз.');
        }
    });

    // Поиск отеля
    $('#searchHotelBtn').on('click', function () {
        const modal = $('#hotelModal');
        const city = modal.data('city');
        const checkIn = $('#hotelCheckIn').val();
        const checkOut = $('#hotelCheckOut').val();
        const adults = 1;
        const children = 0;

        if (!checkOut) {
            alert('Пожалуйста, укажите дату выезда.');
            return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            alert('Дата выезда должна быть позже даты заезда.');
            return;
        }

        $.ajax({
            url: `/Hotels/Search`,
            method: 'POST',
            data: { city: city, checkIn: checkIn, checkOut: checkOut, adults: adults, children: children },
            success: function (data) {
                console.log("Полученные данные отелей:", data);

                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                        console.log("Парсинг JSON отелей прошёл успешно:", data);
                    } catch (e) {
                        alert("Ошибка при парсинге JSON отелей: " + e.message);
                        return;
                    }
                }

                if (!Array.isArray(data)) {
                    alert("Неверный формат данных от API отелей.");
                    return;
                }

                $('#hotelOptions tbody').empty();

                if (data.length === 0) {
                    alert('Отели не найдены.');
                    return;
                }

                let currentHotelOptions = data;

                data.forEach((hotel, index) => {
                    console.log("Отель:", JSON.stringify(hotel, null, 2));

                    const hotelName = hotel.name || 'Неизвестно';
                    const hotelPrice = hotel.price ? `${hotel.price} руб.` : 'Неизвестно';
                    const hotelRating = hotel.rating ? `${hotel.rating} / 5` : 'Нет рейтинга';

                    $('#hotelOptions tbody').append(`
                        <tr>                        
                            <td>${hotelName}</td>
                            <td>${hotelPrice}</td>
                            <td>
                                <input type="radio" name="selectedHotel" value="${index}">
                            </td>
                        </tr>
                    `);
                });

                $('#hotelOptions').show();

                $('#hotelModal').data('hotelOptions', currentHotelOptions);
            },
            error: function () {
                alert('Ошибка при получении данных отелей.');
            }
        });
    });

    // Подтверждение выбора отеля
    $('#confirmHotelBtn').on('click', async function () {
        const modal = $('#hotelModal');
        const hotelOptions = modal.data('hotelOptions');
        const selectedHotelIndex = modal.find('input[name="selectedHotel"]:checked').val();

        if (selectedHotelIndex === undefined || selectedHotelIndex === null) {
            alert('Выберите отель.');
            return;
        }

        const selectedHotel = hotelOptions[selectedHotelIndex];

        if (!selectedHotel) {
            alert('Некорректный выбор отеля.');
            return;
        }

        const hotelName = selectedHotel?.name || 'Неизвестно';
        const hotelPrice = selectedHotel?.price ? `${selectedHotel.price} руб.` : 'Неизвестно';
        const hotelRating = selectedHotel?.rating ? `${selectedHotel.rating} / 5` : 'Нет рейтинга';
        const hotelImageUrl = selectedHotel?.imageUrl || '/images/no-image.png';
        const hotelLatitude = selectedHotel?.latitude || null;
        const hotelLongitude = selectedHotel?.longitude || null;

        const checkInDate = $('#hotelCheckIn').val(); // Захват даты заезда
        const checkOutDate = $('#hotelCheckOut').val(); // Захват даты выезда

        if (!checkInDate || !checkOutDate) {
            alert('Пожалуйста, укажите дату заезда и выезда.');
            return;
        }

        const hotelInfo = `
        <div class="hotel-details">
            <p><strong>Название:</strong> ${hotelName}</p>
            <p><strong>Дата заезда:</strong> ${checkInDate}</p>
            <p><strong>Дата выезда:</strong> ${checkOutDate}</p>
            <p><strong>Координаты:</strong> Широта: ${hotelLatitude !== null ? hotelLatitude : 'Неизвестно'}, Долгота: ${hotelLongitude !== null ? hotelLongitude : 'Неизвестно'}</p>
            <p><strong>Цена:</strong> ${hotelPrice}</p>
            <p><strong>Рейтинг:</strong> ${hotelRating}</p>
            <img src="${hotelImageUrl}" alt="${hotelName}" style="max-width: 100px; height: auto; margin-top: 10px;" />
        </div>
    `;

        console.log('Hotel Info HTML:', hotelInfo);

        const stopIndex = modal.data('stopIndex');
        console.log('Stop Index для обновления UI:', stopIndex);

        if (!routeStopsData[stopIndex]) {
            routeStopsData[stopIndex] = {};
        }

        try {
            const hotelCoords = await getHotelCoordinates(hotelName, modal.data('city'));
            const hotelLatitudeParsed = hotelCoords.latitude !== null ? parseFloat(hotelCoords.latitude) : null;
            const hotelLongitudeParsed = hotelCoords.longitude !== null ? parseFloat(hotelCoords.longitude) : null;

            routeStopsData[stopIndex].Hotel = {
                ...selectedHotel,
                latitude: hotelLatitudeParsed,
                longitude: hotelLongitudeParsed
            };
            routeStopsData[stopIndex].HotelCheckInDate = checkInDate;
            routeStopsData[stopIndex].HotelCheckOutDate = checkOutDate;

            const stopFields = $('#stops-container .stop-fields[data-stop-index="' + stopIndex + '"]');
            console.log('Selected stopFields for hotel:', stopFields);

            const hotelInfoElement = stopFields.find('.selected-hotel .hotel-info');
            console.log('Found hotel-info:', hotelInfoElement.length > 0 ? 'Yes' : 'No');

            if (hotelInfoElement.length > 0) {
                hotelInfoElement.html(hotelInfo);
                stopFields.find('.selected-hotel').show();
                hotelInfoElement.css('display', 'block');
                console.log('UI обновлено для остановки:', stopIndex);
            } else {
                console.log('hotel-info элемент не найден для stopIndex:', stopIndex);
            }

            $('#hotelModal').hide();
        } catch (error) {
            console.error('Ошибка при подтверждении отеля:', error);
            alert('Произошла ошибка при подтверждении отеля. Пожалуйста, попробуйте еще раз.');
        }
    });

    // Обработка изменений в выборе транспорта и отеля
    $('#transportOptions tbody').on('change', 'input[name="selectedTransport"]', function () {
        $('#confirmTransportBtn').prop('disabled', false);
    });

    $('#hotelOptions tbody').on('change', 'input[name="selectedHotel"]', function () {
        $('#confirmHotelBtn').prop('disabled', false);
    });

    // Отправка формы с данными маршрута
    $('form').on('submit', function (e) {
        $('#routeStopsData').val(JSON.stringify(routeStopsData));
    });
});
