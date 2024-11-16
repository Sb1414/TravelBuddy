$(function () {
    let stopCount = 1;
    const routeStopsData = {}; // объект для хранения данных остановок (включая координаты)

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
                            return {
                                label: item.name + (item.state ? ", " + item.state : "") + ", " + item.country,
                                value: item.name,
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

    // обновление routeStopsData только если выбраны значения
    $(document).on("change", ".stop-fields select, .stop-fields input[type='number']", function () {
        const stopIndex = $(this).closest('.stop-fields').find('input[name*="DestinationCity"]').attr("name").match(/\d+/)[0];
        if (routeStopsData[stopIndex]) {
            routeStopsData[stopIndex].Transportation = $(this).closest('.stop-fields').find('select[name*="Transportation"]').val() || null;
            routeStopsData[stopIndex].Duration = $(this).closest('.stop-fields').find('input[name*="Duration"]').val() || null;
            routeStopsData[stopIndex].DurationType = $(this).closest('.stop-fields').find('select[name*="DurationType"]').val() || null;
        }
    });

    // добавление новой остановки при нажатии на +
    document.getElementById('add-stop-btn').addEventListener('click', function () {
        // делаем видимыми дополнительные поля для предыдущей остановки
        $('#stops-container .stop-fields:last .additional-fields').show();

        // добавляем новый блок с только полем города назначения
        const stopsContainer = document.getElementById('stops-container');
        const stopHtml = `
                    <div class="stop-fields mt-3">
                        <label>Город назначения</label>
                        <input type="text" name="RouteStops[${stopCount}].DestinationCity" class="form-control city-autocomplete" />
        
                        <!-- Поля, которые станут видимыми только после нажатия на + -->
                        <div class="additional-fields mt-2" style="display: none;">
                            <label>Средство передвижения</label>
                            <select name="RouteStops[${stopCount}].Transportation" class="form-control">
                                <option value="">Не выбрано</option>
                                <option value="Электричка">Электричка</option>
                                <option value="Самолет">Самолет</option>
                                <option value="Поезд">Поезд</option>
                                <option value="Автобус">Автобус</option>
                            </select>
        
                            <div class="form-inline mt-2">
                                <div style="flex: 1;">
                                    <label>Время пребывания</label>
                                    <input type="number" name="RouteStops[${stopCount}].Duration" class="form-control" style="width: 100%;" />
                                </div>
                                <div style="flex: 1;">
                                    <label>Тип времени</label>
                                    <select name="RouteStops[${stopCount}].DurationType" class="form-control" style="width: 100%;">
                                        <option value="">Не выбрано</option>
                                        <option value="Дни">Дни</option>
                                        <option value="Часы">Часы</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>`;
        stopsContainer.insertAdjacentHTML('beforeend', stopHtml);
        stopCount++;
    });

    // Передача данных остановок (включая координаты) при отправке формы
    $('form').on('submit', function (e) {
        e.preventDefault(); // Отключаем стандартное поведение отправки формы

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: $(this).serialize() + "&routeStopsData=" + encodeURIComponent(JSON.stringify(routeStopsData)),
            success: function (response) {
                if (response.success) {
                    alert(response.message); // Выводим сообщение об успешном сохранении
                    window.location.href = "/Route/Routes"; // Перенаправляем на страницу с маршрутами
                } else {
                    console.error("Ошибка при сохранении маршрута:", response.message);
                    if (response.errors) {
                        console.log("Ошибки валидации:", response.errors);
                    }
                    alert("Произошла ошибка: " + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Произошла ошибка при сохранении маршрута:", error);
                alert("Произошла ошибка при создании маршрута.");
            }
        });
    });
});

$(document).on("change", ".transportation-select", function () {
    const transportType = $(this).val();
    const stopIndex = $(this).closest(".stop-fields").find('input[name*="DestinationCity"]').attr("name").match(/\d+/)[0];
    const destination = routeStopsData[stopIndex]?.DestinationCity;

    if (transportType === "Электричка" && destination) {
        const trainTableContainer = $(this).closest(".stop-fields").find(".train-table-container");
        trainTableContainer.show();

        // Загрузка рейсов через API
        fetch(`/api/trains?toCity=${destination}`)
            .then((response) => response.json())
            .then((data) => {
                const trainOptions = trainTableContainer.find(".train-options");
                trainOptions.empty();

                data.forEach((train) => {
                    trainOptions.append(`
                        <tr>
                            <td>${train.departure_time}</td>
                            <td>${train.arrival_time}</td>
                            <td>${train.title}</td>
                            <td>
                                <button type="button" class="btn btn-primary select-train" 
                                    data-train-id="${train.id}" 
                                    data-train-title="${train.title}"
                                    data-departure-time="${train.departure_time}"
                                    data-arrival-time="${train.arrival_time}">
                                    Выбрать
                                </button>
                            </td>
                        </tr>
                    `);
                });
            })
            .catch((error) => console.error("Ошибка загрузки рейсов:", error));
    }
});

$(document).on("click", ".select-train", function () {
    const trainId = $(this).data("train-id");
    const trainTitle = $(this).data("train-title");
    const departureTime = $(this).data("departure-time");
    const arrivalTime = $(this).data("arrival-time");

    const stopIndex = $(this).closest(".stop-fields").find('input[name*="DestinationCity"]').attr("name").match(/\d+/)[0];
    routeStopsData[stopIndex] = {
        ...routeStopsData[stopIndex],
        SelectedTrainId: trainId,
        SelectedTrainTitle: trainTitle,
        SelectedDepartureTime: departureTime,
        SelectedArrivalTime: arrivalTime
    };

    alert(`Рейс ${trainTitle} выбран.`);
});
